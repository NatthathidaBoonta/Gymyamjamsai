# 🗺️ Project Map — Gymyamjamsai

แผนผังโครงสร้างโฟลเดอร์และคำอธิบายของแต่ละไฟล์

```
Gymyamjamsai/
│
├── 📄 README.md                        ← รายละเอียดโปรเจ็คและวิธีรัน
├── 📄 architecture.md                  ← อธิบายสถาปัตยกรรมระบบ
├── 📄 project_map.md                   ← ไฟล์นี้
├── 📄 script.md                        ← รวมคำสั่งที่ใช้บ่อย
├── 📄 docker-compose.yml               ← ควบคุม Container ทั้งหมด
│
├── 📁 backend/
│   ├── 📄 server.js                    ← Entry point ของ Express App
│   ├── 📄 .env                         ← Environment Variables (PORT, JWT_SECRET, ฯลฯ)
│   ├── 📄 .env.example                 ← ตัวอย่าง .env สำหรับทีม
│   ├── 📄 package.json
│   ├── 📄 Dockerfile
│   │
│   ├── 📁 prisma/
│   │   └── 📄 schema.prisma            ← Database schema (User, ฯลฯ)
│   │
│   └── 📁 src/
│       ├── 📁 database/
│       │   └── 📄 index.js             ← Prisma Client singleton
│       │
│       ├── 📁 middleware/
│       │   ├── 📄 auth.middleware.js   ← ตรวจสอบ JWT token
│       │   └── 📄 error.middleware.js  ← Global error handler
│       │
│       └── 📁 modules/
│           ├── 📁 auth/
│           │   ├── 📄 auth.router.js       ← POST /api/auth/register, /api/auth/login
│           │   ├── 📄 auth.controller.js   ← รับ request, คืน response
│           │   ├── 📄 auth.service.js      ← hash password, สร้าง JWT
│           │   ├── 📄 auth.repository.js   ← query Prisma (createUser, findByEmail)
│           │   └── 📄 auth.dto.js          ← validation schema ของ register/login
│           │
│           └── 📁 status/
│               ├── 📄 status.router.js     ← GET /api/status
│               ├── 📄 status.controller.js
│               ├── 📄 status.service.js
│               ├── 📄 status.repository.js
│               └── 📄 status.dto.js
│
└── 📁 frontend/
    ├── 📄 index.html
    ├── 📄 .env                          ← VITE_API_URL
    ├── 📄 .env.example
    ├── 📄 package.json
    ├── 📄 vite.config.ts
    ├── 📄 tsconfig.json
    ├── 📄 Dockerfile
    │
    └── 📁 src/
        ├── 📄 main.tsx                  ← React DOM render entry
        ├── 📄 App.tsx                   ← Root Component + Router Provider
        │
        ├── 📁 theme/
        │   ├── 📄 theme.ts             ← ส่งออก CSS variable names เป็น constants
        │   └── 📄 theme.css            ← :root { --color-primary: ...; } ฯลฯ
        │
        ├── 📁 routes/
        │   ├── 📄 Router.tsx           ← ตั้งค่า React Router ทั้งหมด
        │   └── 📄 ProtectedRoute.tsx   ← ตรวจสอบ token ก่อนเข้าหน้าที่ต้อง auth
        │
        ├── 📁 services/
        │   ├── 📄 api.ts               ← Axios instance (baseURL, interceptors)
        │   ├── 📄 auth.ts              ← register(), login()
        │   └── 📄 status.ts            ← getServerStatus()
        │
        ├── 📁 components/
        │   └── 📁 status/
        │       ├── 📄 Status.tsx       ← Component แสดงสถานะ Backend
        │       └── 📄 Status.css
        │
        └── 📁 pages/
            ├── 📄 Home.tsx             ← หน้าหลัก (Protected)
            ├── 📄 Home.css
            ├── 📄 Login.tsx            ← หน้า Login/Register
            └── 📄 Login.css
```
