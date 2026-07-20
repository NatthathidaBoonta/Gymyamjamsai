/**
 * navConfig.ts — เมนู Sidebar แยกตาม Role
 * อ้างอิงเส้นทางตาม docs/planning/07-frontend-pages.md
 */

export type Role = 'member' | 'trainer' | 'admin';

export interface NavItem {
  label: string;
  path: string;
  icon: string; // ใช้ emoji แทน icon library (CSS Vanilla ไม่พึ่ง dependency ภายนอก)
}

export const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  member: [
    { label: 'ภาพรวมสุขภาพ', path: '/member/dashboard', icon: '📊' },
    { label: 'ตารางออกกำลังกาย', path: '/member/workout', icon: '🏋️' },
    { label: 'กระดานกิจกรรม', path: '/member/activities', icon: '📅' },
  ],
  trainer: [
    { label: 'ภาพรวมผู้สอน', path: '/trainer/dashboard', icon: '📊' },
    { label: 'จัดการกิจกรรม', path: '/trainer/activities', icon: '📋' },
  ],
  admin: [
    { label: 'ภาพรวมระบบ', path: '/admin/dashboard', icon: '📊' },
    { label: 'จัดการผู้ใช้งาน', path: '/admin/users', icon: '👥' },
    { label: 'คลังท่าออกกำลังกาย', path: '/admin/exercises', icon: '💪' },
  ],
};

export const ROLE_LABEL: Record<Role, string> = {
  member: 'สมาชิก',
  trainer: 'ผู้ฝึกสอน',
  admin: 'ผู้ดูแลระบบ',
};

/** หน้าแรกของแต่ละ Role — ใช้ตอน redirect หลัง login และเมื่อเข้าหน้าที่ไม่มีสิทธิ์ */
export const HOME_BY_ROLE: Record<Role, string> = {
  member: '/member/dashboard',
  trainer: '/trainer/dashboard',
  admin: '/admin/dashboard',
};
