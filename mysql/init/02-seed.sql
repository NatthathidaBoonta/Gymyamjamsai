-- ============================================================
-- 02-seed.sql — Gymyamjamsai Seed Data (DML)
-- ------------------------------------------------------------
-- Phase 2: ข้อมูลจำลองสำหรับทดสอบ (รันหลัง 01-schema.sql อัตโนมัติ)
--
-- บัญชีทดสอบ (password ผ่าน bcrypt cost=12):
--   admin@gymyam.com    / Admin@123    → role: admin
--   trainer@gymyam.com  / Trainer@123  → role: trainer
--   member@gymyam.com   / Member@123   → role: member
--
-- ⚠️ Hash เหล่านี้เป็นของบัญชีทดสอบใน dev เท่านั้น — ห้ามใช้ซ้ำใน production
-- ============================================================

-- บังคับ charset ของ client เป็น utf8mb4 ก่อน INSERT
-- (จำเป็น: docker-entrypoint รัน mysql client ด้วย charset เริ่มต้นเป็น latin1
--  ทำให้ข้อความไทยถูกเก็บแบบ double-encoded ถ้าไม่ตั้งค่านี้)
SET NAMES utf8mb4;

-- ------------------------------------------------------------
-- users + user_profiles (3 บัญชี ครบทุก role)
-- ------------------------------------------------------------
INSERT INTO users (id, email, password_hash, role, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin@gymyam.com',   '$2a$12$dpuyM7bxa8OqBd8ZW.bUCeS2IL65wt4.5kFbeQ6rQ9Zd1uiDxA/K6', 'admin',   TRUE),
  ('22222222-2222-2222-2222-222222222222', 'trainer@gymyam.com', '$2a$12$tIPlUC8MRVBZdY74c/WhcuFyU7FPjLwo.v9/ySgRgYCC34OdCQ3SO', 'trainer', TRUE),
  ('33333333-3333-3333-3333-333333333333', 'member@gymyam.com',  '$2a$12$.2tQdz5DKL65BSJVsDlNIeuE/ZJKlFmeqhb/UT2eMXqc1GTGi0vo.', 'member',  TRUE);

INSERT INTO user_profiles (user_id, first_name, last_name, fitness_goal, medical_conditions) VALUES
  ('11111111-1111-1111-1111-111111111111', 'ระบบ',    'ผู้ดูแล',   NULL,                    NULL),
  ('22222222-2222-2222-2222-222222222222', 'เทรนเนอร์', 'ใจดี',     NULL,                    NULL),
  ('33333333-3333-3333-3333-333333333333', 'สมชาย',   'ตั้งใจ',   'ลดน้ำหนัก 5 กิโลกรัม',    'ไม่มีโรคประจำตัว');

-- ------------------------------------------------------------
-- exercises (คลังท่าตัวอย่าง 6 ท่า)
-- ------------------------------------------------------------
INSERT INTO exercises (id, name, category, media_url, instructions) VALUES
  ('e0000001-0000-0000-0000-000000000001', 'Push-up',        'strength', '/exercises/push-up.gif',        'วิดพื้นโดยให้ลำตัวตรง ลงจนอกเกือบแตะพื้นแล้วดันขึ้น'),
  ('e0000002-0000-0000-0000-000000000002', 'Bodyweight Squat','strength', '/exercises/bodyweight-squat.gif','ย่อเข่าลงจนต้นขาขนานพื้น หลังตรง แล้วยืนขึ้น'),
  ('e0000003-0000-0000-0000-000000000003', 'Plank',          'strength', '/exercises/plank.gif',          'ยันตัวด้วยปลายแขน เกร็งหน้าท้อง ลำตัวเป็นเส้นตรง'),
  ('e0000004-0000-0000-0000-000000000004', 'Barbell Deadlift','strength', '/exercises/barbell-deadlift.gif','ยกบาร์เบลจากพื้นโดยใช้สะโพกและขา หลังตรงตลอด'),
  ('e0000005-0000-0000-0000-000000000005', 'Jumping Jack',   'cardio',   '/exercises/jumping-jack.jpg',   'กระโดดพร้อมกางแขนขาออก แล้วกลับสู่ท่าเริ่มต้น'),
  ('e0000006-0000-0000-0000-000000000006', 'Lunge',          'strength', '/exercises/lunge.gif',          'ก้าวขาไปข้างหน้าแล้วย่อเข่าลง สลับซ้ายขวา');

-- ------------------------------------------------------------
-- user_metrics (ประวัติร่างกายของ member — 2 จุดเวลา สำหรับกราฟ)
-- ------------------------------------------------------------
INSERT INTO user_metrics (id, user_id, weight_kg, height_cm, bmi, recorded_at) VALUES
  ('m0000001-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 80.00, 175.00, 26.12, '2026-06-01 08:00:00'),
  ('m0000002-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 78.50, 175.00, 25.63, '2026-07-01 08:00:00');

-- ------------------------------------------------------------
-- workout_plans + workout_plan_details + workout_logs (ของ member)
-- ------------------------------------------------------------
INSERT INTO workout_plans (id, user_id, status, start_date, end_date) VALUES
  ('p0000001-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'active', '2026-07-01', '2026-07-28');

INSERT INTO workout_plan_details (id, plan_id, exercise_id, target_sets, target_reps, target_weight, day_of_week) VALUES
  ('d0000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000001', 3, 15, NULL,  'Monday'),
  ('d0000002-0000-0000-0000-000000000002', 'p0000001-0000-0000-0000-000000000001', 'e0000002-0000-0000-0000-000000000002', 3, 20, NULL,  'Monday');

INSERT INTO workout_logs (id, plan_detail_id, actual_sets, actual_reps, actual_weight, logged_at) VALUES
  ('l0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 3, 15, NULL, '2026-07-06 18:30:00'),
  ('l0000002-0000-0000-0000-000000000002', 'd0000002-0000-0000-0000-000000000002', 3, 18, NULL, '2026-07-06 18:45:00');

-- ------------------------------------------------------------
-- activities + activity_registrations (คลาสของ trainer + member ลงทะเบียน)
-- ------------------------------------------------------------
INSERT INTO activities (id, trainer_id, title, description, max_participants, start_datetime, status) VALUES
  ('a0000001-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'คลาสคาร์ดิโอเช้าวันเสาร์', 'คลาสคาร์ดิโอสำหรับผู้เริ่มต้น เผาผลาญไขมัน 45 นาที', 20, '2026-07-25 07:00:00', 'open');

INSERT INTO activity_registrations (id, activity_id, user_id, status, is_attended) VALUES
  ('r0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'registered', FALSE);

-- ------------------------------------------------------------
-- status_audit_logs (ตัวอย่างประวัติการเปลี่ยนสถานะแผน)
-- ------------------------------------------------------------
INSERT INTO status_audit_logs (id, entity_type, entity_id, old_status, new_status, changed_by_user_id) VALUES
  ('s0000001-0000-0000-0000-000000000001', 'workout_plan', 'p0000001-0000-0000-0000-000000000001', 'pending', 'active', '33333333-3333-3333-3333-333333333333');
