/// <reference types="vite/client" />

/**
 * Types for the build-time configuration this site reads.
 *
 * Without this, `import.meta.env['VITE_…']` is `any`, and the project's lint
 * rules reject unsafe assignments from it — which is the correct complaint: an
 * untyped env value silently becomes an untyped string anywhere it is used.
 *
 * Every value here is inlined into the public bundle. None of them may be secret.
 */
interface ImportMetaEnv {
  /** Nakama client API base, over TLS. Empty disables authentication. */
  readonly VITE_NAKAMA_URL?: string;
  /** Nakama server key. Public by design — see src/lib/nakama.ts. */
  readonly VITE_NAKAMA_SERVER_KEY?: string;
  /** Google Identity Services client id. Empty hides the Google button. */
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  /** itch.io OAuth application client id. Empty hides the itch.io button. */
  readonly VITE_ITCH_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
