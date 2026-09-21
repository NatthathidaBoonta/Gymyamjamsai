/**
 * LandingFx.tsx — ลูกเล่นหน้าแรก (ทุกตัวปิดเองเมื่อ prefers-reduced-motion)
 *
 * IntroReveal   : ม่านโลโก้ตอนเปิดเว็บ ~1 วิ แล้วเปิดออก
 * ParticleField : canvas อนุภาคลอย + เส้นเชื่อม ขยับตามเมาส์ (พื้นหลัง hero)
 * RotatingWord  : คำในหัวข้อสลับเอง (มีแผน / เห็นผล / มั่นใจ …)
 * CountUp       : ตัวเลขวิ่งขึ้นเมื่อเลื่อนมาเห็น
 * Marquee       : แถบข้อความวิ่งไม่รู้จบ
 * Tilt          : การ์ดเอียง 3 มิติตามเมาส์
 * CursorGlow    : แสงตามเมาส์ทั่วหน้า
 * ScrollProgress: แถบบอกความคืบหน้าการเลื่อน (บนสุด)
 * Reveal        : เลื่อนขึ้น/ชัดขึ้นเมื่อเข้าจอ (เริ่มจากมองเห็นอยู่แล้ว ไม่มีช่วงว่างเปล่า)
 */

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import './LandingFx.css';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

/* ---------------- IntroReveal ---------------- */
export function IntroReveal() {
  const reduced = useReducedMotion();
  const [done, setDone] = useState(() => sessionStorage.getItem('gym_intro') === '1');

  useEffect(() => {
    if (done || reduced) {
      setDone(true);
      return;
    }
    const t = window.setTimeout(() => {
      setDone(true);
      sessionStorage.setItem('gym_intro', '1');
    }, 1400);
    return () => window.clearTimeout(t);
  }, [done, reduced]);

  if (done) return null;
  return (
    <div className="intro" aria-hidden="true">
      <div className="intro__mark">
        <span className="intro__dot"></span>
        <span className="intro__word">Gymyamjamsai</span>
      </div>
      <div className="intro__bar"><span></span></div>
    </div>
  );
}

/* ---------------- ParticleField ---------------- */
interface Particle { x: number; y: number; vx: number; vy: number; r: number; hue: 0 | 1 }

export function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || reduced) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    const mouse = { x: -9999, y: -9999 };
    let particles: Particle[] = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(110, Math.floor((w * h) / 14000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6,
        hue: Math.random() < 0.7 ? 0 : 1,
      }));
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        // ดูดเข้าหาเมาส์เบาๆ
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 160 * 160) {
          p.vx += (dx / Math.sqrt(d2 + 1)) * 0.02;
          p.vy += (dy / Math.sqrt(d2 + 1)) * 0.02;
        }
        p.vx *= 0.995;
        p.vy *= 0.995;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;
      }
      // เส้นเชื่อมระหว่างอนุภาคใกล้กัน
      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 120 * 120) {
            const alpha = (1 - Math.sqrt(d2) / 120) * 0.18;
            ctx.strokeStyle = `rgba(255, 154, 77, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const p of particles) {
        ctx.fillStyle = p.hue === 0 ? 'rgba(255, 122, 26, 0.75)' : 'rgba(143, 184, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = window.requestAnimationFrame(tick);
    };

    resize();
    tick();
    window.addEventListener('resize', resize);
    canvas.parentElement?.addEventListener('mousemove', onMove);
    canvas.parentElement?.addEventListener('mouseleave', onLeave);
    const onVis = () => { if (document.hidden) window.cancelAnimationFrame(raf); else tick(); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.parentElement?.removeEventListener('mousemove', onMove);
      canvas.parentElement?.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [reduced]);

  if (reduced) return null;
  return <canvas ref={ref} className="particles" aria-hidden="true" />;
}

/* ---------------- RotatingWord ---------------- */
export function RotatingWord({ words, interval = 2400 }: { words: string[]; interval?: number }) {
  const [i, setI] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % words.length), interval);
    return () => window.clearInterval(t);
  }, [words.length, interval, reduced]);
  return (
    <span className="rot" aria-live="polite">
      {words.map((wd, n) => (
        <span key={wd} className={`rot__w ${n === i ? 'on' : ''}`} aria-hidden={n !== i}>{wd}</span>
      ))}
    </span>
  );
}

/* ---------------- CountUp ---------------- */
export function CountUp({ to, suffix = '', duration = 1400 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) { setVal(to); return; }
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(to * eased));
        if (p < 1) raf = window.requestAnimationFrame(step);
      };
      raf = window.requestAnimationFrame(step);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => { io.disconnect(); window.cancelAnimationFrame(raf); };
  }, [to, duration, reduced]);

  return <span ref={ref}>{val}{suffix}</span>;
}

/* ---------------- Marquee ---------------- */
export function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {row.map((t, i) => (
          <span key={i} className="marquee__item"><i className="ri-flashlight-line"></i>{t}</span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Tilt ---------------- */
export function Tilt({ children, className = '', style, max = 8 }: { children: ReactNode; className?: string; style?: CSSProperties; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || reduced) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--rx', `${(-py * max).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(px * max).toFixed(2)}deg`);
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }
  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  }
  return (
    <div ref={ref} className={`tilt ${className}`} style={style} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </div>
  );
}

/* ---------------- CursorGlow ---------------- */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    let x = -500; let y = -500; let tx = x; let ty = y; let raf = 0;
    const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; };
    const loop = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      el.style.transform = `translate3d(${x - 250}px, ${y - 250}px, 0)`;
      raf = window.requestAnimationFrame(loop);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    loop();
    return () => { window.removeEventListener('mousemove', onMove); window.cancelAnimationFrame(raf); };
  }, [reduced]);
  if (reduced) return null;
  return <div ref={ref} className="cursor-glow" aria-hidden="true" />;
}

/* ---------------- ScrollProgress ---------------- */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const on = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      el.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); };
  }, []);
  return <div ref={ref} className="scroll-progress" aria-hidden="true" />;
}

/* ---------------- Reveal ---------------- */
export function Reveal({ children, className = '', delay = 0, as: Tag = 'div' }: { children: ReactNode; className?: string; delay?: number; as?: 'div' | 'section' | 'article' }) {
  const ref = useRef<HTMLElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { setOn(true); io.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const El = Tag as 'div';
  return (
    <El ref={ref as React.RefObject<HTMLDivElement>} className={`reveal ${on ? 'reveal--on' : ''} ${className}`} style={{ '--rd': `${delay}ms` } as CSSProperties}>
      {children}
    </El>
  );
}
