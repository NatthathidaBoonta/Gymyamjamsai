/**
 * src/pages/Profile.tsx
 *
 * Profile / Onboarding Page (Protected)
 * ใช้ทั้งตอนกรอกข้อมูลเริ่มต้นหลัง Register (Onboarding)
 * และตอนแก้ไขข้อมูลร่างกาย/เป้าหมายภายหลัง
 */

import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile, saveMyProfile, type FitnessLevel, type Gender } from '../services/profile';
import './Profile.css';

const GOAL_OPTIONS = ['ลดน้ำหนัก', 'เพิ่มกล้ามเนื้อ', 'เพิ่มความฟิต', 'สุขภาพทั่วไป'];

const FITNESS_LEVEL_OPTIONS: { value: FitnessLevel; label: string }[] = [
  { value: 'beginner', label: 'มือใหม่' },
  { value: 'intermediate', label: 'ปานกลาง' },
  { value: 'advanced', label: 'ชำนาญ' },
];

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'ชาย' },
  { value: 'female', label: 'หญิง' },
  { value: 'other', label: 'อื่นๆ' },
];

export default function Profile() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isNewProfile, setIsNewProfile] = useState(true);
  const [error, setError] = useState('');

  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [goal, setGoal] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel | ''>('');

  useEffect(() => {
    (async () => {
      try {
        const res = await getMyProfile();
        if (res.data) {
          setIsNewProfile(false);
          setWeightKg(String(res.data.weightKg ?? ''));
          setHeightCm(String(res.data.heightCm ?? ''));
          setAge(String(res.data.age ?? ''));
          setGender((res.data.gender as Gender) ?? '');
          setGoal(res.data.goal ?? '');
          setFitnessLevel((res.data.fitnessLevel as FitnessLevel) ?? '');
        }
      } catch {
        // ยังไม่มี profile หรือดึงข้อมูลไม่สำเร็จ — ให้กรอกใหม่ได้ตามปกติ
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!goal || !fitnessLevel || !gender) {
      setError('กรุณาเลือกเพศ เป้าหมาย และระดับความฟิต');
      return;
    }

    setIsSaving(true);
    try {
      await saveMyProfile({
        weightKg: Number(weightKg),
        heightCm: Number(heightCm),
        age: Number(age),
        gender,
        goal,
        fitnessLevel,
      });
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string; errors?: string[] } } };
      const msg =
        axiosError?.response?.data?.errors?.join(', ') ||
        axiosError?.response?.data?.message ||
        (err instanceof Error ? err.message : 'Something went wrong');
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <p className="profile-loading">⏳ กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <span className="profile-icon">📋</span>
          <h1>{isNewProfile ? 'ยินดีต้อนรับ! มาเริ่มกันเลย' : 'โปรไฟล์ของฉัน'}</h1>
          <p>
            {isNewProfile
              ? 'กรอกข้อมูลร่างกายและเป้าหมาย เพื่อให้เราออกแบบตารางออกกำลังกายที่เหมาะกับคุณ'
              : 'แก้ไขข้อมูลร่างกายและเป้าหมายของคุณ'}
          </p>
        </div>

        <form className="profile-form" onSubmit={handleSubmit} noValidate>
          <div className="profile-form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="weightKg">
                น้ำหนัก (กก.)
              </label>
              <input
                id="weightKg"
                type="number"
                min="1"
                step="0.1"
                className="form-input"
                placeholder="60"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="heightCm">
                ส่วนสูง (ซม.)
              </label>
              <input
                id="heightCm"
                type="number"
                min="1"
                step="0.1"
                className="form-input"
                placeholder="165"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="age">
                อายุ (ปี)
              </label>
              <input
                id="age"
                type="number"
                min="1"
                step="1"
                className="form-input"
                placeholder="25"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="gender">
              เพศ
            </label>
            <div className="profile-level-options">
              {GENDER_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  className={`profile-level-btn ${gender === opt.value ? 'active' : ''}`}
                  onClick={() => setGender(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="goal">
              เป้าหมาย
            </label>
            <select
              id="goal"
              className="form-input"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              required
            >
              <option value="" disabled>
                เลือกเป้าหมายของคุณ
              </option>
              {GOAL_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="fitnessLevel">
              ระดับความฟิตปัจจุบัน
            </label>
            <div className="profile-level-options">
              {FITNESS_LEVEL_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  className={`profile-level-btn ${fitnessLevel === opt.value ? 'active' : ''}`}
                  onClick={() => setFitnessLevel(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="profile-message error">⚠️ {error}</div>}

          <div className="profile-actions">
            {!isNewProfile && (
              <button
                type="button"
                className="profile-cancel-btn"
                onClick={() => navigate('/')}
                disabled={isSaving}
              >
                ยกเลิก
              </button>
            )}
            <button type="submit" className="profile-submit-btn" disabled={isSaving}>
              {isSaving ? '⏳ กำลังบันทึก...' : isNewProfile ? '✨ เริ่มต้นใช้งาน' : '💾 บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
