/**
 * Attendance.tsx — Trainer เช็คชื่อผู้เข้าร่วมคลาส
 * Phase 10: เชื่อม GET /api/activities/:id/participants และ PATCH /api/activities/:id/attendance
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Toast from '../../components/Toast';
import { ApiError } from '../../services/api';
import * as activityService from '../../services/activity.service';
import './Attendance.css';

interface Participant {
  user_id: string;
  name: string;
  attended: boolean;
}

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

function Attendance() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

  useEffect(() => {
    if (id) loadParticipants();
  }, [id]);

  async function loadParticipants() {
    if (!id) return;
    setLoading(true);
    try {
      const data = await activityService.getActivityParticipants(id);
      setParticipants(data);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'ไม่สามารถโหลดรายชื่อ', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleAttendance(userId: string, currentStatus: boolean) {
    if (!id) return;
    setSaving(userId);
    try {
      await activityService.markAttendance(id, userId, !currentStatus);
      setParticipants((prev) =>
        prev.map((p) => (p.user_id === userId ? { ...p, attended: !currentStatus } : p)),
      );
      showToast(!currentStatus ? 'บันทึกการเข้าร่วม' : 'ยกเลิกการเข้าร่วม', 'success');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'ไม่สำเร็จ', 'error');
    } finally {
      setSaving(null);
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ show: true, message, type });
  }

  const attendedCount = participants.filter((p) => p.attended).length;
  const totalCount = participants.length;

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>กำลังโหลด...</div>;
  }

  return (
    <div className="attendance">
      <div className="attendance__header">
        <button type="button" className="btn btn--ghost" onClick={() => navigate(-1)}>
          ← กลับ
        </button>
        <h1>เช็คชื่อผู้เข้าร่วม</h1>
      </div>

      <div className="attendance__summary">
        <p>
          <strong>รวม:</strong> {totalCount} คน
        </p>
        <p>
          <strong>เข้าร่วมแล้ว:</strong> {attendedCount} คน
        </p>
        {totalCount > 0 && (
          <p>
            <strong>ร้อยละ:</strong> {Math.round((attendedCount / totalCount) * 100)}%
          </p>
        )}
      </div>

      {participants.length > 0 ? (
        <table className="attendance__table">
          <thead>
            <tr>
              <th style={{ textAlign: 'center' }}>เข้าร่วม</th>
              <th>ชื่อผู้เข้าร่วม</th>
              <th style={{ textAlign: 'center' }}>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((participant) => (
              <tr key={participant.user_id} className={participant.attended ? 'attendance__row--checked' : ''}>
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={participant.attended}
                    onChange={() => handleToggleAttendance(participant.user_id, participant.attended)}
                    disabled={saving === participant.user_id}
                    className="attendance__checkbox"
                  />
                </td>
                <td className="attendance__name">{participant.name}</td>
                <td style={{ textAlign: 'center' }}>
                  {saving === participant.user_id ? (
                    <span className="attendance__loading">กำลังบันทึก...</span>
                  ) : participant.attended ? (
                    <span className="attendance__badge attendance__badge--attended">✓ เข้าร่วม</span>
                  ) : (
                    <span className="attendance__badge attendance__badge--absent">- ขาด</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '2rem' }}>
          ยังไม่มีผู้ลงทะเบียน
        </p>
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

export default Attendance;
