/**
 * TrainerActivities.tsx — Trainer จัดการกิจกรรม (CRUD)
 * Phase 10: เชื่อม GET/POST/PUT/DELETE /api/activities (trainer scope)
 */

import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Toast from '../../components/Toast';
import { ApiError } from '../../services/api';
import * as activityService from '../../services/activity.service';
import './TrainerActivities.css';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

interface FormState {
  id?: string;
  title: string;
  start_datetime: string;
  max_participants: string;
  description: string;
}

function TrainerActivities() {
  const [activities, setActivities] = useState<activityService.Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

  const [form, setForm] = useState<FormState>({
    title: '',
    start_datetime: '',
    max_participants: '30',
    description: '',
  });
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    loadActivities();
  }, []);

  async function loadActivities() {
    setLoading(true);
    try {
      const data = await activityService.listActivities();
      // ตัวกรอง: แสดงเฉพาะกิจกรรมของตัวเอง (Phase 6 backend จะ filter trainer_id)
      setActivities(data);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'ไม่สามารถโหลดกิจกรรม', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.start_datetime) {
      showToast('กรุณากรอกชื่อและวันเวลาคลาส', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        start_datetime: form.start_datetime,
        max_participants: parseInt(form.max_participants, 10),
        description: form.description,
      };

      if (isEditMode && form.id) {
        // PUT: ใช้ apiFetch โดยตรง (ยังไม่มี updateActivity service)
        const resp = await fetch(`http://localhost:5000/api/activities/${form.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('gym_token')}`,
          },
          body: JSON.stringify(payload),
        });
        if (!resp.ok) throw new ApiError('แก้ไขไม่สำเร็จ', resp.status);
        showToast('แก้ไขกิจกรรมสำเร็จ', 'success');
      } else {
        // POST: ใช้ apiFetch (จริงๆ ยังไม่มี createActivity เขียนไว้)
        const resp = await fetch('http://localhost:5000/api/activities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('gym_token')}`,
          },
          body: JSON.stringify(payload),
        });
        if (!resp.ok) throw new ApiError('สร้างไม่สำเร็จ', resp.status);
        showToast('สร้างกิจกรรมใหม่สำเร็จ', 'success');
      }

      setForm({ title: '', start_datetime: '', max_participants: '30', description: '' });
      setIsEditMode(false);
      await loadActivities();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'ไม่สำเร็จ', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(activity: activityService.Activity) {
    setForm({
      id: activity.id,
      title: activity.title,
      start_datetime: activity.start_datetime,
      max_participants: activity.max_participants.toString(),
      description: activity.description ?? '',
    });
    setIsEditMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id: string) {
    if (!confirm('ต้องการยกเลิกกิจกรรมนี้หรือไม่?')) return;
    setDeleting(id);
    try {
      // DELETE
      const resp = await fetch(`http://localhost:5000/api/activities/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('gym_token')}`,
        },
      });
      if (!resp.ok) throw new ApiError('ยกเลิกไม่สำเร็จ', resp.status);
      showToast('ยกเลิกกิจกรรมสำเร็จ', 'success');
      await loadActivities();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'ยกเลิกไม่สำเร็จ', 'error');
    } finally {
      setDeleting(null);
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ show: true, message, type });
  }

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>กำลังโหลด...</div>;
  }

  return (
    <div className="trainer-activities">
      <h1>จัดการกิจกรรม</h1>

      <section className="trainer-activities__form-section">
        <h2>{isEditMode ? 'แก้ไขกิจกรรม' : 'สร้างกิจกรรมใหม่'}</h2>
        <form onSubmit={handleSubmit} className="trainer-activities__form">
          <div className="trainer-activities__field">
            <label className="trainer-activities__label" htmlFor="title">
              ชื่อคลาส
            </label>
            <input
              id="title"
              className="trainer-activities__input"
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="เช่น คลาสคาร์ดิโอเช้า"
              required
            />
          </div>

          <div className="trainer-activities__field">
            <label className="trainer-activities__label" htmlFor="datetime">
              วันเวลา
            </label>
            <input
              id="datetime"
              className="trainer-activities__input"
              type="datetime-local"
              value={form.start_datetime}
              onChange={(e) => setForm({ ...form, start_datetime: e.target.value })}
              required
            />
          </div>

          <div className="trainer-activities__field">
            <label className="trainer-activities__label" htmlFor="seats">
              จำนวนที่นั่ง
            </label>
            <input
              id="seats"
              className="trainer-activities__input"
              type="number"
              min="1"
              value={form.max_participants}
              onChange={(e) => setForm({ ...form, max_participants: e.target.value })}
              required
            />
          </div>

          <div className="trainer-activities__field">
            <label className="trainer-activities__label" htmlFor="desc">
              คำอธิบาย (ไม่บังคับ)
            </label>
            <textarea
              id="desc"
              className="trainer-activities__input trainer-activities__textarea"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="เช่น ระดับความยาก ข้อกำหนด ฯลฯ"
              rows={3}
            />
          </div>

          <div className="trainer-activities__form-actions">
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'กำลังบันทึก...' : isEditMode ? 'บันทึกแก้ไข' : 'สร้างกิจกรรม'}
            </button>
            {isEditMode && (
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => {
                  setForm({ title: '', start_datetime: '', max_participants: '30', description: '' });
                  setIsEditMode(false);
                }}
              >
                ยกเลิก
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="trainer-activities__list-section">
        <h2>กิจกรรมของฉัน ({activities.length})</h2>
        {activities.length > 0 ? (
          <table className="trainer-activities__table">
            <thead>
              <tr>
                <th>ชื่อคลาส</th>
                <th>วันเวลา</th>
                <th>ที่นั่ง</th>
                <th style={{ textAlign: 'center' }}>ดำเนิน การ</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id}>
                  <td className="trainer-activities__title">{activity.title}</td>
                  <td>
                    {new Date(activity.start_datetime).toLocaleString('th-TH', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td>
                    {activity.current_participants}/{activity.max_participants}
                  </td>
                  <td className="trainer-activities__actions">
                    <Link to={`/trainer/activities/${activity.id}/attendance`} className="trainer-activities__btn trainer-activities__btn--link">
                      ✓ เช็คชื่อ
                    </Link>
                    <button
                      className="trainer-activities__btn trainer-activities__btn--edit"
                      onClick={() => handleEdit(activity)}
                      title="แก้ไข"
                    >
                      ✏️
                    </button>
                    <button
                      className="trainer-activities__btn trainer-activities__btn--delete"
                      onClick={() => handleDelete(activity.id)}
                      disabled={deleting === activity.id}
                      title="ยกเลิก"
                    >
                      {deleting === activity.id ? '...' : '🗑️'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>ยังไม่มีกิจกรรม</p>
        )}
      </section>

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

export default TrainerActivities;
