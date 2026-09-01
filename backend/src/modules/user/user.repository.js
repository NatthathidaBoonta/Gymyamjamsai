const { pool } = require('../../database');

async function getProfileByUserId(userId) {
  // ดึงข้อมูล profile พร้อมกับ metric ล่าสุด
  const query = `
    SELECT 
      u.email,
      p.first_name,
      p.last_name,
      p.fitness_goal,
      p.medical_conditions,
      m.weight_kg,
      m.height_cm,
      m.bmi
    FROM users u
    LEFT JOIN user_profiles p ON u.id = p.user_id
    LEFT JOIN (
      SELECT user_id, weight_kg, height_cm, bmi 
      FROM user_metrics 
      WHERE user_id = ? 
      ORDER BY recorded_at DESC 
      LIMIT 1
    ) m ON u.id = m.user_id
    WHERE u.id = ?
  `;
  const [rows] = await pool.query(query, [userId, userId]);
  return rows[0] || null;
}

async function upsertProfile(userId, profileData) {
  const { firstName, lastName, fitnessGoal, medicalConditions } = profileData;
  const query = `
    INSERT INTO user_profiles (user_id, first_name, last_name, fitness_goal, medical_conditions)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      first_name = VALUES(first_name),
      last_name = VALUES(last_name),
      fitness_goal = VALUES(fitness_goal),
      medical_conditions = VALUES(medical_conditions)
  `;
  await pool.query(query, [userId, firstName, lastName, fitnessGoal, medicalConditions]);
}

async function insertMetric(metricData) {
  const { id, userId, weightKg, heightCm, bmi } = metricData;
  const query = `
    INSERT INTO user_metrics (id, user_id, weight_kg, height_cm, bmi)
    VALUES (?, ?, ?, ?, ?)
  `;
  await pool.query(query, [id, userId, weightKg, heightCm, bmi]);
}

module.exports = {
  getProfileByUserId,
  upsertProfile,
  insertMetric,
};
