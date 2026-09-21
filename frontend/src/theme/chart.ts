/**
 * chart.ts — ชุดสีสำหรับ Recharts ให้ตรงกับ tokens.css (Ember theme)
 * Recharts รับเฉพาะค่าสีตรงๆ ไม่รับ var(--…) จึงต้องประกาศซ้ำที่นี่ที่เดียว
 * ห้ามใช้เขียว/แดงเป็นสีชุดข้อมูล — เก็บไว้บอกสถานะเท่านั้น
 */

export const CHART_SERIES = ['#ff7a1a', '#ffb347', '#8fb8ff', '#9ea8c0'] as const;

export const CHART_GRID = '#202a40';
export const CHART_AXIS = '#9ea8c0';
export const CHART_AREA_FILL = 'rgba(255, 122, 26, 0.12)';

export const CHART_TOOLTIP_STYLE = {
  background: '#1b2336',
  border: '1px solid #2f3b57',
  borderRadius: 8,
  color: '#eef0f6',
  fontFamily: "'Noto Sans Thai', system-ui, sans-serif",
  fontSize: 13,
} as const;

export const CHART_AXIS_TICK = { fill: CHART_AXIS, fontSize: 12, fontFamily: "'Noto Sans Thai', system-ui, sans-serif" } as const;
