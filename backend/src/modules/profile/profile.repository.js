/**
 * src/modules/profile/profile.repository.js
 *
 * Repository สำหรับโมดูล Profile
 * จัดการ Database Operations ผ่าน mysql2 (raw SQL)
 */

const { v4: uuidv4 } = require('uuid');
const pool = require('../../database');

/**
 * ค้นหา Profile ด้วย User ID
 * @param {string} userId
 * @returns {Promise<Object|null>} profile or null
 */
const findByUserId = async (userId) => {
  const [rows] = await pool.query(
    `SELECT id, user_id AS userId, weight_kg AS weightKg, height_cm AS heightCm, age, gender, goal,
            fitness_level AS fitnessLevel, created_at AS createdAt, updated_at AS updatedAt
     FROM profiles WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
};

/**
 * สร้างหรืออัปเดต Profile ของ User (upsert)
 * @param {string} userId
 * @param {{ weightKg: number, heightCm: number, age: number, gender?: string, goal: string, fitnessLevel: string }} data
 * @returns {Promise<Object>} profile
 */
const upsertProfile = async (userId, { weightKg, heightCm, age, gender, goal, fitnessLevel }) => {
  const existing = await findByUserId(userId);

  if (existing) {
    await pool.query(
      `UPDATE profiles SET weight_kg = ?, height_cm = ?, age = ?, gender = ?, goal = ?, fitness_level = ?
       WHERE user_id = ?`,
      [weightKg, heightCm, age, gender || null, goal, fitnessLevel, userId]
    );
  } else {
    await pool.query(
      `INSERT INTO profiles (id, user_id, weight_kg, height_cm, age, gender, goal, fitness_level)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), userId, weightKg, heightCm, age, gender || null, goal, fitnessLevel]
    );
  }

  return findByUserId(userId);
};

module.exports = { findByUserId, upsertProfile };
