/**
 * PagePlaceholder.tsx — โครงหน้าเปล่าสำหรับ Phase 8
 *
 * Phase 8 ส่งมอบเฉพาะ "โครงเว็บที่มีเมนูนำทาง (ยังไม่มีข้อมูลจริง)"
 * เนื้อหาจริงของแต่ละหน้าจะถูกเติมใน Phase 9-11 ตาม Implementation Plan
 */

import './PagePlaceholder.css';

interface Props {
  title: string;
  description: string;
  /** ฟีเจอร์ที่จะมาใน Phase ถัดไป (แสดงเป็นรายการ) */
  upcoming?: string[];
  /** Phase ที่จะพัฒนาหน้านี้ */
  phase?: string;
}

function PagePlaceholder({ title, description, upcoming = [], phase }: Props) {
  return (
    <section className="placeholder">
      <h1 className="placeholder__title">{title}</h1>
      <p className="placeholder__desc">{description}</p>

      {upcoming.length > 0 && (
        <div className="placeholder__card">
          <h2 className="placeholder__card-title">
            สิ่งที่จะมีในหน้านี้{phase ? ` (${phase})` : ''}
          </h2>
          <ul className="placeholder__list">
            {upcoming.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default PagePlaceholder;
