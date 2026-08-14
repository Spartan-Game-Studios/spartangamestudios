import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/Layout/Layout';
import { Home } from '@/pages/Home/Home';
import { Games } from '@/pages/Games/Games';
import { GameDetail } from '@/pages/GameDetail/GameDetail';
import { Devlog } from '@/pages/Devlog/Devlog';
import { DevlogPost } from '@/pages/Devlog/DevlogPost';
import { Press } from '@/pages/Press/Press';
import { About } from '@/pages/About/About';
import { NotFound } from '@/pages/NotFound/NotFound';
import { SignIn } from '@/pages/Account/SignIn';
import { Account } from '@/pages/Account/Account';

export const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'games', element: <Games /> },
      { path: 'games/:slug', element: <GameDetail /> },
      { path: 'devlog', element: <Devlog /> },
      { path: 'devlog/:slug', element: <DevlogPost /> },
      { path: 'press', element: <Press /> },
      { path: 'about', element: <About /> },
      { path: 'signin', element: <SignIn /> },
      { path: 'account', element: <Account /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
