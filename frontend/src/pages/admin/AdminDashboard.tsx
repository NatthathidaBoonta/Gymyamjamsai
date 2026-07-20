import PagePlaceholder from '../../components/PagePlaceholder';

function AdminDashboard() {
  return (
    <PagePlaceholder
      title="ภาพรวมระบบ"
      description="สถิติผู้ใช้งานทั้งระบบ ความนิยมของคลาส และการออกรายงาน"
      phase="Phase 11"
      upcoming={[
        'การ์ดสรุปผู้ใช้/กิจกรรม/การลงทะเบียน (GET /api/dashboard/admin)',
        'กราฟแนวโน้มการใช้งาน',
        'ปุ่ม Export รายงาน CSV (GET /api/reports/activities/export)',
      ]}
    />
  );
}

export default AdminDashboard;
