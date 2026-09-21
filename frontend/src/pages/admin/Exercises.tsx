/**
 * Exercises.tsx — Admin จัดการคลังท่า
 * ค้นหา/กรอง · ตารางพร้อมภาพย่อ · เพิ่ม/แก้ไขในแผงด้านข้าง (ฟิลด์ครบ) · ดูรายละเอียดเต็ม · ลบ
 */

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import Toast from '../../components/Toast';
import ExerciseDetailDialog from '../../components/ExerciseDetailDialog';
import { ApiError } from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';
import * as es from '../../services/exercise.service';
import './Exercises.css';

interface ToastState { show: boolean; message: string; type: 'success' | 'error' }

type FormState = {
  id?: string;
  name: string;
  category: string;
  muscle_group: string;
  equipment: string;
  difficulty: es.ExerciseDifficulty;
  media_url: string;
  instructions: string;
  tips: string;
};

const EMPTY: FormState = { name: '', category: 'strength', muscle_group: '', equipment: '', difficulty: 'beginner', media_url: '', instructions: '', tips: '' };
const CATEGORIES = ['strength', 'cardio', 'flexibility'];
const DIFFS: es.ExerciseDifficulty[] = ['beginner', 'intermediate', 'advanced'];

function Exercises() {
  const [items, setItems] = useState<es.Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState<es.ExerciseDifficulty | ''>('');
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [viewing, setViewing] = useState<es.Exercise | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

  const showToast = useCallback((message: string, type: 'success' | 'error') => setToast({ show: true, message, type }), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await es.searchExercises({ q, category, difficulty, limit: 100 });
      setItems(r.items);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'โหลดคลังท่าไม่สำเร็จ', 'error');
    } finally {
      setLoading(false);
    }
  }, [q, category, difficulty, showToast]);

  useEffect(() => {
    const t = setTimeout(load, q ? 250 : 0); // debounce ตอนพิมพ์ค้นหา
    return () => clearTimeout(t);
  }, [load, q]);

  const stats = useMemo(() => {
    const byDiff = { beginner: 0, intermediate: 0, advanced: 0 };
    let noMedia = 0;
    let incomplete = 0;
    for (const e of items) {
      byDiff[e.difficulty] += 1;
      if (!e.media_url) noMedia += 1;
      if (!e.instructions || !e.tips || !e.muscle_group) incomplete += 1;
    }
    return { byDiff, noMedia, incomplete };
  }, [items]);

  function openEdit(e: es.Exercise) {
    setForm({
      id: e.id, name: e.name, category: e.category ?? 'strength', muscle_group: e.muscle_group ?? '',
      equipment: e.equipment ?? '', difficulty: e.difficulty ?? 'beginner', media_url: e.media_url ?? '',
      instructions: e.instructions ?? '', tips: e.tips ?? '',
    });
  }

  async function handleSave(ev: FormEvent) {
    ev.preventDefault();
    if (!form) return;
    setSaving(true);
    const payload: es.ExerciseInput = {
      name: form.name.trim(), category: form.category || null, muscle_group: form.muscle_group.trim() || null,
      equipment: form.equipment.trim() || null, difficulty: form.difficulty, media_url: form.media_url.trim() || null,
      instructions: form.instructions.trim() || null, tips: form.tips.trim() || null,
    };
    try {
      if (form.id) {
        await es.updateExercise(form.id, payload);
        showToast('บันทึกการแก้ไขแล้ว', 'success');
      } else {
        await es.createExercise(payload);
        showToast('เพิ่มท่าใหม่แล้ว', 'success');
      }
      setForm(null);
      await load();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'บันทึกไม่สำเร็จ', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(e: es.Exercise) {
    if (!confirm(`ลบ "${e.name}" ออกจากคลัง?\nท่านี้จะหายจากตารางฝึกของสมาชิกที่ใช้อยู่ด้วย`)) return;
    setDeleting(e.id);
    try {
      await es.deleteExercise(e.id);
      showToast('ลบท่าแล้ว', 'success');
      await load();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'ลบไม่สำเร็จ', 'error');
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="exm">
      <div className="page-head">
        <div>
          <span className="eyebrow">คลังท่า</span>
          <h1>จัดการท่าออกกำลังกาย</h1>
          <p>{items.length} ท่า · {stats.incomplete > 0 ? `${stats.incomplete} ท่ายังขาดข้อมูล (กล้ามเนื้อ/ขั้นตอน/เคล็ดลับ)` : 'ข้อมูลครบทุกท่า'}{stats.noMedia > 0 ? ` · ${stats.noMedia} ท่าไม่มีสื่อ` : ''}</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={() => setForm({ ...EMPTY })}>
          <i className="ri-add-line"></i> เพิ่มท่าใหม่
        </button>
      </div>

      {/* ---------- Toolbar ---------- */}
      <div className="exm__toolbar card card--flat">
        <label className="exm__search">
          <i className="ri-search-line"></i>
          <input type="search" placeholder="ค้นหาชื่อท่า กล้ามเนื้อ หรืออุปกรณ์…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <div className="exm__filters">
          <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="หมวด">
            <option value="">ทุกหมวด</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{es.CATEGORY_LABEL[c] ?? c}</option>)}
          </select>
          <div className="exm__seg" role="group" aria-label="ระดับ">
            <button type="button" className={difficulty === '' ? 'on' : ''} onClick={() => setDifficulty('')}>ทั้งหมด</button>
            {DIFFS.map((d) => (
              <button key={d} type="button" className={difficulty === d ? 'on' : ''} onClick={() => setDifficulty(d)}>
                {es.DIFFICULTY_LABEL[d]} <small>{stats.byDiff[d]}</small>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- Table ---------- */}
      <div className="card card--flat exm__tablewrap">
        {loading ? (
          <div className="exm__state">กำลังโหลด...</div>
        ) : items.length === 0 ? (
          <div className="exm__state">ไม่พบท่าที่ตรงกับเงื่อนไข</div>
        ) : (
          <div className="table-responsive">
            <table className="table exm__table">
              <thead>
                <tr>
                  <th style={{ width: 72 }}></th>
                  <th>ท่า</th>
                  <th>กล้ามเนื้อหลัก</th>
                  <th>อุปกรณ์</th>
                  <th>ระดับ</th>
                  <th>ความครบถ้วน</th>
                  <th style={{ textAlign: 'right' }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {items.map((e) => {
                  const missing = [!e.muscle_group && 'กล้ามเนื้อ', !e.instructions && 'ขั้นตอน', !e.tips && 'เคล็ดลับ', !e.media_url && 'สื่อ'].filter(Boolean) as string[];
                  return (
                    <tr key={e.id}>
                      <td>
                        <button type="button" className="exm__thumb" onClick={() => setViewing(e)} aria-label={`ดู ${e.name}`}>
                          {e.media_url ? <img src={getImageUrl(e.media_url)} alt="" loading="lazy" /> : <i className="ri-image-line"></i>}
                        </button>
                      </td>
                      <td>
                        <button type="button" className="exm__name" onClick={() => setViewing(e)}>{e.name}</button>
                        <div className="exm__sub">{e.category ? es.CATEGORY_LABEL[e.category] ?? e.category : '—'}</div>
                      </td>
                      <td className="exm__muted">{e.muscle_group || '—'}</td>
                      <td className="exm__muted">{e.equipment || '—'}</td>
                      <td><span className={`badge exm__lvl--${e.difficulty}`}>{es.DIFFICULTY_LABEL[e.difficulty]}</span></td>
                      <td>
                        {missing.length === 0
                          ? <span className="badge badge-success">ครบ</span>
                          : <span className="badge badge-warning" title={`ขาด: ${missing.join(', ')}`}>ขาด {missing.length}</span>}
                      </td>
                      <td>
                        <div className="exm__actions">
                          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setViewing(e)} title="ดูรายละเอียด"><i className="ri-eye-line"></i></button>
                          <button type="button" className="btn btn--secondary btn--sm" onClick={() => openEdit(e)}><i className="ri-edit-line"></i> แก้ไข</button>
                          <button type="button" className="btn btn--danger btn--sm" onClick={() => handleDelete(e)} disabled={deleting === e.id} title="ลบ"><i className="ri-delete-bin-line"></i></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---------- Editor drawer ---------- */}
      {form && (
        <div className="exm__drawer-backdrop" onClick={() => !saving && setForm(null)}>
          <form className="exm__drawer" onClick={(e) => e.stopPropagation()} onSubmit={handleSave}>
            <div className="exm__drawer-head">
              <div>
                <span className="eyebrow">{form.id ? 'แก้ไขท่า' : 'ท่าใหม่'}</span>
                <h2>{form.id ? form.name || 'แก้ไขท่า' : 'เพิ่มท่าออกกำลังกาย'}</h2>
              </div>
              <button type="button" className="exm__drawer-close" onClick={() => setForm(null)} aria-label="ปิด"><i className="ri-close-line"></i></button>
            </div>

            <div className="exm__drawer-body">
              <div className="exm__preview">
                {form.media_url ? <img src={getImageUrl(form.media_url)} alt="" /> : <span><i className="ri-image-add-line"></i> ใส่ path สื่อด้านล่างเพื่อดูตัวอย่าง</span>}
              </div>

              <div className="exm__row2">
                <label className="exm__field exm__field--full">
                  <span>ชื่อท่า *</span>
                  <input className="input" required maxLength={255} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </label>
                <label className="exm__field">
                  <span>หมวด</span>
                  <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{es.CATEGORY_LABEL[c] ?? c}</option>)}
                  </select>
                </label>
                <label className="exm__field">
                  <span>ระดับ</span>
                  <select className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as es.ExerciseDifficulty })}>
                    {DIFFS.map((d) => <option key={d} value={d}>{es.DIFFICULTY_LABEL[d]}</option>)}
                  </select>
                </label>
                <label className="exm__field">
                  <span>กล้ามเนื้อหลัก</span>
                  <input className="input" maxLength={100} placeholder="เช่น อก, ไหล่หน้า, หลังแขน" value={form.muscle_group} onChange={(e) => setForm({ ...form, muscle_group: e.target.value })} />
                </label>
                <label className="exm__field">
                  <span>อุปกรณ์</span>
                  <input className="input" maxLength={100} placeholder="เช่น ดัมเบล + ม้านั่ง" value={form.equipment} onChange={(e) => setForm({ ...form, equipment: e.target.value })} />
                </label>
                <label className="exm__field exm__field--full">
                  <span>สื่อ (path ใน /exercises หรือ URL)</span>
                  <input className="input" maxLength={500} placeholder="/exercises/Strength/Squats.gif" value={form.media_url} onChange={(e) => setForm({ ...form, media_url: e.target.value })} />
                </label>
                <label className="exm__field exm__field--full">
                  <span>ขั้นตอน — 1 ขั้นต่อบรรทัด</span>
                  <textarea className="input" rows={5} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} placeholder={'ยืนเท้ากว้างเท่าไหล่\nย่อตัวลงจนต้นขาขนานพื้น\nดันขึ้นกลับสู่ท่ายืน'} />
                </label>
                <label className="exm__field exm__field--full">
                  <span>ข้อควรระวัง / เคล็ดลับ — คั่นด้วย · หรือขึ้นบรรทัดใหม่</span>
                  <textarea className="input" rows={3} value={form.tips} onChange={(e) => setForm({ ...form, tips: e.target.value })} placeholder="หลังตรงตลอด · เข่าไปทางเดียวกับปลายเท้า" />
                </label>
              </div>
            </div>

            <div className="exm__drawer-foot">
              <button type="button" className="btn btn--ghost" onClick={() => setForm(null)} disabled={saving}>ยกเลิก</button>
              <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'กำลังบันทึก...' : form.id ? 'บันทึกการแก้ไข' : 'เพิ่มท่า'}</button>
            </div>
          </form>
        </div>
      )}

      {viewing && (
        <ExerciseDetailDialog
          exercise={viewing}
          onClose={() => setViewing(null)}
          extra={
            <button type="button" className="btn btn--secondary" onClick={() => { const v = viewing; setViewing(null); openEdit(v); }}>
              <i className="ri-edit-line"></i> แก้ไขท่านี้
            </button>
          }
        />
      )}

      {toast.show && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast({ ...toast, show: false })} />}
    </div>
  );
}

export default Exercises;
