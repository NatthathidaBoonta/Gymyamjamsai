/**
 * PublicLayout.tsx — Layout สำหรับ Guest (ยังไม่เข้าสู่ระบบ)
 * โครงสร้าง: Topbar (โลโก้ + ปุ่ม Login/Register) + Main Content เต็มความกว้าง
 */

import { Outlet, useLocation } from 'react-router-dom';
import PublicNav from '../components/PublicNav';
import './PublicLayout.css';

function PublicLayout() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <div className="pub">
      <PublicNav />

      <main className="pub__main">
        <Outlet />
      </main>

      {/* หน้า Landing มี footer ของตัวเองอยู่แล้ว (landing__footer) ไม่ต้องซ้ำ */}
      {!isLanding && (
        <footer className="pub__footer">
          © 2026 Gymyamjamsai — ระบบติดตามพัฒนาการการออกกำลังกาย
        </footer>
      )}
    </div>
  );
}

export default PublicLayout;
