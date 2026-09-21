/**
 * AppFx.tsx — ลูกเล่นร่วมของหน้าหลัง login ทุกบทบาท (ภาษาเดียวกับหน้าแรก แต่เบากว่า)
 *
 * - PageTransition : เนื้อหาเลื่อนขึ้น/ชัดขึ้นทุกครั้งที่เปลี่ยนหน้า + การ์ดทยอยโผล่ (stagger)
 * - spotlight      : ทุก .card / การ์ดสถิติ ได้ขอบสว่างตามเมาส์ (delegate ที่ main — ไม่ต้องแก้ทุกหน้า)
 * - CursorGlow     : แสงตามเมาส์ (ใช้ตัวเดียวกับหน้าแรก)
 */

import { useEffect, useRef, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { CursorGlow } from './landing/LandingFx';
import './AppFx.css';

const SPOT_SELECTOR = '.card, .adm__kpi, .trd__kpi, .member-dashboard__card, .wk__ex, .exc, .tca__course, .sug, .activities__card';

export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const ref = useRef<HTMLDivElement>(null);

  // spotlight: จับตำแหน่งเมาส์บนการ์ดที่ใกล้ที่สุด แล้วเขียนเป็น CSS var (ไม่ re-render)
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const onMove = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>(SPOT_SELECTOR);
      if (!target) return;
      const r = target.getBoundingClientRect();
      target.style.setProperty('--mx', `${e.clientX - r.left}px`);
      target.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    host.addEventListener('mousemove', onMove, { passive: true });
    return () => host.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div ref={ref} key={pathname} className="page-enter">
      {children}
    </div>
  );
}

export function AppFx() {
  return <CursorGlow />;
}
