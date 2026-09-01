/**
 * PublicNav.tsx — แถบนำทางเดียวสำหรับหน้า Guest ทั้งหมด (Landing/Login/Register)
 * ใช้ดีไซน์ GymKaK (โลโก้ + เมนู + ปุ่มเข้าสู่ระบบ/สมัครสมาชิก) แทนที่แถบเรียบเดิมของ PublicLayout
 */

import { Link, useLocation } from 'react-router-dom';
import './PublicNav.css';

function PublicNav() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <nav className="public-nav">
      <Link to="/" className="public-nav__logo">
        <h1>Gymyamjamsai</h1>
      </Link>

      {isLanding && (
        <ul className="public-nav__links">
          <li><a href="#exercises">ท่าออกกำลัง</a></li>
          <li><a href="#programs">โปรแกรม</a></li>
          <li><a href="#features">ฟีเจอร์</a></li>
        </ul>
      )}

      <div className="public-nav__cta">
        <Link to="/login" className="public-nav__btn public-nav__btn--ghost">
          เข้าสู่ระบบ
        </Link>
        <Link to="/register" className="public-nav__btn public-nav__btn--primary">
          สมัครสมาชิก
        </Link>
      </div>
    </nav>
  );
}

export default PublicNav;
