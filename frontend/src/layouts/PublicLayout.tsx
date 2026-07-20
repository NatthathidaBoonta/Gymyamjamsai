/**
 * PublicLayout.tsx — Layout สำหรับ Guest (ยังไม่เข้าสู่ระบบ)
 * โครงสร้าง: Topbar (โลโก้ + ปุ่ม Login/Register) + Main Content เต็มความกว้าง
 */

import { Link, NavLink, Outlet } from 'react-router-dom';
import './PublicLayout.css';

function PublicLayout() {
  return (
    <div className="pub">
      <header className="pub__topbar">
        <Link to="/" className="pub__brand">
          Gymyamjamsai
        </Link>
        <nav className="pub__actions">
          <NavLink to="/login" className="btn btn--ghost">
            เข้าสู่ระบบ
          </NavLink>
          <NavLink to="/register" className="btn btn--primary">
            สมัครสมาชิก
          </NavLink>
        </nav>
      </header>

      <main className="pub__main">
        <Outlet />
      </main>

      <footer className="pub__footer">
        © 2026 Gymyamjamsai — ระบบติดตามพัฒนาการการออกกำลังกาย
      </footer>
    </div>
  );
}

export default PublicLayout;
