/**
 * Exercises.tsx — Admin จัดการท่าออกกำลังกาย (CRUD)
 * Phase 10: เชื่อม GET/POST/PUT/DELETE /api/exercises
 */

import { useEffect, useState, type FormEvent } from 'react';
import Toast from '../../components/Toast';
import { ApiError } from '../../services/api';
import * as exerciseService from '../../services/exercise.service';
import './Exercises.css';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

interface FormState {
  id?: string;
  name: string;
  category: string;
  description: string;
}

const CATEGORIES = ['ขา', 'แขน', 'อก', 'หลัง', 'ท้อง', 'ไหล่', 'อื่นๆ'];

function Exercises() {
  const [exercises, setExercises] = useState<exerciseService.Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

  const [form, setForm] = useState<FormState>({ name: '', category: '', description: '' });
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    loadExercises();
  }, []);

  async function loadExercises() {
    setLoading(true);
    try {
      const data = await exerciseService.listExercises();
      setExercises(data);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'ไม่สามารถโหลดท่า', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.category.trim()) {
      showToast('กรุณากรอกชื่อและหมวดหมู่ท่า', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode && form.id) {
        await exerciseService.updateExercise(form.id, {
          name: form.name,
          category: form.category,
          description: form.description,
        });
        showToast('แก้ไขท่าสำเร็จ', 'success');
      } else {
        await exerciseService.createExercise({
          name: form.name,
          category: form.category,
          description: form.description,
        });
        showToast('เพิ่มท่าใหม่สำเร็จ', 'success');
      }
      setForm({ name: '', category: '', description: '' });
      setIsEditMode(false);
      await loadExercises();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'ไม่สำเร็จ', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(exercise: exerciseService.Exercise) {
    setForm({
      id: exercise.id,
      name: exercise.name,
      category: exercise.category,
      description: exercise.description ?? '',
    });
    setIsEditMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id: string) {
    if (!confirm('ต้องการลบท่านี้หรือไม่?')) return;
    setDeleting(id);
    try {
      await exerciseService.deleteExercise(id);
      showToast('ลบท่าสำเร็จ', 'success');
      await loadExercises();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'ลบไม่สำเร็จ', 'error');
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
    <div className="exercises">
      <h1>คลังท่าออกกำลังกาย</h1>

      <section className="exercises__form-section">
        <h2>{isEditMode ? 'แก้ไขท่า' : 'เพิ่มท่าใหม่'}</h2>
        <form onSubmit={handleSubmit} className="exercises__form">
          <div className="exercises__field">
            <label className="exercises__label" htmlFor="name">
              ชื่อท่า
            </label>
            <input
              id="name"
              className="exercises__input"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="เช่น Barbell Bench Press"
              required
            />
          </div>

          <div className="exercises__field">
            <label className="exercises__label" htmlFor="category">
              หมวดหมู่
            </label>
            <select
              id="category"
              className="exercises__input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            >
              <option value="">-- เลือกหมวดหมู่ --</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="exercises__field">
            <label className="exercises__label" htmlFor="desc">
              คำอธิบาย (ไม่บังคับ)
            </label>
            <textarea
              id="desc"
              className="exercises__input exercises__textarea"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="เช่น วิธีทำ ข้อควรระวัง ฯลฯ"
              rows={3}
            />
          </div>

          <div className="exercises__form-actions">
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'กำลังบันทึก...' : isEditMode ? 'บันทึกแก้ไข' : 'เพิ่มท่า'}
            </button>
            {isEditMode && (
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => {
                  setForm({ name: '', category: '', description: '' });
                  setIsEditMode(false);
                }}
              >
                ยกเลิก
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="exercises__list-section">
        <h2>รายการท่าทั้งหมด ({exercises.length})</h2>
        {exercises.length > 0 ? (
          <table className="exercises__table">
            <thead>
              <tr>
                <th>ชื่อท่า</th>
                <th>หมวดหมู่</th>
                <th>คำอธิบาย</th>
                <th style={{ textAlign: 'center' }}>ดำเนิน การ</th>
              </tr>
            </thead>
            <tbody>
              {exercises.map((ex) => (
                <tr key={ex.id}>
                  <td className="exercises__name">{ex.name}</td>
                  <td>{ex.category}</td>
                  <td className="exercises__desc">{ex.description || '-'}</td>
                  <td className="exercises__actions">
                    <button
                      className="exercises__btn exercises__btn--edit"
                      onClick={() => handleEdit(ex)}
                      title="แก้ไข"
                    >
                      ✏️
                    </button>
                    <button
                      className="exercises__btn exercises__btn--delete"
                      onClick={() => handleDelete(ex.id)}
                      disabled={deleting === ex.id}
                      title="ลบ"
                    >
                      {deleting === ex.id ? '...' : '🗑️'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>ยังไม่มีท่า</p>
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

export default Exercises;
