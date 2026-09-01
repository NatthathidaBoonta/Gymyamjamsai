/**
 * navConfig.ts — เมนู Sidebar แยกตาม Role
 * อ้างอิงเส้นทางตาม docs/planning/07-frontend-pages.md
 */

export type Role = 'member' | 'trainer' | 'admin';

export interface NavItem {
  label: string;
  path: string;
  icon?: string; // ใช้ emoji แทน icon library (CSS Vanilla ไม่พึ่ง dependency ภายนอก)
}

export const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  member: [
    { label: 'ภาพรวมสุขภาพ', path: '/member/dashboard', icon: 'ri-dashboard-line' },
    { label: 'โปรไฟล์ของฉัน', path: '/member/profile', icon: 'ri-user-line' },
    { label: 'ตารางออกกำลังกาย', path: '/member/workout', icon: 'ri-calendar-line' },
    { label: 'กระดานกิจกรรม', path: '/member/activities', icon: 'ri-discuss-line' },
  ],
  trainer: [
    { label: 'ภาพรวมผู้สอน', path: '/trainer/dashboard', icon: 'ri-dashboard-line' },
    { label: 'จัดการกิจกรรม', path: '/trainer/activities', icon: 'ri-calendar-event-line' },
    { label: 'เช็คชื่อ', path: '/trainer/attendance', icon: 'ri-check-double-line' },
  ],
  admin: [
    { label: 'ภาพรวมระบบ', path: '/admin/dashboard', icon: 'ri-dashboard-line' },
    { label: 'จัดการผู้ใช้งาน', path: '/admin/users', icon: 'ri-group-line' },
    { label: 'จัดการท่า', path: '/admin/exercises', icon: 'ri-settings-4-line' },
    { label: 'ไลบรารีท่า', path: '/admin/exercise-library', icon: 'ri-book-read-line' },
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
