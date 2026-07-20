import PagePlaceholder from '../../components/PagePlaceholder';

function TrainerActivities() {
  return (
    <PagePlaceholder
      title="จัดการกิจกรรม"
      description="รายการคลาสที่คุณสร้าง พร้อมเข้าสู่หน้าเช็คชื่อผู้เข้าร่วม"
      phase="Phase 10"
      upcoming={[
        'ตารางกิจกรรมของตนเอง',
        'ปุ่มสร้าง/แก้ไข/ยกเลิกกิจกรรม',
        'ลิงก์ไปหน้าเช็คชื่อของแต่ละคลาส',
      ]}
    />
  );
}

export default TrainerActivities;
