const cron = require('node-cron');
const { pool } = require('../database');
const notificationService = require('../modules/notification/notification.service');

/**
 * ส่งแจ้งเตือน SLA ให้กับ User ที่ขาดการออกกำลังกาย
 * @param {number} days จำนวนวันที่ขาด
 */
async function checkAndNotifyInactiveUsers(days) {
  try {
    const query = `
      SELECT u.id, u.email
      FROM users u
      LEFT JOIN (
          SELECT wp.user_id, MAX(wl.logged_at) AS last_log
          FROM workout_plans wp
          JOIN workout_plan_details wpd ON wp.id = wpd.plan_id
          JOIN workout_logs wl ON wpd.id = wl.plan_detail_id
          GROUP BY wp.user_id
      ) latest_logs ON u.id = latest_logs.user_id
      WHERE u.role = 'member'
        AND u.is_active = TRUE
        AND DATEDIFF(CURDATE(), DATE(COALESCE(latest_logs.last_log, u.created_at))) = ?;
    `;
    const [inactiveUsers] = await pool.query(query, [days]);

    for (const user of inactiveUsers) {
      await notificationService.notify(
        user.id,
        `⚠️ แจ้งเตือนการขาดหาย`,
        `คุณไม่ได้บันทึกการออกกำลังกายมาเป็นเวลา ${days} วันแล้ว อย่าลืมกลับมาออกกำลังกายเพื่อสุขภาพที่ดีนะครับ!`,
        'sla_warning',
        null
      );
      console.log(`[Cron] Sent ${days}-day SLA warning to user: ${user.id}`);
    }
  } catch (error) {
    console.error(`[Cron] Error checking inactive users (${days} days):`, error);
  }
}

/**
 * เริ่มทำงาน Cron Jobs ทั้งหมด
 */
function startCronJobs() {
  console.log('[Cron] Starting cron jobs...');

  // รันทุกๆ วันเวลา 00:01 น.
  cron.schedule('1 0 * * *', async () => {
    console.log('[Cron] Running daily SLA check...');
    await checkAndNotifyInactiveUsers(3);
    await checkAndNotifyInactiveUsers(7);
    console.log('[Cron] Daily SLA check completed.');
  });
}

/**
 * ฟังก์ชันสำหรับทดสอบ (Manual Trigger)
 */
async function testCronTrigger() {
  console.log('[Cron] Manual Trigger Started');
  await checkAndNotifyInactiveUsers(3);
  await checkAndNotifyInactiveUsers(7);
  console.log('[Cron] Manual Trigger Completed');
}

module.exports = {
  startCronJobs,
  testCronTrigger
};
