/**
 * navConfig.ts — เมนู Sidebar แยกตาม Role
 * อ้างอิงเส้นทางตาม docs/planning/07-frontend-pages.md
 */

export type Role = 'member' | 'trainer' | 'admin';

export interface NavItem {
  label: string;
  path: string;
  icon?: string; // ชื่อ class ของ Remix Icon
}

export const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  member: [
    { label: 'Dashboard', path: '/member/dashboard', icon: 'ri-dashboard-line' },
    { label: 'ตารางออกกำลังกาย', path: '/member/workout', icon: 'ri-calendar-line' },
    { label: 'คลังท่า', path: '/member/exercise-library', icon: 'ri-book-read-line' },
    { label: 'คอร์ส', path: '/member/activities', icon: 'ri-discuss-line' },
    { label: 'โปรไฟล์', path: '/member/profile', icon: 'ri-user-line' },
  ],
  trainer: [
    { label: 'Dashboard', path: '/trainer/dashboard', icon: 'ri-dashboard-line' },
    { label: 'คอร์สของฉัน', path: '/trainer/activities', icon: 'ri-calendar-event-line' },
    { label: 'คลังท่า', path: '/trainer/exercise-library', icon: 'ri-book-read-line' },
    { label: 'เสนอแก้ไขท่า', path: '/trainer/exercises', icon: 'ri-lightbulb-line' },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'ri-dashboard-line' },
    { label: 'จัดการผู้ใช้งาน', path: '/admin/users', icon: 'ri-group-line' },
    { label: 'จัดการท่า', path: '/admin/exercises', icon: 'ri-settings-4-line' },
    { label: 'คลังท่า', path: '/admin/exercise-library', icon: 'ri-book-read-line' },
    { label: 'อนุมัติข้อเสนอ', path: '/admin/suggestions', icon: 'ri-git-pull-request-line' },
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
