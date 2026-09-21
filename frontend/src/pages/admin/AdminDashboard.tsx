/**
 * AdminDashboard.tsx — ภาพรวมระบบสำหรับผู้ดูแล
 * KPI 6 ช่อง · ผู้ใช้ใหม่รายสัปดาห์ (area) · การจองรายวัน (bar) · คอร์สยอดนิยม · สัดส่วน role · งานที่รอ
 */

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Toast from '../../components/Toast';
import { CountUp } from '../../components/landing/LandingFx';
import { ApiError, BASE_URL, getToken } from '../../services/api';
import * as ds from '../../services/dashboard.service';
import { CHART_AXIS_TICK, CHART_GRID, CHART_SERIES, CHART_TOOLTIP_STYLE } from '../../theme/chart';
import './AdminDashboard.css';

interface ToastState { show: boolean; message: string; type: 'success' | 'error' }

const ROLE_LABEL: Record<string, string> = { member: 'สมาชิก', trainer: 'ผู้ฝึกสอน', admin: 'ผู้ดูแล' };

function fmtWeek(w: string) {
  return new Date(w).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
}
function fmtDay(d: string) {
  return new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
}

function AdminDashboard() {
  const [summary, setSummary] = useState<ds.DashboardAdmin | null>(null);
  const [charts, setCharts] = useState<ds.DashboardAdminCharts | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

  const showToast = useCallback((message: string, type: 'success' | 'error') => setToast({ show: true, message, type }), []);

  useEffect(() => {
    (async () => {
      try {
        const [s, c] = await Promise.all([ds.getAdminDashboard(), ds.getAdminCharts()]);
        setSummary(s);
        setCharts(c);
      } catch (err) {
        showToast(err instanceof ApiError ? err.message : 'โหลดข้อมูลไม่สำเร็จ', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [showToast]);

  async function handleExportCSV() {
    setExporting(true);
    try {
      const response = await fetch(`${BASE_URL}/api/reports/activities/export`, { headers: { Authorization: `Bearer ${getToken() ?? ''}` } });
      if (!response.ok) throw new ApiError('ดาวน์โหลด CSV ไม่สำเร็จ', response.status);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activities-report-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('ดาวน์โหลดรายงานแล้ว', 'success');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'ดาวน์โหลดไม่สำเร็จ', 'error');
    } finally {
      setExporting(false);
    }
  }

  if (loading) return <div className="adm__state">กำลังโหลด...</div>;
  if (!summary || !charts) return <div className="adm__state">ไม่มีข้อมูล</div>;

  const totalRoles = charts.users_by_role.reduce((s, r) => s + r.count, 0) || 1;
  const maxPopular = Math.max(1, ...charts.popular_activities.map((a) => a.registrations));
  const newUsersTotal = charts.new_users_by_week.reduce((s, r) => s + r.count, 0);
  const regs14 = charts.registrations_by_day.reduce((s, r) => s + r.count, 0);

  return (
    <div className="adm">
      <div className="page-head">
        <div>
          <span className="eyebrow">ผู้ดูแลระบบ</span>
          <h1>ภาพรวมระบบ</h1>
          <p>สถานะล่าสุด ณ {new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}</p>
        </div>
        <div className="adm__head-actions">
          <button type="button" className="btn btn--secondary" onClick={handleExportCSV} disabled={exporting}>
            <i className="ri-download-2-line"></i> {exporting ? 'กำลังสร้าง...' : 'ส่งออกรายงาน CSV'}
          </button>
        </div>
      </div>

      {/* ---------- งานที่รอ ---------- */}
      {charts.pending_suggestions > 0 && (
        <Link to="/admin/suggestions" className="adm__alert">
          <i className="ri-git-pull-request-line"></i>
          <span><b>{charts.pending_suggestions}</b> ข้อเสนอแก้ไขท่าจากผู้ฝึกสอนรอการอนุมัติ</span>
          <i className="ri-arrow-right-line adm__alert-arrow"></i>
        </Link>
      )}

      {/* ---------- KPI ---------- */}
      <div className="adm__kpis">
        <div className="card adm__kpi adm__kpi--hot">
          <span className="adm__kpi-k">ผู้ใช้ทั้งหมด</span>
          <span className="adm__kpi-v"><CountUp to={summary.total_users} /></span>
          <span className="adm__kpi-d">+{newUsersTotal} ใน 8 สัปดาห์</span>
        </div>
        <div className="card adm__kpi">
          <span className="adm__kpi-k">ฝึกจริงใน 7 วัน</span>
          <span className="adm__kpi-v"><CountUp to={charts.active_members_7d} /></span>
          <span className="adm__kpi-d">สมาชิกที่บันทึกผล</span>
        </div>
        <div className="card adm__kpi">
          <span className="adm__kpi-k">คอร์สทั้งหมด</span>
          <span className="adm__kpi-v"><CountUp to={summary.total_activities} /></span>
          <span className="adm__kpi-d">{summary.total_registrations} การจอง</span>
        </div>
        <div className="card adm__kpi">
          <span className="adm__kpi-k">การจอง 14 วัน</span>
          <span className="adm__kpi-v"><CountUp to={regs14} /></span>
          <span className="adm__kpi-d">ครั้ง</span>
        </div>
        <div className="card adm__kpi">
          <span className="adm__kpi-k">ท่าในคลัง</span>
          <span className="adm__kpi-v"><CountUp to={summary.total_exercises} /></span>
          <span className="adm__kpi-d">{charts.exercises_by_category.map((c) => `${c.category} ${c.count}`).join(' · ')}</span>
        </div>
        <div className="card adm__kpi">
          <span className="adm__kpi-k">อัตราเข้าร่วม</span>
          <span className="adm__kpi-v"><CountUp to={Math.round(summary.average_attendance_rate)} /><small>%</small></span>
          <span className="adm__kpi-d">จากการจองทั้งหมด</span>
        </div>
      </div>

      {/* ---------- Charts ---------- */}
      <div className="adm__grid">
        <section className="card adm__panel adm__panel--wide">
          <div className="adm__panel-head">
            <h2>ผู้ใช้ใหม่รายสัปดาห์</h2>
            <span className="adm__panel-sub">8 สัปดาห์ล่าสุด</span>
          </div>
          {charts.new_users_by_week.length === 0 ? (
            <div className="adm__empty">ยังไม่มีผู้ใช้ใหม่ในช่วงนี้</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={charts.new_users_by_week} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="admUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_SERIES[0]} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={CHART_SERIES[0]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
                <XAxis dataKey="week" tickFormatter={fmtWeek} tick={CHART_AXIS_TICK} axisLine={{ stroke: CHART_GRID }} tickLine={false} />
                <YAxis allowDecimals={false} tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} labelFormatter={(l) => `สัปดาห์ ${fmtWeek(String(l))}`} formatter={(v) => [`${v} คน`, 'ผู้ใช้ใหม่']} />
                <Area type="monotone" dataKey="count" stroke={CHART_SERIES[0]} strokeWidth={2} fill="url(#admUsers)" dot={{ r: 3, fill: CHART_SERIES[0], strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </section>

        <section className="card adm__panel">
          <div className="adm__panel-head">
            <h2>สัดส่วนผู้ใช้</h2>
            <span className="adm__panel-sub">ตามบทบาท</span>
          </div>
          <div className="adm__roles">
            {charts.users_by_role.map((r, i) => (
              <div key={r.role} className="adm__role">
                <div className="adm__role-row">
                  <span>{ROLE_LABEL[r.role] ?? r.role}</span>
                  <b>{r.count}</b>
                </div>
                <div className="adm__bar"><div style={{ width: `${(r.count / totalRoles) * 100}%`, background: CHART_SERIES[i % CHART_SERIES.length] }} /></div>
              </div>
            ))}
          </div>
        </section>

        <section className="card adm__panel">
          <div className="adm__panel-head">
            <h2>การจองรายวัน</h2>
            <span className="adm__panel-sub">14 วันล่าสุด</span>
          </div>
          {charts.registrations_by_day.length === 0 ? (
            <div className="adm__empty">ยังไม่มีการจองในช่วงนี้</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={charts.registrations_by_day} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
                <XAxis dataKey="date" tickFormatter={fmtDay} tick={CHART_AXIS_TICK} axisLine={{ stroke: CHART_GRID }} tickLine={false} />
                <YAxis allowDecimals={false} tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.04)' }} labelFormatter={(l) => fmtDay(String(l))} formatter={(v) => [`${v} ครั้ง`, 'การจอง']} />
                <Bar dataKey="count" fill={CHART_SERIES[1]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>

        <section className="card adm__panel adm__panel--wide">
          <div className="adm__panel-head">
            <h2>คอร์สยอดนิยม</h2>
            <span className="adm__panel-sub">เรียงตามจำนวนการจอง</span>
          </div>
          {charts.popular_activities.length === 0 ? (
            <div className="adm__empty">ยังไม่มีคอร์ส</div>
          ) : (
            <ol className="adm__popular">
              {charts.popular_activities.map((a, i) => (
                <li key={a.id}>
                  <span className="adm__rank">{i + 1}</span>
                  <div className="adm__pop-body">
                    <div className="adm__pop-row">
                      <span className="adm__pop-title">{a.title}</span>
                      <span className="adm__pop-num"><b>{a.registrations}</b>/{a.max_participants}</span>
                    </div>
                    <div className="adm__bar"><div style={{ width: `${(a.registrations / maxPopular) * 100}%` }} /></div>
                    <div className="adm__pop-meta">
                      {a.trainer_name || 'ผู้ฝึกสอน'} · {a.start_datetime ? new Date(a.start_datetime).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : '—'}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      {toast.show && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast({ ...toast, show: false })} />}
    </div>
  );
}

export default AdminDashboard;
