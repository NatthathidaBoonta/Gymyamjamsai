import PagePlaceholder from '../../components/PagePlaceholder';

function TrainerDashboard() {
  return (
    <PagePlaceholder
      title="ภาพรวมผู้สอน"
      description="สรุปคลาสที่เปิด จำนวนผู้จอง และคลาสที่กำลังจะเริ่ม"
      phase="Phase 11"
      upcoming={[
        'การ์ดสรุปจำนวนคลาสและผู้ลงทะเบียน',
        'ฟอร์มสร้างกิจกรรมใหม่ (POST /api/activities)',
        'แจ้งเตือนคลาสที่ใกล้ถึงเวลา',
      ]}
    />
  );
}

export default TrainerDashboard;
