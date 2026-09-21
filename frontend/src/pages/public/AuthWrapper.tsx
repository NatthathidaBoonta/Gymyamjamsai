/**
 * AuthWrapper.tsx — กรอบหน้า Login/Register (แนว Cruip sign-in: การ์ดเดียวกลางจอ + glow)
 */

import type { ReactNode } from 'react';
import './AuthWrapper.css';

interface Props {
  children: ReactNode;
}

function AuthWrapper({ children }: Props) {
  return (
    <div className="auth-wrapper">
      <div className="auth-wrapper__glow" aria-hidden="true"></div>
      <div className="auth-wrapper__card card">{children}</div>
      <ul className="auth-wrapper__points" aria-label="จุดเด่นของระบบ">
        <li><i className="ri-edit-circle-line"></i>บันทึกผลใน 2 คลิก</li>
        <li><i className="ri-line-chart-line"></i>กราฟพัฒนาการรายสัปดาห์</li>
        <li><i className="ri-shield-check-line"></i>ข้อมูลสุขภาพเป็นส่วนตัว</li>
      </ul>
    </div>
  );
}

export default AuthWrapper;
