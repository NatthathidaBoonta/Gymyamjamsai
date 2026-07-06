# 📜 Script Reference — Gymyamjamsai

รวมคำสั่งที่ใช้บ่อยในโปรเจ็ค แบ่งตามหมวดหมู่

---

## 🐳 Docker Commands

| คำสั่ง | คำอธิบาย |
|--------|----------|
| `docker compose up --build` | Build image และรันทุก service |
| `docker compose up -d` | รันแบบ background (detached) |
| `docker compose down` | หยุดและลบ Container (เก็บ MySQL data volume ไว้) |
| `docker compose down -v` | หยุดและลบ Container พร้อม volume (⚠️ ลบข้อมูล MySQL ทั้งหมด) |
| `docker compose logs -f backend` | ดู log ของ backend แบบ real-time |
| `docker compose logs -f frontend` | ดู log ของ frontend แบบ real-time |
| `docker compose logs -f mysql` | ดู log ของ mysql แบบ real-time |
| `docker compose ps` | ดูสถานะ Container ทั้งหมด |
| `docker compose restart backend` | Restart เฉพาะ backend |
| `docker compose exec backend npm run seed` | รัน seed script ในคอนเทนเนอร์ backend |
| `docker compose exec mysql mysql -u root -p` | เข้า MySQL CLI ในคอนเทนเนอร์ |

---

## 🔧 Backend Commands

```bash
# เข้าโฟลเดอร์ backend
cd backend

# ติดตั้ง Dependencies
npm install

# รันในโหมด Development (nodemon - auto-restart)
npm run dev

# รันในโหมด Production
npm start

# สร้างข้อมูลผู้ใช้ตั้งต้น (admin/user) สำหรับทดสอบ
npm run seed
```

---

## ⚛️ Frontend Commands

```bash
# เข้าโฟลเดอร์ frontend
cd frontend

# ติดตั้ง Dependencies
npm install

# รัน Development Server
npm run dev

# Build สำหรับ Production
npm run build

# Preview Production Build
npm run preview

# Lint โค้ด
npm run lint
```

---

## 🔐 Environment Setup

**Root `.env`** (ใช้โดย `docker-compose.yml`)
```env
MYSQL_ROOT_PASSWORD=changeme-root-password
MYSQL_DATABASE=gymyamjamsai
MYSQL_USER=gymyam_user
MYSQL_PASSWORD=gymyam_password
```

**Backend `.env`**
```env
PORT=5001
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173

DB_HOST=localhost
DB_PORT=3307
DB_USER=gymyam_user
DB_PASSWORD=gymyam_password
DB_NAME=gymyamjamsai

JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=24h
```

**Frontend `.env`**
```env
VITE_API_URL=http://localhost:5001
```

---

## 🗄️ MySQL Schema Workflow

```bash
# 1. แก้ไข/เพิ่มตารางที่ mysql/init/01_init.sql (หรือเพิ่มไฟล์ 02_xxx.sql ใหม่)
# 2. ไฟล์ .sql ใน mysql/init/ จะรันอัตโนมัติ "ครั้งแรก" ที่สร้าง container เท่านั้น
#    ถ้าแก้ schema หลัง container มีข้อมูลแล้ว ต้อง reset volume ก่อน:
docker compose down -v
docker compose up -d --build
```

---

## 🚀 Deployment Checklist

```bash
# 1. Build Frontend
cd frontend && npm run build

# 2. ตรวจสอบ Environment Variables
# - ตั้ง NODE_ENV=production
# - ตั้ง DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME ให้ชี้ไปยัง production MySQL
# - ตั้ง JWT_SECRET ที่แข็งแกร่ง
# - ตั้ง MYSQL_ROOT_PASSWORD ที่แข็งแกร่งใน root .env

# 3. Start Backend
cd backend && npm start
```
