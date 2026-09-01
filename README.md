# 🏋️ Gymyamjamsai

Full-Stack Web Application สำหรับระบบติดตามพัฒนาการการออกกำลังกายออนไลน์
สร้างด้วย **Node.js + Express** (Backend) และ **React + Vite + TypeScript** (Frontend)

---

## 🚧 Development Status

โปรเจกต์กำลังพัฒนาตาม [Implementation Plan](docs/planning/10-implementation-plan.md) แบบทีละ Phase

- ✅ **Phase 0** — Requirement and Architecture (เอกสาร Planning ครบถ้วน)
- ✅ **Phase 1** — Project Setup (โครงสร้าง backend/frontend เปล่าพร้อมเขียนโค้ด, Linter ตั้งค่าแล้ว) — ผ่าน QA Review
- ✅ **Phase 2** — Database Schema & Seed Data (10 ตารางตาม ERD + seed accounts, utf8mb4) — ผ่าน QA Review
- ✅ **Phase 3** — Backend Core & MySQL Connection (mysql2 pool, CORS, `GET /api/health`, central error handler) — ผ่าน QA Review
- ✅ **Phase 4** — Authentication & Authorization (JWT login/register, bcrypt, `authenticate` + `requireRole`) — ผ่าน QA Review
- ✅ **Phase 5** — Workout Plan & Exercise CRUD API (Exercise CRUD, generate ตารางแบบ Static Template, current) — ผ่าน QA Review
- ✅ **Phase 6** — Activity Registration API (สร้างคลาส, จองที่นั่งกัน Race Condition, เช็คชื่อ) — ผ่าน QA Review
- ✅ **Phase 7** — Dashboard & Report API (สถิติพัฒนาการ, ภาพรวมระบบ, Export CSV) — ผ่าน QA Review
- ✅ **Phase 8** — Frontend Layout & Routing (2 layouts, 12 routes, Responsive CSS Vanilla) — ผ่าน QA Review
- ✅ **Phase 9** — Frontend Authentication (Login/Register forms, Protected Routes, 401 interceptor) — ผ่าน QA Review
- ✅ **Phase 10** — Workout & Activity Management UI (Member/Admin/Trainer CRUD pages) — ผ่าน QA Review
- ✅ **Phase 11** — Dashboard & Report UI (Recharts charts, export CSV) — ผ่าน QA Review
- ✅ **Phase 12** — Notifications System (Real-time bell, notifications page, API) — ผ่าน QA Review
- ✅ **Phase 13** — Docker Integration (docker-compose, responsive dev environment) — ผ่าน QA Review
- ✅ **Phase 14** — Bug Fixes & API Contracts (Type safety, error boundaries, field mappings) — ผ่าน QA Review
- ✅ **Phase 15** — Production Deployment (Dockerfiles.prod, docker-compose.prod, DEPLOYMENT_GUIDE) — ผ่าน QA Review

> Backend API ครบตามแผน Phase 3-7 แล้ว ส่วน Frontend มีโครง Layout + Router (Sidebar/Topbar responsive) แต่หน้าต่างๆ ยังเป็นโครงเปล่า — เนื้อหาจริงและการเชื่อม API จะเริ่มที่ Phase 9-11

### 🖥️ Frontend Routes (Phase 8)

| Path | หน้า | Layout |
|---|---|---|
| `/` · `/login` · `/register` | Landing, เข้าสู่ระบบ, สมัครสมาชิก | Public |
| `/member/dashboard` · `/member/workout` · `/member/activities` | สมาชิก | Dashboard |
| `/trainer/dashboard` · `/trainer/activities` · `/trainer/activities/:id/attendance` | ผู้ฝึกสอน | Dashboard |
| `/admin/dashboard` · `/admin/users` · `/admin/exercises` | ผู้ดูแลระบบ | Dashboard |

> Responsive: จอ ≥ 900px แสดง Sidebar ถาวร · จอเล็กกว่านั้น Sidebar ยุบเป็น drawer เปิดด้วยปุ่ม ☰

### 🗄️ Database (Phase 2)

Schema + seed อยู่ที่ [`mysql/init/`](mysql/init/) รันอัตโนมัติเมื่อ MySQL container ถูกสร้างครั้งแรก บัญชีทดสอบ (dev):

| Email | Password | Role |
|---|---|---|
| admin@gymyam.com | Admin@123 | admin |
| trainer@gymyam.com | Trainer@123 | trainer |
| member@gymyam.com | Member@123 | member |

> ℹ️ MySQL รัน init script เฉพาะตอนสร้าง volume ครั้งแรก หากเคยรัน stack มาก่อน ต้อง `docker compose down -v && docker compose up` เพื่อให้ schema ใหม่มีผล (ลบ test data เดิมใน dev)

---

## 📦 Tech Stack (เป้าหมายของโปรเจกต์)

| Layer        | Technology                                  |
|--------------|---------------------------------------------|
| Frontend     | React 19, Vite, TypeScript, Vanilla CSS     |
| Backend      | Node.js, Express.js (JavaScript)            |
| DB Driver    | mysql2 (raw SQL, connection pool)           |
| Database     | MySQL 8.0                                   |
| DB Admin     | phpMyAdmin                                  |
| Auth         | JWT + bcryptjs + UUID                       |
| Container    | Docker + Docker Compose                     |

---

## 🗂️ Project Structure

```
Gymyamjamsai/
├── backend/        # Node.js Express REST API
├── frontend/       # React Vite Application
├── mysql/init/     # SQL init script (รันอัตโนมัติตอน MySQL container สร้างครั้งแรก)
├── docker-compose.yml
├── .env             # ตัวแปร MySQL สำหรับ docker-compose (ห้าม push ขึ้น Git)
├── README.md
├── architecture.md
├── project_map.md
└── script.md
```

---

## ⚡ Quick Start

### 1. ด้วย Docker (แนะนำ)
```bash
docker compose up --build
```

### 2. รันแยก (Development)

**Backend:** (ต้องมี MySQL รันอยู่ก่อน เช่นผ่าน `docker compose up mysql -d`)
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Endpoints

| URL | Description |
|-----|-------------|
| http://localhost:5000 | Backend API (local) / Docker |
| http://localhost:5000/api/health | Health check + สถานะ DB (Phase 3) |
| POST /api/auth/register · /api/auth/login · GET /api/auth/me | Auth (JWT) — Phase 4-9 |
| GET/POST/PUT/DELETE /api/exercises | คลังท่าออกกำลังกาย — Phase 5, 10 |
| POST /api/workout-plans/generate · GET /api/workout-plans/current | ตารางออกกำลังกาย — Phase 5, 10 |
| GET/POST /api/activities · POST /:id/register · PATCH /:id/attendance | กิจกรรม/จองคลาส/เช็คชื่อ — Phase 6, 10 |
| GET /api/dashboard/personal · /api/dashboard/admin · /api/reports/activities/export | สถิติ/รายงาน — Phase 7, 11 |
| http://localhost:5173 | Frontend Dev Server (Vite + HMR) |
| http://localhost:8081 | phpMyAdmin (DB management) |
| localhost:3306 | MySQL (host port varies) |

**📖 Docker Setup:** See [DOCKER.md](./DOCKER.md) for full setup guide.

---

## 📋 Documentation

- [Architecture](./architecture.md) — สถาปัตยกรรมระบบ
- [Project Map](./project_map.md) — แผนผังโฟลเดอร์
- [Scripts](./script.md) — คำสั่งที่ใช้บ่อย
