/**
 * cors.js — กติกา origin ที่อนุญาต (ใช้ร่วมกันระหว่าง REST และ Socket.IO)
 *
 * อนุญาต: ไม่มี Origin (curl/เซิร์ฟเวอร์), same-origin, FRONTEND_ORIGIN (หลายค่าคั่น ,), RENDER_EXTERNAL_URL,
 *          *.vercel.app เมื่อ ALLOW_VERCEL_PREVIEWS=true,
 *          และ http://localhost:<port> ทุกพอร์ต (Vite เปลี่ยนพอร์ตเองเมื่อชน)
 */

function normalize(url) {
  return (url || '').trim().replace(/\/+$/, '');
}

function configuredOrigins() {
  // FRONTEND_ORIGIN รับหลายค่าคั่นด้วย , เช่น "https://app.vercel.app,https://gym.example.com"
  const fromEnv = (process.env.FRONTEND_ORIGIN || '').split(',');
  return [...fromEnv, process.env.RENDER_EXTERNAL_URL, 'http://localhost:5173'].map(normalize).filter(Boolean);
}

/** preview deployment ของ Vercel (https://<branch>-<hash>-<team>.vercel.app) — เปิดด้วย ALLOW_VERCEL_PREVIEWS=true */
function isVercelPreview(origin) {
  return process.env.ALLOW_VERCEL_PREVIEWS === 'true' && /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin);
}

/**
 * @param {string|undefined} origin  header Origin ของ request
 * @param {string} [self]            origin ของเซิร์ฟเวอร์เอง (protocol://host) ถ้ารู้
 */
function isOriginAllowed(origin, self) {
  if (!origin) return true;
  const o = normalize(origin);
  if (self && o === normalize(self)) return true;
  if (configuredOrigins().includes(o)) return true;
  if (isVercelPreview(o)) return true;
  return /^http:\/\/localhost:\d+$/.test(o);
}

module.exports = { isOriginAllowed, configuredOrigins };
