/**
 * src/routes/Router.tsx
 *
 * Application Router
 * กำหนด Routes ทั้งหมดของ Application
 */

import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import ProtectedRoute from './ProtectedRoute';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Profile from '../pages/Profile';
import Exercises from '../pages/Exercises';
import Landing from '../pages/Landing';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // Protected Routes (ต้อง login)
      {
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: <Home />,
          },
          {
            path: 'profile',
            element: <Profile />,
          },
          {
            path: 'exercises',
            element: <Exercises />,
          },
        ],
      },
    ],
  },
  // Public Routes
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/welcome',
    element: <Landing />,
  },
]);

export default router;
