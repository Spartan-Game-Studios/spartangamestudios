/**
 * Nakama client.
 *
 * The studio already runs Nakama for multiplayer, so the site authenticates
 * against it rather than standing up a second identity system. One account works
 * on the website and in the games — which is the whole reason to do it this way.
 *
 * WHY THERE IS NO SDK HERE
 * `@heroiclabs/nakama-js` would pull a dependency for what is four fetch calls
 * against a documented REST API. The endpoints below are stable v2 routes.
 *
 * ON THE SERVER KEY BEING PUBLIC
 * Nakama's client model puts the server key in the client — game binaries embed
 * it too. It is a routing credential, not a secret, and anyone reading the
 * bundle can call authenticate/*. That is by design; the protection against
 * abuse is the rate limit in front of the auth endpoints, not the key's secrecy.
 * Do NOT treat this value as sensitive, and equally do not add anything that
 * assumes it is.
 */

const BASE = (import.meta.env['VITE_NAKAMA_URL'] ?? '').replace(/\/+$/, '');
const SERVER_KEY = import.meta.env['VITE_NAKAMA_SERVER_KEY'] ?? '';

/** Both must be set at build time or authentication cannot work at all. */
export function nakamaConfigured(): boolean {
  return Boolean(BASE && SERVER_KEY);
}

export interface Session {
  token: string;
  refreshToken: string;
  /** Epoch ms the access token stops being accepted. */
  expiresAt: number;
  userId: string;
  username: string;
  /** Absent for Google accounts that chose not to share it, and for device auth. */
  email: string | null;
  /** True when this authentication call created the account. */
  created: boolean;
}

export class AuthError extends Error {
  // Declared and assigned rather than using constructor parameter properties:
  // the project builds with `erasableSyntaxOnly`, which rejects that shorthand.
  readonly code: number;
  readonly status: number;

  constructor(code: number, status: number, message: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.status = status;
  }
}

interface TokenResponse {
  token: string;
  refresh_token: string;
  created?: boolean;
}

/** Claims we read out of the access token. Nakama signs it; we only decode. */
interface Claims {
  uid?: string;
  usn?: string;
  ema?: string;
  exp?: number;
}

/**
 * Decodes a JWT payload WITHOUT verifying it.
 *
 * That is safe for what it is used for: reading the display name and expiry of a
 * token this client just received over TLS. It must never be used to make a
 * trust decision — the server verifies on every request, and a token the client
 * rewrote would simply be rejected there.
 */
function decodeClaims(token: string): Claims {
  const part = token.split('.')[1];
  if (!part) return {};
  try {
    // base64url -> base64, then percent-decode so non-ASCII names survive.
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(b64)
        .split('')
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    );
    return JSON.parse(json) as Claims;
  } catch {
    return {};
  }
}

function toSession(body: TokenResponse): Session {
  const claims = decodeClaims(body.token);
  return {
    token: body.token,
    refreshToken: body.refresh_token,
    // `exp` is seconds; fall back to an hour out, matching token_expiry_sec.
    expiresAt: claims.exp ? claims.exp * 1000 : Date.now() + 3_600_000,
    userId: claims.uid ?? '',
    username: claims.usn ?? '',
    email: claims.ema ?? null,
    created: body.created === true,
  };
}

async function post<T>(path: string, body: unknown, useServerKey = true): Promise<T> {
  if (!nakamaConfigured()) {
    throw new AuthError(0, 0, 'not_configured');
  }
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      // Nakama takes the server key as HTTP Basic with an empty password.
      authorization: useServerKey ? `Basic ${btoa(`${SERVER_KEY}:`)}` : '',
      accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let code = 0;
    let message = `http_${res.status}`;
    try {
      const err = (await res.json()) as { code?: number; message?: string };
      code = err.code ?? 0;
      message = err.message ?? message;
    } catch {
      // A rate-limit 429 comes from nginx as HTML, not JSON — the status is the
      // only thing that survives, and it is enough to say the right thing.
    }
    throw new AuthError(code, res.status, message);
  }
  return (await res.json()) as T;
}

export async function signUpWithEmail(email: string, password: string, username?: string) {
  const body = await post<TokenResponse>(
    `/v2/account/authenticate/email?create=true${username ? `&username=${encodeURIComponent(username)}` : ''}`,
    { email, password },
  );
  return toSession(body);
}

export async function signInWithEmail(email: string, password: string) {
  const body = await post<TokenResponse>('/v2/account/authenticate/email?create=false', {
    email,
    password,
  });
  return toSession(body);
}

/**
 * Exchanges a Google ID token for a Nakama session.
 *
 * `create=true` because a Google sign-in has no separate sign-up step — the
 * first press of the button is the registration, which is most of why people
 * prefer it.
 */
export async function signInWithGoogle(idToken: string) {
  const body = await post<TokenResponse>('/v2/account/authenticate/google?create=true', {
    token: idToken,
  });
  return toSession(body);
}

/** Trades a refresh token for a new session. Throws once the refresh expires. */
export async function refreshSession(refreshToken: string) {
  const body = await post<TokenResponse>('/v2/account/session/refresh', { token: refreshToken });
  return toSession(body);
}

/* ------------------------------------------------------------------ *
 *  Authenticated calls — account and storage
 * ------------------------------------------------------------------ */

/** What the server knows about the signed-in user. */
export interface Account {
  userId: string;
  /** Nakama's generated handle, e.g. "CixjvnjvNP" — rarely worth showing. */
  username: string;
  /** From the Google profile when it authenticated. Null for email-only. */
  displayName: string | null;
  avatarUrl: string | null;
  email: string | null;
  /** SteamID64, from account metadata. Set by the OpenID flow, not by Nakama. */
  steamId: string | null;
  /** Whether the address has been confirmed by clicking a link sent to it. */
  emailVerified: boolean;
  /** itch.io handle, when linked. */
  itchUsername: string | null;
  linked: {
    itch: boolean;
    google: boolean;
    steam: boolean;
    apple: boolean;
    facebook: boolean;
    /** Email/password credentials exist on the account. */
    email: boolean;
  };
}

async function authed<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  if (!nakamaConfigured()) throw new AuthError(0, 0, 'not_configured');
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
      authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    let message = `http_${res.status}`;
    let code = 0;
    try {
      const err = (await res.json()) as { code?: number; message?: string };
      code = err.code ?? 0;
      message = err.message ?? message;
    } catch {
      // Non-JSON body; the status carries what we need.
    }
    throw new AuthError(code, res.status, message);
  }
  return (await res.json()) as T;
}

interface AccountResponse {
  user: {
    id: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
    google_id?: string;
    steam_id?: string;
    apple_id?: string;
    facebook_id?: string;
    /** A JSON *string*, not an object — Nakama serialises it on the way out. */
    metadata?: string;
  };
  email?: string;
}

/** Both flags live in the same metadata blob, so they are parsed together. */
interface Metadata {
  steamId: string | null;
  emailVerified: boolean;
  itchUsername: string | null;
  itchId: string | null;
}

function parseMetadata(raw: string | undefined): Metadata {
  const empty: Metadata = { steamId: null, emailVerified: false, itchUsername: null, itchId: null };
  if (!raw) return empty;
  try {
    const parsed = JSON.parse(raw) as {
      steam_id?: unknown;
      email_verified?: unknown;
      itch_username?: unknown;
      itch_id?: unknown;
    };
    return {
      steamId: typeof parsed.steam_id === 'string' ? parsed.steam_id : null,
      emailVerified: parsed.email_verified === true,
      itchUsername: typeof parsed.itch_username === 'string' ? parsed.itch_username : null,
      itchId: typeof parsed.itch_id === 'string' ? parsed.itch_id : null,
    };
  } catch {
    return empty;
  }
}

/**
 * The account as the server sees it.
 *
 * Worth fetching rather than reading the JWT: Nakama fills display_name and
 * avatar_url from the Google profile at sign-in, and neither appears in the
 * token. Without this call the site shows Nakama's generated username — a random
 * string like "CixjvnjvNP" — to someone whose name it already knows.
 */
export async function getAccount(token: string): Promise<Account> {
  const body = await authed<AccountResponse>('/v2/account', token);
  const u = body.user;
  const meta = parseMetadata(u.metadata);
  return {
    userId: u.id,
    steamId: meta.steamId,
    emailVerified: meta.emailVerified,
    itchUsername: meta.itchUsername,
    username: u.username ?? '',
    displayName: u.display_name || null,
    avatarUrl: u.avatar_url || null,
    email: body.email || null,
    linked: {
      itch: Boolean(meta.itchId),
      google: Boolean(u.google_id),
      // Either route counts as linked: the native column (set by an in-game
      // session ticket) or our OpenID metadata.
      steam: Boolean(u.steam_id) || Boolean(meta.steamId),
      apple: Boolean(u.apple_id),
      facebook: Boolean(u.facebook_id),
      email: Boolean(body.email),
    },
  };
}

/** Games the user follows. Nakama storage, owner-read/owner-write. */
const FOLLOW_COLLECTION = 'following';

interface StorageObject {
  key: string;
  value: string;
}

export async function listFollowed(token: string, userId: string): Promise<string[]> {
  const body = await authed<{ objects?: StorageObject[] }>(
    `/v2/storage/${FOLLOW_COLLECTION}/${encodeURIComponent(userId)}`,
    token,
  );
  return (body.objects ?? []).map((o) => o.key);
}

/**
 * Follows a game.
 *
 * Goes through an RPC rather than writing storage directly, because the server
 * requires a confirmed email address before adding anyone to a list it will
 * later mail. Writing storage from here would skip that check.
 *
 * Throws AuthError with code 9 (FAILED_PRECONDITION) when the address is not
 * confirmed yet, which the UI turns into an explanation rather than a shrug.
 */
export async function follow(token: string, slug: string): Promise<void> {
  await rpc('follow_game', token, { slug });
}

/** Unfollows. Not gated server-side: someone who cannot verify must still be
 *  able to get off the list. */
export async function unfollow(token: string, slug: string): Promise<void> {
  await rpc('unfollow_game', token, { slug });
}

/* ------------------------------------------------------------------ *
 *  Steam, via OpenID
 * ------------------------------------------------------------------ */

const STEAM_OPENID = 'https://steamcommunity.com/openid/login';

/**
 * Where to send someone to prove they own a Steam account.
 *
 * Steam speaks OpenID 2.0, which is old but is the only web-facing option —
 * Nakama's own Steam auth wants a Steamworks session ticket that a browser
 * cannot produce. `identifier_select` means "let the user pick", which is the
 * normal shape when we do not know their Steam id in advance.
 *
 * Steam requires return_to to sit beneath realm, so both are derived from the
 * running origin rather than hardcoded — otherwise this only works in production.
 */
export function steamOpenIdUrl(returnTo: string): string {
  const origin = window.location.origin;
  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': `${origin}${returnTo}`,
    'openid.realm': origin,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  });
  return `${STEAM_OPENID}?${params.toString()}`;
}

/** True when the current URL carries an OpenID assertion coming back from Steam. */
export function readSteamCallback(search: string): Record<string, string> | null {
  const q = new URLSearchParams(search);
  if (q.get('openid.mode') !== 'id_res') return null;
  const params: Record<string, string> = {};
  q.forEach((value, key) => {
    if (key.startsWith('openid.')) params[key] = value;
  });
  return Object.keys(params).length > 0 ? params : null;
}

/**
 * Calls a Nakama RPC.
 *
 * The payload is a JSON *string* nested inside the request body, which is
 * Nakama's convention rather than a mistake, and the reply nests the result the
 * same way.
 */
async function rpc<T>(name: string, token: string, payload: unknown): Promise<T> {
  const body = await authed<{ payload?: string }>(`/v2/rpc/${name}`, token, {
    method: 'POST',
    body: JSON.stringify(JSON.stringify(payload)),
  });
  return JSON.parse(body.payload ?? '{}') as T;
}

/** Hands Steam's assertion to the server, which verifies it WITH Steam. */
export async function linkSteam(token: string, params: Record<string, string>): Promise<string> {
  const out = await rpc<{ steam_id?: string }>('steam_openid_verify', token, { params });
  return out.steam_id ?? '';
}

export async function unlinkSteam(token: string): Promise<void> {
  await rpc('steam_openid_unlink', token, {});
}

/* ------------------------------------------------------------------ *
 *  Email verification
 * ------------------------------------------------------------------ */

/** Asks the server to send a verification link to the account's own address. */
export async function requestEmailVerification(
  session: string,
): Promise<{ alreadyVerified: boolean }> {
  const out = await rpc<{ sent?: boolean; already_verified?: boolean }>(
    'email_verify_request',
    session,
    {},
  );
  return { alreadyVerified: out.already_verified === true };
}

/**
 * Redeems a token from a verification email.
 *
 * Requires a session, which is why the verify page signs someone in first and
 * redeems afterwards. The alternative is exposing the RPC with Nakama's
 * http_key, and shipping that key in a public bundle to save one sign-in is a
 * poor trade — the token in the link is already the secret.
 */
export async function confirmEmailVerification(session: string, token: string): Promise<void> {
  await rpc('email_verify_confirm', session, { token });
}

/* ------------------------------------------------------------------ *
 *  itch.io
 * ------------------------------------------------------------------ */

/**
 * Where to send someone to authorise us against their itch.io account.
 *
 * itch implements the OAuth 2.0 IMPLICIT flow, so the access token comes back
 * in the URL fragment rather than as a code to exchange. `profile:me` is the
 * narrowest scope that identifies them — we do not ask for their games or
 * purchases, because we have no use for either.
 */
export function itchAuthUrl(returnTo: string): string {
  const clientId = import.meta.env['VITE_ITCH_CLIENT_ID'] ?? '';
  if (!clientId) return '';
  const params = new URLSearchParams({
    client_id: clientId,
    scope: 'profile:me',
    response_type: 'token',
    redirect_uri: `${window.location.origin}${returnTo}`,
  });
  return `https://itch.io/user/oauth?${params.toString()}`;
}

export function itchConfigured(): boolean {
  return Boolean(import.meta.env['VITE_ITCH_CLIENT_ID']);
}

/** Reads the access token itch leaves in the fragment. */
export function readItchCallback(hash: string): string | null {
  const h = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!h) return null;
  const token = new URLSearchParams(h).get('access_token');
  return token && token.length > 0 ? token : null;
}

/**
 * Hands the access token to the server, which spends it once against itch.io.
 *
 * The token is not kept anywhere on this side either: it is a live credential
 * for someone's itch account, and it has done its job the moment the server has
 * confirmed the identity behind it.
 */
export async function linkItch(session: string, accessToken: string): Promise<string> {
  const out = await rpc<{ itch_username?: string }>('itch_link', session, {
    access_token: accessToken,
  });
  return out.itch_username ?? '';
}

export async function unlinkItch(session: string): Promise<void> {
  await rpc('itch_unlink', session, {});
}

/* ------------------------------------------------------------------ *
 *  Account deletion
 * ------------------------------------------------------------------ */

/**
 * Deletes the account and everything owned by it. Irreversible.
 *
 * The literal string 'DELETE' is required by the server as a second step, so an
 * accidental call from anything holding a session cannot destroy an account.
 */
export async function deleteAccount(session: string): Promise<void> {
  await rpc('delete_account', session, { confirm: 'DELETE' });
}
