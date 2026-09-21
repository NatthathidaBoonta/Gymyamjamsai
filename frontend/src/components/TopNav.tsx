/**
 * TopNav.tsx — แถบนำทางด้านบนสำหรับผู้ที่เข้าสู่ระบบแล้ว (ใช้ทั้งใน DashboardLayout และหน้าสาธารณะ)
 * โลโก้ · หน้าหลัก · เมนูตาม role · แจ้งเตือน · บทบาท · ออกจากระบบ — มือถือยุบเป็นแผง ☰
 */

import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { NAV_BY_ROLE, ROLE_LABEL } from '../routes/navConfig';
import NotificationBell from './NotificationBell';
import '../layouts/DashboardLayout.css';

function TopNav() {
  const location = useLocation();
  const { role, logout } = useAuth();
  const [open, setOpen] = useState(false);

  // ปิดเมนูมือถืออัตโนมัติเมื่อเปลี่ยนหน้า
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // ปิดด้วย Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const navItems = role ? NAV_BY_ROLE[role] : [];

  return (
    <>
      <header className="topnav">
        <div className={`topnav__inner ${open ? 'topnav__inner--open' : ''}`}>
          <Link to="/" className="topnav__brand" aria-label="Gymyamjamsai — หน้าหลัก">
            <span className="topnav__brand-dot"></span>
            <span className="topnav__brand-name">Gymyamjamsai</span>
          </Link>

          <nav className="topnav__links" aria-label="เมนู">
            <Link to="/" className="topnav__link">
              <i className="ri-home-5-line" aria-hidden="true"></i>
              <span>หน้าหลัก</span>
            </Link>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `topnav__link ${isActive ? 'topnav__link--active' : ''}`}
              >
                <i className={item.icon} aria-hidden="true"></i>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="topnav__actions">
            <NotificationBell />
            <span className="topnav__user" title={role ? ROLE_LABEL[role] : ''}>
              <i className="ri-user-3-line" aria-hidden="true"></i>
              <span className="topnav__role">{role ? ROLE_LABEL[role] : ''}</span>
            </span>
            <button type="button" className="btn btn--ghost btn--sm topnav__logout" onClick={logout}>
              <i className="ri-logout-box-r-line" aria-hidden="true"></i>
              <span>ออกจากระบบ</span>
            </button>
            <button
              type="button"
              className="topnav__burger"
              aria-label={open ? 'ปิดเมนู' : 'เปิดเมนู'}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              <i className={open ? 'ri-close-line' : 'ri-menu-line'}></i>
            </button>
          </div>

          {/* แผงเมนูมือถือ (ภายใน pill เดียวกัน เลื่อนลง) */}
          <nav className="topnav__mobile" aria-label="เมนูมือถือ">
            <Link to="/" className="topnav__mlink">
              <i className="ri-home-5-line" aria-hidden="true"></i> หน้าหลัก
            </Link>
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} className={({ isActive }) => `topnav__mlink ${isActive ? 'on' : ''}`}>
                <i className={item.icon} aria-hidden="true"></i> {item.label}
              </NavLink>
            ))}
            <div className="topnav__mfoot">
              <span className="topnav__mrole"><i className="ri-user-3-line"></i> {role ? ROLE_LABEL[role] : ''}</span>
              <button type="button" className="btn btn--danger btn--sm" onClick={logout}>
                <i className="ri-logout-box-r-line"></i> ออกจากระบบ
              </button>
            </div>
          </nav>
        </div>
      </header>

      {open && <div className="topnav__backdrop" onClick={() => setOpen(false)} aria-hidden="true" />}

    </>
  );
}

export default TopNav;
