/**
 * MemberDashboard.tsx — Member ดูภาพรวมสุขภาพและความก้าวหน้า
 * Phase 11: เชื่อม GET /api/dashboard/personal (weight trend + frequency + attendance)
 */

import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Toast from '../../components/Toast';
import { ApiError } from '../../services/api';
import * as dashboardService from '../../services/dashboard.service';
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

  const latestWeight = data?.weight_trend?.[data.weight_trend.length - 1]?.weight;
  const firstWeight = data?.weight_trend?.[0]?.weight;
  const weightDiff = latestWeight && firstWeight ? (latestWeight - firstWeight).toFixed(1) : null;

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>กำลังโหลด...</div>;
  }

  return (
    <div className="member-dashboard">
      <h1>ภาพรวมสุขภาพ</h1>

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

      <div className="member-dashboard__cards">
        <div className="member-dashboard__card">
          <h3>น้ำหนักล่าสุด</h3>
          <p className="member-dashboard__card-value">{latestWeight ?? '-'} กก.</p>
          <p className="member-dashboard__card-sub">
            {weightDiff && (
              <>
                {parseFloat(weightDiff) > 0 ? '↑' : '↓'} {Math.abs(parseFloat(weightDiff))} กก.
              </>
            )}
          </p>
        </div>

        <div className="member-dashboard__card">
          <h3>อัตราการเข้าร่วม</h3>
          <p className="member-dashboard__card-value">{data?.attendance_rate.toFixed(1) ?? '-'}%</p>
          <p className="member-dashboard__card-sub">จากกิจกรรมทั้งหมด</p>
        </div>

        <div className="member-dashboard__card">
          <h3>ครั้งออกกำลังกาย</h3>
          <p className="member-dashboard__card-value">
            {data?.workout_frequency.reduce((sum, d) => sum + d.count, 0) ?? '-'}
          </p>
          <p className="member-dashboard__card-sub">ในช่วงเวลา</p>
        </div>
      </div>

      <div className="member-dashboard__charts">
        <section className="member-dashboard__chart-section">
          <h2>แนวโน้มน้ำหนัก</h2>
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

        <section className="member-dashboard__chart-section">
          <h2>ความถี่การออกกำลังกาย</h2>
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
    </div>
  );
}

export default MemberDashboard;
