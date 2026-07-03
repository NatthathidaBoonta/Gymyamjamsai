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
 Repository      (Database Queries via Prisma)
     │
     ▼
 Prisma ORM      (SQLite → PostgreSQL/MongoDB)
```

### Layer Responsibilities

| Layer       | หน้าที่                                                |
|-------------|-------------------------------------------------------|
| Router      | กำหนด URL path และ HTTP method, ส่งต่อไปยัง Controller |
| Controller  | รับ req/res, ตรวจ input, เรียก Service, ส่ง response   |
| Service     | ตรรกะทางธุรกิจ (hash password, generate token, ฯลฯ)  |
| Repository  | CRUD ผ่าน Prisma (ซ่อน logic DB ไว้ที่นี่เพียงที่เดียว) |
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

## Database Strategy (Prisma)

- **Dev:** SQLite3 — ไม่ต้องตั้งค่าอะไรเพิ่ม
- **Prod (Scale Up):** เปลี่ยนเพียง `DATABASE_URL` ใน `.env` และ `provider` ใน `schema.prisma`

```prisma
// ปัจจุบัน
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// เมื่อ Scale ไป PostgreSQL
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

โค้ดใน Repository ไม่จำเป็นต้องเปลี่ยนแปลงใดๆ เพราะ Prisma เป็น Abstraction Layer

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
  ├── backend  (port 3000)   → Node.js Express
  └── frontend (port 5173)   → Vite Dev / Nginx Prod
```
