/**
 * Landing.tsx — GymKaK Style Black/Purple Theme
 * Professional fitness tracking platform with modern design
 */

import { Link } from 'react-router-dom';
import './Landing.css';

function Landing() {
  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero__content">
          <h2 className="hero__title">ออกกำลังกายอย่างฉลาด</h2>
          <p className="hero__subtitle">
            ระบบติดตามการออกกำลังกายครบครัน พร้อม 100+ ท่าตัวอย่าง คำแนะนำทีละขั้นตอน
            และการวิเคราะห์กล้ามเนื้อ สำหรับทุกระดับ
          </p>
          <div className="hero__actions">
            <Link to="/register" className="btn btn--primary btn--large">
              เริ่มต้นฟรี
            </Link>
            <Link to="/exercise-library" className="btn btn--outline btn--large">
              ดูไลบรารีท่า
            </Link>
          </div>
        </div>
        <div className="hero__visual">
          <div className="hero__image">Hero</div>
        </div>
      </section>

      {/* Exercises Showcase */}
      <section id="exercises" className="exercises-showcase">
        <h2>ท่าออกกำลังกายจากทั่วโลก</h2>
        <p className="section-subtitle">100+ ท่ามาจากแหล่งที่เชื่อถือได้ พร้อมคำแนะนำอย่างละเอียด</p>
        <div className="exercises-grid">
          <div className="exercise-card">
            <div className="exercise-icon"><i className="ri-user-star-line"></i></div>
            <h3>สำหรับสมาชิก</h3>
            <p>บันทึกการออกกำลังกาย, ติดตามน้ำหนัก และประเมินผลสุขภาพรายวัน</p>
          </div>
          <div className="role-card">
            <div className="exercise-icon"><i className="ri-team-line"></i></div>
            <h3>สำหรับเทรนเนอร์</h3>
            <p>ออกแบบโปรแกรมการสอน, เช็คชื่อสมาชิก และติดตามพัฒนาการของนักเรียน</p>
          </div>
          <div className="role-card">
            <div className="exercise-icon"><i className="ri-drag-move-line"></i></div>
            <h3>12+ Flexibility</h3>
            <p>เพิ่มความยืดหยุ่น</p>
          </div>
        </div>
        <div className="showcase-cta">
          <Link to="/exercise-library" className="btn btn--primary">
            เข้าชมไลบรารีท่า →
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <h2>ทำไมเลือก GymYamjamsai?</h2>
        <div className="features__grid">
          <div className="feature-card">
            <div className="feature__icon"><i className="ri-play-circle-line"></i></div>
            <h4>มีรูปและวิดีโอสอน</h4>
            <p>ดูท่าที่ถูกต้อง ป้องกันอาการบาดเจ็บ</p>
          </div>
          <div className="feature-card">
            <div className="feature__icon"><i className="ri-edit-circle-line"></i></div>
            <h4>บันทึกง่าย</h4>
            <p>กรอกข้อมูลรวดเร็วผ่านมือถือ</p>
          </div>
          <div className="feature-card">
            <div className="feature__icon"><i className="ri-heart-pulse-line"></i></div>
            <h4>ครอบคลุมทุกสาย</h4>
            <p>รองรับทั้งเวทเทรนนิ่งและคาร์ดิโอ</p>
          </div>
          <div className="feature-card">
            <div className="feature__icon"><i className="ri-bar-chart-line"></i></div>
            <h4>สถิติชัดเจน</h4>
            <p>ดูกราฟพัฒนาการของตัวเองได้ทุกที่</p>
          </div>
          <div className="feature-card">
            <div className="feature__icon"><i className="ri-medal-line"></i></div>
            <h4>ติดตามเป้าหมาย</h4>
            <p>อัปเดตน้ำหนัก / BMI ให้ถึงเป้า</p>
          </div>
          <div className="feature-card">
            <div className="feature__icon"><i className="ri-star-smile-line"></i></div>
            <h3>สำหรับทุกระดับ</h3>
            <p>ผู้เริ่มต้น ระดับกลาง หรือขั้นสูง</p>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="programs">
        <h2>โปรแกรมฝึกกำลัง</h2>
        <div className="programs__grid">
          <div className="program-card">
            <div className="program__icon"><i className="ri-user-star-line"></i></div>
            <h3>Strength</h3>
            <p>สร้างกำลังและมวลกล้าม</p>
            <span className="tag">สำหรับทุกคน</span>
          </div>
          <div className="program-card">
            <div className="program__icon"><i className="ri-run-line"></i></div>
            <h3>Cardio</h3>
            <p>เพิ่มความสามารถทางหัวใจ</p>
            <span className="tag">ลดไขมัน</span>
          </div>
          <div className="program-card">
            <div className="program__icon"><i className="ri-heart-3-line"></i></div>
            <h3>Flexibility</h3>
            <p>ยืดหยุ่นและการฟื้นตัว</p>
            <span className="tag">การฟื้นตัว</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>พร้อมเริ่มต้นหรือยัง?</h2>
        <p>ลงทะเบียนและเข้าถึงห้องสมุดท่าออกกำลังกายครบครัน 100+ ท่า</p>
        <Link to="/register" className="btn btn--primary btn--large">
          สมัครสมาชิกฟรี
        </Link>
      </section>

      {/* Footer */}
      <footer className="landing__footer">
        <p>© 2026 GymYamjamsai — ระบบติดตามการออกกำลังกาย</p>
      </footer>
    </div>
  );
}

export default Landing;
