# Database Design Overview: Gymyamjamsai

*(หมายเหตุ: จากข้อความของคุณ มีการกล่าวถึง "ระบบร้องเรียนศูนย์ดำรงธรรม" ซึ่งผมคาดว่าน่าจะเป็นการคัดลอก Template มาผิด ผมจึงได้ปรับแก้และออกแบบ Database ให้ตรงกับบริบทของ **ระบบ Gymyamjamsai (ระบบติดตามพัฒนาการการออกกำลังกาย)** ที่เรากำลังวางแผนกันอยู่นะครับ เพื่อความต่อเนื่องของเอกสารทั้งหมด)*

## ภาพรวมฐานข้อมูล (Database Overview)
- **RDBMS:** MySQL 8
- **Naming Convention:** `snake_case` สำหรับชื่อตารางและชื่อ Field

---

## การแบ่งกลุ่มตาราง (Table Categories)

### 7. ตาราง Master Data ที่ควรมี
1. `users` (ข้อมูลบัญชีผู้ใช้งานพื้นฐานและ Role)
2. `user_profiles` (ข้อมูลส่วนตัวและเป้าหมาย)
3. `exercises` (คลังท่าออกกำลังกายหลักของระบบ)

### 8. ตาราง Transaction ที่ควรมี
4. `user_metrics` (ประวัติการบันทึกน้ำหนัก ส่วนสูง เพื่อแสดงกราฟ)
5. `workout_plans` (แผนการออกกำลังกายในแต่ละวงรอบ)
6. `workout_plan_details` (รายละเอียดท่าที่จะเล่นในแต่ละแผน)
7. `workout_logs` (บันทึกผลการเล่นจริงรายวัน)
8. `activities` (กิจกรรม/คลาสที่อาจารย์สร้าง)
9. `activity_registrations` (การลงทะเบียนเข้าร่วมกิจกรรมของนักศึกษา)

### 9. ตาราง Log/History ที่ควรมี
10. `status_audit_logs` (ประวัติการเปลี่ยนสถานะของแผนออกกำลังกายและกิจกรรม)

---

## 1-5. รายละเอียดตาราง (Table Definitions)

### 1. `users`
- **วัตถุประสงค์:** เก็บข้อมูลบัญชีสำหรับการ Authentication และตรวจสอบ Role
- **Field สำคัญ:** `id`, `email`, `password_hash`, `role` (enum: member, trainer, admin), `is_active`, `created_at`
- **Primary Key:** `id`
- **Foreign Key:** -

### 2. `user_profiles`
- **วัตถุประสงค์:** เก็บข้อมูลสุขภาพเบื้องต้นและโรคประจำตัว (แยกจากตาราง users เพื่อลดขนาดตารางหลัก)
- **Field สำคัญ:** `user_id`, `first_name`, `last_name`, `fitness_goal`, `medical_conditions`
- **Primary Key:** `user_id` (เป็นความสัมพันธ์แบบ 1:1 กับ users)
- **Foreign Key:** `user_id` อ้างอิงไปที่ `users.id`

### 3. `exercises`
- **วัตถุประสงค์:** เก็บข้อมูลท่าออกกำลังกาย เพื่อให้ระบบดึงไปประมวลผลตารางอัตโนมัติ
- **Field สำคัญ:** `id`, `name`, `category` (เช่น cardio, strength), `media_url`, `instructions`
- **Primary Key:** `id`
- **Foreign Key:** -

### 4. `user_metrics`
- **วัตถุประสงค์:** เก็บประวัติร่างกายของ Member (Time-series data) เพื่อนำไปทำเป็นกราฟสรุปพัฒนาการ
- **Field สำคัญ:** `id`, `user_id`, `weight_kg`, `height_cm`, `bmi`, `recorded_at`
- **Primary Key:** `id`
- **Foreign Key:** `user_id` อ้างอิงไปที่ `users.id`

### 5. `workout_plans`
- **วัตถุประสงค์:** เก็บ Header ของแผนการออกกำลังกายในวงรอบนั้นๆ พร้อมสถานะ
- **Field สำคัญ:** `id`, `user_id`, `status` (enum: pending, active, adjusted), `start_date`, `end_date`
- **Primary Key:** `id`
- **Foreign Key:** `user_id` อ้างอิงไปที่ `users.id`

### 6. `workout_plan_details`
- **วัตถุประสงค์:** เก็บรายละเอียดรายการท่าทางที่ระบบจัดมาให้ในแต่ละแผน
- **Field สำคัญ:** `id`, `plan_id`, `exercise_id`, `target_sets`, `target_reps`, `target_weight`, `day_of_week`
- **Primary Key:** `id`
- **Foreign Key:** `plan_id` อ้างอิง `workout_plans.id`, `exercise_id` อ้างอิง `exercises.id`

### 7. `workout_logs`
- **วัตถุประสงค์:** เก็บผลการออกกำลังกายจริงเทียบกับเป้าหมายที่ตั้งไว้ (Actual vs Target)
- **Field สำคัญ:** `id`, `plan_detail_id`, `actual_sets`, `actual_reps`, `actual_weight`, `logged_at`
- **Primary Key:** `id`
- **Foreign Key:** `plan_detail_id` อ้างอิง `workout_plan_details.id`

### 8. `activities`
- **วัตถุประสงค์:** เก็บข้อมูลกิจกรรมหรือคลาสที่ Trainer เป็นคนสร้าง
- **Field สำคัญ:** `id`, `trainer_id`, `title`, `description`, `max_participants`, `start_datetime`, `status` (open, full, closed)
- **Primary Key:** `id`
- **Foreign Key:** `trainer_id` อ้างอิง `users.id`

### 9. `activity_registrations`
- **วัตถุประสงค์:** เก็บข้อมูลว่านักศึกษาคนไหน กดลงทะเบียนเข้าร่วมคลาสใด และมาร่วมจริงหรือไม่
- **Field สำคัญ:** `id`, `activity_id`, `user_id`, `status` (registered, cancelled), `is_attended` (boolean)
- **Primary Key:** `id`
- **Foreign Key:** `activity_id` อ้างอิง `activities.id`, `user_id` อ้างอิง `users.id`

### 10. `status_audit_logs`
- **วัตถุประสงค์:** เก็บประวัติการเปลี่ยนแปลงตาม Requirement ระบบ (Log) เช่น การเปลี่ยนสถานะแผนออกกำลังกายจาก Active -> Adjusted หรือการระงับบัญชีผู้ใช้
- **Field สำคัญ:** `id`, `entity_type` (เช่น 'workout_plan', 'activity'), `entity_id`, `old_status`, `new_status`, `changed_by_user_id`, `created_at`
- **Primary Key:** `id`
- **Foreign Key:** `changed_by_user_id` อ้างอิง `users.id`

---

## 6. ความสัมพันธ์ระหว่างตาราง (Relationships)
- **One-to-One (1:1):** 
  - `users` (1) กับ `user_profiles` (1)
- **One-to-Many (1:N):**
  - `users` (1) มีหลาย `user_metrics` (N) 
  - `users` (1) มีหลาย `workout_plans` (N)
  - `workout_plans` (1) ประกอบด้วยหลาย `workout_plan_details` (N)
  - `workout_plan_details` (1) อาจมีการบันทึกซ้ำหลายครั้ง `workout_logs` (N)
  - `users (Trainer)` (1) สร้างหลาย `activities` (N)
  - `activities` (1) มีผู้จองหลายคน `activity_registrations` (N)
  - `users (Member)` (1) จองได้หลายคลาส `activity_registrations` (N)

---

## 10. ข้อควรระวังเรื่องข้อมูลส่วนบุคคล (PDPA Precautions)
1. **Data Encryption:** ฟิลด์ `password_hash` ต้องเข้ารหัสแบบทางเดียว (เช่น bcrypt) เสมอ
2. **Sensitive Data Protection:** ตาราง `user_metrics` และ `user_profiles` บรรจุข้อมูลสุขภาพ (Health Data) ถือเป็นข้อมูลอ่อนไหว (Sensitive Personal Data) 
   - **Authorization:** ในฝั่ง API ต้องดึงข้อมูลโดยอิงจาก `user_id` ใน JWT Token เสมอ เพื่อป้องกันไม่ให้ผู้ใช้แอบ Query เปลี่ยน ID ไปดูน้ำหนักคนอื่น (Insecure Direct Object Reference)
3. **Data Anonymization:** หาก Admin ดึงรายงานสรุปภาพรวม (เช่น กราฟน้ำหนักเฉลี่ยของคนทั้งระบบ) จะต้องตัดฟิลด์ที่ระบุตัวตนได้ทิ้ง (เช่น ไม่แสดงชื่อหรืออีเมล)
4. **Right to be Forgotten:** ควรใช้ `deleted_at` (Soft Delete) ในตาราง `users` หากผู้ใช้ขอลบบัญชี ระบบควรซ่อนข้อมูลโปรไฟล์ แต่ยังสามารถนำ `user_metrics` ไปทำสถิติรวมแบบไร้ตัวตนได้
