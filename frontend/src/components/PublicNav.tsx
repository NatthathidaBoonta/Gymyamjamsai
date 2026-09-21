/**
 * PublicNav.tsx — แถบนำทางหน้าสาธารณะ
 * Guest: โลโก้ + เข้าสู่ระบบ/สมัคร · ล็อกอินอยู่: แสดง TopNav ตามบทบาท (จนกว่าจะออกจากระบบ)
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import TopNav from './TopNav';
import './PublicNav.css';

function PublicNav() {
  const { isAuthenticated, isLoading } = useAuth();

  // ระหว่างตรวจ token ตอนเปิดแอป ยังไม่รู้สถานะ → แสดงแบบ guest ไว้ก่อน (ไม่กระพริบเมนู)
  if (!isLoading && isAuthenticated) return <TopNav />;

  return (
    <nav className="public-nav" aria-label="เมนูหลัก">
      <div className="public-nav__inner">
        <Link to="/" className="public-nav__logo">
          <h1>Gymyamjamsai</h1>
        </Link>

        <div className="public-nav__cta">
          <Link to="/login" className="btn btn--secondary btn--sm">
            เข้าสู่ระบบ
          </Link>
          <Link to="/register" className="btn btn--primary btn--sm">
            สมัครสมาชิก
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default PublicNav;
