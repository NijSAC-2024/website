import { createBrowserRouter } from 'react-router-dom';

import ErrorPage from './pages/ErrorPage.tsx';
import Home from './pages/Home.tsx';
import Agenda from './pages/Agenda.tsx';
import Event from './pages/Event.tsx';
import Signup from './pages/Signup.tsx';
import TextPage from './pages/TextPage.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    errorElement: <ErrorPage />
  },
  {
    path: '/register',
    element: <Signup />,
    errorElement: <ErrorPage />
  },
  {
    path: '/agenda',
    element: <Agenda />,
    errorElement: <ErrorPage />
  },
  {
    path: '/about',
    element: <TextPage />,
    errorElement: <ErrorPage />
  },
  {
    path: '/agenda/:eventId',
    element: <Event />,
    errorElement: <ErrorPage />
  },
  {
    path: '*',
    element: <ErrorPage />
  }
]);

export default router;
