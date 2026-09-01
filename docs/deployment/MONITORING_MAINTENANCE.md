# Monitoring and Maintenance Plan: Gymyamjamsai

เอกสารฉบับนี้จัดทำขึ้นโดยทีม Site Reliability Engineering (SRE) เพื่อเป็นคู่มือในการตรวจสอบการทำงาน (Monitoring) และบำรุงรักษาระบบ (Maintenance) ประจำวัน สำหรับโครงสร้างแบบ Single-container (บน Railway) หรือ Docker Compose (สำหรับ On-premise) ให้เหมาะสมกับธุรกิจขนาดเล็กถึงขนาดกลาง (SME)

---

## 1. Monitoring Goals
- ตรวจจับปัญหาระบบล่ม (Downtime) ได้ภายใน 5 นาที
- ทราบถึงข้อผิดพลาด (Errors/Bugs) ก่อนที่ผู้ใช้งานจะรายงาน
- ป้องกันปัญหาพื้นที่เต็ม (Disk Full) ล่วงหน้า
- มั่นใจได้ว่าการสำรองข้อมูล (Backup) ถูกสร้างขึ้นอย่างสมบูรณ์ในทุกๆ วัน

## 2. Services to Monitor
- **App Service:** Node.js Backend (เสิร์ฟทั้ง API และ Frontend แบบ SPA)
- **Database Service:** MySQL 8

---

## 3. Log Monitoring
การตรวจสอบบันทึกการทำงานของระบบ:
- **Production (Railway):** ให้ล็อกอินเข้าสู่ [Railway Dashboard](https://railway.app) > เลือก Project > เลือก Service > ไปที่แท็บ **View Logs** เพื่อดูบันทึกแบบ Real-time
- **Railway CLI (Alternative):** รันคำสั่ง `railway logs`
- **Development (Local):** ใช้คำสั่ง `docker-compose logs -f` หรือดูเจาะจงเฉพาะ Backend `docker logs -f gymyamjamsai-backend`

## 4. Error Monitoring
เนื่องจากระบบมี Central Error Handler คอยดักจับ 4xx และ 5xx ไว้แล้ว:
- หากพบบรรทัดที่มีข้อความ `[Error]` ใน Logs ให้ตรวจสอบ Endpoint ที่เกิดปัญหา
- **(Advanced สำหรับอนาคต):** สามารถเชื่อมต่อกับบริการเช่น **Sentry** (นำ DSN ใส่เข้า `server.js`) เพื่อให้เมื่อเกิด Error ระดับ 500 ระบบแจ้งเตือนไปยังแชนเนล Slack ของทีมงานทันที

## 5. Database Monitoring
- **Railway MySQL:** สามารถดูสถิติ (Metrics) พื้นฐาน ได้แก่ Memory usage, CPU usage, และ Network Egress ได้ในหน้า Dashboard ของ Database
- **Slow Query:** หากแอปหน่วงผิดปกติ สามารถตั้งค่าให้ MySQL บันทึก Slow Query Log ได้ (เปิด `long_query_time = 2`)

## 6. Disk Usage Monitoring
- **Railway Ephemeral Storage:** ในสถาปัตยกรรม Railway (Free/Hobby) ดิสก์มีพื้นที่จำกัดและหายไปเมื่อ Deploy ใหม่ พื้นที่ส่วนใหญ่ถูกใช้กับ Database
- **Volume Storage (uploads/):** หากมีการผูก Volume ไว้สำหรับเก็บไฟล์ ต้องเช็คขนาด Volume เป็นระยะผ่าน Railway Settings
- *สัญญาณอันตราย:* หาก Disk ของ Database ใกล้ถึงขอบเขตโควต้า (เช่น 90% ของ 10GB) ระบบจะปฏิเสธการ Write ทันที ต้องมีแผนขยาย (Upgrade) ก่อนถึงจุดนั้น

## 7. Backup Monitoring
- **ตรวจสอบทางสายตา (Visual Check):** แอดมินต้องเปิดดูโฟลเดอร์หรือ Cloud Storage (เช่น S3) อย่างน้อยสัปดาห์ละ 1 ครั้ง ว่ามีไฟล์นามสกุล `.sql` ถูกสร้างขึ้นตามเวลาหรือไม่
- **ขนาดไฟล์:** สังเกตขนาดไฟล์ Backup ว่ามี "ขนาดโตขึ้นเรื่อยๆ" อย่างสมเหตุสมผลหรือไม่ หากขนาดไฟล์เหลือ 0KB หรือขนาดเล็กลงผิดปกติ แสดงว่าการเชื่อมต่อกับฐานข้อมูลล้มเหลว

---

## 8. Basic Health Check
ระบบได้รับการติดตั้งจุดตรวจสอบ Uptime เชิงรุกไว้แล้ว:
- **Endpoint:** `GET /api/health`
- **เครื่องมือที่แนะนำ:** สมัครใช้งาน [UptimeRobot](https://uptimerobot.com) (ฟรี) นำ URL `https://your-domain.com/api/health` ไปตั้งค่าให้ตรวจสอบทุกๆ 5 นาที หากระบบ Down จะมีอีเมลแจ้งเตือนมายังทีม SRE ทันที

---

## 9. Routine Maintenance Tasks
รอบเวลาการบำรุงรักษา:
- **รายสัปดาห์:**
  - เข้าไปดู Railway Metrics ว่ากราฟ Memory ทะลุเกินโควต้าหรือไม่
  - ตรวจสอบขนาด Backup
- **รายเดือน:**
  - สรุปตัวเลขผู้ใช้งาน (Admin Dashboard) หากมีผู้ใช้งานแอคทีฟเพิ่มขึ้นเกิน 50% อาจพิจารณา Scale up RAM หรือ CPU ของ Railway Service
- **ทุกๆ 6 เดือน (Recovery Test):**
  - นำไฟล์ Database Backup มาลองกู้คืนระบบในเครื่อง Test (Disaster Recovery Drill)

## 10. Update Procedure
ขั้นตอนการนำเวอร์ชันใหม่ขึ้น Production อย่างปลอดภัย:
1. ทำการทดสอบโค้ดบน Dev Environment ให้ผ่าน 100%
2. รวม (Merge) โค้ดเข้าสู่กิ่งหลัก (เช่น `main` หรือ `production`)
3. **Railway Auto-Deploy:** เมื่อตรวจพบการอัปเดต Railway จะสั่ง Build ใหม่แบบ **Zero-Downtime** (Container เก่าจะยังรันอยู่จนกว่า Container ใหม่จะบิลด์ผ่านแล้วสลับสับเปลี่ยน)
4. เมื่ออัปเดตเสร็จ ให้ยิง `GET /api/health` เพื่อยืนยันว่าระบบใหม่ตื่นขึ้นสมบูรณ์

## 11. Incident Response
แนวทางการรับมือเมื่อระบบล่ม (Downtime):
1. **แจ้งผู้เกี่ยวข้อง (Acknowledge):** ส่งข้อความในกลุ่มทีมงาน "กำลังตรวจสอบปัญหาเซิร์ฟเวอร์ล่ม"
2. **ตรวจสอบต้นตอ (Investigate):** เปิดดู Logs ใน Railway อันดับแรก หาคำว่า `Error`, `Crash` หรือ `OOM (Out Of Memory)`
3. **Rollback ทันที (Mitigate):** หากเป็นเพราะการ Deploy โค้ดใหม่ ให้กดจุด 3 จุดที่ Deployment เวอร์ชันเก่าใน Railway แล้วสั่ง **Redeploy** เพื่อถอยระบบกลับทันที
4. **Post-Mortem:** เมื่อระบบฟื้นกลับมาแล้ว (หรือแก้ไขเสร็จแล้ว) ให้จดบันทึกสาเหตุและหาวิธีป้องกันไม่ให้เกิดซ้ำ

## 12. Maintenance Checklist
- [ ] ติดตั้ง UptimeRobot ผูกกับ `/api/health` (แจ้งเตือนเข้า Email/Slack)
- [ ] นำ Railway MySQL URL ไปผูกกับเครื่องมือจัดการฐานข้อมูล (เช่น DBeaver / TablePlus) เพื่อความสะดวกในการซ่อมแซมข้อมูลฉุกเฉิน
- [ ] ตรวจสอบว่า `NODE_ENV=production` เสมอ เพื่อประหยัด Resource ของเครื่อง
- [ ] ตรวจสอบแผน Backup (ตามคู่มือ BACKUP_RESTORE.md) ว่าทำงานสมบูรณ์แล้ว
