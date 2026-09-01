/**
 * MemberDashboard.tsx — Member ดูภาพรวมสุขภาพและความก้าวหน้า
 * Phase 11: เชื่อม GET /api/dashboard/personal (weight trend + frequency + attendance)
 */

import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Toast from '../../components/Toast';
import { ApiError } from '../../services/api';
import * as dashboardService from '../../services/dashboard.service';
import * as profileService from '../../services/profile.service';
import './MemberDashboard.css';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

interface DateRange {
  start: string;
  end: string;
}

function MemberDashboard() {
  const [data, setData] = useState<dashboardService.DashboardPersonal | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [heightInput, setHeightInput] = useState('');
  const [savingWeight, setSavingWeight] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, [dateRange]);

  async function loadDashboard() {
    setLoading(true);
    try {
      const dashData = await dashboardService.getPersonalDashboard(dateRange.start, dateRange.end);
      setData(dashData);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'ไม่สามารถโหลดข้อมูล', 'error');
    } finally {
      setLoading(false);
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ show: true, message, type });
  }

  async function handleUpdateWeight(e: React.FormEvent) {
    e.preventDefault();
    setSavingWeight(true);
    try {
      await profileService.updateProfile({
        firstName: undefined as any,
        lastName: undefined as any,
        fitnessGoal: undefined as any,
        medicalConditions: undefined as any,
        weight: weightInput,
        height: heightInput,
      });
      showToast('บันทึกข้อมูลน้ำหนัก/ส่วนสูงสำเร็จ', 'success');
      setShowWeightModal(false);
      loadDashboard();
    } catch (err) {
      showToast('ไม่สามารถบันทึกข้อมูลได้', 'error');
    } finally {
      setSavingWeight(false);
    }
  }

  const latestWeight = data?.weight_trend?.[data.weight_trend.length - 1]?.weight;
  const firstWeight = data?.weight_trend?.[0]?.weight;
  const weightDiff = latestWeight && firstWeight ? (latestWeight - firstWeight).toFixed(1) : null;

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>กำลังโหลด...</div>;
  }

  return (
    <div className="member-dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.8rem', color: 'var(--color-text)' }}>
          <i className="ri-dashboard-line" style={{ color: 'var(--color-primary)' }}></i> ภาพรวมสุขภาพ
        </h1>
        <button className="btn btn--primary" onClick={() => setShowWeightModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="ri-add-circle-line"></i> อัปเดตน้ำหนัก
        </button>
      </div>

      <div className="member-dashboard__filters">
        <div className="member-dashboard__filter-group">
          <label htmlFor="start-date">ตั้งแต่</label>
          <input
            id="start-date"
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="member-dashboard__input"
          />
        </div>
        <div className="member-dashboard__filter-group">
          <label htmlFor="end-date">ถึง</label>
          <input
            id="end-date"
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="member-dashboard__input"
          />
        </div>
      </div>

      <div className="member-dashboard__cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="member-dashboard__card" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h3 style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ background: 'var(--color-bg)', padding: '0.5rem', borderRadius: '8px', color: 'var(--color-primary)' }}>
              <i className="ri-weight-line"></i>
            </div>
            น้ำหนักล่าสุด
          </h3>
          <p className="member-dashboard__card-value" style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--color-text)' }}>
            {latestWeight ?? '-'} <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>กก.</span>
          </p>
          <p className="member-dashboard__card-sub" style={{ margin: 0, fontSize: '0.85rem', color: weightDiff && parseFloat(weightDiff) > 0 ? '#ef4444' : '#10b981' }}>
            {weightDiff && (
              <>
                <i className={parseFloat(weightDiff) > 0 ? 'ri-arrow-up-line' : 'ri-arrow-down-line'}></i> {Math.abs(parseFloat(weightDiff))} กก.
              </>
            )}
            {!weightDiff && '-'}
          </p>
        </div>

        <div className="member-dashboard__card" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h3 style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ background: 'var(--color-bg)', padding: '0.5rem', borderRadius: '8px', color: 'var(--color-primary)' }}>
              <i className="ri-check-double-line"></i>
            </div>
            อัตราการเข้าร่วม
          </h3>
          <p className="member-dashboard__card-value" style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--color-text)' }}>
            {data?.attendance_rate.toFixed(1) ?? '-'} <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>%</span>
          </p>
          <p className="member-dashboard__card-sub" style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>จากกิจกรรมทั้งหมด</p>
        </div>

        <div className="member-dashboard__card" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h3 style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ background: 'var(--color-bg)', padding: '0.5rem', borderRadius: '8px', color: 'var(--color-primary)' }}>
              <i className="ri-fire-line"></i>
            </div>
            ครั้งออกกำลังกาย
          </h3>
          <p className="member-dashboard__card-value" style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--color-text)' }}>
            {data?.workout_frequency.reduce((sum, d) => sum + d.count, 0) ?? '-'} <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>ครั้ง</span>
          </p>
          <p className="member-dashboard__card-sub" style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>ในช่วงเวลา</p>
        </div>
      </div>

      <div className="member-dashboard__charts">
        <section className="member-dashboard__chart-section" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', margin: '0 0 1.5rem 0', color: 'var(--color-text)' }}>
            <i className="ri-line-chart-line" style={{ color: 'var(--color-primary)' }}></i> แนวโน้มน้ำหนัก
          </h2>
          {data?.weight_trend && data.weight_trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.weight_trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(date) => new Date(date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip
                  formatter={(value: any) => (typeof value === 'number' ? value.toFixed(1) : value)}
                  labelFormatter={(label: any) => new Date(label as string).toLocaleDateString('th-TH')}
                />
                <Legend />
                <Line type="monotone" dataKey="weight" stroke="#2563eb" dot={{ r: 4 }} name="น้ำหนัก (กก.)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>ไม่มีข้อมูลน้ำหนัก</p>
          )}
        </section>

        <section className="member-dashboard__chart-section" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', margin: '0 0 1.5rem 0', color: 'var(--color-text)' }}>
            <i className="ri-bar-chart-grouped-line" style={{ color: 'var(--color-primary)' }}></i> ความถี่การออกกำลังกาย
          </h2>
          {data?.workout_frequency && data.workout_frequency.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.workout_frequency}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(date) => new Date(date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip labelFormatter={(label) => new Date(label as string).toLocaleDateString('th-TH')} />
                <Legend />
                <Bar dataKey="count" fill="#10b981" name="ครั้ง" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>ไม่มีข้อมูลการออกกำลังกาย</p>
          )}
        </section>
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast({ ...toast, show: false })}
        />
      )}

      {showWeightModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius)', width: '90%', maxWidth: '400px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow)' }}>
            <h2 style={{ color: 'var(--color-text)', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="ri-weight-line" style={{ color: 'var(--color-primary)' }}></i> อัปเดตน้ำหนัก/ส่วนสูง
            </h2>
            <form onSubmit={handleUpdateWeight} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>น้ำหนักล่าสุด (กก.)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>
              <div>
                <label style={{ color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>ส่วนสูง (ซม.) (ถ้ามี)</label>
                <input
                  type="number"
                  step="0.1"
                  value={heightInput}
                  onChange={(e) => setHeightInput(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn--primary" disabled={savingWeight} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  {savingWeight ? <><i className="ri-loader-4-line ri-spin"></i> บันทึก...</> : <><i className="ri-save-line"></i> บันทึก</>}
                </button>
                <button type="button" className="btn" onClick={() => setShowWeightModal(false)} style={{ background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)', flex: 1 }}>
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberDashboard;
