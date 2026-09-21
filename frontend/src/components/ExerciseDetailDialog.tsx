/**
 * ExerciseDetailDialog.tsx — รายละเอียดท่าแบบเต็ม (ใช้ร่วมกันทุก role)
 *
 * ซ้าย: สื่อ (GIF/รูป) แสดงเต็มไม่ถูกตัด (object-fit: contain)
 * ขวา: ชื่อ, หมวด/ระดับ/กล้ามเนื้อ/อุปกรณ์, ขั้นตอนเป็นลำดับ, ข้อควรระวัง
 * `extra` ให้หน้าที่เรียกใช้เสริมปุ่ม (เช่น "เสนอแก้ไข" ของ trainer, "แก้ไข" ของ admin)
 */

import { useEffect, type ReactNode } from 'react';
import { CATEGORY_LABEL, DIFFICULTY_LABEL, type Exercise } from '../services/exercise.service';
import { getImageUrl } from '../utils/imageUtils';
import './ExerciseDetailDialog.css';

interface Props {
  exercise: Exercise;
  onClose: () => void;
  /** ปุ่ม/เนื้อหาเพิ่มเติมท้าย dialog (ตาม role) */
  extra?: ReactNode;
  /** เป้าหมายจากตารางฝึก (แสดงเมื่อเปิดจากหน้า Workout) */
  target?: { sets: number | null; reps: number | null; weight: number | null; day?: string };
}

export function splitSteps(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split(/\n+/)
    .map((s) => s.replace(/^\s*(\d+[.)]|[-•·])\s*/, '').trim())
    .filter(Boolean);
}

export function splitTips(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split(/\s*[·•]\s*|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function ExerciseDetailDialog({ exercise, onClose, extra, target }: Props) {
  // ปิดด้วย Esc + ล็อกสกรอลล์พื้นหลัง
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const steps = splitSteps(exercise.instructions);
  const tips = splitTips(exercise.tips);
  const difficulty = exercise.difficulty || 'beginner';

  return (
    <div className="exd" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="exd-title">
      <div className="exd__panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="exd__close" onClick={onClose} aria-label="ปิด">
          <i className="ri-close-line"></i>
        </button>

        {/* ---------- สื่อ ---------- */}
        <div className="exd__media">
          {exercise.media_url ? (
            <img src={getImageUrl(exercise.media_url)} alt={exercise.name} />
          ) : (
            <div className="exd__media-empty">
              <i className="ri-image-line"></i>
              <span>ไม่มีสื่อประกอบ</span>
            </div>
          )}
          <div className="exd__media-caption">
            {exercise.media_url?.toLowerCase().endsWith('.gif') ? 'ภาพเคลื่อนไหวแสดงจังหวะการเคลื่อนไหวเต็มรอบ' : 'ภาพประกอบท่า'}
          </div>
        </div>

        {/* ---------- เนื้อหา ---------- */}
        <div className="exd__body">
          <div className="exd__head">
            <div className="exd__badges">
              {exercise.category && <span className="badge badge-neutral">{CATEGORY_LABEL[exercise.category] ?? exercise.category}</span>}
              <span className={`badge exd__lvl exd__lvl--${difficulty}`}>{DIFFICULTY_LABEL[difficulty]}</span>
            </div>
            <h2 id="exd-title" className="exd__title">{exercise.name}</h2>
          </div>

          <dl className="exd__facts">
            <div>
              <dt><i className="ri-body-scan-line"></i> กล้ามเนื้อหลัก</dt>
              <dd>{exercise.muscle_group || '—'}</dd>
            </div>
            <div>
              <dt><i className="ri-tools-line"></i> อุปกรณ์</dt>
              <dd>{exercise.equipment || 'ไม่ต้องใช้'}</dd>
            </div>
            {target && (
              <div className="exd__facts-target">
                <dt><i className="ri-crosshair-2-line"></i> เป้าหมายของคุณ{target.day ? ` · ${target.day}` : ''}</dt>
                <dd>
                  {target.sets ?? '—'} sets × {target.reps ?? '—'} reps
                  {target.weight ? ` · ${target.weight} kg` : ''}
                </dd>
              </div>
            )}
          </dl>

          <section className="exd__section">
            <h3><span className="exd__num">01</span> ขั้นตอนการทำ</h3>
            {steps.length ? (
              <ol className="exd__steps">
                {steps.map((s, i) => (
                  <li key={i}><span>{i + 1}</span>{s}</li>
                ))}
              </ol>
            ) : (
              <p className="exd__empty">ยังไม่มีขั้นตอนสำหรับท่านี้</p>
            )}
          </section>

          <section className="exd__section">
            <h3><span className="exd__num">02</span> ข้อควรระวังและเคล็ดลับ</h3>
            {tips.length ? (
              <ul className="exd__tips">
                {tips.map((t, i) => (
                  <li key={i}><i className="ri-alert-line"></i>{t}</li>
                ))}
              </ul>
            ) : (
              <p className="exd__empty">ยังไม่มีเคล็ดลับสำหรับท่านี้</p>
            )}
          </section>

          {extra && <div className="exd__extra">{extra}</div>}
        </div>
      </div>
    </div>
  );
}

export default ExerciseDetailDialog;
