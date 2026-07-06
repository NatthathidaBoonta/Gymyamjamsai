/**
 * src/components/layout/Navbar.tsx
 *
 * Shared Navbar สำหรับหน้าที่ Login แล้ว (Home, Exercises, ฯลฯ)
 */

import { NavLink, useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../../services/auth';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `app-navbar-link ${isActive ? 'active' : ''}`;

  return (
    <nav className="app-navbar">
      <div className="app-navbar-logo">🏋️ Gymyamjamsai</div>

      <div className="app-navbar-links">
        <NavLink to="/" end className={linkClass}>
          แดชบอร์ด
        </NavLink>
        <NavLink to="/exercises" className={linkClass}>
          คลังท่าออกกำลังกาย
        </NavLink>
      </div>

      <div className="app-navbar-user">
        {user && <span className="app-navbar-username">👤 {user.name || user.email}</span>}
        <button className="app-navbar-profile-btn" onClick={() => navigate('/profile')}>
          โปรไฟล์
        </button>
        <button className="app-navbar-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
