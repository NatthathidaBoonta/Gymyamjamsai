/**
 * TrainerExercises.tsx — ผู้ฝึกสอนดูคลังท่าและเสนอแก้ไขรายละเอียด (ต้องผ่านการอนุมัติของแอดมิน)
 * แท็บ "คลังท่า": การ์ด + ดูรายละเอียดเต็ม + ปุ่มเสนอแก้ไข (ฟอร์มเติมค่าปัจจุบันให้)
 * แท็บ "ข้อเสนอของฉัน": สถานะ + ถอนได้ขณะยังรอ
 */

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import Toast from '../../components/Toast';
import ExerciseCard from '../../components/ExerciseCard';
import ExerciseDetailDialog from '../../components/ExerciseDetailDialog';
import SuggestionCard from '../../components/SuggestionCard';
import { ApiError } from '../../services/api';
import * as es from '../../services/exercise.service';
import '../admin/Suggestions.css';
import './TrainerExercises.css';

interface ToastState { show: boolean; message: string; type: 'success' | 'error' }
type Tab = 'library' | 'mine';

interface ProposeForm {
  exercise: es.Exercise;
  name: string;
  muscle_group: string;
  equipment: string;
  difficulty: es.ExerciseDifficulty;
  instructions: string;
  tips: string;
  note: string;
}

const DIFFS: es.ExerciseDifficulty[] = ['beginner', 'intermediate', 'advanced'];

function TrainerExercises() {
  const [tab, setTab] = useState<Tab>('library');
  const [items, setItems] = useState<es.Exercise[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<es.Exercise | null>(null);
  const [propose, setPropose] = useState<ProposeForm | null>(null);
  const [sending, setSending] = useState(false);
  const [mine, setMine] = useState<es.ExerciseSuggestion[]>([]);
  const [withdrawing, setWithdrawing] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

  const showToast = useCallback((message: string, type: 'success' | 'error') => setToast({ show: true, message, type }), []);

  const loadLibrary = useCallback(async () => {
    setLoading(true);
    try {
      const r = await es.searchExercises({ q, limit: 100 });
      setItems(r.items);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'โหลดคลังท่าไม่สำเร็จ', 'error');
    } finally {
      setLoading(false);
    }
  }, [q, showToast]);

  const loadMine = useCallback(async () => {
    try {
      setMine(await es.listSuggestions());
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'โหลดข้อเสนอไม่สำเร็จ', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    const t = setTimeout(loadLibrary, q ? 250 : 0);
    return () => clearTimeout(t);
  }, [loadLibrary, q]);

  useEffect(() => { loadMine(); }, [loadMine]);

  const pendingIds = useMemo(() => new Set(mine.filter((s) => s.status === 'pending').map((s) => s.exercise_id)), [mine]);
  const pendingCount = pendingIds.size;

  function openPropose(e: es.Exercise) {
    setViewing(null);
    setPropose({
      exercise: e, name: e.name, muscle_group: e.muscle_group ?? '', equipment: e.equipment ?? '',
      difficulty: e.difficulty ?? 'beginner', instructions: e.instructions ?? '', tips: e.tips ?? '', note: '',
    });
  }

  async function submitPropose(ev: FormEvent) {
    ev.preventDefault();
    if (!propose) return;
    // ส่งเฉพาะฟิลด์ที่เปลี่ยน — backend ตรวจซ้ำอีกชั้น
    const e = propose.exercise;
    const payload: es.SuggestionPayload = {};
    if (propose.name.trim() !== e.name) payload.name = propose.name.trim();
    if ((propose.muscle_group.trim() || null) !== (e.muscle_group ?? null)) payload.muscle_group = propose.muscle_group.trim() || null;
    if ((propose.equipment.trim() || null) !== (e.equipment ?? null)) payload.equipment = propose.equipment.trim() || null;
    if (propose.difficulty !== (e.difficulty ?? 'beginner')) payload.difficulty = propose.difficulty;
    if ((propose.instructions.trim() || null) !== (e.instructions ?? null)) payload.instructions = propose.instructions.trim() || null;
    if ((propose.tips.trim() || null) !== (e.tips ?? null)) payload.tips = propose.tips.trim() || null;
    if (Object.keys(payload).length === 0) {
      showToast('ยังไม่ได้แก้ไขอะไรจากข้อมูลปัจจุบัน', 'error');
      return;
    }
    setSending(true);
    try {
      await es.createSuggestion(e.id, payload, propose.note.trim() || undefined);
      showToast('ส่งข้อเสนอแล้ว รอผู้ดูแลระบบอนุมัติ', 'success');
      setPropose(null);
      await loadMine();
      setTab('mine');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'ส่งข้อเสนอไม่สำเร็จ', 'error');
    } finally {
      setSending(false);
    }
  }

  async function handleWithdraw(s: es.ExerciseSuggestion) {
    if (!confirm(`ถอนข้อเสนอของท่า "${s.exercise_name}"?`)) return;
    setWithdrawing(s.id);
    try {
      await es.withdrawSuggestion(s.id);
      showToast('ถอนข้อเสนอแล้ว', 'success');
      await loadMine();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'ถอนไม่สำเร็จ', 'error');
    } finally {
      setWithdrawing(null);
    }
  }

  return (
    <div className="tre">
      <div className="page-head">
        <div>
          <span className="eyebrow">คลังท่า</span>
          <h1>เสนอแก้ไขรายละเอียดท่า</h1>
          <p>ปรับขั้นตอน เคล็ดลับ กล้ามเนื้อ อุปกรณ์ หรือระดับของท่าในคลัง — มีผลเมื่อผู้ดูแลระบบอนุมัติ</p>
        </div>
      </div>

      <div className="sgp__tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'library'} className={`sgp__tab ${tab === 'library' ? 'on' : ''}`} onClick={() => setTab('library')}>
          คลังท่า <span className="sgp__count">{items.length}</span>
        </button>
        <button type="button" role="tab" aria-selected={tab === 'mine'} className={`sgp__tab ${tab === 'mine' ? 'on' : ''}`} onClick={() => setTab('mine')}>
          ข้อเสนอของฉัน <span className="sgp__count">{pendingCount > 0 ? `${pendingCount} รอ` : mine.length}</span>
        </button>
      </div>

      {tab === 'library' && (
        <>
          <label className="tre__search">
            <i className="ri-search-line"></i>
            <input type="search" placeholder="ค้นหาชื่อท่า กล้ามเนื้อ หรืออุปกรณ์…" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          {loading ? (
            <div className="sgp__state">กำลังโหลด...</div>
          ) : (
            <div className="tre__grid">
              {items.map((e) => (
                <ExerciseCard
                  key={e.id}
                  exercise={e}
                  onOpen={setViewing}
                  actions={
                    pendingIds.has(e.id) ? (
                      <span className="badge badge-warning">มีข้อเสนอรออยู่</span>
                    ) : (
                      <button type="button" className="btn btn--secondary btn--sm" onClick={() => openPropose(e)}>
                        <i className="ri-lightbulb-line"></i> เสนอแก้ไข
                      </button>
                    )
                  }
                />
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'mine' && (
        mine.length === 0 ? (
          <div className="card sgp__state">
            <i className="ri-inbox-line"></i>
            <span>ยังไม่มีข้อเสนอ — เปิดท่าในคลังแล้วกด "เสนอแก้ไข"</span>
          </div>
        ) : (
          <div className="sgp__list">
            {mine.map((s) => (
              <SuggestionCard
                key={s.id}
                suggestion={s}
                actions={s.status === 'pending' ? (
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => handleWithdraw(s)} disabled={withdrawing === s.id}>
                    <i className="ri-arrow-go-back-line"></i> ถอนข้อเสนอ
                  </button>
                ) : undefined}
              />
            ))}
          </div>
        )
      )}

      {viewing && (
        <ExerciseDetailDialog
          exercise={viewing}
          onClose={() => setViewing(null)}
          extra={
            pendingIds.has(viewing.id)
              ? <span className="badge badge-warning">คุณมีข้อเสนอของท่านี้รออยู่</span>
              : <button type="button" className="btn btn--primary" onClick={() => openPropose(viewing)}><i className="ri-lightbulb-line"></i> เสนอแก้ไขท่านี้</button>
          }
        />
      )}

      {propose && (
        <div className="modal-overlay" onClick={() => !sending && setPropose(null)}>
          <form className="modal-content tre__propose" onClick={(e) => e.stopPropagation()} onSubmit={submitPropose}>
            <span className="eyebrow">เสนอแก้ไข</span>
            <h3>{propose.exercise.name}</h3>
            <p className="tre__hint">แก้เฉพาะส่วนที่ต้องการ ระบบจะส่งเฉพาะฟิลด์ที่เปลี่ยนไปให้ผู้ดูแลระบบเทียบกับของเดิม</p>

            <div className="tre__form">
              <label className="tre__field tre__field--full"><span>ชื่อท่า</span><input className="input" maxLength={255} value={propose.name} onChange={(e) => setPropose({ ...propose, name: e.target.value })} /></label>
              <label className="tre__field"><span>กล้ามเนื้อหลัก</span><input className="input" maxLength={100} value={propose.muscle_group} onChange={(e) => setPropose({ ...propose, muscle_group: e.target.value })} /></label>
              <label className="tre__field"><span>อุปกรณ์</span><input className="input" maxLength={100} value={propose.equipment} onChange={(e) => setPropose({ ...propose, equipment: e.target.value })} /></label>
              <label className="tre__field"><span>ระดับ</span>
                <select className="input" value={propose.difficulty} onChange={(e) => setPropose({ ...propose, difficulty: e.target.value as es.ExerciseDifficulty })}>
                  {DIFFS.map((d) => <option key={d} value={d}>{es.DIFFICULTY_LABEL[d]}</option>)}
                </select>
              </label>
              <label className="tre__field tre__field--full"><span>ขั้นตอน — 1 ขั้นต่อบรรทัด</span><textarea className="input" rows={5} value={propose.instructions} onChange={(e) => setPropose({ ...propose, instructions: e.target.value })} /></label>
              <label className="tre__field tre__field--full"><span>ข้อควรระวัง / เคล็ดลับ — คั่นด้วย ·</span><textarea className="input" rows={3} value={propose.tips} onChange={(e) => setPropose({ ...propose, tips: e.target.value })} /></label>
              <label className="tre__field tre__field--full"><span>เหตุผลถึงผู้ดูแลระบบ</span><textarea className="input" rows={2} maxLength={500} placeholder="เช่น สมาชิกมักทำผิดตรงจุดนี้ จึงเพิ่มคำเตือน" value={propose.note} onChange={(e) => setPropose({ ...propose, note: e.target.value })} /></label>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setPropose(null)} disabled={sending}>ยกเลิก</button>
              <button type="submit" className="btn btn--primary" disabled={sending}>{sending ? 'กำลังส่ง...' : 'ส่งข้อเสนอ'}</button>
            </div>
          </form>
        </div>
      )}

      {toast.show && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast({ ...toast, show: false })} />}
    </div>
  );
}

export default TrainerExercises;
