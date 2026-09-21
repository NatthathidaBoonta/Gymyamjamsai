/**
 * SuggestionCard.tsx — ข้อเสนอแก้ไขท่า 1 รายการ (ใช้ทั้งฝั่ง Trainer และ Admin)
 * แสดง "ค่าเดิม → ค่าที่เสนอ" ทีละฟิลด์ + สถานะ + ปุ่มตาม role
 */

import type { ReactNode } from 'react';
import {
  DIFFICULTY_LABEL,
  SUGGESTABLE_FIELD_LABEL,
  SUGGESTION_STATUS_LABEL,
  type Exercise,
  type ExerciseSuggestion,
  type SuggestionPayload,
} from '../services/exercise.service';
import { getImageUrl } from '../utils/imageUtils';
import './SuggestionCard.css';

interface Props {
  suggestion: ExerciseSuggestion;
  /** ค่าปัจจุบันของท่า (ถ้ามี) เพื่อแสดง diff — ไม่มีก็แสดงเฉพาะค่าที่เสนอ */
  current?: Exercise | null;
  actions?: ReactNode;
}

const STATUS_BADGE = { pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-error' } as const;

function fmt(field: keyof SuggestionPayload, value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  if (field === 'difficulty') return DIFFICULTY_LABEL[value as keyof typeof DIFFICULTY_LABEL] ?? value;
  return value;
}

function SuggestionCard({ suggestion: s, current, actions }: Props) {
  const fields = Object.keys(s.payload) as Array<keyof SuggestionPayload>;
  const when = new Date(s.created_at).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <article className={`sug card card--flat sug--${s.status}`}>
      <div className="sug__head">
        <div className="sug__ex">
          <div className="sug__thumb">{s.exercise_media_url ? <img src={getImageUrl(s.exercise_media_url)} alt="" /> : <i className="ri-image-line"></i>}</div>
          <div>
            <div className="sug__exname">{s.exercise_name}</div>
            <div className="sug__by">
              โดย <b>{s.trainer_name || s.trainer_email}</b> · {when}
            </div>
          </div>
        </div>
        <span className={`badge ${STATUS_BADGE[s.status]}`}>{SUGGESTION_STATUS_LABEL[s.status]}</span>
      </div>

      {s.note && (
        <p className="sug__note"><i className="ri-chat-1-line"></i> {s.note}</p>
      )}

      <div className="sug__diff">
        {fields.map((f) => {
          const before = current ? (current[f] as string | null | undefined) : undefined;
          const after = s.payload[f];
          const multiline = f === 'instructions' || f === 'tips';
          return (
            <div key={f} className={`sug__row ${multiline ? 'sug__row--multi' : ''}`}>
              <div className="sug__field">{SUGGESTABLE_FIELD_LABEL[f]}</div>
              {current !== undefined && (
                <div className="sug__before">
                  <span className="sug__tag">เดิม</span>
                  <div>{fmt(f, before)}</div>
                </div>
              )}
              <div className="sug__after">
                <span className="sug__tag sug__tag--new">เสนอ</span>
                <div>{fmt(f, after)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {s.status !== 'pending' && (
        <div className="sug__review">
          <i className={s.status === 'approved' ? 'ri-checkbox-circle-line' : 'ri-close-circle-line'}></i>
          <span>
            {s.status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}โดย {s.reviewer_name || 'ผู้ดูแลระบบ'}
            {s.reviewed_at && ` · ${new Date(s.reviewed_at).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}`}
            {s.review_note && ` — “${s.review_note}”`}
          </span>
        </div>
      )}

      {actions && <div className="sug__actions">{actions}</div>}
    </article>
  );
}

export default SuggestionCard;
