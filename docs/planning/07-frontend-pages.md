# Frontend Page Structure: Gymyamjamsai

*(หมายเหตุ: จากคำสั่งของคุณ มีการระบุชื่อระบบและกลุ่มผู้ใช้งานของ "ระบบร้องเรียนศูนย์ดำรงธรรม" ผมได้ทำการ **Mapping กลุ่มผู้ใช้และประยุกต์โครงสร้าง** ให้สอดคล้องกับ Domain ของ **Gymyamjamsai** (ระบบติดตามออกกำลังกาย) ดังนี้: ประชาชน -> Member, เจ้าหน้าที่/หน่วยงาน -> Trainer, ผู้บริหาร/Admin -> Admin เพื่อให้เอกสารต่อเนื่องและนำไปพัฒนาต่อได้จริงครับ)*

## 8. Layout หลักของระบบ (Core Layouts)
ระบบใช้ **React + Vite** และ **MUI (Material-UI)** ในการจัด Layout โดยแบ่งออกเป็น 2 Layout หลักตามการเข้าสู่ระบบ:

1. **Public Layout (สำหรับ Guest):** 
   - **Topbar:** โลโก้แบรนด์, ปุ่ม `Login` / `Register`
   - **Main Content:** เนื้อหาเต็มหน้าจอ (เช่น Hero Banner แนะนำระบบ)
2. **Dashboard Layout (สำหรับ Member, Trainer, Admin):** 
   - **Sidebar (Drawer):** เมนูนำทางด้านซ้ายมือ (Dynamic ตาม Role ของผู้ใช้)
   - **Topbar (AppBar):** แสดงชื่อโปรไฟล์, ไอคอนแจ้งเตือน (Notifications), และปุ่ม `Logout`
   - **Main Content:** พื้นที่แสดงผลตรงกลาง รองรับ MUI Grid และ Dashboard Cards

---

## รายละเอียดหน้าจอ (แยกตามกลุ่มผู้ใช้งาน)

### 🟢 1. กลุ่มผู้เยี่ยมชม (Guest)
*(ผู้ที่ยังไม่ได้เข้าสู่ระบบ)*

#### 1.1 หน้าแรก (Landing Page)
- **URL Path:** `/`
- **Role:** Guest
- **ข้อมูลที่แสดง:** Hero Banner แนะนำระบบ, สรุปฟีเจอร์เด่น, คลาสออกกำลังกายเบื้องต้นที่น่าสนใจ
- **ปุ่ม/Action สำคัญ:** `เข้าสู่ระบบ`, `สมัครสมาชิก`
- **ตาราง/ฟอร์ม:** -
- **เชื่อมโยง API:** `GET /api/activities` (ดึงรายการคลาสมาโชว์บางส่วน)

#### 1.2 หน้า Authentication (Login / Register)
- **URL Path:** `/login` และ `/register`
- **Role:** Guest
- **ข้อมูลที่แสดง:** แบบฟอร์มสำหรับเข้าสู่ระบบและสมัครสมาชิก
- **ปุ่ม/Action สำคัญ:** `Submit`
- **ตาราง/ฟอร์ม:** ฟอร์มกรอก Email, Password (และข้อมูลร่างกายเบื้องต้นสำหรับหน้า Register)
- **เชื่อมโยง API:** `POST /api/auth/login`, `POST /api/auth/register`

---

### 🔵 2. กลุ่มสมาชิก / นักศึกษา (Member)
*(เทียบเท่า "ประชาชน" - เน้นติดตามสุขภาพและลงทะเบียนคลาส)*

#### 2.1 หน้าภาพรวมสุขภาพ (Member Dashboard)
- **URL Path:** `/member/dashboard`
- **Role:** Member
- **ข้อมูลที่แสดง:** Dashboard Cards แสดงน้ำหนักปัจจุบัน, กราฟแนวโน้มน้ำหนัก, สถิติการออกกำลังกาย, กิจกรรมที่กำลังจะมาถึง
- **ปุ่ม/Action สำคัญ:** `อัปเดตน้ำหนักล่าสุด`
- **ตาราง/ฟอร์ม:** MUI Dialog Form สำหรับอัปเดตน้ำหนัก
- **เชื่อมโยง API:** `GET /api/dashboard/personal`, `PUT /api/users/profile`

#### 2.2 หน้าตารางออกกำลังกายและบันทึกผล (Workout Plan & Logs)
- **URL Path:** `/member/workout`
- **Role:** Member
- **ข้อมูลที่แสดง:** ตารางท่าออกกำลังกายที่ระบบจัดให้ (มีรูป/วิดีโอ), ประวัติการบันทึกผล
- **ปุ่ม/Action สำคัญ:** `บันทึกผล (Log Workout)`, `ขอตารางใหม่ (Generate Plan)`
- **ตาราง/ฟอร์ม:** ฟอร์มกรอกเซ็ต, จำนวนครั้ง, และน้ำหนักที่ยกได้จริง (Actual vs Target)
- **เชื่อมโยง API:** `GET /api/workout-plans/current`, `POST /api/workout-logs`, `POST /api/workout-plans/generate`

#### 2.3 หน้ากระดานกิจกรรม (Activity Board)
- **URL Path:** `/member/activities`
- **Role:** Member
- **ข้อมูลที่แสดง:** รายการคลาสออกกำลังกายที่สาขาวิชาเปิดรับ (แสดงเป็น MUI Cards) พร้อมหลอด Progress จำนวนที่นั่ง
- **ปุ่ม/Action สำคัญ:** `กดลงทะเบียน (Register)`
- **ตาราง/ฟอร์ม:** -
- **เชื่อมโยง API:** `GET /api/activities`, `POST /api/activities/:id/register`

---

### 🟠 3. กลุ่มผู้ฝึกสอน / อาจารย์ (Trainer)
*(เทียบเท่า "เจ้าหน้าที่ศูนย์ฯ/หน่วยงาน" - เน้นจัดการคลาสและเช็คชื่อ)*

#### 3.1 หน้าภาพรวมผู้สอน (Trainer Dashboard)
- **URL Path:** `/trainer/dashboard`
- **Role:** Trainer
- **ข้อมูลที่แสดง:** สรุปจำนวนคลาสที่เปิด, จำนวนคนจองเฉลี่ย, แจ้งเตือนคลาสที่กำลังจะเริ่ม
- **ปุ่ม/Action สำคัญ:** `สร้างกิจกรรมใหม่`
- **ตาราง/ฟอร์ม:** ฟอร์มสร้าง Activity (กำหนดชื่อ, วันเวลา, สถานที่, จำนวนรับสูงสุด)
- **เชื่อมโยง API:** `POST /api/activities`

#### 3.2 หน้าจัดการกิจกรรมและเช็คชื่อ (Activities & Attendance)
- **URL Path:** `/trainer/activities` และ `/trainer/activities/:id/attendance`
- **Role:** Trainer
- **ข้อมูลที่แสดง:** รายการกิจกรรมของตนเอง, รายชื่อนักศึกษาที่กดลงทะเบียน
- **ปุ่ม/Action สำคัญ:** `เช็คชื่อเข้าร่วม (Mark Attendance)`, `แก้ไข/ยกเลิกกิจกรรม`
- **ตาราง/ฟอร์ม:** ตาราง DataGrid แสดงรายชื่อนักศึกษา พร้อม Checkbox สำหรับเช็คชื่อ
- **เชื่อมโยง API:** `GET /api/activities/:id/participants`, `PUT /api/activities/:id/attendance`

---

### 🔴 4. กลุ่มผู้ดูแลระบบ (Admin)
*(เทียบเท่า "ผู้บริหาร/Admin" - เน้นดูรายงานและจัดการ Master Data)*

#### 4.1 หน้าภาพรวมระบบและรายงาน (Admin Dashboard & Reports)
- **URL Path:** `/admin/dashboard`
- **Role:** Admin
- **ข้อมูลที่แสดง:** Dashboard Cards สรุปผู้ใช้งานทั้งระบบ, สถิติความนิยมของคลาส, กราฟแนวโน้มการใช้งาน
- **ปุ่ม/Action สำคัญ:** `Export Report (PDF/CSV)`
- **ตาราง/ฟอร์ม:** -
- **เชื่อมโยง API:** `GET /api/dashboard/admin`, `GET /api/reports/activities/export`

#### 4.2 หน้าจัดการผู้ใช้งาน (User Management)
- **URL Path:** `/admin/users`
- **Role:** Admin
- **ข้อมูลที่แสดง:** รายชื่อผู้ใช้งานทั้งหมดในระบบ, บทบาท (Role), สถานะบัญชี
- **ปุ่ม/Action สำคัญ:** `ระงับบัญชี (Suspend)`, `เปลี่ยนสิทธิ์ (Change Role)`
- **ตาราง/ฟอร์ม:** ตาราง MUI DataGrid
- **เชื่อมโยง API:** `GET /api/users`, `PUT /api/users/:id/role`

#### 4.3 หน้าจัดการคลังท่าออกกำลังกาย (Master Data: Exercises)
- **URL Path:** `/admin/exercises`
- **Role:** Admin
- **ข้อมูลที่แสดง:** รายการท่าออกกำลังกายต้นแบบทั้งหมดในระบบ
- **ปุ่ม/Action สำคัญ:** `เพิ่มท่าใหม่`, `อัปโหลดรูปภาพ/วิดีโอ`
- **ตาราง/ฟอร์ม:** ฟอร์มเพิ่ม/แก้ไข ท่าออกกำลังกาย (ชื่อ, หมวดหมู่, ลิงก์ไฟล์แนบ)
- **เชื่อมโยง API:** `GET /api/exercises`, `POST /api/exercises`, `POST /api/upload`
