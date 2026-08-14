import { useEffect, useRef, useState } from 'react';

/**
 * Renders Google's own sign-in button via Google Identity Services.
 *
 * GIS is loaded on demand rather than from index.html: the script sets cookies
 * and phones home, and most visitors never open the sign-in page. Loading it
 * only when the button is actually rendered keeps that off every other page.
 *
 * The button is Google's, not ours — GIS renders it into a div we own. That is a
 * requirement of their branding terms, and it is also why the styling here is
 * limited to sizing the container.
 */

const SRC = 'https://accounts.google.com/gsi/client';

interface GoogleAccounts {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (response: { credential?: string }) => void;
        auto_select?: boolean;
        challenge_ux_mode?: string;
      }) => void;
      renderButton: (
        parent: HTMLElement,
        options: { theme?: string; size?: string; width?: number; text?: string },
      ) => void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleAccounts;
  }
}

let loader: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (loader) return loader;
  loader = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }
    const el = document.createElement('script');
    el.src = SRC;
    el.async = true;
    el.defer = true;
    el.onload = () => resolve();
    el.onerror = () => {
      // Let a later attempt retry rather than caching the failure forever —
      // this fires on a flaky network as readily as on a blocked script.
      loader = null;
      reject(new Error('google_script_failed'));
    };
    document.head.appendChild(el);
  });
  return loader;
}

export interface GoogleButtonState {
  /** Attach to the element GIS should render its button into. */
  ref: React.RefObject<HTMLDivElement | null>;
  /** False when no client id is configured, or the script could not load. */
  available: boolean;
}

export function useGoogleButton(onCredential: (idToken: string) => void): GoogleButtonState {
  const ref = useRef<HTMLDivElement | null>(null);
  const clientId = import.meta.env['VITE_GOOGLE_CLIENT_ID'] ?? '';
  const [available, setAvailable] = useState(Boolean(clientId));

  // The callback must not re-run this effect: GIS would re-render the button on
  // every keystroke elsewhere in the form.
  const handler = useRef(onCredential);
  handler.current = onCredential;

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;

    loadScript()
      .then(() => {
        if (cancelled || !ref.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response.credential) handler.current(response.credential);
          },
          // No One Tap prompt: it appears unbidden on page load and is a poor
          // fit for a site where signing in is optional.
          auto_select: false,
        });
        window.google.accounts.id.renderButton(ref.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
        });
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  return { ref, available };
}
