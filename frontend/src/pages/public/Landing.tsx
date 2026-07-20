/**
 * Landing.tsx — หน้าแรกสำหรับ Guest (/)
 * Phase 8: โครงหน้า + ปุ่มนำทาง (ยังไม่ดึงข้อมูลจริงจาก API)
 */

import { Link } from 'react-router-dom';
import './Landing.css';

const FEATURES = [
  { icon: '📊', title: 'ติดตามพัฒนาการ', desc: 'บันทึกน้ำหนักและดูกราฟความก้าวหน้าของตัวเอง' },
  { icon: '🏋️', title: 'ตารางออกกำลังกาย', desc: 'รับตารางที่เหมาะกับเป้าหมายของคุณ' },
  { icon: '📅', title: 'ลงทะเบียนคลาส', desc: 'จองคลาสกับผู้ฝึกสอนได้ง่ายๆ' },
];

function Landing() {
  return (
    <div className="landing">
      <section className="landing__hero">
        <h1 className="landing__title">ติดตามพัฒนาการการออกกำลังกายของคุณ</h1>
        <p className="landing__subtitle">
          บันทึกผล ดูสถิติ และลงทะเบียนคลาสออกกำลังกาย ครบในที่เดียว
        </p>
        <div className="landing__cta">
          <Link to="/register" className="btn btn--primary">
            เริ่มต้นใช้งาน
          </Link>
          <Link to="/login" className="btn btn--ghost">
            เข้าสู่ระบบ
          </Link>
        </div>
      </section>

      <section className="landing__features">
        {FEATURES.map((f) => (
          <article key={f.title} className="landing__feature">
            <span className="landing__feature-icon" aria-hidden="true">
              {f.icon}
            </span>
            <h2 className="landing__feature-title">{f.title}</h2>
            <p className="landing__feature-desc">{f.desc}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

export default Landing;
