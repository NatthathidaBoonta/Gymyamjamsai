# 📜 Script Reference — Gymyamjamsai

รวมคำสั่งที่ใช้บ่อยในโปรเจ็ค แบ่งตามหมวดหมู่

---

## 🐳 Docker Commands

| คำสั่ง | คำอธิบาย |
|--------|----------|
| `docker-compose up --build` | Build image และรันทุก service |
| `docker-compose up -d` | รันแบบ background (detached) |
| `docker-compose down` | หยุดและลบ Container |
| `docker-compose logs -f backend` | ดู log ของ backend แบบ real-time |
| `docker-compose logs -f frontend` | ดู log ของ frontend แบบ real-time |
| `docker-compose ps` | ดูสถานะ Container ทั้งหมด |
| `docker-compose restart backend` | Restart เฉพาะ backend |

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

# Prisma: สร้าง Client จาก Schema
npx prisma generate

# Prisma: รัน Migration (dev)
npx prisma migrate dev --name init

# Prisma: รัน Migration (production)
npx prisma migrate deploy

# Prisma: เปิด Database GUI
npx prisma studio

# Prisma: Reset Database (⚠️ ลบข้อมูลทั้งหมด)
npx prisma migrate reset
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

**Backend `.env`**
```env
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

**Frontend `.env`**
```env
VITE_API_URL=http://localhost:3000
```

---

## 🗄️ Prisma Migration Workflow

```bash
# 1. แก้ schema.prisma
# 2. รัน migrate
npx prisma migrate dev --name <ชื่อ migration>
# 3. Prisma จะ generate client ให้อัตโนมัติ

# ถ้าแก้ schema แล้วต้องการ generate client ใหม่โดยไม่ migrate
npx prisma generate
```

---

## 🚀 Deployment Checklist

```bash
# 1. Build Frontend
cd frontend && npm run build

# 2. ตรวจสอบ Environment Variables
# - ตั้ง NODE_ENV=production
# - ตั้ง DATABASE_URL ให้ชี้ไปยัง production DB
# - ตั้ง JWT_SECRET ที่แข็งแกร่ง

# 3. รัน Migration บน Production
cd backend && npx prisma migrate deploy

# 4. Start Backend
npm start
```
