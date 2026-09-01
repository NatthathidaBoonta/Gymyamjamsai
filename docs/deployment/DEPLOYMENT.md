# Deployment Guide: Gymyamjamsai

เอกสารคู่มือนี้อธิบายวิธีการนำระบบ **Gymyamjamsai** ขึ้นสู่ Production โดยครอบคลุม 2 สภาพแวดล้อม (Deployment Targets) เพื่อตอบสนองต่อนโยบายขององค์กรที่ต่างกัน แต่ทั้งคู่ใช้สถาปัตยกรรมพื้นฐานร่วมกันคือ **Single-container Model**

---

## A. ส่วนรวม (Shared Configuration)

### 1. Overview (Single-container Model)
ระบบนี้ถูกออกแบบให้ทำงานผ่าน Container เดียวเพื่อความง่ายในการ Scale:
- **Stage 1:** สร้าง (Build) React Frontend เป็นไฟล์ Static ไปเก็บไว้ที่โฟลเดอร์ `dist/`
- **Stage 2:** ย้าย `dist/` มาใส่ใน Backend (Node.js/Express) เพื่อให้ Backend เสิร์ฟไฟล์ Static พร้อมทำตัวเป็น API Server (เสิร์ฟผ่านพอร์ต `5000`) ไปพร้อมกัน

### 2. Prerequisites (สิ่งที่ต้องมี)
- Git & GitHub (สำหรับจัดเก็บ Source Code และผูกกับ CI/CD)
- เลือก Deployment Target ที่เหมาะสมกับองค์กร (Target A: Railway, Target B: On-premise)

### 3. Project Files
- `Dockerfile`: Multi-stage build (Root directory) ใช้เป็นจุดศูนย์กลางทั้ง 2 Target
- `railway.toml`: คอนฟิกสำหรับ Railway (Target A)
- `docker-compose.prod.yml`: คอนฟิกสำหรับ On-premise (Target B)
- `nginx/default.conf`: สำหรับ Reverse Proxy และ SSL (Target B)
- `.env.production.example`: ไฟล์อ้างอิงตัวแปรสภาพแวดล้อมจริง

### 4. Environment Variables (ข้อควรระวัง)
> **สำคัญ:** ห้ามนำ `.env` ขึ้น Git เด็ดขาด ให้นำค่าเหล่านี้ไปตั้งใน Server หรือ Dashboard แทน

```env
NODE_ENV=production
PORT=5000
FRONTEND_ORIGIN=https://<your-domain.com>
JWT_SECRET=<ตั้งรหัสสุ่มความยาว-64-ตัวอักษร>
DB_HOST=<ไอพีเซิร์ฟเวอร์-DB>
DB_PORT=3306
DB_USER=<ชื่อผู้ใช้-DB>
DB_PASSWORD=<รหัสผ่าน-DB>
DB_NAME=gymyamjamsai_prod
```

### 5. Database Init / Migration
เมื่อเซ็ตอัพฐานข้อมูลเสร็จ ให้นำเข้าโครงสร้างตารางด้วยคำสั่ง:
```bash
mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME> < mysql/init/01-schema.sql
# ถ้าต้องการข้อมูลตัวอย่าง ให้รัน seed ด้วย
mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME> < mysql/init/02-seed.sql
```

### 6. Smoke Test (หลัง Deploy)
- เข้าเว็บ `/` โหลดหน้าแรกสำเร็จหรือไม่
- เรียก `GET /api/health` ต้องคืนสถานะ 200 พร้อมคำว่า "connected"
- ทดลอง Login ด้วยบัญชีที่มีอยู่ และทดสอบจองคลาสออกกำลังกาย

### 7. Backup and Restore (mysqldump)
แนะนำให้ทำ Cronjob ใน Server หรือเครื่อง Automation สั่งรันทุกคืน:
```bash
# การ Backup
mysqldump -h <DB_HOST> -u <DB_USER> -p'<DB_PASSWORD>' gymyamjamsai_prod > backup.sql

# การ Restore (เวลาระบบพัง)
mysql -h <DB_HOST> -u <DB_USER> -p'<DB_PASSWORD>' gymyamjamsai_prod < backup.sql
```

---

## B. Target A — Railway (Primary PaaS)
เหมาะกับ Startup ที่ต้องการความเร็ว SSL Auto และไม่ต้องดูแลเซิร์ฟเวอร์

### 1. Create Railway Project & Link GitHub Repo
1. ไปที่ [Railway.app](https://railway.app) และสร้าง **New Project**
2. เลือก **Deploy from GitHub repo** และเลือกโปรเจกต์ Gymyamjamsai
3. ระบบจะค้นหา `Dockerfile` และ `railway.toml` เพื่อกำหนดการ Build อัตโนมัติ

### 2. Provision MySQL
1. ในหน้า Project, คลิก **New** > **Database** > **Add MySQL**
2. ระบบจะจัดสรร Database ให้อัตโนมัติ

### 3. Set Env Vars (Railway Dashboard)
1. ไปที่ Service (แอปของเรา) > **Variables**
2. นำเข้าค่าตามหัวข้อ 4 (อ้างอิง `DB_*` จากแท็บ Variables ของ Database ที่เพิ่งสร้าง)
3. *ข้อควรระวัง:* ไม่ต้องใส่ `PORT` (Railway กำหนดให้อัตโนมัติ)

### 4. Persistent Volume สำหรับ `uploads/`
1. ในหน้าแอป ไปที่ **Settings** > **Volumes**
2. เพิ่ม Volume และตั้ง Mount Path ไปที่ `/app/backend/uploads`

### 5. Custom Domain & SSL
1. ในหน้าแอป ไปที่ **Settings** > **Networking**
2. คลิก **Generate Domain** หรือเพิ่ม Domain ของตนเอง (Railway จะสร้าง SSL ให้อัตโนมัติ)

### 6. Deploy / Logs / Rollback
- **Deploy:** ระบบจะ Auto-deploy ทุกครั้งที่ Push ไปยังกิ่ง (branch) หลัก
- **View Logs:** แถบ **Deployments** > **View Logs**
- **Rollback:** หากเกิดข้อผิดพลาด เลือกคลิกจุด 3 จุดที่เวอร์ชันเก่า แล้วกด **Redeploy**

---

## C. Target B — On-premise / Ubuntu Server (Alternative)
เหมาะสำหรับองค์กรที่ต้องการจัดการเครือข่าย ป้องกันการเข้าถึงภายนอก และเก็บข้อมูลไว้ในประเทศ

### 1. Server Requirements + Install Docker & Compose
- **OS:** Ubuntu 20.04/22.04 LTS
- **ติดตั้ง Docker:**
  ```bash
  sudo apt update && sudo apt install -y docker.io docker-compose
  sudo systemctl enable --now docker
  ```

### 2. Clone Project + Configure `.env.production`
```bash
git clone https://github.com/your-org/gymyamjamsai.git
cd gymyamjamsai
cp .env.production.example .env.production
nano .env.production # แก้ไขข้อมูลลับตามความเหมาะสม
```

### 3. Setup Nginx + SSL
1. ยืนยันให้ DNS (A Record) ชี้มาที่ IP เครื่องเซิร์ฟเวอร์
2. ทำการตั้งค่า SSL เบื้องต้น (สมมติใช้ Let's Encrypt บน Ubuntu เครื่องหลัก):
   ```bash
   sudo apt install certbot
   sudo certbot certonly --standalone -d <your-domain.com>
   ```
3. Copy คีย์มาใส่ใน `nginx/ssl/` ตามที่กำหนดค่าไว้ใน `nginx/default.conf`

### 4. Deploy (Docker Compose)
รันคำสั่งต่อไปนี้เพื่อสั่งประกอบร่างระบบ:
```bash
sudo docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```
ระบบจะแบ่ง Volume ดังนี้:
- `app_uploads` (สำหรับไฟล์แนบ)
- `mysql_data_prod` (ฐานข้อมูล ถาวรข้ามการ Restart)

### 5. Operations (Verify, Logs, Update, Rollback)
- **Verify Services:** `sudo docker-compose -f docker-compose.prod.yml ps`
- **View Logs:** `sudo docker-compose -f docker-compose.prod.yml logs -f`
- **Restart System:** `sudo docker-compose -f docker-compose.prod.yml restart`
- **Update New Version:**
  ```bash
  git pull origin main
  sudo docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
  ```
- **Rollback:** `git checkout <commit-hash>` แล้วรัน Update New Version ใหม่

---

## D. Troubleshooting (การแก้ปัญหาเบื้องต้น)

**1. Database Connection Refused**
- *Target A:* เช็ค Variables ว่า `DB_HOST` หรือรหัสผ่านกรอกผิดหรือไม่
- *Target B:* เช็คสถานะ `docker ps` ว่า MySQL ติดลูป Restart (CrashLoopBackOff) หรือไม่ อาจจะเกิดจากการเปลี่ยนรหัสผ่าน MySQL ทับซ้ำ (ให้ลบ Volume mysql_data_prod ทิ้งแล้วเริ่มใหม่)

**2. Frontend เป็นหน้าขาว หรือ 404**
- ระบบ Single-container ต้องมี `app.get('*')` ชี้ไปที่ `index.html` เสมอใน Express Backend ตรวจสอบ `server.js` ว่ามี Route ลำดับแปลกๆ ดักการทำงานหรือไม่

**3. "File Too Large" หรือ Error Upload รูป (Target B)**
- ตรวจสอบในไฟล์ `nginx/default.conf` ว่ามีคำสั่ง `client_max_body_size 10M;` (หรือขนาดที่ใหญ่พอ) แล้วหรือยัง

**4. CORS Error**
- เช็คว่าค่า `FRONTEND_ORIGIN` กรอกเป็น URL รูปแบบที่ถูกต้อง (ไม่มี `/` ปิดท้าย) หรือไม่ เช่น `https://app.gymyamjamsai.com`
