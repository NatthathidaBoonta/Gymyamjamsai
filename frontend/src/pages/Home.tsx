/**
 * src/pages/Home.tsx
 *
 * Home Page (Protected) — แดชบอร์ดหลักหลัง Login
 * แสดงสรุปเป้าหมาย/ร่างกาย, ท่าแนะนำสำหรับวันนี้, และสถานะฟีเจอร์ที่กำลังจะมา
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Status from '../components/status/Status';
import { getCurrentUser } from '../services/auth';
import { getMyProfile, type Profile as ProfileData } from '../services/profile';
import { listExercises, type Exercise } from '../services/exercise';
import './Home.css';

const FITNESS_LEVEL_LABEL: Record<string, string> = {
  beginner: 'มือใหม่',
  intermediate: 'ปานกลาง',
  advanced: 'ชำนาญ',
};

const CATEGORY_ICON: Record<string, string> = {
  calisthenics: '🤸',
  cardio: '🏃',
  weight: '🏋️',
};

/**
 * กลุ่มกล้ามเนื้อที่ให้น้ำหนักความสำคัญเพิ่มขึ้นเล็กน้อยตามเพศ (เป็นเพียงลำดับความสำคัญ
 * ไม่ใช่การจำกัดสิทธิ์ — ผู้ใช้ทุกเพศเห็นท่าออกกำลังกายครบทุกท่าเหมือนกันในคลังท่า)
 * ใช้ประกอบกับระดับความฟิตและเป้าหมายเพื่อเรียงลำดับท่าแนะนำในแดชบอร์ดเท่านั้น
 */
const GENDER_MUSCLE_PRIORITY: Record<string, string[]> = {
  male: ['อก', 'หลัง', 'ไหล่', 'ไบเซ็ป', 'ไตรเซ็ป'],
  female: ['สะโพก', 'ขา', 'แกนกลางลำตัว'],
  other: [],
};

/** จัดเรียงท่าออกกำลังกายโดยให้ท่าที่ตรงกับกลุ่มกล้ามเนื้อที่ให้น้ำหนักตามเพศขึ้นก่อน */
const sortByGenderPriority = (exercises: Exercise[], gender: string | null): Exercise[] => {
  const priority = (gender && GENDER_MUSCLE_PRIORITY[gender]) || [];
  if (priority.length === 0) return exercises;
  return [...exercises].sort((a, b) => {
    const aScore = a.targetMuscle && priority.includes(a.targetMuscle) ? 0 : 1;
    const bScore = b.targetMuscle && priority.includes(b.targetMuscle) ? 0 : 1;
    return aScore - bScore;
  });
};

/** คำนวณ BMI และระดับตามเกณฑ์ที่ใช้ทั่วไปในไทย */
const getBmiInfo = (weightKg: number, heightCm: number) => {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  let label = 'ปกติ';
  if (bmi < 18.5) label = 'น้ำหนักน้อย';
  else if (bmi < 23) label = 'ปกติ';
  else if (bmi < 25) label = 'ท้วม';
  else if (bmi < 30) label = 'อ้วน';
  else label = 'อ้วนมาก';
  return { value: bmi.toFixed(1), label };
};

export default function Home() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [recommended, setRecommended] = useState<Exercise[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getMyProfile();
        if (!res.data) {
          navigate('/profile', { replace: true });
          return;
        }
        setProfile(res.data);
      } finally {
        setCheckingProfile(false);
      }
    })();
  }, [navigate]);

  useEffect(() => {
    if (!profile?.fitnessLevel) return;
    listExercises({ difficulty: profile.fitnessLevel })
      .then((res) => setRecommended(sortByGenderPriority(res.data, profile.gender).slice(0, 3)))
      .catch(() => setRecommended([]));
  }, [profile?.fitnessLevel, profile?.gender]);

  if (checkingProfile) {
    return null;
  }

  const bmi = profile?.weightKg && profile?.heightCm ? getBmiInfo(profile.weightKg, profile.heightCm) : null;

  return (
    <div className="home-page">
      <Navbar />

      <main className="home-main">
        <div className="home-greeting">
          <h1>สวัสดี{user?.name ? ` ${user.name}` : ''}! 👋</h1>
          <p>มาดูภาพรวมการออกกำลังกายของคุณวันนี้กัน</p>
        </div>

        {profile && (
          <>
            <h2 className="home-section-title">🎯 เป้าหมายของคุณ</h2>
            <div className="home-profile-summary">
              <div className="home-profile-item">
                <span className="home-profile-item-label">เป้าหมาย</span>
                <span className="home-profile-item-value">{profile.goal}</span>
              </div>
              <div className="home-profile-item">
                <span className="home-profile-item-label">ระดับความฟิต</span>
                <span className="home-profile-item-value">
                  {profile.fitnessLevel ? FITNESS_LEVEL_LABEL[profile.fitnessLevel] : '-'}
                </span>
              </div>
              <div className="home-profile-item">
                <span className="home-profile-item-label">น้ำหนัก / ส่วนสูง</span>
                <span className="home-profile-item-value">
                  {profile.weightKg} กก. / {profile.heightCm} ซม.
                </span>
              </div>
              {bmi && (
                <div className="home-profile-item">
                  <span className="home-profile-item-label">BMI</span>
                  <span className="home-profile-item-value">
                    {bmi.value} <span className="home-bmi-tag">{bmi.label}</span>
                  </span>
                </div>
              )}
            </div>
          </>
        )}

        <div className="home-section-header-row">
          <h2 className="home-section-title">✨ ท่าแนะนำสำหรับวันนี้</h2>
          <Link to="/exercises" className="home-section-link">
            ดูคลังท่าทั้งหมด →
          </Link>
        </div>
        {recommended.length > 0 ? (
          <div className="home-recommended-grid">
            {recommended.map((exercise) => (
              <div className="home-recommended-card" key={exercise.id}>
                <div className="home-recommended-media">
                  {exercise.mediaUrl ? (
                    <img src={exercise.mediaUrl} alt={exercise.name} loading="lazy" />
                  ) : (
                    <span>{exercise.category ? CATEGORY_ICON[exercise.category] : '💪'}</span>
                  )}
                </div>
                <div className="home-recommended-info">
                  <h3>{exercise.name}</h3>
                  <span className="home-recommended-muscle">{exercise.targetMuscle}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="home-empty-note">ยังไม่มีท่าแนะนำ ลองไปสำรวจคลังท่าออกกำลังกายดูก่อนได้เลย</p>
        )}

        <h2 className="home-section-title">🗓️ ตารางและบันทึกผล</h2>
        <div className="home-coming-soon-card">
          <span className="home-coming-soon-icon">🚧</span>
          <div>
            <h3>ฟีเจอร์นี้กำลังจะมาเร็วๆ นี้</h3>
            <p>ตารางออกกำลังกายส่วนตัว บันทึกผลรายวัน และรายงานพัฒนาการ อยู่ระหว่างการพัฒนา</p>
          </div>
        </div>

        {user?.role === 'admin' && (
          <>
            <h2 className="home-section-title">🔌 System Status</h2>
            <div className="home-status-wrapper">
              <Status />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
