import { useContext } from 'react';
import { AuthContext, type AuthState } from './context';

/** Session access. Throws outside AuthProvider rather than returning a null
 *  that every caller would have to re-check. */
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
