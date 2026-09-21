-- ============================================================
-- tidb-reset.sql — ล้างทุกตารางก่อน import ใหม่ (ใช้กับ deploy/tidb-import.ps1 -Reset)
-- ⚠️ ข้อมูลทั้งหมดในฐานข้อมูลจะหาย — ใช้เฉพาะตอน DB ยังเป็น demo
-- ============================================================
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS status_audit_logs;
DROP TABLE IF EXISTS activity_registrations;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS workout_logs;
DROP TABLE IF EXISTS workout_plan_details;
DROP TABLE IF EXISTS workout_plans;
DROP TABLE IF EXISTS user_metrics;
DROP TABLE IF EXISTS exercise_suggestions;
DROP TABLE IF EXISTS exercises;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;
