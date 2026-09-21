/**
 * Suggestions.tsx — Admin พิจารณาข้อเสนอแก้ไขท่าจาก Trainer
 * เห็น diff เดิม → เสนอ · อนุมัติ (merge ลงคลังทันที) หรือปฏิเสธ พร้อมหมายเหตุ
 */

import { useCallback, useEffect, useState } from 'react';
import Toast from '../../components/Toast';
import SuggestionCard from '../../components/SuggestionCard';
import { ApiError } from '../../services/api';
import * as es from '../../services/exercise.service';
import './Suggestions.css';

interface ToastState { show: boolean; message: string; type: 'success' | 'error' }
type Tab = es.SuggestionStatus;

function Suggestions() {
  const [tab, setTab] = useState<Tab>('pending');
  const [items, setItems] = useState<es.ExerciseSuggestion[]>([]);
  const [currentMap, setCurrentMap] = useState<Record<string, es.Exercise>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState<{ s: es.ExerciseSuggestion; decision: 'approve' | 'reject' } | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [counts, setCounts] = useState<Record<Tab, number>>({ pending: 0, approved: 0, rejected: 0 });
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

  const showToast = useCallback((message: string, type: 'success' | 'error') => setToast({ show: true, message, type }), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await es.listSuggestions();
      setCounts({
        pending: all.filter((s) => s.status === 'pending').length,
        approved: all.filter((s) => s.status === 'approved').length,
        rejected: all.filter((s) => s.status === 'rejected').length,
      });
      const visible = all.filter((s) => s.status === tab);
      setItems(visible);
      // ค่าปัจจุบันของท่า (เฉพาะ pending ที่ต้องเทียบ)
      if (tab === 'pending') {
        const ids = Array.from(new Set(visible.map((s) => s.exercise_id)));
        const results = await Promise.all(ids.map((id) => es.getExercise(id).catch(() => null)));
        const map: Record<string, es.Exercise> = {};
        results.forEach((ex, i) => { if (ex) map[ids[i]] = ex; });
        setCurrentMap(map);
      }
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'โหลดข้อเสนอไม่สำเร็จ', 'error');
    } finally {
      setLoading(false);
    }
  }, [tab, showToast]);

  useEffect(() => { load(); }, [load]);

  async function submitReview() {
    if (!reviewing) return;
    setBusy(reviewing.s.id);
    try {
      await es.reviewSuggestion(reviewing.s.id, reviewing.decision, reviewNote.trim() || undefined);
      showToast(reviewing.decision === 'approve' ? 'อนุมัติและอัปเดตคลังท่าแล้ว' : 'ปฏิเสธข้อเสนอแล้ว', 'success');
      setReviewing(null);
      setReviewNote('');
      await load();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'ดำเนินการไม่สำเร็จ', 'error');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="sgp">
      <div className="page-head">
        <div>
          <span className="eyebrow">คลังท่า</span>
          <h1>อนุมัติข้อเสนอแก้ไขท่า</h1>
          <p>ผู้ฝึกสอนเสนอปรับรายละเอียดท่า — อนุมัติแล้วข้อมูลจะเข้าคลังทันทีและแจ้งผู้เสนอ</p>
        </div>
      </div>

      <div className="sgp__tabs" role="tablist">
        {(['pending', 'approved', 'rejected'] as Tab[]).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} className={`sgp__tab ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>
            {es.SUGGESTION_STATUS_LABEL[t]} <span className="sgp__count">{counts[t]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="sgp__state">กำลังโหลด...</div>
      ) : items.length === 0 ? (
        <div className="card sgp__state">
          <i className="ri-inbox-line"></i>
          <span>{tab === 'pending' ? 'ไม่มีข้อเสนอที่รอพิจารณา' : `ยังไม่มีรายการที่${es.SUGGESTION_STATUS_LABEL[tab]}`}</span>
        </div>
      ) : (
        <div className="sgp__list">
          {items.map((s) => (
            <SuggestionCard
              key={s.id}
              suggestion={s}
              current={tab === 'pending' ? currentMap[s.exercise_id] ?? null : undefined}
              actions={
                s.status === 'pending' ? (
                  <>
                    <button type="button" className="btn btn--danger btn--sm" disabled={busy === s.id} onClick={() => { setReviewing({ s, decision: 'reject' }); setReviewNote(''); }}>
                      <i className="ri-close-line"></i> ปฏิเสธ
                    </button>
                    <button type="button" className="btn btn--primary btn--sm" disabled={busy === s.id} onClick={() => { setReviewing({ s, decision: 'approve' }); setReviewNote(''); }}>
                      <i className="ri-check-line"></i> อนุมัติ
                    </button>
                  </>
                ) : undefined
              }
            />
          ))}
        </div>
      )}

      {reviewing && (
        <div className="modal-overlay" onClick={() => !busy && setReviewing(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{reviewing.decision === 'approve' ? 'อนุมัติข้อเสนอ' : 'ปฏิเสธข้อเสนอ'}</h3>
            <p className="sgp__modal-desc">
              ท่า <b>{reviewing.s.exercise_name}</b> โดย {reviewing.s.trainer_name || reviewing.s.trainer_email}
              {reviewing.decision === 'approve' ? ' — ข้อมูลที่เสนอจะถูกเขียนทับในคลังทันที' : ' — ผู้เสนอจะได้รับแจ้งพร้อมเหตุผล'}
            </p>
            <label className="sgp__modal-field">
              <span>หมายเหตุถึงผู้เสนอ {reviewing.decision === 'reject' ? '(ควรระบุเหตุผล)' : '(ไม่บังคับ)'}</span>
              <textarea className="input" rows={3} maxLength={500} value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} autoFocus />
            </label>
            <div className="modal-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setReviewing(null)} disabled={!!busy}>ยกเลิก</button>
              <button type="button" className={`btn ${reviewing.decision === 'approve' ? 'btn--primary' : 'btn--danger'}`} onClick={submitReview} disabled={!!busy}>
                {busy ? 'กำลังดำเนินการ...' : reviewing.decision === 'approve' ? 'ยืนยันอนุมัติ' : 'ยืนยันปฏิเสธ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.show && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast({ ...toast, show: false })} />}
    </div>
  );
}

export default Suggestions;
