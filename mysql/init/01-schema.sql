-- ============================================================
-- 01-schema.sql — Gymyamjamsai Database Schema (DDL)
-- ------------------------------------------------------------
-- Phase 2: Database Schema and Seed Data
-- โครงสร้างตารางตาม ERD ใน docs/planning/05-database-design.md (10 ตาราง)
-- รันอัตโนมัติครั้งแรกที่ MySQL container ถูกสร้าง
-- (mount ไว้ที่ /docker-entrypoint-initdb.d ใน docker-compose.yml)
--
-- Charset: utf8mb4 / utf8mb4_unicode_ci เพื่อรองรับภาษาไทย
-- Primary Key: UUID v4 (VARCHAR(36)) ตามหลัก Security ใน architecture.md
-- ============================================================

-- บังคับ charset ของ client เป็น utf8mb4 (ดูเหตุผลใน 02-seed.sql)
SET NAMES utf8mb4;

-- ------------------------------------------------------------
-- 1. users — บัญชีผู้ใช้และ Role (Authentication)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(36)  PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('member', 'trainer', 'admin') NOT NULL DEFAULT 'member',
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  deleted_at    DATETIME     NULL,              -- Soft delete (PDPA: Right to be Forgotten)
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. user_profiles — ข้อมูลส่วนตัว/เป้าหมาย (1:1 กับ users)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id            VARCHAR(36)  PRIMARY KEY,   -- 1:1 กับ users
  first_name         VARCHAR(100) NULL,
  last_name          VARCHAR(100) NULL,
  fitness_goal       VARCHAR(255) NULL,          -- เป้าหมาย เช่น ลดน้ำหนัก, เพิ่มกล้ามเนื้อ
  medical_conditions TEXT         NULL,          -- โรคประจำตัว (Sensitive Data)
  created_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_profiles_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. exercises — คลังท่าออกกำลังกายหลัก (Master Data)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exercises (
  id           VARCHAR(36)  PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  category     VARCHAR(50)  NULL,                -- cardio, strength, ฯลฯ
  media_url    VARCHAR(500) NULL,
  instructions TEXT         NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_exercises_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4. user_metrics — ประวัติน้ำหนัก/ส่วนสูง (Time-series สำหรับกราฟ)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_metrics (
  id          VARCHAR(36)  PRIMARY KEY,
  user_id     VARCHAR(36)  NOT NULL,
  weight_kg   DECIMAL(5,2) NULL,                 -- DECIMAL(5,2) ตาม risk note (11-plan)
  height_cm   DECIMAL(5,2) NULL,
  bmi         DECIMAL(5,2) NULL,
  recorded_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_metrics_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_metrics_user_time (user_id, recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5. workout_plans — Header ของแผนออกกำลังกายในแต่ละวงรอบ
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workout_plans (
  id         VARCHAR(36) PRIMARY KEY,
  user_id    VARCHAR(36) NOT NULL,
  status     ENUM('pending', 'active', 'adjusted') NOT NULL DEFAULT 'pending',
  start_date DATE        NULL,
  end_date   DATE        NULL,
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_workout_plans_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_workout_plans_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 6. workout_plan_details — รายละเอียดท่าในแต่ละแผน
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workout_plan_details (
  id            VARCHAR(36)  PRIMARY KEY,
  plan_id       VARCHAR(36)  NOT NULL,
  exercise_id   VARCHAR(36)  NOT NULL,
  target_sets   INT          NULL,
  target_reps   INT          NULL,
  target_weight DECIMAL(6,2) NULL,
  day_of_week   VARCHAR(20)  NULL,               -- Monday, Tuesday, ฯลฯ
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_plan_details_plan
    FOREIGN KEY (plan_id) REFERENCES workout_plans(id) ON DELETE CASCADE,
  CONSTRAINT fk_plan_details_exercise
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
  INDEX idx_plan_details_plan (plan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 7. workout_logs — ผลการเล่นจริง (Actual vs Target)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workout_logs (
  id             VARCHAR(36)  PRIMARY KEY,
  plan_detail_id VARCHAR(36)  NOT NULL,
  actual_sets    INT          NULL,
  actual_reps    INT          NULL,
  actual_weight  DECIMAL(6,2) NULL,
  logged_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_workout_logs_plan_detail
    FOREIGN KEY (plan_detail_id) REFERENCES workout_plan_details(id) ON DELETE CASCADE,
  INDEX idx_workout_logs_plan_detail (plan_detail_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 8. activities — คลาส/กิจกรรมที่ Trainer สร้าง
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activities (
  id               VARCHAR(36)  PRIMARY KEY,
  trainer_id       VARCHAR(36)  NOT NULL,
  title            VARCHAR(255) NOT NULL,
  description      TEXT         NULL,
  max_participants INT          NOT NULL DEFAULT 0,
  start_datetime   DATETIME     NULL,
  status           ENUM('open', 'full', 'closed') NOT NULL DEFAULT 'open',
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_activities_trainer
    FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_activities_trainer (trainer_id),
  INDEX idx_activities_start (start_datetime)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 9. activity_registrations — การลงทะเบียนเข้าร่วมคลาส
--    UNIQUE(activity_id, user_id) กันจองซ้ำ (รองรับ Capacity logic Phase 6)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_registrations (
  id          VARCHAR(36) PRIMARY KEY,
  activity_id VARCHAR(36) NOT NULL,
  user_id     VARCHAR(36) NOT NULL,
  status      ENUM('registered', 'cancelled') NOT NULL DEFAULT 'registered',
  is_attended BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_registrations_activity
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  CONSTRAINT fk_registrations_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uq_registration_activity_user UNIQUE (activity_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 10. status_audit_logs — ประวัติการเปลี่ยนสถานะ (Log/History)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS status_audit_logs (
  id                 VARCHAR(36)  PRIMARY KEY,
  entity_type        VARCHAR(50)  NOT NULL,      -- 'workout_plan', 'activity', 'user', ฯลฯ
  entity_id          VARCHAR(36)  NOT NULL,
  old_status         VARCHAR(50)  NULL,
  new_status         VARCHAR(50)  NULL,
  changed_by_user_id VARCHAR(36)  NULL,
  created_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_logs_user
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_audit_entity (entity_type, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 11. notifications — การแจ้งเตือน (Phase 12: Notification & SLA)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id          VARCHAR(36)  PRIMARY KEY,
  user_id     VARCHAR(36)  NOT NULL,
  title       VARCHAR(255) NOT NULL,
  message     TEXT         NOT NULL,
  type        VARCHAR(50)  NOT NULL,          -- เช่น 'activity', 'sla_warning'
  related_id  VARCHAR(36)  NULL,              -- อ้างอิง activity_id หรืออื่นๆ
  is_read     BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notifications_user_read (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
