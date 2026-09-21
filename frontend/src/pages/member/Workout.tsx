/**
 * Workout.tsx — ตารางออกกำลังกายของสมาชิก
 *
 * - แผนเก็บใน DB (workout_plans) — ออกจากระบบแล้วกลับมาก็ยังอยู่ จนกว่าจะ "ขอตารางใหม่"
 * - แสดงเป็นรายวัน (แท็บวัน) การ์ดท่าจากคลังพร้อม GIF · กดดูรายละเอียดเต็ม
 * - บันทึกผล: กด "บันทึก" ที่การ์ด → ฟอร์มเติมค่าเป้าหมายให้ → ปรับแล้วส่ง
 * - บันทึกตารางเป็นรูป PNG (html-to-image)
 */

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { toPng } from 'html-to-image';
import Toast from '../../components/Toast';
import ExerciseDetailDialog from '../../components/ExerciseDetailDialog';
import { ApiError } from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';
import { DIFFICULTY_LABEL } from '../../services/exercise.service';
import * as ws from '../../services/workout.service';
import './Workout.css';

interface ToastState { show: boolean; message: string; type: 'success' | 'error' }
interface LogForm { detail: ws.PlanDetail; sets: string; reps: string; weightKg: string }

const GOALS: ws.PlanGoal[] = ['lose_weight', 'build_muscle', 'general'];

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

function Workout() {
  const [plan, setPlan] = useState<ws.WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [pickingGoal, setPickingGoal] = useState(false);
  const [goal, setGoal] = useState<ws.PlanGoal>('general');
  const [activeDay, setActiveDay] = useState<ws.DayOfWeek>(ws.todayDay());
  const [selected, setSelected] = useState<ws.PlanDetail | null>(null);
  const [logForm, setLogForm] = useState<LogForm | null>(null);
  const [logging, setLogging] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });
  const exportRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => setToast({ show: true, message, type }), []);

  const loadPlan = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ws.getCurrentWorkoutPlan();
      setPlan(data);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'ไม่สามารถโหลดตารางได้', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  const days = useMemo(() => (plan ? ws.groupByDay(plan.details) : []), [plan]);
  const trainingDays = days.map((d) => d.day);

  // ถ้าวันนี้ไม่ใช่วันฝึก ให้เปิดวันฝึกวันแรก
  useEffect(() => {
    if (trainingDays.length && !trainingDays.includes(activeDay)) setActiveDay(trainingDays[0]);
  }, [trainingDays, activeDay]);

  const current = days.find((d) => d.day === activeDay);
  const totalLogs = plan ? plan.details.reduce((sum, d) => sum + Number(d.log_count || 0), 0) : 0;
  const doneThisDay = current ? current.items.filter((d) => d.log_count > 0).length : 0;

  async function handleGenerate() {
    setGenerating(true);
    try {
      const data = await ws.generateWorkoutPlan(goal);
      setPlan(data);
      setPickingGoal(false);
      showToast('สร้างตารางใหม่แล้ว', 'success');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'ไม่สามารถสร้างตารางได้', 'error');
    } finally {
      setGenerating(false);
    }
  }

  function openLog(detail: ws.PlanDetail) {
    setLogForm({
      detail,
      sets: String(detail.target_sets ?? ''),
      reps: String(detail.target_reps ?? ''),
      weightKg: detail.target_weight ? String(detail.target_weight) : '',
    });
  }

  async function handleLog(e: FormEvent) {
    e.preventDefault();
    if (!plan || !logForm) return;
    setLogging(true);
    try {
      await ws.logWorkout(plan.id, {
        exerciseId: logForm.detail.exercise_id,
        sets: parseInt(logForm.sets, 10),
        reps: parseInt(logForm.reps, 10),
        weightKg: logForm.weightKg ? parseFloat(logForm.weightKg) : undefined,
      });
      showToast(`บันทึก ${logForm.detail.exercise_name} แล้ว`, 'success');
      setLogForm(null);
      await loadPlan();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'ไม่สามารถบันทึกผลได้', 'error');
    } finally {
      setLogging(false);
    }
  }

  async function handleExport() {
    if (!exportRef.current || !plan) return;
    setExporting(true);
    const imgs = Array.from(exportRef.current.querySelectorAll('img'));
    const originalSrc = imgs.map((img) => img.src);
    try {
      // GIF ท่าแต่ละไฟล์ใหญ่หลาย MB — ถ้าปล่อยให้ html-to-image ฝังทั้งไฟล์จะค้าง
      // จึงวาดเฟรมแรกลง canvas เล็กๆ เป็น JPEG ก่อน (รูปอยู่ origin เดียวกัน canvas ไม่ taint)
      await Promise.all(imgs.map((img) => (img.complete ? Promise.resolve() : new Promise((r) => { img.onload = img.onerror = () => r(null); }))));
      for (const img of imgs) {
        if (!img.naturalWidth) continue;
        const c = document.createElement('canvas');
        c.width = 160;
        c.height = 160;
        const ctx = c.getContext('2d');
        if (!ctx) continue;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, 160, 160);
        const s = Math.min(160 / img.naturalWidth, 160 / img.naturalHeight);
        const w = img.naturalWidth * s;
        const h = img.naturalHeight * s;
        ctx.drawImage(img, (160 - w) / 2, (160 - h) / 2, w, h);
        img.src = c.toDataURL('image/jpeg', 0.85);
      }
      // skipFonts: ไม่อ่าน stylesheet ข้ามโดเมน (Google Fonts / Remix Icon) ซึ่ง browser บล็อก
      const dataUrl = await toPng(exportRef.current, {
        pixelRatio: 2,
        backgroundColor: '#0a0e1a',
        skipFonts: true,
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `gymyam-plan-${plan.goal ?? 'general'}-${new Date().toISOString().slice(0, 10)}.png`;
      a.click();
      showToast('บันทึกรูปตารางแล้ว', 'success');
    } catch {
      showToast('บันทึกรูปไม่สำเร็จ ลองใหม่อีกครั้ง', 'error');
    } finally {
      imgs.forEach((img, i) => { img.src = originalSrc[i]; });
      setExporting(false);
    }
  }

  if (loading) {
    return <div className="wk__loading">กำลังโหลดตาราง...</div>;
  }

  return (
    <div className="wk">
      {/* ---------- Header ---------- */}
      <div className="page-head">
        <div>
          <span className="eyebrow">ตารางของฉัน</span>
          <h1>ตารางออกกำลังกาย</h1>
          {plan ? (
            <p>
              เป้าหมาย <b>{plan.goal ? ws.GOAL_LABEL[plan.goal] : 'ฟิตทั่วไป'}</b> · {formatDate(plan.start_date)} – {formatDate(plan.end_date)} ·
              ฝึก {trainingDays.length} วัน/สัปดาห์ · บันทึกแล้ว {totalLogs} ครั้ง
            </p>
          ) : (
            <p>ยังไม่มีตาราง — เลือกเป้าหมายเพื่อให้ระบบจัดท่าและวันฝึกให้</p>
          )}
        </div>
        <div className="wk__head-actions">
          {plan && (
            <button type="button" className="btn btn--secondary" onClick={handleExport} disabled={exporting}>
              <i className="ri-image-line"></i> {exporting ? 'กำลังสร้างรูป...' : 'บันทึกเป็นรูป'}
            </button>
          )}
          <button type="button" className={`btn ${plan ? 'btn--ghost' : 'btn--primary'}`} onClick={() => setPickingGoal(true)}>
            <i className="ri-refresh-line"></i> {plan ? 'ขอตารางใหม่' : 'สร้างตาราง'}
          </button>
        </div>
      </div>

      {/* ---------- Empty ---------- */}
      {!plan && (
        <div className="card wk__empty">
          <i className="ri-calendar-2-line"></i>
          <h3>เริ่มจากการเลือกเป้าหมาย</h3>
          <p>ระบบจะจัดท่าจากคลัง กำหนดเซต/ครั้ง และวันฝึกให้ทั้งสัปดาห์ ตารางจะอยู่กับคุณจนกว่าจะขอใหม่</p>
          <button type="button" className="btn btn--primary" onClick={() => setPickingGoal(true)}>เลือกเป้าหมาย</button>
        </div>
      )}

      {/* ---------- Schedule ---------- */}
      {plan && (
        <>
          <div className="wk__days" role="tablist" aria-label="วันฝึก">
            {ws.DAY_ORDER.map((day) => {
              const group = days.find((g) => g.day === day);
              const isRest = !group;
              const isToday = day === ws.todayDay();
              return (
                <button
                  key={day}
                  type="button"
                  role="tab"
                  aria-selected={activeDay === day}
                  className={`wk__day ${activeDay === day ? 'wk__day--active' : ''} ${isRest ? 'wk__day--rest' : ''}`}
                  onClick={() => !isRest && setActiveDay(day)}
                  disabled={isRest}
                >
                  <span className="wk__day-name">{ws.DAY_SHORT[day]}</span>
                  <span className="wk__day-count">{isRest ? 'พัก' : `${group.items.length} ท่า`}</span>
                  {isToday && <span className="wk__day-today">วันนี้</span>}
                </button>
              );
            })}
          </div>

          {current && (
            <section className="wk__day-panel">
              <div className="wk__day-head">
                <h2>{ws.DAY_LABEL[current.day]}</h2>
                <span className="badge badge-neutral">{doneThisDay}/{current.items.length} บันทึกแล้ว</span>
              </div>

              <div className="wk__grid">
                {current.items.map((d, idx) => (
                  <article key={d.id} className={`wk__ex ${d.log_count > 0 ? 'wk__ex--done' : ''}`}>
                    <button type="button" className="wk__ex-media" onClick={() => setSelected(d)} aria-label={`ดูรายละเอียด ${d.exercise_name}`}>
                      {d.media_url ? <img src={getImageUrl(d.media_url)} alt="" loading="lazy" /> : <i className="ri-image-line"></i>}
                      <span className="wk__ex-order">{idx + 1}</span>
                    </button>
                    <div className="wk__ex-body">
                      <div className="wk__ex-meta">
                        <span className={`wk__lvl wk__lvl--${d.difficulty}`}>{DIFFICULTY_LABEL[d.difficulty]}</span>
                        {d.equipment && <span className="wk__ex-eq"><i className="ri-tools-line"></i>{d.equipment}</span>}
                      </div>
                      <h3><button type="button" onClick={() => setSelected(d)}>{d.exercise_name}</button></h3>
                      {d.muscle_group && <p className="wk__ex-muscle">{d.muscle_group}</p>}
                      <div className="wk__ex-target">
                        <div><b>{d.target_sets ?? '—'}</b><span>Sets</span></div>
                        <div><b>{d.target_reps ?? '—'}</b><span>Reps</span></div>
                        <div><b>{d.target_weight ?? '—'}</b><span>kg</span></div>
                      </div>
                      <div className="wk__ex-actions">
                        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setSelected(d)}>
                          <i className="ri-eye-line"></i> รายละเอียด
                        </button>
                        <button type="button" className="btn btn--primary btn--sm" onClick={() => openLog(d)}>
                          <i className="ri-check-line"></i> บันทึกผล
                        </button>
                      </div>
                      {d.log_count > 0 && (
                        <div className="wk__ex-done">
                          <i className="ri-checkbox-circle-fill"></i> บันทึกแล้ว {d.log_count} ครั้ง
                          {d.last_logged_at && ` · ล่าสุด ${formatDate(d.last_logged_at)}`}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ---------- ตารางสำหรับ export (ซ่อนนอกจอ แต่ render จริง) ---------- */}
          <div className="wk__export-host" aria-hidden="true">
            <div ref={exportRef} className="wk__export">
              <div className="wk__export-head">
                <div>
                  <div className="wk__export-brand">Gymyamjamsai</div>
                  <div className="wk__export-title">Workout Plan · {plan.goal ? ws.GOAL_LABEL[plan.goal] : 'ฟิตทั่วไป'}</div>
                </div>
                <div className="wk__export-dates">{formatDate(plan.start_date)} – {formatDate(plan.end_date)}</div>
              </div>
              <div className="wk__export-grid">
                {days.map((g) => (
                  <div key={g.day} className="wk__export-day">
                    <div className="wk__export-dayname">{ws.DAY_LABEL[g.day]}</div>
                    {g.items.map((d, i) => (
                      <div key={d.id} className="wk__export-item">
                        <div className="wk__export-thumb">
                          {d.media_url && <img src={getImageUrl(d.media_url)} alt="" />}
                        </div>
                        <div>
                          <div className="wk__export-name">{i + 1}. {d.exercise_name}</div>
                          <div className="wk__export-target">{d.target_sets ?? '—'} sets × {d.target_reps ?? '—'} reps{d.target_weight ? ` · ${d.target_weight} kg` : ''}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ---------- Goal picker ---------- */}
      {pickingGoal && (
        <div className="modal-overlay" onClick={() => !generating && setPickingGoal(false)}>
          <div className="modal-content wk__goal" onClick={(e) => e.stopPropagation()}>
            <h3>เลือกเป้าหมาย</h3>
            {plan && <p className="wk__goal-warn"><i className="ri-information-line"></i> ตารางปัจจุบันจะถูกแทนที่ ประวัติที่บันทึกไว้ยังอยู่ในกราฟ</p>}
            <div className="wk__goal-list">
              {GOALS.map((g) => (
                <label key={g} className={`wk__goal-item ${goal === g ? 'wk__goal-item--on' : ''}`}>
                  <input type="radio" name="goal" value={g} checked={goal === g} onChange={() => setGoal(g)} />
                  <span className="wk__goal-name">{ws.GOAL_LABEL[g]}</span>
                  <span className="wk__goal-desc">{ws.GOAL_DESC[g]}</span>
                </label>
              ))}
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setPickingGoal(false)} disabled={generating}>ยกเลิก</button>
              <button type="button" className="btn btn--primary" onClick={handleGenerate} disabled={generating}>
                {generating ? 'กำลังสร้าง...' : plan ? 'สร้างตารางใหม่' : 'สร้างตาราง'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Log form ---------- */}
      {logForm && (
        <div className="modal-overlay" onClick={() => !logging && setLogForm(null)}>
          <form className="modal-content wk__log" onClick={(e) => e.stopPropagation()} onSubmit={handleLog}>
            <div className="wk__log-head">
              {logForm.detail.media_url && <img src={getImageUrl(logForm.detail.media_url)} alt="" />}
              <div>
                <span className="eyebrow">บันทึกผล · {ws.DAY_LABEL[logForm.detail.day_of_week]}</span>
                <h3>{logForm.detail.exercise_name}</h3>
                <p>เป้าหมาย {logForm.detail.target_sets ?? '—'} sets × {logForm.detail.target_reps ?? '—'} reps — ปรับตามที่ทำได้จริง</p>
              </div>
            </div>
            <div className="wk__log-fields">
              <label>
                <span>Sets</span>
                <input type="number" inputMode="numeric" min={1} max={20} required value={logForm.sets} onChange={(e) => setLogForm({ ...logForm, sets: e.target.value })} autoFocus />
              </label>
              <label>
                <span>Reps / set</span>
                <input type="number" inputMode="numeric" min={1} max={200} required value={logForm.reps} onChange={(e) => setLogForm({ ...logForm, reps: e.target.value })} />
              </label>
              <label>
                <span>Weight (kg)</span>
                <input type="number" inputMode="decimal" min={0} step={0.5} placeholder="ถ้ามี" value={logForm.weightKg} onChange={(e) => setLogForm({ ...logForm, weightKg: e.target.value })} />
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setLogForm(null)} disabled={logging}>ยกเลิก</button>
              <button type="submit" className="btn btn--primary" disabled={logging}>{logging ? 'กำลังบันทึก...' : 'บันทึก'}</button>
            </div>
          </form>
        </div>
      )}

      {selected && (
        <ExerciseDetailDialog
          exercise={ws.detailToExercise(selected)}
          target={{ sets: selected.target_sets, reps: selected.target_reps, weight: selected.target_weight, day: ws.DAY_LABEL[selected.day_of_week] }}
          onClose={() => setSelected(null)}
          extra={
            <button type="button" className="btn btn--primary" onClick={() => { const d = selected; setSelected(null); openLog(d); }}>
              <i className="ri-check-line"></i> บันทึกผลท่านี้
            </button>
          }
        />
      )}

      {toast.show && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast({ ...toast, show: false })} />}
    </div>
  );
}

export default Workout;
