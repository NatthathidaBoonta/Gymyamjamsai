import type { ReactNode } from 'react';
import './AuthWrapper.css';

interface Props {
  children: ReactNode;
}

function AuthWrapper({ children }: Props) {
  return (
    <div className="auth-wrapper">
      <div className="auth-wrapper__info">
        <div className="auth-wrapper__info-content">
          <h1>เริ่มต้นสุขภาพดีไปกับเรา</h1>
          <p>Gymyamjamsai ระบบติดตามพัฒนาการการออกกำลังกายที่ออกแบบมาเพื่อคุณ</p>
          
          <div className="auth-wrapper__features">
            <div className="feature-item">
              <div className="feature-icon"><i className="ri-edit-circle-line" style={{ fontSize: '1.5rem' }}></i></div>
              <div className="feature-text">
                <h3>บันทึกง่าย</h3>
                <p>บันทึกการออกกำลังกายได้สะดวกรวดเร็ว</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><i className="ri-bar-chart-line" style={{ fontSize: '1.5rem' }}></i></div>
              <div className="feature-text">
                <h3>สถิติชัดเจน</h3>
                <p>ดูกราฟพัฒนาการของตัวเองได้ทุกที่</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><i className="ri-play-circle-line" style={{ fontSize: '1.5rem' }}></i></div>
              <div className="feature-text">
                <h3>มีรูปและวิดีโอสอน</h3>
                <p>ดูท่าที่ถูกต้อง ป้องกันอาการบาดเจ็บ</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="auth-wrapper__form">
        {children}
      </div>
    </div>
  );
}

export default AuthWrapper;
