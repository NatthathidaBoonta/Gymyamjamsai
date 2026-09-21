/**
 * ExerciseCard.tsx — การ์ดท่าออกกำลังกาย (ใช้ร่วมกันทุกหน้า)
 * สื่อด้านบน (object-fit: contain บนพื้นขาว) · ชื่อ · กล้ามเนื้อ · badge ระดับ · action ท้ายการ์ด
 */

import type { ReactNode } from 'react';
import { CATEGORY_LABEL, DIFFICULTY_LABEL, type Exercise } from '../services/exercise.service';
import { getImageUrl } from '../utils/imageUtils';
import './ExerciseCard.css';

interface Props {
  exercise: Exercise;
  onOpen?: (exercise: Exercise) => void;
  /** ปุ่มเพิ่มเติมท้ายการ์ด */
  actions?: ReactNode;
  /** ขนาดกะทัดรัด (ใช้ในแถวเลื่อนของ Landing) */
  compact?: boolean;
}

function ExerciseCard({ exercise, onOpen, actions, compact = false }: Props) {
  const difficulty = exercise.difficulty || 'beginner';
  const clickable = Boolean(onOpen);

  return (
    <article className={`exc ${compact ? 'exc--compact' : ''} ${clickable ? 'exc--clickable' : ''}`}>
      <button
        type="button"
        className="exc__media"
        onClick={() => onOpen?.(exercise)}
        disabled={!clickable}
        aria-label={`ดูรายละเอียด ${exercise.name}`}
      >
        {exercise.media_url ? (
          <img src={getImageUrl(exercise.media_url)} alt="" loading="lazy" />
        ) : (
          <span className="exc__media-empty"><i className="ri-image-line"></i></span>
        )}
        <span className={`exc__lvl exc__lvl--${difficulty}`}>{DIFFICULTY_LABEL[difficulty]}</span>
      </button>

      <div className="exc__body">
        <div className="exc__meta">
          {exercise.category && <span>{CATEGORY_LABEL[exercise.category] ?? exercise.category}</span>}
          {exercise.equipment && <span><i className="ri-tools-line"></i>{exercise.equipment}</span>}
        </div>
        <h3 className="exc__title">
          {clickable ? (
            <button type="button" onClick={() => onOpen?.(exercise)}>{exercise.name}</button>
          ) : (
            exercise.name
          )}
        </h3>
        {exercise.muscle_group && <p className="exc__muscle">{exercise.muscle_group}</p>}
        {actions && <div className="exc__actions">{actions}</div>}
      </div>
    </article>
  );
}

export default ExerciseCard;
