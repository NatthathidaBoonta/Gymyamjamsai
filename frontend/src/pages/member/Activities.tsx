/**
 * Activities.tsx — Member ดูและลงทะเบียนคลาส
 * Phase 10: เชื่อม GET /api/activities และ POST /api/activities/:id/register
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../../components/Toast';
import { ApiError } from '../../services/api';
import * as activityService from '../../services/activity.service';
import './Activities.css';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

function Activities() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<activityService.Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

  useEffect(() => {
    loadActivities();
  }, []);

  async function loadActivities() {
    setLoading(true);
    try {
      const data = await activityService.listActivities();
      // member เห็นเฉพาะคลาสที่ยังไม่ถูกยกเลิก
      setActivities(data.filter((a) => a.status !== 'closed'));
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'ไม่สามารถโหลดรายการคลาส', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleUnregister(activityId: string) {
    if (!confirm('ต้องการยกเลิกการลงทะเบียนคลาสนี้หรือไม่?')) return;
    setRegistering(activityId);
    try {
      await activityService.unregisterActivity(activityId);
      showToast('ยกเลิกการลงทะเบียนแล้ว', 'success');
      await loadActivities();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'ยกเลิกไม่สำเร็จ', 'error');
    } finally {
      setRegistering(null);
    }
  }

  async function handleRegister(activityId: string) {
    setRegistering(activityId);
    try {
      await activityService.registerActivity(activityId);
      showToast('ส่งคำขอแล้ว — รอผู้ฝึกสอนอนุมัติ', 'success');
      await loadActivities();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'ลงทะเบียนไม่สำเร็จ', 'error');
    } finally {
      setRegistering(null);
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ show: true, message, type });
  }

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>กำลังโหลด...</div>;
  }

  return (
    <div className="activities">
      <h1>กระดานกิจกรรม</h1>
      <p className="activities__subtitle">คลาสออกกำลังกายที่เปิดรับลงทะเบียน</p>

      {activities && activities.length > 0 ? (
        <div className="activities__grid">
          {activities.map((activity) => {
            const isFull = activity.status === 'full' || activity.available_seats <= 0;
            const available = activity.available_seats;

            return (
              <article key={activity.id} className={`activities__card ${isFull ? 'activities__card--full' : ''}`}>
                <div className="activities__card-header">
                  <h2 className="activities__title">{activity.title}</h2>
                  <span className="activities__trainer">{activity.trainer_name || 'ผู้สอน'}</span>
                </div>

                <p className="activities__description">{activity.description || '-'}</p>

                <div className="activities__meta">
                  <div className="activities__meta-item">
                    <span className="activities__meta-label">เวลา:</span>
                    <span>{activity.start_datetime ? new Date(activity.start_datetime).toLocaleString('th-TH') : '-'}</span>
                  </div>

                  <div className="activities__meta-item">
                    <span className="activities__meta-label">ที่นั่ง:</span>
                    <span>
                      {activity.current_participants}/{activity.max_participants}
                    </span>
                  </div>
                </div>

                <div className="activities__progress">
                  <div
                    className="activities__progress-bar"
                    style={{ width: `${(activity.current_participants / activity.max_participants) * 100}%` }}
                  />
                </div>

                {activity.is_registered ? (
                  <>
                    <p className="activities__registered">
                      {activity.registration_status === 'pending' ? (
                        <><i className="ri-time-line"></i> ส่งคำขอแล้ว — รอผู้ฝึกสอนอนุมัติ</>
                      ) : (
                        <><i className="ri-checkbox-circle-fill"></i> คุณอยู่ในคอร์สนี้แล้ว</>
                      )}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button
                        type="button"
                        className="btn btn--ghost activities__btn"
                        style={{ flex: 1 }}
                        onClick={() => handleUnregister(activity.id)}
                        disabled={registering === activity.id}
                      >
                        {registering === activity.id ? 'กำลังยกเลิก...' : 'ยกเลิก'}
                      </button>
                      
                      <button
                        type="button"
                        className="btn btn--primary activities__btn"
                        style={{ flex: 1 }}
                        onClick={() => navigate(`/activities/${activity.id}/chat`)}
                        disabled={activity.registration_status !== 'approved'}
                        title={activity.registration_status !== 'approved' ? 'เข้าห้องแชทได้เมื่อผู้ฝึกสอนอนุมัติ' : undefined}
                      >
                        <i className="ri-chat-3-line"></i> ห้องแชท
                      </button>
                    </div>
                  </>
                ) : isFull ? (
                  <p className="activities__full-text">เต็มแล้ว</p>
                ) : (
                  <>
                    <p className="activities__available">เหลือ {available} ที่นั่ง</p>
                    <button
                      type="button"
                      className="btn btn--primary activities__btn"
                      onClick={() => handleRegister(activity.id)}
                      disabled={registering === activity.id}
                    >
                      {registering === activity.id ? 'กำลังส่งคำขอ...' : 'ขอเข้าร่วม'}
                    </button>
                  </>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: 'var(--text-2)', marginTop: '2rem' }}>
          ไม่มีคลาสในขณะนี้
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

export default Activities;
