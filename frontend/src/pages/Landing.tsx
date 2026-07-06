/**
 * src/pages/Landing.tsx
 *
 * Landing Page (Public)
 * หน้าแรกก่อน Login — แนะนำระบบและชวนสมัครสมาชิก/เข้าสู่ระบบ
 */

import { useNavigate } from 'react-router-dom';
import { getToken } from '../services/auth';
import './Landing.css';

const FEATURES = [
  {
    icon: '🎯',
    title: 'แนะนำท่าที่ใช่',
    description: 'คลังท่าออกกำลังกายพร้อมคำอธิบาย จัดกลุ่มตามกล้ามเนื้อเป้าหมายและระดับความยาก',
  },
  {
    icon: '📊',
    title: 'ติดตามพัฒนาการ',
    description: 'บันทึกน้ำหนัก ส่วนสูง และผลการออกกำลังกาย เห็นความก้าวหน้าของตัวเองชัดเจน',
  },
  {
    icon: '🗓️',
    title: 'ตารางเฉพาะคุณ',
    description: 'ออกแบบตารางออกกำลังกายให้เหมาะกับเป้าหมายและระดับความฟิตของแต่ละคน',
  },
  {
    icon: '⚡',
    title: 'เริ่มได้ทันที',
    description: 'ไม่มีพื้นฐานก็เริ่มได้ สมัครสมาชิกฟรี กรอกข้อมูลแป๊บเดียวก็พร้อมออกกำลังกาย',
  },
];

const STEPS = [
  { number: '01', title: 'สมัครสมาชิก', description: 'สร้างบัญชีฟรีภายในไม่กี่วินาที' },
  { number: '02', title: 'กรอกข้อมูลเริ่มต้น', description: 'น้ำหนัก ส่วนสูง เป้าหมาย และระดับความฟิตของคุณ' },
  { number: '03', title: 'เริ่มออกกำลังกาย', description: 'รับตารางและท่าออกกำลังกายที่เหมาะกับคุณทันที' },
];

export default function Landing() {
  const navigate = useNavigate();
  const isLoggedIn = !!getToken();

  const goToApp = () => navigate(isLoggedIn ? '/' : '/login');
  const goToRegister = () => navigate(isLoggedIn ? '/' : '/login?mode=register');

  return (
    <div className="landing-page">
      {/* ---- Nav ---- */}
      <header className="landing-nav">
        <div className="landing-nav-logo">🏋️ GYMYAMJAMSAI</div>
        <button className="landing-nav-cta" onClick={goToApp}>
          {isLoggedIn ? 'ไปที่แดชบอร์ด' : 'เข้าสู่ระบบ'}
        </button>
      </header>

      {/* ---- Hero ---- */}
      <section className="landing-hero">
        <div className="landing-hero-glow landing-hero-glow-1" />
        <div className="landing-hero-glow landing-hero-glow-2" />
        <div className="landing-hero-content">
          <span className="landing-hero-eyebrow">ระบบติดตามพัฒนาการการออกกำลังกาย</span>
          <h1 className="landing-hero-title">
            เริ่มออกกำลังกาย
            <br />
            <span className="gradient-text">อย่างมีทิศทาง</span>
          </h1>
          <p className="landing-hero-subtitle">
            ไม่มีพื้นฐาน ไม่มีตารางที่ชัดเจน ก็เริ่มได้ — Gymyamjamsai ช่วยแนะนำท่าที่ถูกต้อง
            ออกแบบตารางให้เหมาะกับคุณ และติดตามพัฒนาการทุกก้าวของการออกกำลังกาย
          </p>
          <div className="landing-hero-actions">
            <button className="landing-btn-primary" onClick={goToRegister}>
              {isLoggedIn ? 'ไปที่แดชบอร์ด' : 'สมัครสมาชิกฟรี'}
            </button>
            <button className="landing-btn-outline" onClick={goToApp}>
              {isLoggedIn ? 'เข้าสู่ระบบอีกครั้ง' : 'เข้าสู่ระบบ'}
            </button>
          </div>
        </div>
      </section>

      {/* ---- Features ---- */}
      <section className="landing-section">
        <h2 className="landing-section-title">ทำไมต้อง Gymyamjamsai</h2>
        <div className="landing-features-grid">
          {FEATURES.map((f) => (
            <div className="landing-feature-card" key={f.title}>
              <span className="landing-feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Steps ---- */}
      <section className="landing-section landing-steps-section">
        <h2 className="landing-section-title">เริ่มต้นง่ายๆ ใน 3 ขั้นตอน</h2>
        <div className="landing-steps-grid">
          {STEPS.map((s) => (
            <div className="landing-step-card" key={s.number}>
              <span className="landing-step-number">{s.number}</span>
              <h3>{s.title}</h3>
              <p>{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="landing-cta-section">
        <h2>พร้อมเริ่มต้นหรือยัง?</h2>
        <p>สมัครสมาชิกวันนี้ ฟรี ไม่มีค่าใช้จ่าย</p>
        <button className="landing-btn-primary" onClick={goToRegister}>
          {isLoggedIn ? 'ไปที่แดชบอร์ด' : 'สมัครสมาชิกฟรี'}
        </button>
      </section>

      {/* ---- Footer ---- */}
      <footer className="landing-footer">
        <span>🏋️ Gymyamjamsai</span>
        <span>เครื่องมือช่วยเหลือ ไม่ทดแทนคำแนะนำจากแพทย์หรือผู้เชี่ยวชาญ</span>
      </footer>
    </div>
  );
}
