import { Outlet, ScrollRestoration } from 'react-router-dom';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';

export function Layout() {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <SiteFooter />
      <ScrollRestoration />
    </>
  );
}
