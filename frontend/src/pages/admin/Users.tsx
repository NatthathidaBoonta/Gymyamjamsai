import PagePlaceholder from '../../components/PagePlaceholder';

function Users() {
  return (
    <PagePlaceholder
      title="จัดการผู้ใช้งาน"
      description="รายชื่อผู้ใช้งานทั้งหมด บทบาท และสถานะบัญชี"
      phase="Phase 10-11"
      upcoming={['ตารางรายชื่อผู้ใช้งาน', 'เปลี่ยนสิทธิ์ (Role)', 'ระงับบัญชี (Suspend)']}
    />
  );
}

export default Users;
