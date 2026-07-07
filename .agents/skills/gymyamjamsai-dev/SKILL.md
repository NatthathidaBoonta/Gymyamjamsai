---
name: gymyamjamsai-dev
description: AI coding assistant skill สำหรับโปรเจกต์ Gymyamjamsai — ระบบติดตามพัฒนาการการออกกำลังกายออนไลน์ (React 18 + Vite 5 + Node.js 20 + Express 4 + MySQL 8 + Docker Compose + Railway)
---

# SKILL: gymyamjamsai-dev

## Purpose

ไฟล์นี้เป็นคู่มือการทำงานของ AI สำหรับโปรเจกต์ **Gymyamjamsai**
ใช้ควบคุมพฤติกรรม ขอบเขต และมาตรฐานการทำงานของ AI ตลอดทุก Phase

**อ่านไฟล์เหล่านี้ก่อนเริ่มทำงานทุกครั้ง:**
1. `SKILL.md` (ไฟล์นี้)
2. `docs/planning/00-ai-working-rules.md`
3. `docs/planning/00-tech-stack-decision.md`
4. `docs/planning/PROJECT_CONTEXT.md` (ก่อน implementation)
5. `docs/planning/10-implementation-plan.md` (ก่อนแต่ละ Phase)

**When to Use**: ใช้เมื่อทำงานกับโปรเจกต์ Gymyamjamsai ทุก Phase

**When NOT to Use**: ห้ามใช้ skill นี้กับโปรเจกต์อื่น

---

## 1. Project Working Principles

- ทำงานเป็น Phase ตามลำดับ ห้ามข้ามหรือทำล่วงหน้า
- Planning ต้องเสร็จก่อน Implementation เสมอ
- ทุกการตัดสินใจสำคัญต้องได้รับ approval จากผู้ใช้
- Document ต้อง sync กับ Code เสมอ
- ทุก Phase ต้องผ่าน Acceptance Criteria ก่อนปิด

### Project Architecture

```
gymyamjamsai/
├── frontend/               # React 18 + Vite 5 + CSS
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/       # API calls (axios)
│   │   ├── hooks/
│   │   ├── context/
│   │   └── routes/
│   └── vite.config.ts
├── backend/                # Node.js 20 + Express 4
│   ├── src/
│   │   ├── modules/        # Feature modules (auth, profile, exercise...)
│   │   ├── middleware/
│   │   └── database/
│   └── server.js
├── db/
│   └── init/
│       └── 01-init.sql
├── docs/
│   └── planning/
├── .agents/
│   └── skills/
│       └── gymyamjamsai-dev/
│           └── SKILL.md    (ไฟล์นี้)
├── docker-compose.yml
├── Dockerfile              # Multi-stage production build
└── .env.example
```

### Service Map & Ports

| Service | Internal (Docker) | Host (Dev) |
|---|---|---|
| Frontend | `frontend:5173` | `localhost:5173` |
| Backend | `backend:5000` | `localhost:5000` |
| MySQL | `mysql:3306` | `localhost:3307` |
| phpMyAdmin | `phpmyadmin:80` | `localhost:8081` |

### Docker Network Rules

- Network: custom bridge (`gymyamjamsai-net`)
- Backend เชื่อมต่อ DB ด้วย: `mysql:3306` (**ไม่ใช่** `localhost:3307`)
- phpMyAdmin เชื่อมต่อ DB ด้วย: `mysql:3306`

---

## 2. AI General Rules

- อ่าน SKILL.md และ planning docs ก่อนเริ่มงานทุกครั้ง
- ทำเฉพาะ Phase ที่ได้รับมอบหมาย
- แจ้งเมื่อจบ Phase และรอ approval ก่อน Phase ถัดไป
- รายงานทุกไฟล์ที่สร้าง/แก้ไข/ลบ
- ไม่ตัดสินใจเรื่อง Architecture โดยไม่ได้รับอนุญาต

---

## 3. Planning Rules

- ห้ามเขียน Code ก่อน Planning เสร็จ
- ถามเมื่อ Requirement ไม่ชัด อย่าสมมติเอง
- Planning Document ต้องมี: วัตถุประสงค์, ขอบเขต, Out of Scope
- ทุก planning doc ต้องอ้างอิง tech stack จาก `00-tech-stack-decision.md`

---

## 4. Implementation by Phase Rules

- อ่าน `10-implementation-plan.md` ก่อนทุก Phase
- ทำงานทีละ Phase ตามลำดับที่กำหนด
- ทุก Phase ต้องมีก่อนจบ:
  - วิธีรัน (How to Run)
  - วิธีทดสอบ (How to Test)
  - Acceptance Criteria Checklist
  - Git Commit Message ที่แนะนำ
  - Phase Completion Report

---

## 5. Frontend Development Rules

- ใช้ React 18 Functional Components + Hooks เท่านั้น
- ใช้ Vite 5 สำหรับ build tool
- ใช้ CSS Vanilla (ห้ามเพิ่ม Tailwind, MUI หรือ CSS Framework อื่นโดยไม่แจ้ง)
- API calls ทั้งหมดผ่าน `src/services/` โดยใช้ axios instance จาก `src/services/api.ts`
- State management: React Context หรือ useState/useReducer (ห้ามเพิ่ม Redux โดยไม่แจ้ง)
- ทุก API URL อ้างอิงจาก `VITE_API_URL` env var เสมอ
- Component ต้องมี comment อธิบาย props และวัตถุประสงค์
- จัดการ loading state และ error state ทุก API call

---

## 6. Backend Development Rules

- ใช้ Node.js 20 LTS + Express 4
- โครงสร้าง Modular Monolith: แยกเป็น modules (auth, profile, exercise, workout-plan เป็นต้น)
- ทุก module มี: `router.js`, `controller.js`, `service.js`, `repository.js`
- Middleware แยกไว้ที่ `src/middleware/`
- Database pool ที่ `src/database/index.js`
- ทุก route ต้องมี input validation (ใช้ express-validator หรือ custom DTO)
- Error handling ผ่าน centralized error middleware
- ไม่เขียน SQL ใน controller ต้องผ่าน repository เสมอ
- ใช้ environment variables สำหรับทุก config ที่เปลี่ยนได้

---

## 7. Database Development Rules

- ใช้ MySQL 8 charset `utf8mb4` collation `utf8mb4_unicode_ci`
- ทุก table ต้องมี: `id` (VARCHAR 36, UUID), `created_at`, `updated_at`
- ไม่ใช้ Auto Increment integer เป็น primary key — ใช้ UUID แทน
- Foreign key ต้องมี constraint ที่ชัดเจน
- Index ต้องกำหนดสำหรับ column ที่ใช้ filter/join บ่อย
- SQL init script อยู่ที่ `db/init/01-init.sql`
- ห้ามเปลี่ยน schema โดยไม่อัปเดต `docs/planning/05-database-design.md`

---

## 8. API Development Rules

- ทุก endpoint ตาม RESTful conventions
- Response format มาตรฐาน:
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "...",
    "pagination": { ... }  // ถ้ามี
  }
  ```
- Error response format:
  ```json
  {
    "success": false,
    "message": "Human-readable error",
    "error": "ERROR_CODE"
  }
  ```
- HTTP Status codes: 200, 201, 400, 401, 403, 404, 422, 500
- Authentication ผ่าน JWT Bearer token ใน `Authorization` header
- ทุก API ต้องระบุใน `docs/planning/06-api-contract.md`
- ห้ามเปลี่ยน API Contract โดยไม่แจ้งและไม่อัปเดต doc

---

## 9. Docker Development Rules

- ห้ามใส่ `version:` ใน `docker-compose.yml`
- ใช้ bind mounts สำหรับ source code
- ใช้ anonymous volume สำหรับ `node_modules`
- Backend/phpMyAdmin ต้องเชื่อมต่อ DB ผ่าน service name ไม่ใช่ `localhost`
- MySQL ต้องมี healthcheck
- Service ที่ต้องการ DB ต้องใช้ `depends_on` + `condition: service_healthy`
- เมื่อเพิ่ม package ใหม่ ต้อง rebuild container ด้วย `docker-compose up --build`
- ทุก environment variable ผ่าน `.env` file
- `docker-compose.yml` อ้างอิงด้วยรูปแบบ `${VAR:-default}`

### คำสั่งที่ใช้บ่อย

```bash
# Start all services
docker-compose up -d

# Rebuild after adding packages
docker-compose up --build

# View logs
docker-compose logs -f backend

# Stop all
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

---

## 10. Testing Rules

- ทุก Phase ต้องมี Test Cases ก่อนปิด
- API ทดสอบด้วย Postman หรือ curl
- Frontend ทดสอบด้วย Browser
- Acceptance Criteria ต้องผ่านทั้งหมดก่อนปิด Phase
- Unit test (ถ้ามี) ต้องผ่านทั้งหมด
- ระบุ test command ใน Phase Completion Report

---

## 11. Debugging Rules

- วิเคราะห์ Root Cause ก่อนเสนอ Fix
- แสดง Error message และ Stack trace
- อธิบายสาเหตุและวิธีแก้
- ถ้า Fix กระทบ scope นอก Phase ปัจจุบัน ต้องแจ้งก่อน
- บันทึก significant bug และ fix ลงใน documentation

---

## 12. Documentation Rules

- อัปเดต doc ทุกครั้งที่เปลี่ยน Architecture, API, DB Schema
- Code ห้ามล้ำหน้า Document
- ใช้ภาษาที่ชัดเจน อ่านง่าย
- ตารางสำหรับข้อมูลเชิงเปรียบเทียบ
- Code block สำหรับตัวอย่าง command

---

## 13. Git Commit Rules

- ใช้ Conventional Commits: `<type>(<scope>): <subject>`
- Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`
- Subject กระชับ ไม่เกิน 72 ตัวอักษร
- ตรวจ `git status` ก่อน commit เสมอ
- ตรวจว่า `.env` ไม่ถูก track

### ตัวอย่าง Commit Messages

```
docs: add tech stack decision
docs: add AI working rules
docs: add system overview
docs: add project context
feat: complete phase 1 project setup
fix: resolve backend database connection
chore: update docker compose configuration
feat: implement auth module (login/register)
feat: implement exercise CRUD endpoints
refactor: extract database pool to singleton
```

---

## 14. Security Rules

- ห้ามเขียน secrets ลงใน source code โดยตรง
- JWT secret ต้องผ่าน environment variable เสมอ
- Password ต้องถูก hash ด้วย bcrypt ก่อน store
- ทุก protected route ต้องผ่าน auth middleware
- Input validation ทุก endpoint
- ห้าม log sensitive data (password, token)

---

## 15. Forbidden Actions

| ห้ามทำ |
|---|
| เขียน Code ก่อน Planning เสร็จ |
| ทำ Phase ถัดไปโดยไม่ได้รับ approval |
| เพิ่ม Feature นอกแผน |
| เปลี่ยน Tech Stack โดยไม่แจ้ง |
| เปลี่ยน DB Schema โดยไม่อัปเดต doc |
| เปลี่ยน API Contract โดยไม่แจ้ง |
| Commit `.env` หรือ secrets |
| ใช้ `localhost` ระหว่าง Docker services |
| ใส่ `version:` ใน docker-compose.yml |
| Bind mount `node_modules` |
| ใช้ library ใหม่โดยไม่แจ้ง |

---

## 16. Required Response Format

ทุก response ที่เกี่ยวกับ implementation ต้องมีส่วนต่อไปนี้:

```markdown
### 📁 Files Changed
- [CREATE] path/to/new-file.js
- [MODIFY] path/to/existing-file.js
- [DELETE] path/to/removed-file.js

### ▶️ How to Run
<คำสั่งที่ใช้รัน>

### 🧪 How to Test
<ขั้นตอนทดสอบ step-by-step>

### ✅ Acceptance Criteria
- [ ] criteria 1
- [ ] criteria 2
- [ ] criteria 3

### 💬 Recommended Commit Message
<type>(<scope>): <subject>
```

---

## 17. Phase Completion Report Format

เมื่อจบ Phase ต้องส่ง report ในรูปแบบ:

```markdown
## Phase X Completion Report

### ✅ What Was Done
- สิ่งที่ทำใน Phase นี้

### 📁 Files Created/Modified
- [CREATE] path/to/file
- [MODIFY] path/to/file

### 🧪 Test Results
- [ ] Acceptance Criteria 1 — PASS/FAIL
- [ ] Acceptance Criteria 2 — PASS/FAIL

### ⚠️ Issues / Deviations
- ปัญหาที่พบและวิธีแก้ (ถ้ามี)

### 💬 Recommended Commit Message
feat(phase-X): <description>

### ➡️ Next Phase
Phase X+1: <ชื่อ Phase ถัดไป> — รอ approval ก่อนเริ่ม
```
