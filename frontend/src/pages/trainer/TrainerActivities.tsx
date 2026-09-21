/**
 * TrainerActivities.tsx — ผู้ฝึกสอนจัดการคอร์สของตัวเอง
 * สร้าง / แก้ไข / ยกเลิก (แจ้งผู้จองอัตโนมัติ) / ดูรายชื่อผู้สมัคร — ไม่มีเช็คชื่อ
 */

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../../components/Toast';
import { ApiError } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import * as as_ from '../../services/activity.service';
import './TrainerActivities.css';

interface ToastState { show: boolean; message: string; type: 'success' | 'error' }
interface FormState { id?: string; title: string; start_datetime: string; max_participants: string; description: string }

const EMPTY: FormState = { title: '', start_datetime: '', max_participants: '20', description: '' };
const STATUS_LABEL: Record<as_.ActivityStatus, string> = { open: 'เปิดรับ', full: 'เต็มแล้ว', closed: 'ยกเลิกแล้ว' };
const STATUS_BADGE: Record<as_.ActivityStatus, string> = { open: 'badge-success', full: 'badge-warning', closed: 'badge-neutral' };
const REG_BADGE: Record<as_.RegistrationStatus, string> = { pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-neutral', cancelled: 'badge-neutral' };

/** แปลง DATETIME จาก API → ค่าที่ <input type="datetime-local"> รับ (เวลาท้องถิ่น) */
function toLocalInput(value: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function fmtDT(value: string | null) {
  return value ? new Date(value).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
}

function TrainerActivities() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<as_.Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'active' | 'closed'>('active');
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [roster, setRoster] = useState<{ activity: as_.Activity; list: as_.Participant[] | null } | null>(null);
  const [reviewing, setReviewing] = useState<string | null>(null);
  // คำขอรออนุมัติทุกคอร์ส (โหลดเฉพาะคอร์สที่มี pending)
  const [requests, setRequests] = useState<Array<{ activity: as_.Activity; p: as_.Participant }>>([]);

  const loadRequests = useCallback(async (list: as_.Activity[]) => {
    const withPending = list.filter((a) => a.status !== 'closed' && a.pending_count > 0);
    const rows = await Promise.all(
      withPending.map(async (activity) => {
        try {
          const ps = await as_.getActivityParticipants(activity.id);
          return ps.filter((p) => p.status === 'pending').map((p) => ({ activity, p }));
        } catch {
          return [];
        }
      }),
    );
    setRequests(rows.flat().sort((a, b) => a.p.registered_at.localeCompare(b.p.registered_at)));
  }, []);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

  const showToast = useCallback((message: string, type: 'success' | 'error') => setToast({ show: true, message, type }), []);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const all = await as_.listActivities();
      const mine = all.filter((a) => a.trainer_id === userId);
      setItems(mine);
      loadRequests(mine);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'โหลดคอร์สไม่สำเร็จ', 'error');
    } finally {
      setLoading(false);
    }
  }, [userId, showToast, loadRequests]);

  useEffect(() => { load(); }, [load]);

  const visible = useMemo(
    () => items.filter((a) => (tab === 'closed' ? a.status === 'closed' : a.status !== 'closed')),
    [items, tab],
  );
  const closedCount = items.filter((a) => a.status === 'closed').length;

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    if (!form.title.trim() || !form.start_datetime) {
      showToast('กรุณากรอกชื่อคอร์สและวันเวลา', 'error');
      return;
    }
    setSaving(true);
    const payload: as_.ActivityInput = {
      title: form.title.trim(),
      // ส่งเป็น ISO พร้อม timezone — ไม่ให้ server ตีความเวลาท้องถิ่นของเครื่อง server (Railway = UTC)
      start_datetime: new Date(form.start_datetime).toISOString(),
      max_participants: parseInt(form.max_participants, 10),
      description: form.description.trim() || undefined,
    };
    try {
      if (form.id) {
        await as_.updateActivity(form.id, payload);
        showToast('บันทึกการแก้ไขแล้ว', 'success');
      } else {
        await as_.createActivity(payload);
        showToast('สร้างคอร์สแล้ว', 'success');
      }
      setForm(null);
      await load();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'บันทึกไม่สำเร็จ', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel(a: as_.Activity) {
    const n = a.current_participants;
    if (!confirm(`ปิดคอร์ส "${a.title}"?${n ? `\nผู้สมัคร ${n} คนจะได้รับแจ้งเตือน และห้องแชทจะอ่านได้อย่างเดียว` : ''}`)) return;
    setCancelling(a.id);
    try {
      const r = await as_.cancelActivity(a.id);
      showToast(r.notified ? `ยกเลิกแล้ว แจ้งผู้สมัคร ${r.notified} คน` : 'ยกเลิกคอร์สแล้ว', 'success');
      await load();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'ยกเลิกไม่สำเร็จ', 'error');
    } finally {
      setCancelling(null);
    }
  }

  async function openRoster(a: as_.Activity) {
    setRoster({ activity: a, list: null });
    try {
      const list = await as_.getActivityParticipants(a.id);
      setRoster({ activity: a, list });
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'โหลดรายชื่อไม่สำเร็จ', 'error');
      setRoster(null);
    }
  }

  async function handleReview(memberId: string, decision: 'approve' | 'reject', activityId = roster?.activity.id) {
    if (!activityId) return;
    if (decision === 'reject' && !confirm('ปฏิเสธผู้สมัครคนนี้? ที่นั่งจะถูกคืนให้คนอื่น')) return;
    setReviewing(memberId);
    try {
      const fn = decision === 'approve' ? as_.approveParticipant : as_.rejectParticipant;
      const r = await fn(activityId, memberId);
      setRoster((cur) => cur && { ...cur, list: cur.list?.map((p) => (p.user_id === memberId ? { ...p, status: r.status } : p)) ?? null });
      showToast(decision === 'approve' ? 'อนุมัติแล้ว — สมาชิกเข้าห้องแชทได้ทันที' : 'ปฏิเสธแล้ว คืนที่นั่งให้คอร์ส', 'success');
      await load();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'ดำเนินการไม่สำเร็จ', 'error');
    } finally {
      setReviewing(null);
    }
  }

  return (
    <div className="tca">
      <div className="page-head">
        <div>
          <span className="eyebrow">ผู้ฝึกสอน</span>
          <h1>คอร์สของฉัน</h1>
          <p>{items.length - closedCount} คอร์สที่ใช้งาน · {closedCount} ยกเลิกแล้ว</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={() => setForm({ ...EMPTY })}>
          <i className="ri-add-line"></i> สร้างคอร์ส
        </button>
      </div>

      {requests.length > 0 && (
        <section className="card tca__requests">
          <div className="tca__requests-head">
            <h2><i className="ri-user-add-line"></i> คำขอเข้าร่วมรออนุมัติ <span className="badge badge-warning">{requests.length}</span></h2>
            <span>อนุมัติแล้วสมาชิกจะเข้าห้องแชทของคอร์สได้ทันที</span>
          </div>
          <ul className="tca__requests-list">
            {requests.map(({ activity, p }) => (
              <li key={`${activity.id}-${p.user_id}`}>
                <div className="tca__req-who">
                  <span className="tca__num">{(p.name || p.email).charAt(0)}</span>
                  <div>
                    <div className="tca__pname">{p.name || p.email}</div>
                    <div className="tca__pmail">ขอเข้า <b>{activity.title}</b> · {new Date(p.registered_at).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                  </div>
                </div>
                <div className="tca__req-actions">
                  <button type="button" className="btn btn--ghost btn--sm" disabled={reviewing === p.user_id} onClick={() => handleReview(p.user_id, 'reject', activity.id)}>ปฏิเสธ</button>
                  <button type="button" className="btn btn--primary btn--sm" disabled={reviewing === p.user_id} onClick={() => handleReview(p.user_id, 'approve', activity.id)}>
                    <i className="ri-check-line"></i> อนุมัติ
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="sgp__tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'active'} className={`sgp__tab ${tab === 'active' ? 'on' : ''}`} onClick={() => setTab('active')}>
          ใช้งาน <span className="sgp__count">{items.length - closedCount}</span>
        </button>
        <button type="button" role="tab" aria-selected={tab === 'closed'} className={`sgp__tab ${tab === 'closed' ? 'on' : ''}`} onClick={() => setTab('closed')}>
          ยกเลิกแล้ว <span className="sgp__count">{closedCount}</span>
        </button>
      </div>

      {loading ? (
        <div className="tca__state">กำลังโหลด...</div>
      ) : visible.length === 0 ? (
        <div className="card tca__state">
          <i className="ri-calendar-event-line"></i>
          <span>{tab === 'active' ? 'ยังไม่มีคอร์ส — สร้างคอร์สแรกได้เลย' : 'ไม่มีคอร์สที่ยกเลิก'}</span>
        </div>
      ) : (
        <div className="tca__grid">
          {visible.map((a) => {
            const pct = a.max_participants ? Math.min(100, Math.round((a.current_participants / a.max_participants) * 100)) : 0;
            const closed = a.status === 'closed';
            return (
              <article key={a.id} className={`card tca__course ${closed ? 'tca__course--closed' : ''}`}>
                <div className="tca__course-head">
                  <span>
                    <span className={`badge ${STATUS_BADGE[a.status]}`}>{STATUS_LABEL[a.status]}</span>
                    {a.pending_count > 0 && <span className="badge badge-warning" style={{ marginLeft: 6 }}>รออนุมัติ {a.pending_count}</span>}
                  </span>
                  <span className="tca__when"><i className="ri-time-line"></i>{fmtDT(a.start_datetime)}</span>
                </div>
                <h3>{a.title}</h3>
                {a.description && <p className="tca__desc">{a.description}</p>}
                <div className="tca__seats">
                  <div className="tca__seats-row">
                    <span>ผู้สมัคร</span>
                    <span><b>{a.current_participants}</b> / {a.max_participants}</span>
                  </div>
                  <div className="tca__bar"><div style={{ width: `${pct}%` }} /></div>
                </div>
                <div className="tca__actions">
                  <button type="button" className="btn btn--secondary btn--sm" onClick={() => navigate(`/activities/${a.id}/chat`)}>
                    <i className="ri-chat-3-line"></i> แชท
                  </button>
                  <button type="button" className={`btn btn--sm ${a.pending_count > 0 ? 'btn--primary' : 'btn--secondary'}`} onClick={() => openRoster(a)}>
                    <i className="ri-group-line"></i> รายชื่อ{a.pending_count > 0 ? ` (${a.pending_count} รอ)` : ''}
                  </button>
                  {!closed && (
                    <>
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => setForm({ id: a.id, title: a.title, start_datetime: toLocalInput(a.start_datetime), max_participants: String(a.max_participants), description: a.description ?? '' })}>
                        <i className="ri-edit-line"></i> แก้ไข
                      </button>
                      <button type="button" className="btn btn--danger btn--sm" onClick={() => handleCancel(a)} disabled={cancelling === a.id}>
                        <i className="ri-close-circle-line"></i> ปิดคอร์ส
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ---------- ฟอร์มสร้าง/แก้ไข ---------- */}
      {form && (
        <div className="modal-overlay" onClick={() => !saving && setForm(null)}>
          <form className="modal-content" onClick={(e) => e.stopPropagation()} onSubmit={handleSave}>
            <h3>{form.id ? 'แก้ไขคอร์ส' : 'สร้างคอร์สใหม่'}</h3>
            <div className="tca__form">
              <label className="tca__field tca__field--full">
                <span>ชื่อคอร์ส *</span>
                <input className="input" required maxLength={255} placeholder="เช่น Strength 101: ท่าพื้นฐาน" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
              </label>
              <label className="tca__field">
                <span>วันเวลาเริ่ม *</span>
                <input className="input" type="datetime-local" required value={form.start_datetime} onChange={(e) => setForm({ ...form, start_datetime: e.target.value })} />
              </label>
              <label className="tca__field">
                <span>จำนวนที่นั่ง *</span>
                <input className="input" type="number" min={1} max={500} required value={form.max_participants} onChange={(e) => setForm({ ...form, max_participants: e.target.value })} />
              </label>
              <label className="tca__field tca__field--full">
                <span>รายละเอียด</span>
                <textarea className="input" rows={3} maxLength={1000} placeholder="ระดับ สิ่งที่ต้องเตรียม สถานที่ ฯลฯ" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setForm(null)} disabled={saving}>ยกเลิก</button>
              <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'กำลังบันทึก...' : form.id ? 'บันทึกการแก้ไข' : 'สร้างคอร์ส'}</button>
            </div>
          </form>
        </div>
      )}

      {/* ---------- รายชื่อผู้สมัคร ---------- */}
      {roster && (
        <div className="modal-overlay" onClick={() => setRoster(null)}>
          <div className="modal-content tca__roster" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="tca__roster-head">
              <div>
                <span className="eyebrow">ผู้สมัคร</span>
                <h3>{roster.activity.title}</h3>
                <p>{fmtDT(roster.activity.start_datetime)} · {roster.activity.current_participants}/{roster.activity.max_participants} ที่นั่ง{roster.list && roster.list.some((p) => p.status === 'pending') ? ` · รออนุมัติ ${roster.list.filter((p) => p.status === 'pending').length}` : ''}</p>
              </div>
              <button type="button" className="tca__roster-close" onClick={() => setRoster(null)} aria-label="ปิด"><i className="ri-close-line"></i></button>
            </div>
            {roster.list === null ? (
              <div className="tca__state">กำลังโหลดรายชื่อ...</div>
            ) : roster.list.length === 0 ? (
              <div className="tca__state">ยังไม่มีผู้สมัคร</div>
            ) : (
              <ol className="tca__list">
                {roster.list.map((p, i) => (
                  <li key={p.user_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className="tca__num">{i + 1}</span>
                      <div>
                        <div className="tca__pname">
                          {p.name || '—'} 
                          <span className={`badge ${REG_BADGE[p.status]}`} style={{ marginLeft: '0.5rem' }}>{as_.REGISTRATION_LABEL[p.status]}</span>
                        </div>
                        <div className="tca__pmail">{p.email}</div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className="tca__pdate">{new Date(p.registered_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</span>
                      
                      {roster.activity.status !== 'closed' && (p.status === 'pending' || p.status === 'approved') && (
                        <div style={{ display: 'flex', gap: '0.25rem', marginLeft: '1rem' }}>
                          {p.status === 'pending' && (
                            <button type="button" className="btn btn--primary btn--sm" disabled={reviewing === p.user_id} onClick={() => handleReview(p.user_id, 'approve')}>
                              อนุมัติ
                            </button>
                          )}
                          <button type="button" className="btn btn--ghost btn--sm" disabled={reviewing === p.user_id} onClick={() => handleReview(p.user_id, 'reject')}>
                            ปฏิเสธ
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}

      {toast.show && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast({ ...toast, show: false })} />}
    </div>
  );
}

export default TrainerActivities;
