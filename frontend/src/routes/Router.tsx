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
        ],
      },
    ],
  },
  // Public Routes
  {
    path: '/login',
    element: <Login />,
  },
]);

export default router;
