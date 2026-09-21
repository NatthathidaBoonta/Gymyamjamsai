/**
 * cors.js — กติกา origin ที่อนุญาต (ใช้ร่วมกันระหว่าง REST และ Socket.IO)
 *
 * อนุญาต: ไม่มี Origin (curl/เซิร์ฟเวอร์), same-origin, FRONTEND_ORIGIN, RENDER_EXTERNAL_URL,
 *          และ http://localhost:<port> ทุกพอร์ต (Vite เปลี่ยนพอร์ตเองเมื่อชน)
 */

function normalize(url) {
  return (url || '').trim().replace(/\/+$/, '');
}

function configuredOrigins() {
  return [process.env.FRONTEND_ORIGIN, process.env.RENDER_EXTERNAL_URL, 'http://localhost:5173']
    .map(normalize)
    .filter(Boolean);
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
  return /^http:\/\/localhost:\d+$/.test(o);
}

module.exports = { isOriginAllowed, configuredOrigins };
