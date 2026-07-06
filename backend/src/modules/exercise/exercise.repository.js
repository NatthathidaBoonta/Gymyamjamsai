/**
 * src/modules/exercise/exercise.repository.js
 *
 * Repository สำหรับโมดูล Exercise (คลังท่าออกกำลังกาย)
 * จัดการ Database Operations ผ่าน mysql2 (raw SQL)
 */

const { v4: uuidv4 } = require('uuid');
const pool = require('../../database');

const SELECT_FIELDS = `id, name, target_muscle AS targetMuscle, equipment, category, difficulty, media_url AS mediaUrl, description,
                       created_at AS createdAt, updated_at AS updatedAt`;

/**
 * ดึงรายการท่าออกกำลังกายทั้งหมด รองรับ filter
 * @param {{ targetMuscle?: string, equipment?: string, category?: string, difficulty?: string, search?: string }} filters
 * @returns {Promise<Object[]>}
 */
const findAll = async ({ targetMuscle, equipment, category, difficulty, search } = {}) => {
  let sql = `SELECT ${SELECT_FIELDS} FROM exercises WHERE 1=1`;
  const params = [];

  if (targetMuscle) {
    sql += ' AND target_muscle = ?';
    params.push(targetMuscle);
  }
  if (equipment) {
    sql += ' AND equipment = ?';
    params.push(equipment);
  }
  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (difficulty) {
    sql += ' AND difficulty = ?';
    params.push(difficulty);
  }
  if (search) {
    sql += ' AND name LIKE ?';
    params.push(`%${search}%`);
  }
  sql += ' ORDER BY name ASC';

  const [rows] = await pool.query(sql, params);
  return rows;
};

/**
 * ค้นหาท่าออกกำลังกายด้วย ID
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
const findById = async (id) => {
  const [rows] = await pool.query(`SELECT ${SELECT_FIELDS} FROM exercises WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
};

/**
 * สร้างท่าออกกำลังกายใหม่
 * @param {{ name: string, targetMuscle?: string, equipment?: string, category?: string, difficulty?: string, mediaUrl?: string, description?: string }} data
 * @returns {Promise<Object>}
 */
const create = async ({ name, targetMuscle, equipment, category, difficulty, mediaUrl, description }) => {
  const id = uuidv4();
  await pool.query(
    `INSERT INTO exercises (id, name, target_muscle, equipment, category, difficulty, media_url, description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, targetMuscle || null, equipment || null, category || null, difficulty || null, mediaUrl || null, description || null]
  );
  return findById(id);
};

/**
 * แก้ไขท่าออกกำลังกาย
 * @param {string} id
 * @param {{ name: string, targetMuscle?: string, equipment?: string, category?: string, difficulty?: string, mediaUrl?: string, description?: string }} data
 * @returns {Promise<Object>}
 */
const update = async (id, { name, targetMuscle, equipment, category, difficulty, mediaUrl, description }) => {
  await pool.query(
    `UPDATE exercises SET name = ?, target_muscle = ?, equipment = ?, category = ?, difficulty = ?, media_url = ?, description = ?
     WHERE id = ?`,
    [name, targetMuscle || null, equipment || null, category || null, difficulty || null, mediaUrl || null, description || null, id]
  );
  return findById(id);
};

/**
 * ลบท่าออกกำลังกาย
 * @param {string} id
 */
const remove = async (id) => {
  await pool.query('DELETE FROM exercises WHERE id = ?', [id]);
};

module.exports = { findAll, findById, create, update, remove };
