// Client for the publishing-studio backend (services/publisher). The dashboard
// at /studio is the only caller. Every request carries the Nakama session token;
// the server gates on its staff allowlist, so a 403 here means "signed in, but
// not studio staff" — which the dashboard shows as a distinct state.

// Read the base lazily, same as the merch client — it keeps the value out of
// module-eval so tests and SSR-less builds don't trip on an undefined env.
function apiBase(): string | undefined {
  const v = import.meta.env.VITE_PUBLISHER_API_URL;
  return typeof v === 'string' && v.length > 0 ? v.replace(/\/+$/, '') : undefined;
}

export function studioApiConfigured(): boolean {
  return apiBase() !== undefined;
}

/** Carries the HTTP status so the dashboard can tell 403 (not staff) from the rest. */
export class StudioApiError extends Error {
  status: number;
  constructor(status: number, message?: string) {
    super(message ?? `studio-${status}`);
    this.name = 'StudioApiError';
    this.status = status;
  }
}

export type PostStatus = 'draft' | 'approved' | 'scheduled' | 'publishing' | 'published' | 'failed';
export type TargetStatus = 'pending' | 'publishing' | 'published' | 'failed' | 'skipped';

export interface StudioTarget {
  channel: string;
  caption: string | null;
  status: TargetStatus;
  url: string | null;
  externalId: string | null;
  error: string | null;
}

export interface StudioMedia {
  kind: 'photo' | 'video';
  url?: string;
  path?: string;
  alt?: string;
}

export interface StudioPost {
  id: string;
  title: string;
  body: string;
  status: PostStatus;
  scheduleAt: number | null;
  media: StudioMedia[];
  targets: StudioTarget[];
  created_at: number;
  updated_at: number;
}

export interface Channel {
  channel: string;
  kinds: string[];
}

export interface NewPostInput {
  title?: string;
  body: string;
  targets: { channel: string; caption?: string }[];
}

async function request<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const API = apiBase();
  if (!API) throw new StudioApiError(0, 'studio-api-not-configured');
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { 'content-type': 'application/json' } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) throw new StudioApiError(res.status);
  return (await res.json()) as T;
}

export function listChannels(token: string): Promise<Channel[]> {
  return request<{ channels: Channel[] }>(token, '/channels').then((d) => d.channels);
}

export function listPosts(token: string): Promise<StudioPost[]> {
  return request<{ posts: StudioPost[] }>(token, '/posts').then((d) => d.posts);
}

export function createPost(token: string, input: NewPostInput): Promise<StudioPost> {
  return request<{ post: StudioPost }>(token, '/posts', {
    method: 'POST',
    body: JSON.stringify(input),
  }).then((d) => d.post);
}

export function approvePost(token: string, id: string): Promise<StudioPost> {
  return request<{ post: StudioPost }>(token, `/posts/${id}/approve`, { method: 'POST' }).then(
    (d) => d.post,
  );
}

export function publishPost(token: string, id: string): Promise<StudioPost> {
  return request<{ post: StudioPost }>(token, `/posts/${id}/publish`, { method: 'POST' }).then(
    (d) => d.post,
  );
}

/** Per-channel text limits, for the composer's live count. 0 = no limit shown. */
export const CHANNEL_LIMITS: Record<string, number> = {
  bluesky: 300,
  discord: 2000,
  x: 280,
  simulated: 2000,
  devlog: 0,
};
