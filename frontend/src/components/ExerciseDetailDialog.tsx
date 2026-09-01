/**
 * ExerciseDetailDialog.tsx — Modal แสดงรายละเอียดท่าออกกำลังกาย
 */

import type { Exercise } from '../services/exercise.service';
import './ExerciseDetailDialog.css';

interface Props {
  exercise: Exercise;
  onClose: () => void;
}

function ExerciseDetailDialog({ exercise, onClose }: Props) {
  const categoryIcon: Record<string, string> = {
    strength: 'Strength',
    cardio: 'Cardio',
    flexibility: 'Flexibility',
  };

  const categoryLabel = {
    strength: 'Strength Training',
    cardio: 'Cardio',
    flexibility: 'Flexibility',
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <button className="dialog-close" onClick={onClose}>
          ✕
        </button>

        <div className="dialog-image">
          {exercise.media_url ? (
            <img src={exercise.media_url} alt={exercise.name} />
          ) : (
            <div className="dialog-image__placeholder">
              {categoryIcon[exercise.category as keyof typeof categoryIcon]}
            </div>
          )}
        </div>

        <div className="dialog-body">
          <div className="dialog-header">
            <h2>{exercise.name}</h2>
            <span className="dialog-category">
              {categoryIcon[exercise.category as keyof typeof categoryIcon]}{' '}
              {categoryLabel[exercise.category as keyof typeof categoryLabel]}
            </span>
          </div>

          <div className="dialog-instructions">
            <h3>วิธีการ (Step-by-Step)</h3>
            <div className="instructions-text">
              {exercise.instructions ? (
                <ul>
                  {exercise.instructions.split('\n').map((step: string, idx: number) => (
                    <li key={idx}>
                      <strong>{idx + 1}.</strong> {step.replace(/^\d+\.\s*/, '')}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>ไม่มีรายละเอียด</p>
              )}
            </div>
          </div>

          <div className="dialog-tips">
            <h3>⚠️ เคล็ดลับความปลอดภัย</h3>
            <ul>
              <li>✅ ทำให้ช้าและควบคุม ไม่ควรเร่ง</li>
              <li>✅ หลังตรง ไม่โค้งเกินไป</li>
              <li>✅ หายใจให้สม่ำเสมอ ไม่หยุดหายใจ</li>
              <li>✅ ถ้ารู้สึกปวด ให้หยุดทันที</li>
              <li>✅ ให้ร่างกายพัก 24 ชั่วโมง ระหว่างกลุ่มกล้ามเนื้อเดียวกัน</li>
            </ul>
          </div>

          <div className="dialog-recommendations">
            <h3>💡 คำแนะนำ</h3>
            <div className="recommendation-grid">
              <div className="recommendation-item">
                <strong>Sets</strong>
                <p>3-4</p>
              </div>
              <div className="recommendation-item">
                <strong>Reps</strong>
                <p>8-15</p>
              </div>
              <div className="recommendation-item">
                <strong>Rest</strong>
                <p>60-90s</p>
              </div>
              <div className="recommendation-item">
                <strong>Difficulty</strong>
                <p>⭐⭐⭐</p>
              </div>
            </div>
          </div>

          <button className="dialog-action" onClick={onClose}>
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExerciseDetailDialog;
