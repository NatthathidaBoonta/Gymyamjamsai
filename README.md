# 🏋️ Gymyamjamsai

Full-Stack Web Application สำหรับระบบจัดการยิม  
สร้างด้วย **Node.js + Express** (Backend) และ **React + Vite + TypeScript** (Frontend)

---

## 📦 Tech Stack

| Layer        | Technology                                  |
|--------------|---------------------------------------------|
| Frontend     | React 19, Vite, TypeScript, Vanilla CSS     |
| Backend      | Node.js, Express.js (JavaScript)            |
| ORM          | Prisma ORM                                  |
| Database     | SQLite3 (dev) → PostgreSQL / MongoDB (prod) |
| Auth         | JWT + bcrypt + UUID                         |
| Container    | Docker + Docker Compose                     |

---

## 🗂️ Project Structure

```
Gymyamjamsai/
├── backend/        # Node.js Express REST API
├── frontend/       # React Vite Application
├── docker-compose.yml
├── README.md
├── architecture.md
├── project_map.md
└── script.md
```

---

## ⚡ Quick Start

### 1. ด้วย Docker (แนะนำ)
```bash
docker-compose up --build
```

### 2. รันแยก (Development)

**Backend:**
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
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

| URL                         | Description            |
|-----------------------------|------------------------|
| http://localhost:3000       | Backend API            |
| http://localhost:3000/api/status | Status Check API  |
| http://localhost:5173       | Frontend Dev Server    |

---

## 📋 Documentation

- [Architecture](./architecture.md) — สถาปัตยกรรมระบบ
- [Project Map](./project_map.md) — แผนผังโฟลเดอร์
- [Scripts](./script.md) — คำสั่งที่ใช้บ่อย
