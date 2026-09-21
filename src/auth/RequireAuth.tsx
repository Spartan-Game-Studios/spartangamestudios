import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

/**
 * Route guard for the shop. The merch storefront, product pages, cart, and
 * checkout render only for a signed-in visitor; everyone else is sent to sign in
 * with a `from` so they land back on the shop afterwards (SignIn honours it).
 *
 * Waits for the stored session to resolve before deciding, so a returning
 * signed-in visitor isn't bounced to sign-in during that first-paint window.
 */
export function RequireAuth() {
  const { session, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!session) {
    return <Navigate to="/signin" replace state={{ from: location.pathname + location.search }} />;
  }
  return <Outlet />;
}
