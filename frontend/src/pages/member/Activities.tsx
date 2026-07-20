/**
 * Activities.tsx — Member ดูและลงทะเบียนคลาส
 * Phase 10: เชื่อม GET /api/activities และ POST /api/activities/:id/register
 */

import { useEffect, useState } from 'react';
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
      setActivities(data);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'ไม่สามารถโหลดรายการคลาส', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(activityId: string) {
    setRegistering(activityId);
    try {
      await activityService.registerActivity(activityId);
      showToast('ลงทะเบียนสำเร็จ', 'success');
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
            const isFull = activity.current_participants >= activity.max_participants;
            const available = activity.max_participants - activity.current_participants;

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
                    <span>{new Date(activity.start_datetime).toLocaleString('th-TH')}</span>
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

                {isFull ? (
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
                      {registering === activity.id ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
                    </button>
                  </>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '2rem' }}>
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
