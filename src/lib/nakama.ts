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
