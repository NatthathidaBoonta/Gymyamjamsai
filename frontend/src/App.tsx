/**
 * src/App.tsx
 *
 * Root Application Component
 * ทำหน้าที่เป็น Layout wrapper สำหรับ React Router
 */

import { Outlet } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div id="app-root">
      <Outlet />
    </div>
  );
}

export default App;
