/**
 * TrainerDashboard.tsx — ภาพรวมผู้ฝึกสอน: คอร์สของฉัน ผู้สมัคร คอร์สถัดไป และสถานะข้อเสนอแก้ไขท่า
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../../services/api';
import { CountUp } from '../../components/landing/LandingFx';
import * as ds from '../../services/dashboard.service';
import './TrainerDashboard.css';

const STATUS_BADGE: Record<string, string> = { open: 'badge-success', full: 'badge-warning', closed: 'badge-neutral' };
const STATUS_LABEL: Record<string, string> = { open: 'เปิดรับ', full: 'เต็ม', closed: 'ยกเลิก' };

function TrainerDashboard() {
  const [data, setData] = useState<ds.DashboardTrainer | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ds.getTrainerDashboard()
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'โหลดข้อมูลไม่สำเร็จ'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="trd__state">กำลังโหลด...</div>;
  if (error || !data) return <div className="trd__state">{error || 'ไม่มีข้อมูล'}</div>;

  return (
    <div className="trd">
      <div className="page-head">
        <div>
          <span className="eyebrow">ผู้ฝึกสอน</span>
          <h1>ภาพรวมผู้สอน</h1>
          <p>คอร์สที่คุณดูแล ผู้สมัคร และข้อเสนอแก้ไขท่าที่ส่งไป</p>
        </div>
        <div className="trd__head-actions">
          <Link to="/trainer/exercises" className="btn btn--secondary"><i className="ri-lightbulb-line"></i> เสนอแก้ไขท่า</Link>
          <Link to="/trainer/activities" className="btn btn--primary"><i className="ri-add-line"></i> สร้างคอร์ส</Link>
        </div>
      </div>

      <div className="trd__kpis">
        <div className="card trd__kpi trd__kpi--hot">
          <span className="trd__kpi-k">คอร์สที่กำลังจะถึง</span>
          <span className="trd__kpi-v"><CountUp to={data.courses.upcoming} /></span>
          <span className="trd__kpi-d">จากทั้งหมด {data.courses.total} คอร์ส</span>
        </div>
        <Link to="/trainer/activities" className={`card trd__kpi trd__kpi--link ${data.pending_requests > 0 ? 'trd__kpi--alert' : ''}`}>
          <span className="trd__kpi-k">คำขอรออนุมัติ</span>
          <span className="trd__kpi-v"><CountUp to={data.pending_requests} /></span>
          <span className="trd__kpi-d">{data.pending_requests > 0 ? 'กดเพื่อไปอนุมัติ →' : 'ไม่มีคำขอค้าง'}</span>
        </Link>
        <div className="card trd__kpi">
          <span className="trd__kpi-k">ผู้สมัครรวม</span>
          <span className="trd__kpi-v"><CountUp to={data.total_registrations} /></span>
          <span className="trd__kpi-d">ที่นั่งที่ถูกจอง</span>
        </div>
        <div className="card trd__kpi">
          <span className="trd__kpi-k">สถานะคอร์ส</span>
          <span className="trd__kpi-v trd__kpi-v--sm">
            <span className="badge badge-success">เปิด {data.courses.open}</span>
            <span className="badge badge-warning">เต็ม {data.courses.full}</span>
            <span className="badge badge-neutral">ยกเลิก {data.courses.closed}</span>
          </span>
        </div>
        <div className="card trd__kpi">
          <span className="trd__kpi-k">ข้อเสนอแก้ไขท่า</span>
          <span className="trd__kpi-v trd__kpi-v--sm">
            <span className="badge badge-warning">รอ {data.suggestions.pending}</span>
            <span className="badge badge-success">อนุมัติ {data.suggestions.approved}</span>
            <span className="badge badge-error">ปฏิเสธ {data.suggestions.rejected}</span>
          </span>
        </div>
      </div>

      <section className="card trd__panel">
        <div className="trd__panel-head">
          <h2>คอร์สถัดไป</h2>
          <Link to="/trainer/activities" className="trd__link">จัดการทั้งหมด <i className="ri-arrow-right-line"></i></Link>
        </div>
        {data.upcoming_courses.length === 0 ? (
          <div className="trd__empty">
            <i className="ri-calendar-event-line"></i>
            <span>ยังไม่มีคอร์สที่กำลังจะถึง</span>
            <Link to="/trainer/activities" className="btn btn--primary btn--sm">สร้างคอร์สแรก</Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr><th>คอร์ส</th><th>วันเวลา</th><th>ผู้สมัคร</th><th>สถานะ</th></tr>
              </thead>
              <tbody>
                {data.upcoming_courses.map((c) => {
                  const pct = c.max_participants ? Math.min(100, Math.round((c.registrations / c.max_participants) * 100)) : 0;
                  return (
                    <tr key={c.id}>
                      <td className="trd__title">{c.title}</td>
                      <td className="trd__muted">{c.start_datetime ? new Date(c.start_datetime).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}</td>
                      <td>
                        <div className="trd__seats">
                          <span><b>{c.registrations}</b>/{c.max_participants}</span>
                          <div className="trd__bar"><div style={{ width: `${pct}%` }} /></div>
                        </div>
                      </td>
                      <td><span className={`badge ${STATUS_BADGE[c.status] ?? 'badge-neutral'}`}>{STATUS_LABEL[c.status] ?? c.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default TrainerDashboard;
