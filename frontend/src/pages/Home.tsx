/**
 * src/pages/Home.tsx
 *
 * Home Page (Protected)
 * หน้า Dashboard หลังจาก Login สำเร็จ
 */

import { useNavigate } from 'react-router-dom';
import Status from '../components/status/Status';
import { logout, getCurrentUser } from '../services/auth';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="home-page">
      {/* Navbar */}
      <nav className="home-navbar">
        <div className="home-logo">🏋️ Gymyamjamsai</div>
        <div className="home-nav-user">
          {user && (
            <span className="home-user-name">
              👤 {user.name || user.email}
            </span>
          )}
          <button className="home-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="home-main">
        <div className="home-greeting">
          <h1>Welcome back{user?.name ? `, ${user.name}` : ''}! 👋</h1>
          <p>Here's what's happening with your system today.</p>
        </div>

        <h2 className="home-section-title">🔌 System Status</h2>
        <div className="home-status-wrapper">
          <Status />
        </div>
      </main>
    </div>
  );
}
