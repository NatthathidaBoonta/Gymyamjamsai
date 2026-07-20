# Tech Stack Decision — Gymyamjamsai

> **ช่วงที่ 0: เตรียมกติกาและบริบท**
> เอกสารนี้กำหนดกรอบเทคโนโลยีและขอบเขตเบื้องต้นของโปรเจกต์ ยังไม่มีการวิเคราะห์ Requirement ละเอียด ออกแบบ Database, API หรือเขียน Code ใดๆ

---

## 1. Project Name

**Gymyamjamsai**
ระบบติดตามพัฒนาการการออกกำลังกายออนไลน์

---

## 2. Purpose of the System

ระบบ Web Application สำหรับบันทึกและติดตามพัฒนาการการออกกำลังกายของผู้ใช้งานแบบออนไลน์
ครอบคลุมการจัดการแผนการออกกำลังกาย บันทึก Workout Log ติดตามความก้าวหน้า และแสดงผลแบบ Dashboard

---

## 3. Selected Tech Stack

> **หมายเหตุ (อัปเดต 2026-07-18):** เวอร์ชัน Frontend และเครื่องมือ Lint ด้านล่างถูกปรับให้ตรงกับผลลัพธ์จริงจากการรัน `npm create vite@latest` ใน Phase 1 (ดู [10-implementation-plan.md](10-implementation-plan.md) Phase 1) ณ เวลาที่ implement เนื่องจากเป็นค่า default ปัจจุบันของเครื่องมือ ไม่ใช่การตัดสินใจเปลี่ยน Architecture

| Layer | Technology | Version |
|---|---|---|
| Frontend | React | 19 |
| Frontend Build Tool | Vite | 8 |
| Frontend Styling | CSS (Vanilla) | — |
| Frontend Linter | oxlint | Latest (ติดตั้งมาพร้อม Vite template) |
| Backend Runtime | Node.js LTS | 20 (ทดสอบแล้วรองรับ v24 เช่นกัน) |
| Backend Framework | Express | 4 (ตรึงเวอร์ชันไว้ ไม่ใช้ Express 5 ที่เป็น default ใหม่ของ npm) |
| Backend Linter/Formatter | ESLint 8 + Prettier | Latest |
| Database | MySQL | 8 |
| Dev Infrastructure | Docker Compose | Latest |
| Dev DB Tool | phpMyAdmin | Latest |
| Deployment (Primary) | Railway | Single-container |
| Container Strategy | Dockerfile Multi-stage | — |

---

## 4. Reason for Each Technology

### React 18
- Component-based architecture เหมาะกับ UI ที่มีหลาย State
- Ecosystem ใหญ่ รองรับการต่อยอดในอนาคต
- Hooks-based pattern เหมาะกับ modern functional programming

### Vite 5
- Build tool ที่เร็วกว่า CRA/Webpack อย่างมีนัยสำคัญ
- Hot Module Replacement (HMR) รวดเร็ว เหมาะกับ Development
- Native ES Module support

### CSS (Vanilla)
- ไม่ต้องพึ่ง CSS Framework ภายนอก
- ยืดหยุ่น ควบคุมได้เต็มที่
- ลด bundle size

### Node.js 20 LTS
- Long Term Support รองรับ production workload
- JavaScript ทั้ง Frontend และ Backend ช่วยลด context switching
- Async/Event-driven เหมาะกับ API server

### Express 4
- Minimal and unopinionated framework
- Ecosystem กว้าง มี middleware พร้อมใช้
- เหมาะกับ RESTful API

### MySQL 8
- Relational database ที่เสถียร
- รองรับ JSON fields, Full-text search
- มีการรองรับ charset utf8mb4 สำหรับภาษาไทย

### Docker Compose (Dev)
- ทำให้ environment สม่ำเสมอทุกเครื่อง
- ง่ายต่อการตั้งค่า dependencies เช่น MySQL, phpMyAdmin
- ไม่ต้องติดตั้ง MySQL บน host โดยตรง

### phpMyAdmin (Dev)
- GUI สำหรับจัดการ MySQL ใน Development
- ไม่ต้องใช้ CLI ตลอดเวลา ช่วยประหยัดเวลา

### Railway
- Deployment platform ที่ง่าย รองรับ Dockerfile โดยตรง
- จัดการ SSL, Domain และ Environment Variables เอง
- เหมาะกับโปรเจกต์ขนาดเล็ก-กลาง

---

## 5. Development Environment

### Service Ports

| Service | Host Port | Container Port | Protocol |
|---|---|---|---|
| Frontend (Vite) | 5173 | 5173 | HTTP |
| Backend (Express) | 5000 | 5000 | HTTP |
| MySQL | 3307 | 3306 | TCP |
| phpMyAdmin | 8081 | 80 | HTTP |

### Hot Reload

- **Frontend**: Vite HMR ทำงานอัตโนมัติเมื่อไฟล์เปลี่ยน
- **Backend**: Nodemon watch source files และ restart อัตโนมัติ

### Docker Network

- ทุก service อยู่ใน custom Docker bridge network เดียวกัน (`gymyamjamsai-net` หรือตั้งชื่อตามโปรเจกต์)
- Service ติดต่อกันภายใน Docker ผ่าน **service name** และ **internal port** เท่านั้น
- ห้ามใช้ `localhost` สำหรับการสื่อสารระหว่าง service ภายใน Docker

### Anonymous Volume

- `node_modules` ของ frontend และ backend ใช้ **anonymous volume**
- ป้องกัน host overwrite ที่อาจทำให้เกิดปัญหา architecture ไม่ตรง (เช่น ARM vs x86)
- เมื่อเพิ่ม package ใหม่ต้อง rebuild container เสมอ

### Environment Variables

- ใช้ไฟล์ `.env` สำหรับ local development
- `docker-compose.yml` อ้างอิงค่าด้วยรูปแบบ `${VARIABLE:-default}`
- ห้าม commit `.env` ลงใน Git

### MySQL Healthcheck

- MySQL container ต้องมี healthcheck
- Service ที่พึ่งพา DB ต้องใช้ `depends_on` พร้อม `condition: service_healthy`
- ป้องกัน backend เชื่อมต่อ DB ก่อนที่ MySQL พร้อมรับ connection

### SQL Init Script

- วางที่ `db/init/01-init.sql`
- Mount เข้า Docker ที่ `/docker-entrypoint-initdb.d/`
- ใช้ charset `utf8mb4` และ collation `utf8mb4_unicode_ci` สำหรับรองรับภาษาไทย

### docker-compose.yml

- ไม่ใส่ `version:` attribute (deprecated ใน Docker Compose รุ่นใหม่)

---

## 6. Production Environment

### Railway (Primary Target)

- Deploy จาก root `Dockerfile` แบบ **multi-stage build**
- Stage 1: Build frontend (`npm run build`) → ได้ static files
- Stage 2: Copy static files ไปไว้ใน backend และ serve ผ่าน Express
- Railway จัดการ SSL certificate และ custom domain เอง
- ไม่ต้องใช้ Nginx แยก

### Environment Variables บน Railway

- ตั้งค่า production secrets ผ่าน Railway Environment Variables
- ห้ามเขียน secrets ลงใน Dockerfile หรือ source code

### Ephemeral Filesystem

- Railway filesystem เป็น **ephemeral** (ข้อมูลหาย เมื่อ container restart)
- ถ้ามีฟีเจอร์ file upload ในอนาคต ต้องใช้ Railway Volume หรือ Object Storage ภายนอก (เช่น S3, Cloudflare R2)

### On-Premise / Ubuntu (ทางเลือก)

- ใช้ image เดียวกันกับ Railway
- เพิ่ม MySQL container และ Nginx reverse proxy แยก
- โค้ดต้องไม่ผูกกับ deployment target ใด target หนึ่ง
- Config ทั้งหมดผ่าน environment variables

---

## 7. Tools Required

| Tool | Purpose | Required |
|---|---|---|
| Node.js 20 LTS | Backend runtime | ✅ |
| npm | Package manager | ✅ |
| Docker Desktop | Dev environment | ✅ |
| Docker Compose | Service orchestration | ✅ |
| Git | Version control | ✅ |
| VS Code / IDE | Code editor | ✅ |
| Postman / Thunder Client | API testing | Recommended |
| GitHub CLI (`gh`) | GitHub integration | Optional |
| Railway CLI | Deployment | Optional |

---

## 8. Folder Strategy เบื้องต้น

```
gymyamjamsai/
├── frontend/               # React + Vite app
│   ├── src/
│   ├── public/
│   ├── Dockerfile.dev
│   └── vite.config.ts
├── backend/                # Node.js + Express API
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   ├── middleware/
│   │   └── database/
│   ├── Dockerfile.dev
│   └── server.js
├── db/
│   └── init/
│       └── 01-init.sql     # MySQL init script
├── docs/
│   ├── planning/           # Planning documents
│   ├── testing/
│   └── deployment/
├── .agents/
│   └── skills/             # AI skill definitions
├── docker-compose.yml      # Dev environment
├── Dockerfile              # Production multi-stage
├── .env                    # Local secrets (not committed)
├── .env.example            # Example env vars (committed)
└── .gitignore
```

---

## 9. Constraints

- ห้ามใช้ Nginx แยกสำหรับ production (Railway จัดการเอง)
- ห้ามใส่ secrets ลงใน source code หรือ Dockerfile โดยตรง
- Railway filesystem เป็น ephemeral ห้ามเก็บ user uploads ใน container โดยไม่มี Volume
- ทุก service ใน Docker ต้องสื่อสารกันผ่าน service name ไม่ใช้ `localhost`
- ไม่ใส่ `version:` attribute ใน `docker-compose.yml`
- `node_modules` ต้องใช้ anonymous volume เสมอ

---

## 10. Assumptions

- ผู้ใช้งานเข้าถึงระบบผ่าน Web Browser บน Desktop หรือ Mobile
- ระบบเริ่มต้นเป็น Single-tenant (ผู้ใช้แต่ละคนจัดการ data ของตัวเอง)
- ไม่มี real-time features (WebSocket) ในเวอร์ชันแรก
- ไม่มี payment gateway ในเวอร์ชันแรก
- Railway รองรับ MySQL ผ่าน Railway MySQL plugin หรือ external DB service
- Development ทำบนเครื่องที่ติดตั้ง Docker Desktop แล้ว

---

## 11. Open Questions

| # | คำถาม | ผู้รับผิดชอบ | สถานะ |
|---|---|---|---|
| 1 | Database สำหรับ production จะใช้ Railway MySQL หรือ external provider? | Project Owner | ❓ Open |
| 2 | ต้องการ Email notification หรือไม่? ถ้าใช่ ใช้ service ใด? | Project Owner | ❓ Open |
| 3 | ต้องการระบบ Admin panel แยกหรือรวมใน app เดียว? | Project Owner | ❓ Open |
| 4 | ต้องการ Social Login (Google, Facebook) หรือ Email/Password เท่านั้น? | Project Owner | ❓ Open |
| 5 | Scale target: รองรับผู้ใช้งาน concurrent สูงสุดเท่าไร? | Project Owner | ❓ Open |

---

## 12. Key Decisions

| Decision | ทางเลือกที่ไม่เลือก | เหตุผล |
|---|---|---|
| ใช้ Vite แทน CRA | Create React App | CRA deprecated, Vite เร็วกว่ามาก |
| ใช้ Railway แทน Vercel+Render แยก | Split deployment | ลด complexity, single container เพียงพอสำหรับ MVP |
| ไม่ใช้ Nginx ใน production | Nginx reverse proxy | Railway จัดการ routing เอง |
| ใช้ anonymous volume สำหรับ node_modules | Bind mount node_modules | ป้องกันปัญหา architecture และ permission |
| ใช้ MySQL แทน PostgreSQL | PostgreSQL | ทีมคุ้นเคยกับ MySQL |
| CSS Vanilla แทน Tailwind/MUI | CSS Frameworks | ยืดหยุ่น ไม่มี dependency lock-in |

---

## 13. Docker Service Map & Port Mapping

```
┌─────────────────────────────────────────────────────┐
│              Docker Compose Network                  │
│                 (gymyamjamsai-net)                   │
│                                                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────────┐  │
│  │ frontend │    │ backend  │    │    mysql      │  │
│  │ :5173    │───▶│  :5000   │───▶│    :3306     │  │
│  └──────────┘    └──────────┘    └──────────────┘  │
│                                         │           │
│                        ┌────────────────┘           │
│                        ▼                            │
│                  ┌──────────┐                       │
│                  │phpmyadmin│                       │
│                  │  :80     │                       │
│                  └──────────┘                       │
└─────────────────────────────────────────────────────┘

Host Port Mapping:
  localhost:5173  ──▶  frontend:5173
  localhost:5000  ──▶  backend:5000
  localhost:3307  ──▶  mysql:3306
  localhost:8081  ──▶  phpmyadmin:80
```

---

## 14. Docker Network Rules

| Rule | รายละเอียด |
|---|---|
| Network type | Custom bridge network |
| Service communication | ใช้ service name เท่านั้น (ไม่ใช้ `localhost`) |
| Internal port | ใช้ internal port (ไม่ใช้ host-mapped port) |
| DB access from backend | `mysql:3306` ไม่ใช่ `localhost:3307` |
| DB access from phpMyAdmin | `mysql:3306` ไม่ใช่ `localhost:3307` |
| Host access | ผ่าน mapped ports เท่านั้น |

---

## 15. Environment Variable Strategy

| ไฟล์ | วัตถุประสงค์ | Commit? |
|---|---|---|
| `.env` | Local development secrets | ❌ ห้าม commit |
| `.env.example` | Template ค่าตัวอย่าง | ✅ Commit |
| `docker-compose.yml` | อ้างอิง env vars ด้วย `${VAR:-default}` | ✅ Commit |
| Railway Variables | Production secrets | N/A (platform) |

### ตัวอย่าง `.env.example`

```
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=mysql
DB_PORT=3306
DB_NAME=gymyamjamsai
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=24h

# Frontend
VITE_API_URL=http://localhost:5000
```

---

## 16. Known Setup Risks / Lessons Learned

### ⚠️ `version` ใน Docker Compose เป็น Attribute ที่ล้าสมัย

Docker Compose รุ่นใหม่ (Compose V2 ขึ้นไป) ไม่ใช้ attribute `version:` แล้ว
การใส่ `version: "3.8"` จะทำให้ได้รับ warning หรือ error ในบางระบบ
**กฎ**: ห้ามใส่ `version:` ใน `docker-compose.yml` ทุกกรณี

### ⚠️ `node_modules` ใน Docker ต้องใช้ Anonymous Volume

หากใช้ bind mount สำหรับ `node_modules` โดยตรง:
- `node_modules` บน host อาจ overwrite `node_modules` ใน container
- Binary files ที่ compile สำหรับ ARM อาจไม่ทำงานบน x86 container (และกลับกัน)
- package ที่มี native bindings อาจพัง

**กฎ**: ใช้ anonymous volume สำหรับ `node_modules` เสมอ
เมื่อเพิ่ม package ใหม่ใน `package.json` ต้อง **rebuild container** (`docker-compose up --build`)
ห้าม `npm install` บน host แล้วหวังว่า container จะใช้ได้

### ⚠️ Backend อาจเชื่อมต่อ DB ไม่ได้ถ้าไม่มี Healthcheck

MySQL container อาจยัง "กำลัง initialize" อยู่แม้ว่า container status จะเป็น `running` แล้ว
ถ้า backend เริ่มก่อน MySQL พร้อม จะได้รับ connection error และ crash

**กฎ**: MySQL ต้องมี healthcheck ที่ทดสอบการเชื่อมต่อจริง
Service ที่ต้องการ DB ต้องใช้ `depends_on` พร้อม `condition: service_healthy`

### ⚠️ macOS AirPlay Receiver ใช้ Port 5000

บน macOS Monterey ขึ้นไป AirPlay Receiver จะ bind port 5000
ถ้า backend ใช้ port 5000 อาจเกิด conflict

**กฎ**: บน macOS ให้ใช้ port 5001 สำหรับ backend หรือปิด AirPlay Receiver

### ⚠️ Apple Silicon ARM Architecture

Image บางตัวไม่รองรับ ARM โดยตรง เช่น phpMyAdmin บางเวอร์ชัน
ต้องระบุ `platform: linux/amd64` เฉพาะ service ที่จำเป็นเท่านั้น

### ⚠️ Railway Ephemeral Filesystem

Railway ไม่มี persistent filesystem โดย default
File uploads ใดๆ จะหายเมื่อ container restart
ต้องใช้ Railway Volume หรือ external Object Storage ถ้าต้องการ persistence
