/**
 * ExerciseLibrary.tsx — ห้องรวมท่าออกกำลังกาย (Modern Design)
 * Features: Filter by category, Search, Exercise cards, Detail dialog
 */

import { useEffect, useState } from 'react';
import { listExercises } from '../../services/exercise.service';
import type { Exercise } from '../../services/exercise.service';
import ExerciseDetailDialog from '../../components/ExerciseDetailDialog';
import ExerciseImage from '../../components/ExerciseImage';
import './ExerciseLibrary.css';

type CategoryFilter = 'all' | 'strength' | 'cardio' | 'flexibility';

function ExerciseLibrary() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    loadExercises();
  }, []);

  async function loadExercises() {
    try {
      setLoading(true);
      const data = await listExercises(100, 0);
      setExercises(data.filter((ex: Exercise) => !!ex.media_url));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load exercises');
    } finally {
      setLoading(false);
    }
  }

  function handleExerciseClick(exercise: Exercise) {
    setSelectedExercise(exercise);
    setShowDialog(true);
  }

  function getFilteredExercises() {
    return exercises.filter((ex) => {
      const matchCategory = category === 'all' || ex.category === category;
      const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }

  const filtered = getFilteredExercises();
  const categoryIcon: Record<string, string> = {
    strength: 'Strength',
    cardio: 'Cardio',
    flexibility: 'Flexibility',
  };

  return (
    <div className="exercise-library">
      <header className="exercise-header">
        <div className="exercise-header__content">
          <h1>Exercise Library</h1>
          <p>ท่าออกกำลังกาย {exercises.length} ท่า — เลือกท่าที่ต้องการ</p>
        </div>
      </header>

      <div className="exercise-controls">
        <div className="exercise-search">
          <input
            type="text"
            placeholder="ค้นหาท่าออกกำลังกาย..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="exercise-search__input"
          />
        </div>

        <div className="exercise-filters">
          {(['all', 'strength', 'cardio', 'flexibility'] as const).map((cat) => (
            <button
              key={cat}
              className={`exercise-filter ${category === cat ? 'exercise-filter--active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat === 'all' ? 'ทั้งหมด' : categoryIcon[cat]}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="exercise-loading">กำลังโหลด...</p>}

      {error && <p className="exercise-error">{error}</p>}

      {!loading && filtered.length === 0 && (
        <p className="exercise-empty">ไม่พบท่าออกกำลังกายที่ตรงกัน</p>
      )}

      {!loading && filtered.length > 0 && (
        <div className="exercise-grid">
          {filtered.map((exercise) => (
            <div
              key={exercise.id}
              className="exercise-card"
              onClick={() => handleExerciseClick(exercise)}
            >
              <div className="exercise-card__image">
                <ExerciseImage
                  mediaUrl={exercise.media_url}
                  altText={exercise.name}
                  maxHeight={200}
                />
              </div>
              <div className="exercise-card__content">
                <h3 className="exercise-card__title">{exercise.name}</h3>
                <p className="exercise-card__category">{exercise.category}</p>
                <button className="exercise-card__button">ดูรายละเอียด →</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDialog && selectedExercise && (
        <ExerciseDetailDialog
          exercise={selectedExercise}
          onClose={() => setShowDialog(false)}
        />
      )}
    </div>
  );
}

export default ExerciseLibrary;
