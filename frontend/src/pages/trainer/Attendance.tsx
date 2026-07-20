import { useParams } from 'react-router-dom';
import PagePlaceholder from '../../components/PagePlaceholder';

function Attendance() {
  const { id } = useParams();

  return (
    <PagePlaceholder
      title="เช็คชื่อผู้เข้าร่วม"
      description={`รายชื่อผู้ลงทะเบียนของกิจกรรม: ${id ?? '-'}`}
      phase="Phase 10"
      upcoming={[
        'ตารางรายชื่อผู้ลงทะเบียน (GET /api/activities/:id/participants)',
        'Checkbox เช็คชื่อเข้าร่วม (PATCH /api/activities/:id/attendance)',
        'สรุปจำนวนผู้เข้าร่วมจริง',
      ]}
    />
  );
}

export default Attendance;
