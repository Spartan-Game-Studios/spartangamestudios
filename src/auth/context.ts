import { createContext } from 'react';
import type { Session } from '@/lib/nakama';

/**
 * The context object lives apart from the provider component.
 *
 * React Fast Refresh only preserves state for modules that export components
 * exclusively, so a file exporting both AuthProvider and this constant loses
 * component state on every edit. Splitting them is the standard fix.
 */
export interface AuthState {
  session: Session | null;
  /** True until the stored session has been loaded and (if needed) refreshed. */
  loading: boolean;
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInGoogle: (idToken: string) => Promise<void>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthState | null>(null);
