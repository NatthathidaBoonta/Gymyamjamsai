# 🏗️ Architecture — Gymyamjamsai

## ภาพรวมสถาปัตยกรรม

โปรเจ็คนี้ใช้ **Modular Monolith Architecture** สำหรับฝั่ง Backend  
ซึ่งช่วยให้จัดการ Codebase ได้ง่ายในระยะแรก และสามารถขยายเป็น Microservices ได้ในอนาคต

---

## Backend Architecture

```
HTTP Request
     │
     ▼
 Express Router  (เส้นทาง URL)
     │
     ▼
 Controller      (รับ Request, ส่ง Response)
     │
     ▼
 Service         (Business Logic)
     │
     ▼
 Repository      (Database Queries — raw SQL ผ่าน mysql2)
     │
     ▼
 mysql2 Pool     (MySQL 8.0)
```

### Layer Responsibilities

| Layer       | หน้าที่                                                |
|-------------|-------------------------------------------------------|
| Router      | กำหนด URL path และ HTTP method, ส่งต่อไปยัง Controller |
| Controller  | รับ req/res, ตรวจ input, เรียก Service, ส่ง response   |
| Service     | ตรรกะทางธุรกิจ (hash password, generate token, ฯลฯ)  |
| Repository  | CRUD ผ่าน mysql2 (ซ่อน SQL query ไว้ที่นี่เพียงที่เดียว) |
| DTO         | กำหนด schema ของข้อมูลที่รับ/ส่ง (validation)          |
| Middleware  | ตรวจสอบ JWT, จัดการ Error                              |

---

## Frontend Architecture

```
App.tsx
  │
  ├── Router.tsx (React Router)
  │     ├── PublicRoute  → /login  → Login.tsx
  │     └── ProtectedRoute → /home → Home.tsx
  │
  └── Services Layer
        ├── api.ts       (Axios Instance)
        ├── auth.ts      (ส่ง request ไป /api/auth/*)
        └── status.ts    (ส่ง request ไป /api/status)
```

---

## Database Strategy (MySQL)

- **Schema (DDL):** กำหนดไว้ที่ [`mysql/init/01-schema.sql`](./mysql/init/01-schema.sql) — รันอัตโนมัติครั้งแรกที่ MySQL container ถูกสร้าง (mount ที่ `/docker-entrypoint-initdb.d`)
- **Seed (DML):** ข้อมูลจำลองสำหรับทดสอบอยู่ที่ [`mysql/init/02-seed.sql`](./mysql/init/02-seed.sql) — รันต่อจาก schema โดยอัตโนมัติ (เรียงตามชื่อไฟล์)
- **Connection:** `backend/src/database/index.js` สร้าง connection pool ด้วย `mysql2/promise` โดยอ่านค่าจาก `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` *(สร้างแล้วใน Phase 3 — มี `GET /api/health` ตรวจการเชื่อมต่อ)*
- **Local dev (นอก Docker):** เชื่อมต่อผ่าน host port `3307` (mapped จาก container port `3306`)
- **ใน Docker Compose:** backend เชื่อมต่อผ่าน service name `mysql` port `3306` (override ผ่าน `environment` ใน `docker-compose.yml`)

### Entities หลัก (ตาม ERD ใน docs/planning/05-database-design.md — 10 ตาราง)

`users`, `user_profiles`, `exercises`, `user_metrics`, `workout_plans`, `workout_plan_details`, `workout_logs`, `activities`, `activity_registrations`, `status_audit_logs`

---

## Security

| หัวข้อ        | วิธีการ                                             |
|--------------|---------------------------------------------------|
| Password     | Hash ด้วย `bcrypt` (salt rounds = 12)              |
| User ID      | สร้างด้วย `UUID v4` (ไม่ใช้ auto-increment int)   |
| Session      | JWT (JSON Web Token) หมดอายุใน 24 ชั่วโมง         |
| CORS         | ระบุ origin เฉพาะ frontend URL จาก `.env`          |

---

## Docker Architecture

```
docker-compose.yml
  │
  ├── mysql       (host 3307 → container 3306)  → MySQL 8.0 (healthcheck: mysqladmin ping)
  ├── phpmyadmin  (host 8081 → container 80)    → DB Admin UI (depends_on: mysql healthy)
  ├── backend     (host 5001 → container 5001)  → Node.js Express (depends_on: mysql healthy)
  └── frontend    (host 5173 → container 5173)  → Vite Dev Server (depends_on: backend)
```

Bind mounts (`./backend:/app`, `./frontend:/app`) ให้แก้โค้ดแล้วเห็นผลทันทีโดยไม่ต้อง rebuild image, ส่วน `node_modules` ใช้ anonymous volume แยกเพื่อไม่ให้ของ host ทับของใน container (สำคัญเพราะ native deps ต้อง build แยกกันคนละ OS)
