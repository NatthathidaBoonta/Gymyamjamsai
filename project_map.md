# 🗺️ Project Map — Gymyamjamsai

แผนผังโครงสร้างโฟลเดอร์และคำอธิบายของแต่ละไฟล์

```
Gymyamjamsai/
│
├── 📄 README.md                        ← รายละเอียดโปรเจ็คและวิธีรัน
├── 📄 architecture.md                  ← อธิบายสถาปัตยกรรมระบบ
├── 📄 project_map.md                   ← ไฟล์นี้
├── 📄 script.md                        ← รวมคำสั่งที่ใช้บ่อย
├── 📄 docker-compose.yml               ← ควบคุม Container ทั้งหมด (mysql, phpmyadmin, backend, frontend)
├── 📄 .env                             ← ตัวแปร MySQL สำหรับ docker-compose (ไม่ push ขึ้น Git)
├── 📄 .env.example                     ← ตัวอย่าง .env (root) สำหรับทีม
│
├── 📁 mysql/
│   └── 📁 init/
│       └── 📄 01_init.sql              ← SQL Schema เริ่มต้น รันอัตโนมัติตอน MySQL container สร้างครั้งแรก
│
├── 📁 backend/
│   ├── 📄 server.js                    ← Entry point ของ Express App (PORT 5000)
│   ├── 📄 .env                         ← Environment Variables (PORT, DB_*, JWT_SECRET, ฯลฯ)
│   ├── 📄 .env.example                 ← ตัวอย่าง .env สำหรับทีม
│   ├── 📄 package.json
│   ├── 📄 Dockerfile.dev               ← Dev image (nodemon, bind mount)
│   │
│   ├── 📁 scripts/
│   │   └── 📄 seed.js                  ← สร้างผู้ใช้ตั้งต้น (admin/user) สำหรับทดสอบ
│   │
│   └── 📁 src/
│       ├── 📁 database/
│       │   └── 📄 index.js             ← mysql2 Connection Pool (singleton)
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
│           │   ├── 📄 auth.repository.js   ← raw SQL query ผ่าน mysql2 (createUser, findByEmail)
│           │   └── 📄 auth.dto.js          ← validation schema ของ register/login
│           │
│           ├── 📁 status/
│           │   ├── 📄 status.router.js     ← GET /api/status
│           │   ├── 📄 status.controller.js
│           │   ├── 📄 status.service.js
│           │   ├── 📄 status.repository.js
│           │   └── 📄 status.dto.js
│           │
│           ├── 📁 profile/
│           │   ├── 📄 profile.router.js     ← GET/PUT /api/profile/me (protected)
│           │   ├── 📄 profile.controller.js
│           │   ├── 📄 profile.service.js
│           │   ├── 📄 profile.repository.js ← upsert ผ่าน mysql2 (findByUserId, upsertProfile)
│           │   └── 📄 profile.dto.js        ← validate น้ำหนัก/ส่วนสูง/อายุ/เป้าหมาย/ระดับความฟิต
│           │
│           └── 📁 exercise/
│               ├── 📄 exercise.router.js     ← GET (ทุก user) / POST,PUT,DELETE (admin) /api/exercises
│               ├── 📄 exercise.controller.js
│               ├── 📄 exercise.service.js
│               ├── 📄 exercise.repository.js ← list (filter targetMuscle/difficulty/search), CRUD ผ่าน mysql2
│               └── 📄 exercise.dto.js        ← validate name/difficulty
│
└── 📁 frontend/
    ├── 📄 index.html
    ├── 📄 .env                          ← VITE_API_URL (http://localhost:5000)
    ├── 📄 .env.example
    ├── 📄 package.json
    ├── 📄 vite.config.ts
    ├── 📄 tsconfig.json
    ├── 📄 Dockerfile.dev                ← Dev image (vite --host 0.0.0.0, bind mount)
    │
    └── 📁 src/
        ├── 📄 main.tsx                  ← React DOM render entry
        ├── 📄 App.tsx                   ← Root Component + Router Provider
        │
        ├── 📁 theme/
        │   ├── 📄 theme.ts             ← ส่งออก CSS variable names เป็น constants
        │   └── 📄 theme.css            ← Bold Dark Theme ⚡ — สีเขียวนีออน/ฟ้า, ฟอนต์ Oswald+Nunito
        │
        ├── 📁 routes/
        │   ├── 📄 Router.tsx           ← ตั้งค่า React Router ทั้งหมด (รวม /welcome public route)
        │   └── 📄 ProtectedRoute.tsx   ← ตรวจสอบ token ก่อนเข้าหน้าที่ต้อง auth — ไม่มี token → redirect /welcome
        │
        ├── 📁 services/
        │   ├── 📄 api.ts               ← Axios instance (baseURL, interceptors)
        │   ├── 📄 auth.ts              ← register(), login()
        │   ├── 📄 profile.ts           ← getMyProfile(), saveMyProfile()
        │   ├── 📄 exercise.ts          ← listExercises(filters)
        │   └── 📄 status.ts            ← getServerStatus()
        │
        ├── 📁 components/
        │   ├── 📁 layout/
        │   │   ├── 📄 Navbar.tsx       ← Navbar ใช้ร่วมกันทุกหน้าหลัง login (Dashboard/คลังท่า/โปรไฟล์/Logout)
        │   │   └── 📄 Navbar.css
        │   │
        │   └── 📁 status/
        │       ├── 📄 Status.tsx       ← Component แสดงสถานะ Backend
        │       └── 📄 Status.css
        │
        └── 📁 pages/
            ├── 📄 Home.tsx             ← หน้าหลัก (Protected) — redirect ไป /profile ถ้ายังไม่มี profile
            ├── 📄 Home.css
            ├── 📄 Login.tsx            ← หน้า Login/Register
            ├── 📄 Login.css
            ├── 📄 Profile.tsx          ← Onboarding + แก้ไข Profile (Protected, route: /profile)
            ├── 📄 Profile.css
            ├── 📄 Exercises.tsx        ← คลังท่าออกกำลังกาย: ค้นหา/กรอง + ไฮไลต์ตามระดับผู้ใช้ (route: /exercises)
            ├── 📄 Exercises.css
            ├── 📄 Landing.tsx          ← หน้า Landing (Public) — Hero/Features/Steps/CTA (route: /welcome)
            └── 📄 Landing.css
```
