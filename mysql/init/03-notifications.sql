-- ============================================================
-- 03-notifications.sql — Notifications Table (Phase 12)
-- ============================================================

SET NAMES utf8mb4;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id            VARCHAR(36)  PRIMARY KEY,
  user_id       VARCHAR(36)  NOT NULL,
  title         VARCHAR(255) NOT NULL,
  message       TEXT         NOT NULL,
  type          ENUM('activity', 'workout', 'system', 'reminder') NOT NULL DEFAULT 'system',
  related_id    VARCHAR(36)  NULL,                    -- FK to activity/workout
  is_read       BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notifications_user_read (user_id, is_read),
  INDEX idx_notifications_user_created (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
