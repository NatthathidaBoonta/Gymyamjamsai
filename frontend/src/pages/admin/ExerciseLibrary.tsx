/**
 * ExerciseLibrary.tsx — ไลบรารีท่าแยกสาย (Push / Pull / Legs & Core)
 * แถบเลือกสายด้านบน → หัวข้อสาย → การ์ดขาว: ภาพ · ชื่อ · ชิปกล้ามเนื้อ · ปุ่ม DETAILS
 */

import { useEffect, useMemo, useState } from 'react';
import ExerciseDetailDialog from '../../components/ExerciseDetailDialog';
import { getImageUrl } from '../../utils/imageUtils';
import { SPLITS, muscleChips, splitOf, type Split } from '../../utils/exerciseSplit';
import * as es from '../../services/exercise.service';
import './ExerciseLibrary.css';

function ExerciseLibrary() {
  const [all, setAll] = useState<es.Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [split, setSplit] = useState<Split>('push');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<es.Exercise | null>(null);

  useEffect(() => {
    es.searchExercises({ limit: 100 })
      .then((r) => setAll(r.items))
      .catch(() => setError('โหลดคลังท่าไม่สำเร็จ ลองใหม่อีกครั้ง'))
      .finally(() => setLoading(false));
  }, []);

  const bySplit = useMemo(() => {
    const map: Record<Split, es.Exercise[]> = { push: [], pull: [], legs: [] };
    for (const e of all) map[splitOf(e)].push(e);
    return map;
  }, [all]);

  const meta = SPLITS.find((s) => s.key === split)!;
  const needle = q.trim().toLowerCase();
  const items = bySplit[split].filter(
    (e) => !needle || e.name.toLowerCase().includes(needle) || (e.muscle_group || '').toLowerCase().includes(needle),
  );

  return (
    <div className="lib">
      {/* ---------- แถบเลือกสาย ---------- */}
      <div className="lib__bar">
        <div className="lib__tabs" role="tablist" aria-label="สายการฝึก">
          {SPLITS.map((s) => (
            <button
              key={s.key}
              type="button"
              role="tab"
              aria-selected={split === s.key}
              className={`lib__tab ${split === s.key ? 'on' : ''}`}
              onClick={() => setSplit(s.key)}
            >
              <span className="lib__tab-title">{s.tab}</span>
              <span className="lib__tab-sub">{s.tabSub}</span>
              <span className="lib__tab-count">{bySplit[s.key].length}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ---------- หัวข้อสาย ---------- */}
      <div className="lib__head" key={split}>
        <h1>{meta.title}</h1>
        <p>{meta.desc}</p>
        <label className="lib__search">
          <i className="ri-search-line"></i>
          <input type="search" placeholder="ค้นหาในสายนี้…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      </div>

      {/* ---------- การ์ด ---------- */}
      <div className="lib__panel">
        {error ? (
          <div className="lib__state">{error}</div>
        ) : loading ? (
          <div className="lib__grid">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="lib__skeleton" aria-hidden="true"></div>)}
          </div>
        ) : items.length === 0 ? (
          <div className="lib__state">ไม่พบท่าในสายนี้</div>
        ) : (
          <div className="lib__grid" key={`${split}-${needle}`}>
            {items.map((e, i) => (
              <article key={e.id} className="lib__card" style={{ '--i': i } as React.CSSProperties}>
                <button type="button" className="lib__thumb" onClick={() => setSelected(e)} aria-label={`ดูรายละเอียด ${e.name}`}>
                  {e.media_url ? <img src={getImageUrl(e.media_url)} alt="" loading="lazy" /> : <i className="ri-image-line"></i>}
                </button>
                <h3 className="lib__name">{e.name}</h3>
                <div className="lib__chips">
                  {muscleChips(e).map((m) => <span key={m}>{m}</span>)}
                  {muscleChips(e).length === 0 && <span>{es.DIFFICULTY_LABEL[e.difficulty]}</span>}
                </div>
                <button type="button" className="lib__details" onClick={() => setSelected(e)}>
                  Details
                </button>
              </article>
            ))}
          </div>
        )}
      </div>

      {selected && <ExerciseDetailDialog exercise={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

export default ExerciseLibrary;
