/**
 * ScrollToTop.tsx — เลื่อนกลับบนสุดเมื่อเปลี่ยนหน้า และเมื่อรีเฟรช
 * (เบราว์เซอร์จะจำตำแหน่งสกรอลล์เดิมตอนรีเฟรชเป็นค่าเริ่มต้น — ปิดด้วย scrollRestoration = 'manual')
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // ถ้ามี #hash (เช่น #library ในหน้าแรก) ให้เบราว์เซอร์จัดการเอง
    if (!window.location.hash) window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

export default ScrollToTop;
