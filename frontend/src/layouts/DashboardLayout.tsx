/**
 * DashboardLayout.tsx — Layout สำหรับผู้ที่เข้าสู่ระบบแล้ว (Member/Trainer/Admin)
 *
 * โครงสร้าง: Sidebar (เมนูตาม Role) + Topbar (โปรไฟล์/แจ้งเตือน/ออกจากระบบ) + Main Content
 * Responsive: จอ >= 900px แสดง Sidebar ถาวร / จอเล็กกว่านั้น Sidebar ยุบเป็น drawer เปิดด้วยปุ่ม ☰
 *
 * Phase 9: role มาจาก JWT ผ่าน useAuth (เดิม Phase 8 เดาจาก URL)
 */

import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { NAV_BY_ROLE, ROLE_LABEL } from '../routes/navConfig';
import ErrorBoundary from '../components/ErrorBoundary';
import NotificationBell from '../components/NotificationBell';
import './DashboardLayout.css';

function DashboardLayout() {
  const location = useLocation();
  const { role, logout } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // ปิด drawer อัตโนมัติเมื่อเปลี่ยนหน้า (พฤติกรรมที่คาดหวังบนมือถือ)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // ระหว่าง ProtectedRoute กำลังตรวจสิทธิ์ อาจยังไม่มี role
  const navItems = role ? NAV_BY_ROLE[role] : [];

  return (
    <div className="dash">
      <header className="dash__topbar">
        <button
          type="button"
          className="dash__menu-btn"
          aria-label="เปิด/ปิดเมนู"
          aria-expanded={isSidebarOpen}
          onClick={() => setSidebarOpen((open) => !open)}
        >
          <i className="ri-menu-line"></i>
        </button>
        <span className="dash__brand">Gymyamjamsai</span>

        <div className="dash__topbar-actions">
          <NotificationBell />
          <span className="dash__profile">
            <i className="ri-user-line" style={{ fontSize: '1.1rem' }}></i>
            <span className="dash__role">{role ? ROLE_LABEL[role] : ''}</span>
          </span>
          <button type="button" className="btn btn--ghost dash__logout" onClick={logout}>
            ออกจากระบบ
          </button>
        </div>
      </header>

      {/* ฉากหลังทึบสำหรับปิด drawer บนมือถือ */}
      {isSidebarOpen && (
        <div className="dash__backdrop" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      <aside className={`dash__sidebar ${isSidebarOpen ? 'dash__sidebar--open' : ''}`}>
        <nav>
          <ul className="dash__nav">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `dash__nav-link ${isActive ? 'dash__nav-link--active' : ''}`
                  }
                >
                  <i className={item.icon} aria-hidden="true"></i>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* ปุ่มออกจากระบบสำหรับมือถือ (ปุ่มบน topbar ถูกซ่อนในจอเล็ก) */}
        <button type="button" className="btn btn--ghost dash__logout-mobile" onClick={logout}>
          ออกจากระบบ
        </button>
      </aside>

      <main className="dash__main">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default DashboardLayout;
