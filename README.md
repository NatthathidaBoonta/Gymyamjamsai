# 🏋️ Gymyamjamsai

Full-Stack Web Application สำหรับระบบติดตามพัฒนาการการออกกำลังกายออนไลน์
สร้างด้วย **Node.js + Express** (Backend) และ **React + Vite + TypeScript** (Frontend)

---

## 📦 Tech Stack

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

| URL                                | Description            |
|-------------------------------------|------------------------|
| http://localhost:5001               | Backend API            |
| http://localhost:5001/api/status    | Status Check API       |
| http://localhost:5173               | Frontend Dev Server    |
| http://localhost:8081               | phpMyAdmin             |
| localhost:3307 (จาก host)           | MySQL (container: 3306)|

---

## 📋 Documentation

- [Architecture](./architecture.md) — สถาปัตยกรรมระบบ
- [Project Map](./project_map.md) — แผนผังโฟลเดอร์
- [Scripts](./script.md) — คำสั่งที่ใช้บ่อย
