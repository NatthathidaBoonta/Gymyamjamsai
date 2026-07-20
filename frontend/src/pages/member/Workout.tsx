/**
 * Workout.tsx — Member ดูตารางท่า + ขอตารางใหม่ + บันทึกผล
 * Phase 10: เชื่อม GET /api/workout-plans/current และ POST /api/workout-plans/generate
 */

import { useEffect, useState } from 'react';
import Toast from '../../components/Toast';
import { ApiError } from '../../services/api';
import * as workoutService from '../../services/workout.service';
import './Workout.css';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

function Workout() {
  const [plan, setPlan] = useState<workoutService.WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

  // Load current plan on mount
  useEffect(() => {
    loadPlan();
  }, []);

  async function loadPlan() {
    setLoading(true);
    try {
      const data = await workoutService.getCurrentWorkoutPlan();
      setPlan(data);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'ไม่สามารถโหลดตารางท่า', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateNewPlan() {
    setGenerating(true);
    try {
      const data = await workoutService.generateWorkoutPlan('general');
      setPlan(data);
      showToast('ได้รับตารางท่าใหม่แล้ว', 'success');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'ไม่สามารถขอตารางท่า', 'error');
    } finally {
      setGenerating(false);
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ show: true, message, type });
  }

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>กำลังโหลด...</div>;
  }

  return (
    <div className="workout">
      <div className="workout__header">
        <h1>ตารางออกกำลังกาย</h1>
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleGenerateNewPlan}
          disabled={generating}
        >
          {generating ? 'กำลังขอตาราง...' : 'ขอตารางใหม่'}
        </button>
      </div>

      {plan && (
        <>
          <div className="workout__plan-info">
            <p>
              <strong>เป้าหมาย:</strong> {plan.goal}
            </p>
            <p>
              <strong>สร้างเมื่อ:</strong> {new Date(plan.created_at).toLocaleDateString('th-TH')}
            </p>
          </div>

          <div className="workout__exercises">
            {plan.details && plan.details.length > 0 ? (
              <table className="workout__table">
                <thead>
                  <tr>
                    <th>วัน</th>
                    <th>ท่า</th>
                    <th>หมวดหมู่</th>
                    <th>หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.details.map((detail) => (
                    <tr key={detail.id}>
                      <td>วันที่ {detail.day}</td>
                      <td className="workout__exercise-name">{detail.exercise.name}</td>
                      <td>{detail.exercise.category}</td>
                      <td>{detail.notes ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                ยังไม่มีตารางท่า ขอตารางใหม่ได้เลย
              </p>
            )}
          </div>

          <section className="workout__log">
            <h2>บันทึกผลวันนี้</h2>
            <form className="workout__form">
              <div className="workout__field">
                <label className="workout__label" htmlFor="exercise">
                  เลือกท่า
                </label>
                <select id="exercise" className="workout__input" required>
                  <option value="">-- เลือกท่า --</option>
                  {plan.details?.map((detail) => (
                    <option key={detail.id} value={detail.exercise.id}>
                      {detail.exercise.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="workout__field">
                <label className="workout__label" htmlFor="sets">
                  จำนวนเซต
                </label>
                <input
                  id="sets"
                  className="workout__input"
                  type="number"
                  min="1"
                  placeholder="เช่น 3"
                  required
                />
              </div>

              <div className="workout__field">
                <label className="workout__label" htmlFor="reps">
                  จำนวนครั้งต่อเซต
                </label>
                <input
                  id="reps"
                  className="workout__input"
                  type="number"
                  min="1"
                  placeholder="เช่น 10"
                  required
                />
              </div>

              <div className="workout__field">
                <label className="workout__label" htmlFor="weight">
                  น้ำหนัก (กก.) - ถ้าไม่ใช้ให้เว้นว่าง
                </label>
                <input
                  id="weight"
                  className="workout__input"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="เช่น 20.5"
                />
              </div>

              <button type="submit" className="btn btn--primary workout__submit">
                บันทึกผล
              </button>
            </form>
            <p className="workout__hint">
              💡 ระบบบันทึก workout ถูกพัฒนาแล้ว จะตัวเต็ม เมื่อ backend มี endpoint เพิ่มข้อมูล
            </p>
          </section>
        </>
      )}

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
}

export default Workout;
