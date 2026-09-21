-- ============================================================
-- 03-course-chat.sql — คอร์สแบบต้องอนุมัติ + แชทกลุ่มของคอร์ส (Phase 16)
-- ------------------------------------------------------------
-- รันหลัง 02-seed.sql (แปลง registered → approved) และก่อน 04-sample-accounts.sql ที่ใช้ค่า approved แล้ว
-- ใส่ลง DB เดิม: docker exec -i gymyamjamsai-mysql mysql -ugymyam_user -pgymyam_password gymyamjamsai < mysql/init/03-course-chat.sql
--
-- สถานะการจองใหม่:  pending (รอเทรนเนอร์อนุมัติ) → approved | rejected · cancelled (สมาชิกยกเลิกเอง)
-- 'registered' เดิม = approved
-- ที่นั่ง: นับ pending + approved (จองแล้วถือว่ากันที่นั่งไว้จนกว่าจะถูกปฏิเสธ/ยกเลิก)
-- ============================================================

SET NAMES utf8mb4;

-- 1) ขยาย ENUM ให้รับค่าใหม่ก่อน (ยังคง 'registered' ไว้ชั่วคราวเพื่อแปลงข้อมูล)
ALTER TABLE activity_registrations
  MODIFY COLUMN status ENUM('registered', 'pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending';

-- 2) แปลงข้อมูลเดิม
UPDATE activity_registrations SET status = 'approved' WHERE status = 'registered';

-- 3) ตัด 'registered' ออกจาก ENUM — เหลือชุดเดียวที่โค้ดใช้
ALTER TABLE activity_registrations
  MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending';

-- 4) ข้อความในห้องแชทของคอร์ส (1 ห้อง = 1 คอร์ส สมาชิกที่ approved + เทรนเนอร์เจ้าของ)
CREATE TABLE IF NOT EXISTS chat_messages (
  id          VARCHAR(36)  PRIMARY KEY,
  activity_id VARCHAR(36)  NOT NULL,
  sender_id   VARCHAR(36)  NOT NULL,
  message     TEXT         NOT NULL,             -- ≤ 2000 ตัวอักษร (ตรวจใน service)
  created_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),   -- มิลลิวินาที ใช้เป็น cursor
  CONSTRAINT fk_chat_messages_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_messages_sender   FOREIGN KEY (sender_id)   REFERENCES users(id)      ON DELETE CASCADE,
  INDEX idx_chat_messages_activity_time (activity_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
