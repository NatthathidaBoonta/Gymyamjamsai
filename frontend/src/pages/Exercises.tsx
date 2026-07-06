/**
 * src/pages/Exercises.tsx
 *
 * Exercise Library Page (Protected)
 * แสดงคลังท่าออกกำลังกาย แยกตามสาย (Calisthenics / Cardio / Weight Training)
 * พร้อมค้นหา/กรอง และไฮไลต์ท่าที่เหมาะกับระดับของผู้ใช้
 */

import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import {
  listExercises,
  type Exercise,
  type ExerciseCategory,
  type ExerciseDifficulty,
} from '../services/exercise';
import { getMyProfile } from '../services/profile';
import './Exercises.css';

const DIFFICULTY_LABEL: Record<ExerciseDifficulty, string> = {
  beginner: 'มือใหม่',
  intermediate: 'ปานกลาง',
  advanced: 'ชำนาญ',
};

const CATEGORY_TABS: { value: ExerciseCategory | ''; label: string; icon: string }[] = [
  { value: '', label: 'ทั้งหมด', icon: '🗂️' },
  { value: 'calisthenics', label: 'Calisthenics', icon: '🤸' },
  { value: 'cardio', label: 'Cardio', icon: '🏃' },
  { value: 'weight', label: 'Weight Training', icon: '🏋️' },
];

const CATEGORY_LABEL: Record<ExerciseCategory, string> = {
  calisthenics: 'Calisthenics (น้ำหนักตัวเอง)',
  cardio: 'Cardio',
  weight: 'Weight Training',
};

const CATEGORY_ICON: Record<ExerciseCategory, string> = {
  calisthenics: '🤸',
  cardio: '🏃',
  weight: '🏋️',
};

export default function Exercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [myFitnessLevel, setMyFitnessLevel] = useState<ExerciseDifficulty | null>(null);

  const [search, setSearch] = useState('');
  const [targetMuscle, setTargetMuscle] = useState('');
  const [equipment, setEquipment] = useState('');
  const [difficulty, setDifficulty] = useState<ExerciseDifficulty | ''>('');
  const [activeCategory, setActiveCategory] = useState<ExerciseCategory | ''>('');

  const [selected, setSelected] = useState<Exercise | null>(null);

  const loadExercises = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await listExercises({ search, targetMuscle, equipment, difficulty, category: activeCategory });
      setExercises(res.data);
    } catch {
      setError('ไม่สามารถโหลดคลังท่าออกกำลังกายได้');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getMyProfile()
      .then((res) => setMyFitnessLevel(res.data?.fitnessLevel ?? null))
      .catch(() => setMyFitnessLevel(null));
  }, []);

  useEffect(() => {
    const timeout = setTimeout(loadExercises, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, targetMuscle, equipment, difficulty, activeCategory]);

  const targetMuscleOptions = useMemo(() => {
    const set = new Set(exercises.map((e) => e.targetMuscle).filter((v): v is string => !!v));
    return Array.from(set).sort();
  }, [exercises]);

  const equipmentOptions = useMemo(() => {
    const set = new Set(exercises.map((e) => e.equipment).filter((v): v is string => !!v));
    return Array.from(set).sort();
  }, [exercises]);

  // จัดกลุ่มตามสาย (calisthenics/cardio/weight) เพื่อไม่ให้ท่าคนละสายเรียงติดกันในตะแกรงเดียว
  const groupedByCategory = useMemo(() => {
    const groups: Record<ExerciseCategory, Exercise[]> = { calisthenics: [], cardio: [], weight: [] };
    for (const ex of exercises) {
      if (ex.category && groups[ex.category]) {
        groups[ex.category].push(ex);
      }
    }
    return groups;
  }, [exercises]);

  const renderCard = (exercise: Exercise) => (
    <button key={exercise.id} className="exercise-card" onClick={() => setSelected(exercise)}>
      {exercise.difficulty && myFitnessLevel === exercise.difficulty && (
        <span className="exercise-card-badge">✨ แนะนำสำหรับคุณ</span>
      )}
      <div className="exercise-card-media">
        {exercise.mediaUrl ? (
          <img src={exercise.mediaUrl} alt={exercise.name} loading="lazy" />
        ) : (
          <span className="exercise-card-media-fallback">
            {exercise.category ? CATEGORY_ICON[exercise.category] : '💪'}
          </span>
        )}
      </div>
      <h3 className="exercise-card-name">{exercise.name}</h3>
      <div className="exercise-card-tags">
        {exercise.targetMuscle && <span className="exercise-tag exercise-tag-muscle">{exercise.targetMuscle}</span>}
        {exercise.equipment && <span className="exercise-tag exercise-tag-equipment">{exercise.equipment}</span>}
        {exercise.difficulty && (
          <span className={`exercise-tag exercise-tag-difficulty ${exercise.difficulty}`}>
            {DIFFICULTY_LABEL[exercise.difficulty]}
          </span>
        )}
      </div>
      {exercise.description && <p className="exercise-card-description">{exercise.description}</p>}
    </button>
  );

  return (
    <div className="exercises-page">
      <Navbar />

      <main className="exercises-main">
        <div className="exercises-header">
          <h1>💪 คลังท่าออกกำลังกาย</h1>
          <p>ค้นหาท่าที่เหมาะกับเป้าหมายและระดับความฟิตของคุณ</p>
        </div>

        <div className="exercises-category-tabs">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.value || 'all'}
              className={`exercises-category-tab ${activeCategory === tab.value ? 'active' : ''}`}
              onClick={() => setActiveCategory(tab.value)}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        <div className="exercises-filters">
          <input
            type="text"
            className="exercises-search"
            placeholder="ค้นหาชื่อท่า..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="exercises-filter-select"
            value={targetMuscle}
            onChange={(e) => setTargetMuscle(e.target.value)}
          >
            <option value="">ทุกกล้ามเนื้อเป้าหมาย</option>
            {targetMuscleOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            className="exercises-filter-select"
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
          >
            <option value="">ทุกอุปกรณ์</option>
            {equipmentOptions.map((eq) => (
              <option key={eq} value={eq}>
                {eq}
              </option>
            ))}
          </select>

          <select
            className="exercises-filter-select"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as ExerciseDifficulty | '')}
          >
            <option value="">ทุกระดับความยาก</option>
            <option value="beginner">มือใหม่</option>
            <option value="intermediate">ปานกลาง</option>
            <option value="advanced">ชำนาญ</option>
          </select>
        </div>

        {error && <div className="exercises-message error">⚠️ {error}</div>}

        {isLoading ? (
          <p className="exercises-loading">⏳ กำลังโหลด...</p>
        ) : exercises.length === 0 ? (
          <p className="exercises-empty">ไม่พบท่าออกกำลังกายที่ตรงกับเงื่อนไข</p>
        ) : activeCategory ? (
          // เลือกสายเดียวแล้ว — แสดงตะแกรงเดียว ไม่ต้องแบ่งหัวข้อซ้ำ
          <div className="exercises-grid">{exercises.map(renderCard)}</div>
        ) : (
          // "ทั้งหมด" — แยกเป็นคนละ section ตามสาย ไม่ให้ปนกัน
          (['calisthenics', 'cardio', 'weight'] as ExerciseCategory[]).map((cat) =>
            groupedByCategory[cat].length > 0 ? (
              <section className="exercises-category-section" key={cat}>
                <h2 className="exercises-category-section-title">
                  {CATEGORY_ICON[cat]} {CATEGORY_LABEL[cat]}
                </h2>
                <div className="exercises-grid">{groupedByCategory[cat].map(renderCard)}</div>
              </section>
            ) : null
          )
        )}
      </main>

      {selected && (
        <div className="exercise-modal-backdrop" onClick={() => setSelected(null)}>
          <div className="exercise-modal" onClick={(e) => e.stopPropagation()}>
            <button className="exercise-modal-close" onClick={() => setSelected(null)}>
              ✕
            </button>
            {selected.mediaUrl && (
              <div className="exercise-modal-media">
                <img src={selected.mediaUrl} alt={selected.name} />
              </div>
            )}
            <h2>{selected.name}</h2>
            <div className="exercise-card-tags">
              {selected.targetMuscle && (
                <span className="exercise-tag exercise-tag-muscle">{selected.targetMuscle}</span>
              )}
              {selected.equipment && (
                <span className="exercise-tag exercise-tag-equipment">{selected.equipment}</span>
              )}
              {selected.difficulty && (
                <span className={`exercise-tag exercise-tag-difficulty ${selected.difficulty}`}>
                  {DIFFICULTY_LABEL[selected.difficulty]}
                </span>
              )}
            </div>
            <p className="exercise-modal-description">
              {selected.description || 'ยังไม่มีคำอธิบายสำหรับท่านี้'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
