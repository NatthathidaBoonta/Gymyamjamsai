# REST API Contract: Gymyamjamsai

*(หมายเหตุ: จากข้อความของคุณ มีการระบุ Module 1-12 ที่อ้างอิงถึง "ระบบร้องเรียน (Complaint)" ผมจึงได้ทำการ **ปรับ Mapping ชื่อ Module** ให้สอดคล้องกับ Domain ของ **Gymyamjamsai (Fitness Tracking & Activity Registration)** โดยยังคงยึดโครงสร้างทั้ง 12 ข้อตามที่คุณต้องการ เพื่อให้สามารถทำงานต่อเนื่องกับ Database Design ในขั้นตอนก่อนหน้าได้ครับ)*

---

## ตาราง API Contract เบื้องต้น (Node.js + Express)

| Module | Method | Endpoint | Description | Request Body (สรุป) | Response (สรุป) | Auth | Role | หมายเหตุ |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Auth** | POST | `/api/auth/register` | สมัครสมาชิกใหม่ | `email`, `password` | `{ token, user_id }` | No | Guest | - |
| **1. Auth** | POST | `/api/auth/login` | เข้าสู่ระบบและรับ Token | `email`, `password` | `{ token, role }` | No | Guest | ส่ง JWT Token |
| **2. Users** | GET | `/api/users/profile` | ดึงข้อมูลโปรไฟล์ของตนเอง | - | `{ profile, metrics }` | Yes | Member, Trainer, Admin | อ้างอิง ID จาก Token |
| **2. Users** | PUT | `/api/users/profile` | อัปเดตข้อมูลร่างกายและเป้าหมาย | `weight`, `height`, `goal` | `{ success: true }` | Yes | Member | อัปเดตลง `user_metrics` ด้วย |
| **3. Exercises**<br>*(แทน Agencies)* | GET | `/api/exercises` | ดูคลังท่าออกกำลังกายทั้งหมด | - | `[{ id, name, category, media }]` | Yes | All Roles | รองรับ Pagination |
| **4. Activities**<br>*(แทน Categories)* | GET | `/api/activities` | ดูรายการคลาส/กิจกรรมที่เปิดรับ | - | `[{ id, title, available_seats }]` | Yes | All Roles | - |
| **4. Activities** | POST | `/api/activities` | สร้างกิจกรรม/คลาสใหม่ | `title`, `datetime`, `max_seats` | `{ id, status }` | Yes | Trainer | - |
| **5. Workout Plans**<br>*(แทน Complaints)* | POST | `/api/workout-plans/generate` | ประมวลผลสร้างตารางอัตโนมัติ | `user_id` (optional) | `{ plan_id, schedule }` | Yes | Member | Trigger AI/Logic Generator |
| **5. Workout Plans** | GET | `/api/workout-plans/current` | ดึงตารางออกกำลังกายปัจจุบัน | - | `{ plan_id, details }` | Yes | Member | - |
| **6. Activity Registrations**<br>*(แทน Assignment)* | POST | `/api/activities/:id/register` | กดลงทะเบียนเข้าร่วมคลาส | - | `{ success, status }` | Yes | Member | ตรวจสอบที่นั่งว่าง Real-time |
| **6. Activity Registrations** | GET | `/api/activities/:id/participants` | ดูรายชื่อนักศึกษาที่ลงทะเบียน | - | `[{ user_id, name, attended }]` | Yes | Trainer | ใช้สำหรับหน้าเช็คชื่อ |
| **7. Workout Logs**<br>*(แทน Updates)* | POST | `/api/workout-logs` | บันทึกผลการออกกำลังกายรายวัน | `plan_detail_id`, `actual_sets`, `actual_weight` | `{ success: true }` | Yes | Member | นำไปพล็อตกราฟพัฒนาการ |
| **8. Attachments** | POST | `/api/upload` | อัปโหลดรูป (โปรไฟล์/กิจกรรม) | `file` (form-data) | `{ url_path }` | Yes | All Roles | - |
| **9. Notifications** | GET | `/api/notifications` | ดึงรายการแจ้งเตือนทั้งหมด | - | `[{ id, title, is_read }]` | Yes | All Roles | - |
| **10. Dashboard** | GET | `/api/dashboard/personal` | ข้อมูลสถิติพัฒนาการ (สำหรับกราฟ) | `start_date`, `end_date` | `{ weight_trend, workout_freq }` | Yes | Member | - |
| **10. Dashboard** | GET | `/api/dashboard/admin` | ข้อมูลภาพรวมของระบบ | - | `{ total_users, total_activities }` | Yes | Admin | - |
| **11. Reports** | GET | `/api/reports/activities/export` | Export รายงานผู้เข้าร่วมกิจกรรม | `month`, `year` | File (CSV/PDF) | Yes | Admin, Trainer | - |
| **12. Audit Logs** | GET | `/api/audit-logs` | ดูประวัติการเปลี่ยนสถานะของระบบ | `entity_type` (เช่น plan, activity) | `[{ old, new, changed_by, date }]` | Yes | Admin | ตรวจสอบย้อนหลัง |

---
**โครงสร้างการตอบกลับที่เป็นมาตรฐาน (Standard Response Structure):**
เพื่อให้การสื่อสารระหว่าง Frontend และ Backend ง่ายขึ้น API ทุกตัวจะตอบกลับด้วยโครงสร้างพื้นฐานดังนี้:
```json
{
  "status": "success", 
  "message": "Operation successful",
  "data": { ... }
}
```
*(ในกรณี Error)*
```json
{
  "status": "error",
  "message": "Invalid request parameters",
  "code": 400
}
```
