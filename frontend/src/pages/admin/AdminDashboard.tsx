/**
 * AdminDashboard.tsx — Admin ดูภาพรวมระบบทั้งหมด
 * Phase 11: เชื่อม GET /api/dashboard/admin + Export CSV
 */

import { useEffect, useState } from 'react';
import Toast from '../../components/Toast';
import { ApiError } from '../../services/api';
import * as dashboardService from '../../services/dashboard.service';
import './AdminDashboard.css';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

function AdminDashboard() {
  const [data, setData] = useState<dashboardService.DashboardAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      const adminData = await dashboardService.getAdminDashboard();
      setData(adminData);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'ไม่สามารถโหลดข้อมูล', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleExportCSV() {
    setExporting(true);
    try {
      const response = await fetch('http://localhost:5000/api/reports/activities/export', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('gym_token')}`,
        },
      });

      if (!response.ok) {
        throw new ApiError('ดาวน์โหลด CSV ไม่สำเร็จ', response.status);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activities-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast('ดาวน์โหลด CSV สำเร็จ', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'ดาวน์โหลดไม่สำเร็จ', 'error');
    } finally {
      setExporting(false);
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ show: true, message, type });
  }

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>กำลังโหลด...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__header">
        <h1>ภาพรวมระบบ</h1>
        <button type="button" className="btn btn--primary" onClick={handleExportCSV} disabled={exporting}>
          {exporting ? 'กำลังดาวน์โหลด...' : '📊 ส่งออก CSV'}
        </button>
      </div>

      <div className="admin-dashboard__cards">
        <div className="admin-dashboard__card">
          <p className="admin-dashboard__card-label">ผู้ใช้งานทั้งหมด</p>
          <p className="admin-dashboard__card-value">{data?.total_users ?? '-'}</p>
          <p className="admin-dashboard__card-sub">บัญชี</p>
        </div>

        <div className="admin-dashboard__card">
          <p className="admin-dashboard__card-label">กิจกรรมทั้งหมด</p>
          <p className="admin-dashboard__card-value">{data?.total_activities ?? '-'}</p>
          <p className="admin-dashboard__card-sub">คลาส</p>
        </div>

        <div className="admin-dashboard__card">
          <p className="admin-dashboard__card-label">การลงทะเบียน</p>
          <p className="admin-dashboard__card-value">{data?.total_registrations ?? '-'}</p>
          <p className="admin-dashboard__card-sub">ครั้ง</p>
        </div>

        <div className="admin-dashboard__card">
          <p className="admin-dashboard__card-label">อัตราเข้าร่วมเฉลี่ย</p>
          <p className="admin-dashboard__card-value">{data?.avg_attendance_rate.toFixed(1) ?? '-'}%</p>
          <p className="admin-dashboard__card-sub">ทั่วระบบ</p>
        </div>
      </div>

      <div className="admin-dashboard__info">
        <p>💡 ข้อมูลที่แสดงข้างต้นคือสรุปทั้งระบบ รายงาน CSV จะมีรายละเอียดของกิจกรรมแต่ละคลาส</p>
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

export default AdminDashboard;
