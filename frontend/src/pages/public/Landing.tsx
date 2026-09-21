/**
 * Landing.tsx — หน้าแรกสำหรับ Guest
 * Hero → "ฟีเจอร์มีอะไรบ้าง" (การ์ด 6) → คลังท่าแบบแถวเลื่อนขวา (ข้อมูลจริงจาก API) → CTA
 */

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { HOME_BY_ROLE } from '../../routes/navConfig';
import ExerciseCard from '../../components/ExerciseCard';
import ExerciseDetailDialog from '../../components/ExerciseDetailDialog';
import { CountUp, CursorGlow, IntroReveal, Marquee, ParticleField, Reveal, RotatingWord, ScrollProgress, Tilt } from '../../components/landing/LandingFx';
import { searchExercises, type Exercise } from '../../services/exercise.service';
import './Landing.css';

const HERO_WORDS = ['มีแผน', 'เห็นผล', 'มั่นใจ', 'ไม่บาดเจ็บ'];
const MARQUEE = ['Squat', 'Deadlift', 'Bench Press', 'Pull-ups', 'Plank', 'Lunges', 'Shoulder Press', 'Dips', 'Lat Pulldown', 'Russian Twist', 'Calf Raise', 'Chin-Up'];

const FEATURES = [
  { icon: 'ri-calendar-check-line', title: 'ตารางฝึกตามเป้าหมาย', desc: 'เลือกลดน้ำหนัก เพิ่มกล้าม หรือฟิตทั่วไป ระบบจัดท่า เซต ครั้ง และวันฝึกให้ทั้งสัปดาห์จากคลังท่าจริง' },
  { icon: 'ri-edit-circle-line', title: 'บันทึกผลการฝึก', desc: 'กดที่ท่าในตารางของวันนั้น เซต/ครั้งเป้าหมายถูกเติมให้ แค่ปรับแล้วบันทึก — ทำได้ระหว่างพักเซต' },
  { icon: 'ri-line-chart-line', title: 'กราฟพัฒนาการ', desc: 'น้ำหนัก BMI และความถี่การฝึกย้อนหลัง เห็นแนวโน้มชัดโดยไม่ต้องคำนวณเอง' },
  { icon: 'ri-group-line', title: 'คอร์สจากผู้ฝึกสอน', desc: 'ดูคอร์สที่เปิด เห็นที่นั่งเหลือแบบเรียลไทม์ จอง/ยกเลิกได้เอง ระบบกันจองซ้ำและเวลาชนกัน' },
];

function Landing() {
  const { isAuthenticated, role } = useAuth();
  // ล็อกอินอยู่ → ปุ่มหลักพาไป Dashboard ของบทบาทแทนสมัครสมาชิก
  const home = isAuthenticated && role ? HOME_BY_ROLE[role] : null;
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const [perView, setPerView] = useState(3);
  const timer = useRef<number | null>(null);

  const pages = Math.max(1, Math.ceil(exercises.length / perView));

  // จอแคบโชว์น้อยลง (มือถือ 1, แท็บเล็ต 2, เดสก์ท็อป 3)
  useEffect(() => {
    const mq1 = window.matchMedia('(max-width: 640px)');
    const mq2 = window.matchMedia('(max-width: 960px)');
    const update = () => setPerView(mq1.matches ? 1 : mq2.matches ? 2 : 3);
    update();
    mq1.addEventListener('change', update);
    mq2.addEventListener('change', update);
    return () => {
      mq1.removeEventListener('change', update);
      mq2.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    setPage((p) => Math.min(p, pages - 1));
  }, [pages]);

  // เลื่อนอัตโนมัติทุก 3 วิ — หยุดเมื่อชี้เมาส์/โฟกัส/เปิด dialog/แท็บไม่ได้เปิดอยู่
  useEffect(() => {
    if (paused || selected || pages <= 1 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    timer.current = window.setInterval(() => {
      if (!document.hidden) setPage((p) => (p + 1) % pages);
    }, 3000);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [paused, selected, pages]);

  useEffect(() => {
    searchExercises({ limit: 24 })
      .then((r) => setExercises(r.items))
      .catch(() => setExercises([]));
  }, []);

  /** spotlight ตามเมาส์บนการ์ด (แนว Cruip) — เขียนลง CSS var ไม่ re-render */
  function trackSpot(e: React.MouseEvent<HTMLElement>) {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }

  function go(dir: 1 | -1) {
    setPage((p) => (p + dir + pages) % pages);
  }

  return (
    <div className="landing">
      <IntroReveal />
      <ScrollProgress />
      <CursorGlow />

      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="hero__glow" aria-hidden="true"></div>
        <ParticleField />
        <div className="hero__orbs" aria-hidden="true">
          <span className="hero__orb hero__orb--1"></span>
          <span className="hero__orb hero__orb--2"></span>
          <span className="hero__orb hero__orb--3"></span>
        </div>
        <div className="hero__grid" aria-hidden="true"></div>
        <div className="hero__inner">
          <span className="hero__pill rise" style={{ '--d': 0 } as React.CSSProperties}>
            <span className="hero__pill-dot"></span>
            ระบบติดตามพัฒนาการการออกกำลังกายออนไลน์
          </span>
          <h1 className="hero__title text-gradient shimmer rise" style={{ '--d': 1 } as React.CSSProperties}>
            ออกกำลังกายอย่าง<RotatingWord words={HERO_WORDS} />
            <br />
            เห็นพัฒนาการทุกสัปดาห์
          </h1>
          <p className="hero__subtitle rise" style={{ '--d': 2 } as React.CSSProperties}>
            ตั้งเป้าหมาย รับตารางฝึกที่เหมาะกับคุณ บันทึกผลจากมือถือ แล้วดูกราฟความก้าวหน้า
            — พร้อมจองคอร์สกับผู้ฝึกสอนในที่เดียว
          </p>
          <div className="hero__actions rise" style={{ '--d': 3 } as React.CSSProperties}>
            <Link to={home ?? '/register'} className="btn btn--primary btn--lg btn--shine">
              {home ? 'ไปที่ Dashboard' : 'เริ่มต้นฟรี'} <i className="ri-arrow-right-line"></i>
            </Link>
            <a href="#library" className="btn btn--secondary btn--lg">
              ดูคลังท่า
            </a>
          </div>
          <dl className="hero__stats rise" style={{ '--d': 4 } as React.CSSProperties}>
            <div><dt>Exercises</dt><dd><CountUp to={38} suffix="+" /></dd></div>
            <div><dt>Programs</dt><dd><CountUp to={3} duration={900} /> <small>เป้าหมาย</small></dd></div>
            <div><dt>Quick log</dt><dd><CountUp to={2} duration={700} /> <small>คลิก</small></dd></div>
          </dl>
        </div>
      </section>

      <Marquee items={MARQUEE} />

      {/* ---------- Features ---------- */}
      <section id="features" className="section">
        <div className="section__inner">
          <Reveal className="section__head">
            <h2 className="text-gradient">Features</h2>
            <p>ทุกอย่างที่สมาชิก ผู้ฝึกสอน และผู้ดูแลต้องใช้ — อยู่ในหน้าเดียว ใช้ได้จากมือถือขณะอยู่ที่ยิม</p>
          </Reveal>
          <div className="features__grid">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 90}>
                <Tilt>
                  <article className="card feature-card spot" onMouseMove={trackSpot}>
                    <div className="feature-card__icon"><i className={f.icon}></i></div>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </article>
                </Tilt>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Exercise carousel (3 ท่า/หน้า เลื่อนอัตโนมัติ) ---------- */}
      <section id="library" className="section section--alt">
        <div className="section__inner">
          <Reveal className="rail__head">
            <div>
              <h2 className="text-gradient">Exercise Library</h2>
              <p>กดที่ท่าเพื่อดูภาพเคลื่อนไหว ขั้นตอน และข้อควรระวังแบบเต็ม</p>
            </div>
            <div className="rail__nav">
              <button type="button" className="rail__btn" onClick={() => go(-1)} aria-label="ก่อนหน้า">
                <i className="ri-arrow-left-s-line"></i>
              </button>
              <button type="button" className="rail__btn" onClick={() => go(1)} aria-label="ถัดไป">
                <i className="ri-arrow-right-s-line"></i>
              </button>
            </div>
          </Reveal>

          <div
            className="carousel"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            aria-roledescription="carousel"
            aria-live="polite"
          >
            <div className="carousel__viewport">
              <div
                className="carousel__track"
                style={{ transform: `translateX(-${page * 100}%)`, '--per-view': perView } as React.CSSProperties}
              >
                {exercises.length > 0
                  ? exercises.map((ex) => (
                      <div key={ex.id} className="carousel__slide">
                        <ExerciseCard exercise={ex} onOpen={setSelected} />
                      </div>
                    ))
                  : Array.from({ length: perView }).map((_, i) => (
                      <div key={i} className="carousel__slide"><div className="rail__skeleton" aria-hidden="true"></div></div>
                    ))}
              </div>
            </div>

            {pages > 1 && !paused && !selected && (
              <div className="carousel__progress" key={page} aria-hidden="true"><span></span></div>
            )}
            {pages > 1 && (
              <div className="carousel__dots" role="tablist" aria-label="หน้าของคลังท่า">
                {Array.from({ length: pages }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={i === page}
                    aria-label={`หน้า ${i + 1}`}
                    className={`carousel__dot ${i === page ? 'on' : ''}`}
                    onClick={() => setPage(i)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="rail__foot">
            <Link to="/exercise-library" className="btn btn--secondary">
              ดูคลังท่าทั้งหมด <i className="ri-arrow-right-line"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="section">
        <div className="section__inner">
          <Reveal className="cta card conic">
            <div className="cta__glow" aria-hidden="true"></div>
            <h2 className="text-gradient">พร้อมเริ่มสัปดาห์แรกหรือยัง?</h2>
            <p>สมัครฟรี ตั้งเป้าหมาย แล้วรับตารางฝึกภายในหนึ่งนาที</p>
            <div className="cta__actions">
              <Link to={home ?? '/register'} className="btn btn--primary btn--lg">
                {home ? 'ไปที่ Dashboard' : 'สมัครสมาชิก'} <i className="ri-arrow-right-line"></i>
              </Link>
              {!home && (
                <Link to="/login" className="btn btn--secondary btn--lg">
                  มีบัญชีแล้ว
                </Link>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="landing__footer">
        <div className="section__inner landing__footer-inner">
          <span className="landing__footer-brand">Gymyamjamsai</span>
          <span>© 2026 ระบบติดตามพัฒนาการการออกกำลังกาย</span>
        </div>
      </footer>

      {selected && <ExerciseDetailDialog exercise={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

export default Landing;
