import PagePlaceholder from '../../components/PagePlaceholder';

function MemberDashboard() {
  return (
    <PagePlaceholder
      title="ภาพรวมสุขภาพ"
      description="สรุปน้ำหนักปัจจุบัน กราฟแนวโน้ม และกิจกรรมที่กำลังจะมาถึง"
      phase="Phase 11"
      upcoming={[
        'Dashboard Cards: น้ำหนักปัจจุบัน, ความถี่การออกกำลังกาย',
        'กราฟแนวโน้มน้ำหนัก (GET /api/dashboard/personal)',
        'ปุ่มอัปเดตน้ำหนักล่าสุด',
      ]}
    />
  );
}

export default MemberDashboard;
