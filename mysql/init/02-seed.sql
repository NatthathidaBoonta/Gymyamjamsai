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
-- exercises (คลังท่าออกกำลังกาย 20 ท่า)
-- แบ่งเป็น 3 categories: strength, cardio, flexibility
-- ------------------------------------------------------------
INSERT INTO exercises (id, name, category, media_url, instructions) VALUES
  ('e0000000-0000-0000-0000-000000000003', 'Arnold-Press', 'weight', '/exercises/arnold-press.gif', '[Push (Shoulders, Triceps)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Arnold-Press)'),
  ('e0000000-0000-0000-0000-000000000004', 'Barbell Curl', 'weight', '/exercises/barbell-curl.gif', '[Pull (Biceps)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Barbell Curl)'),
  ('e0000000-0000-0000-0000-000000000005', 'Bench Press', 'weight', '/exercises/bench-press.gif', '[Push (Chest, Shoulders, Triceps)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Bench Press)'),
  ('e0000000-0000-0000-0000-000000000006', 'Bulgarian Split Squat', 'calisthenics', '/exercises/bulgarian-split-squat.gif', '[Legs (Quads, Glutes)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Bulgarian Split Squat)'),
  ('e0000000-0000-0000-0000-000000000007', 'Calf Raise', 'weight', '/exercises/calf-raise.gif', '[Legs (Calves)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Calf Raise)'),
  ('e0000000-0000-0000-0000-000000000008', 'Chest Fly', 'weight', '/exercises/chest-fly.gif', '[Push (Chest)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Chest Fly)'),
  ('e0000000-0000-0000-0000-000000000009', 'Chin-Up', 'calisthenics', '/exercises/chin-up.gif', '[Pull (Biceps, Back)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Chin-Up)'),
  ('e0000000-0000-0000-0000-000000000010', 'Deadlift', 'weight', '/exercises/deadlift.gif', '[Legs (Hamstrings, Glutes, Back)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Deadlift)'),
  ('e0000000-0000-0000-0000-000000000011', 'Diamond Push-Up', 'calisthenics', '/exercises/diamond-push-up.gif', '[Push (Triceps, Chest)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Diamond Push-Up)'),
  ('e0000000-0000-0000-0000-000000000012', 'Dips', 'calisthenics', '/exercises/dips.gif', '[Push (Chest, Triceps)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Dips)'),
  ('e0000000-0000-0000-0000-000000000013', 'Dragon Flag', 'calisthenics', '/exercises/dragon-flag.gif', '[Legs (Core)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Dragon Flag)'),
  ('e0000000-0000-0000-0000-000000000014', 'Dumbbell Row', 'weight', '/exercises/dumbbell-row.gif', '[Pull (Back, Biceps)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Dumbbell Row)'),
  ('e0000000-0000-0000-0000-000000000015', 'Hammer Curl', 'weight', '/exercises/hammer-curl.gif', '[Pull (Biceps)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Hammer Curl)'),
  ('e0000000-0000-0000-0000-000000000016', 'Incline Dumbbell Bench Press', 'weight', '/exercises/incline-dumbbell-bench-press.gif', '[Push (Chest, Shoulders, Triceps)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Incline Dumbbell Bench Press)'),
  ('e0000000-0000-0000-0000-000000000017', 'Lat Pulldown', 'weight', '/exercises/lat-pulldown.gif', '[Pull (Back, Biceps)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Lat Pulldown)'),
  ('e0000000-0000-0000-0000-000000000018', 'Lateral Raise', 'weight', '/exercises/lateral-raise.gif', '[Push (Shoulders)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Lateral Raise)'),
  ('e0000000-0000-0000-0000-000000000019', 'Leg Curl', 'weight', '/exercises/leg-curl.gif', '[Legs (Hamstrings)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Leg Curl)'),
  ('e0000000-0000-0000-0000-000000000020', 'Leg Raise', 'calisthenics', '/exercises/leg-raise.gif', '[Legs (Core)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Leg Raise)'),
  ('e0000000-0000-0000-0000-000000000021', 'Lunges', 'weight', '/exercises/lunges.gif', '[Legs (Quads, Glutes)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Lunges)'),
  ('e0000000-0000-0000-0000-000000000022', 'Muscle Up', 'calisthenics', '/exercises/muscle-up.gif', '[Pull/Push (Back, Triceps, Chest)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Muscle Up)'),
  ('e0000000-0000-0000-0000-000000000023', 'Nordic Hamstring Curl', 'calisthenics', '/exercises/nordic-hamstring-curl.gif', '[Legs (Hamstrings)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Nordic Hamstring Curl)'),
  ('e0000000-0000-0000-0000-000000000024', 'One Arm Pull-Up', 'calisthenics', '/exercises/one-arm-pull-up.gif', '[Pull (Back, Biceps)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า One Arm Pull-Up)'),
  ('e0000000-0000-0000-0000-000000000025', 'Plank', 'calisthenics', '/exercises/plank.gif', '[Legs (Core)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Plank)'),
  ('e0000000-0000-0000-0000-000000000026', 'Pull-ups', 'calisthenics', '/exercises/pull-ups.gif', '[Pull (Back, Biceps)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Pull-ups)'),
  ('e0000001-0000-0000-0000-000000000001', 'Push-ups', 'calisthenics', '/exercises/push-ups.gif', '[Push (Chest, Shoulders, Triceps)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Push-ups)'),
  ('e0000000-0000-0000-0000-000000000027', 'Rear Delt Machine Fly', 'weight', '/exercises/rear-delt-machine-fly.gif', '[Pull (Rear Delts)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Rear Delt Machine Fly)'),
  ('e0000000-0000-0000-0000-000000000028', 'Reverse Barbell Curl', 'weight', '/exercises/reverse-barbell-curl.gif', '[Pull (Forearms, Biceps)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Reverse Barbell Curl)'),
  ('e0000000-0000-0000-0000-000000000029', 'Russian Twist', 'weight', '/exercises/russian-twist.gif', '[Legs (Core, Obliques)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Russian Twist)'),
  ('e0000000-0000-0000-0000-000000000030', 'Seated Cable Row', 'weight', '/exercises/seated-cable-row.gif', '[Pull (Back)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Seated Cable Row)'),
  ('e0000000-0000-0000-0000-000000000031', 'Shoulder Press', 'weight', '/exercises/shoulder-press.gif', '[Push (Shoulders)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Shoulder Press)'),
  ('e0000000-0000-0000-0000-000000000032', 'Shrimp Squat', 'calisthenics', '/exercises/shrimp-squat.gif', '[Legs (Quads)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Shrimp Squat)'),
  ('e0000000-0000-0000-0000-000000000033', 'Skullcrusher', 'weight', '/exercises/skullcrusher.gif', '[Push (Triceps)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Skullcrusher)'),
  ('e0000002-0000-0000-0000-000000000002', 'Squats', 'weight', '/exercises/squats.gif', '[Legs (Quads, Glutes)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Squats)'),
  ('e0000000-0000-0000-0000-000000000034', 'Sumo Deadlift', 'weight', '/exercises/sumo-deadlift.gif', '[Legs (Hamstrings, Glutes)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Sumo Deadlift)'),
  ('e0000000-0000-0000-0000-000000000035', 'Toes to Bar', 'calisthenics', '/exercises/toes-to-bar.gif', '[Legs (Core)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Toes to Bar)'),
  ('e0000000-0000-0000-0000-000000000036', 'Triceps Dips', 'weight', '/exercises/triceps-dips.gif', '[Push (Triceps, Chest)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Triceps Dips)'),
  ('e0000000-0000-0000-0000-000000000037', 'Triceps Pushdown', 'weight', '/exercises/triceps-pushdown.gif', '[Push (Triceps)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Triceps Pushdown)'),
  ('e0000000-0000-0000-0000-000000000038', 'Wrist Curl', 'weight', '/exercises/wrist-curl.gif', '[Pull (Forearms)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Wrist Curl)');

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
