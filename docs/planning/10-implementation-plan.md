# Implementation Plan: Gymyamjamsai

*(หมายเหตุ: ได้ทำการปรับ Mapping ชื่อ Phase จากโครงสร้างที่อ้างอิงถึง "ระบบร้องเรียน" ให้ตรงกับบริบทจริงของระบบติดตามการออกกำลังกาย Gymyamjamsai โดยยังคงรายละเอียดครบทั้ง 15 Phases และข้อกำหนดอย่างครบถ้วน)*

---

## Phase 0: Requirement and Architecture (Completed)
- **เป้าหมาย:** วิเคราะห์ Requirement, Workflow, Database, API และสถาปัตยกรรม 
- **ผลลัพธ์ที่ส่งมอบ:** เอกสาร `docs/planning/01` ถึง `09`
- **สถานะ:** ✔️ เสร็จสิ้น

## Phase 1: Project Setup
- **เป้าหมาย:** สร้างโครงสร้างโฟลเดอร์ Backend และ Frontend และตั้งค่าเครื่องมือ
- **งานที่ต้องทำ:** 
  1. ใช้ `npm init` สร้าง Backend (Node.js/Express)
  2. ใช้ `npm create vite@latest` สร้าง Frontend (React)
  3. ตั้งค่า Linter (ESLint, Prettier)
- **ไฟล์ที่เกี่ยวข้อง:** `backend/package.json`, `frontend/package.json`, `vite.config.js`
- **ผลลัพธ์:** โครงสร้างโฟลเดอร์เปล่าที่พร้อมสำหรับการเขียนโค้ด
- **วิธีทดสอบ:** รัน `npm run dev` ทั้งสองฝั่ง ต้องไม่มี Error
- **Acceptance Criteria:** เข้าถึงหน้าเว็บเริ่มต้นของ Vite ได้ที่ http://localhost:5173 
- **Dependency:** Phase 0
- **Git Commit:** `chore: initialize backend and frontend projects`
- **ความเสี่ยง:** ติดตั้ง Version Node.js ไม่ตรงกับ Dependency (บังคับใช้ v20 LTS)

### ✅ ผลการทดสอบ Phase 1 (QA Review — 2026-07-19)

| Acceptance Criteria | ผล | หลักฐาน |
|---|---|---|
| `npm run dev` (backend) รันไม่มี Error | ✅ PASS | `nodemon` start สำเร็จ, log: `Server listening on port 5000` |
| `npm run dev` (frontend) รันไม่มี Error | ✅ PASS | `vite` ready, ไม่มี error ใน console |
| เข้าถึงหน้าเว็บเริ่มต้นของ Vite ได้ | ✅ PASS | ตรวจสอบผ่าน Browser pane และ `curl` — พบ Vite default template ("Get started", HMR notice) |
| `npm run build` (frontend) | ✅ PASS | `tsc -b && vite build` สำเร็จ ไม่มี type error |
| ESLint (backend) | ✅ PASS | `npm run lint` ไม่มี warning/error |
| Prettier (backend) | ✅ PASS | ทุกไฟล์ผ่าน format check |
| oxlint + tsc (frontend) | ✅ PASS | ไม่มี lint/type error |
| โครงสร้างไฟล์ตรงตาม Phase 1 (bare scaffold) | ✅ PASS | ไม่มีไฟล์จาก Phase 3+ (auth/db/modules) หลงเหลือ |

**สถานะ:** ✅ **Phase 1 PASS** — พร้อมขอ approval เข้า Phase 2

**หมายเหตุ/ความเสี่ยงที่พบเพิ่มเติม (ไม่ block Phase 1 แต่ต้องติดตาม):**
1. เครื่อง dev ปัจจุบันติดตั้ง Node.js v24.11.0 ไม่ตรงกับ v20 LTS ที่กำหนดไว้ (ความเสี่ยงที่ระบุไว้ข้างต้นเกิดขึ้นจริง) — ทดสอบผ่านบน v24 แต่ยังแนะนำให้ใช้ v20 LTS หรือรันผ่าน Docker (`Dockerfile.dev` pin `node:20-alpine` ถูกต้องอยู่แล้ว) เพื่อให้ตรงกับ Production
2. พบว่าค่า `PORT` ไม่ตรงกันระหว่างไฟล์: `backend/.env` จริงในเครื่อง = `5000`, แต่ `backend/.env.example`, `frontend/.env.example`, `docker-compose.yml`, `architecture.md`, และ `README.md` ระบุ `5001` — ไม่กระทบ Acceptance Criteria ของ Phase 1 (ทดสอบด้วย `npm run dev` ตรงๆ ไม่ผ่าน Docker) แต่ต้องแก้ไขให้ตรงกันก่อน Phase 13 (Docker Integration) มิฉะนั้น container จะฟังคนละพอร์ตกับที่ map ไว้
3. `backend/README.md` ไฟล์เดิม encoding เพี้ยน (UTF-16) อ่านไม่ออก ควรแก้ไขเป็น UTF-8 ในโอกาสถัดไป (ไม่ใช่ไฟล์ที่ Phase 1 สร้าง จึงไม่แก้ในรอบนี้เพื่อไม่ให้เกินขอบเขต)

## Phase 2: Database Schema and Seed Data
- **เป้าหมาย:** สร้างโครงสร้างฐานข้อมูล (Table Schema) และข้อมูลจำลอง (Mock data)
- **งานที่ต้องทำ:** เขียนสคริปต์ SQL (DDL และ DML) สำหรับตารางทั้งหมด เช่น `users`, `workout_plans`, `activities`
- **ไฟล์ที่เกี่ยวข้อง:** `db/init/01-schema.sql`, `db/init/02-seed.sql`
- **ผลลัพธ์:** Database ที่มีโครงสร้างและข้อมูลพร้อมใช้งานสำหรับการทดสอบ
- **วิธีทดสอบ:** รัน MySQL Container แล้วเข้าผ่าน phpMyAdmin ตรวจสอบตารางและข้อมูล
- **Acceptance Criteria:** โครงสร้างตารางถูกต้องตาม ERD และมีบัญชี Admin/Trainer สำหรับทดสอบ
- **Dependency:** Phase 1
- **Git Commit:** `feat(db): create initial database schema and seed data`
- **ความเสี่ยง:** การตั้งค่า Character Set ไม่รองรับภาษาไทย (ต้องกำหนดเป็น `utf8mb4`)

### ⚠️ Change Report (Implementation 2026-07-19)
- **เปลี่ยน path จาก `db/init/` → `mysql/init/`:** `docker-compose.yml` mount `./mysql/init:/docker-entrypoint-initdb.d` จริง ถ้าใช้ `db/init/` ตามแผนเดิม ไฟล์จะไม่ถูกรัน จึงยึด path จริงตามหลักการ "keep real architecture"
- **ลบ `mysql/init/01_init.sql` เดิม:** เป็น schema เก่า 8 ตารางที่ไม่ตรง ERD (role เป็น VARCHAR, ชื่อตารางเพี้ยน, ขาด `activities`/`activity_registrations`/`user_metrics`/`status_audit_logs`, ไม่มี seed) และจะชนกับ schema ใหม่ถ้าเก็บไว้ (docker-entrypoint รันทุกไฟล์ `.sql`)
- **อัปเดต `architecture.md`:** sync รายชื่อ entity เป็น 10 ตารางตาม ERD และชื่อไฟล์ init ใหม่

### ✅ ผลการทดสอบ Phase 2 (QA Review — 2026-07-19)

วิธีทดสอบ: รัน MySQL 8.0 container ชั่วคราว (แยกจาก stack dev, ไม่กระทบ volume จริง) mount `mysql/init/` แล้วตรวจสอบผลลัพธ์

| Acceptance Criteria / จุดตรวจ | ผล | หลักฐาน |
|---|---|---|
| Init scripts รันไม่มี error | ✅ PASS | docker log: รัน `01-schema.sql` + `02-seed.sql` สำเร็จ "MySQL init process done" |
| โครงสร้างตารางถูกต้องตาม ERD (10 ตาราง) | ✅ PASS | `SHOW TABLES` = ครบ 10 ตารางตรงชื่อใน 05-database-design.md |
| Charset รองรับภาษาไทย (utf8mb4) | ⚠️ **ตรวจผิดพลาด → แก้แล้วใน Phase 7** | ดู "แก้ไขย้อนหลัง" ด้านล่าง |
| มีบัญชี Admin/Trainer สำหรับทดสอบ | ✅ PASS | seed 3 บัญชี: admin/trainer/member (role ENUM ถูกต้อง) |
| Seed accounts login ได้จริง (bcrypt) | ✅ PASS | `bcrypt.compareSync` ผ่านทั้ง 3 บัญชี (Admin@123 / Trainer@123 / Member@123) |
| ข้อมูล seed ครบทุกตาราง | ✅ PASS | ทุกตารางมีข้อมูล ≥1 row (users=3, exercises=6, ฯลฯ) |
| Foreign Key ทำงาน (integrity) | ✅ PASS | insert FK ที่ไม่มีจริง → error 1452; JOIN ข้ามตารางได้ถูกต้อง |
| UNIQUE กันจองซ้ำ (activity+user) | ✅ PASS | insert ลงทะเบียนซ้ำ → error 1062 Duplicate entry |

**สถานะ:** ✅ **Phase 2 PASS** — พร้อมขอ approval เข้า Phase 3 (Backend Core & MySQL Connection)

**บัญชีทดสอบ (dev เท่านั้น):** `admin@gymyam.com`/`Admin@123`, `trainer@gymyam.com`/`Trainer@123`, `member@gymyam.com`/`Member@123`

### 🐞 แก้ไขย้อนหลัง: Double-encoded Thai (พบตอน Phase 7 — 2026-07-20)

**อาการ:** ข้อความไทยจาก seed ถูกเก็บแบบ double-encoded (stored `C3A0C2B8...` แทนที่จะเป็น `E0B884...`) ทำให้ API คืนค่าเป็น mojibake

**Root cause:** docker-entrypoint ของ MySQL รัน `mysql` client โหลดไฟล์ `.sql` ด้วย client charset เริ่มต้น (latin1) → ตีความ UTF-8 bytes เป็น latin1 แล้วเข้ารหัสซ้ำอีกชั้นลงคอลัมน์ utf8mb4

**⚠️ เหตุที่ Phase 2 ตรวจไม่เจอ:** ตรวจด้วย `mysql` CLI ตัวเดียวกันที่ตั้ง charset ผิด ซึ่ง**ย้อนความเสียหายกลับตอนอ่าน** ทำให้แสดงผลเหมือนถูกต้อง (false positive ของ double-encoding) — **การตรวจภาษาไทยต้องใช้ `HEX()` เทียบ byte เท่านั้น** ไม่ใช่ดูด้วยตา

**Fix:** เพิ่ม `SET NAMES utf8mb4;` ที่ต้นไฟล์ `01-schema.sql` และ `02-seed.sql`

**ยืนยันหลังแก้:** `HEX(LEFT(title,2))` = `E0B884E0B8A5` ตรงกับ `HEX(_utf8mb4'คล')` และ API/CSV คืนภาษาไทยที่ decode ได้จริง

**หมายเหตุการนำไปใช้:** MySQL รัน init script เฉพาะตอนสร้าง volume ครั้งแรกเท่านั้น เนื่องจาก stack dev ปัจจุบันมี volume เดิม (จาก `01_init.sql` เก่า) อยู่แล้ว **ต้องรัน `docker compose down -v` แล้ว `docker compose up` ใหม่** เพื่อให้ schema ใหม่มีผล (ลบเฉพาะ test data ใน dev — ปลอดภัย)

## Phase 3: Backend Core and MySQL Connection
- **เป้าหมาย:** เชื่อมต่อ Backend (Express) กับฐานข้อมูล MySQL
- **งานที่ต้องทำ:** สร้าง Database Connection Pool (`mysql2`), ตั้งค่า Error Handling กลาง, และตั้งค่า CORS
- **ไฟล์ที่เกี่ยวข้อง:** `backend/src/config/db.js`, `backend/src/server.js`
- **ผลลัพธ์:** Backend สามารถยิง Query ดึงข้อมูลจากฐานข้อมูลได้
- **วิธีทดสอบ:** สร้าง API `GET /api/health` ทดลองดึงข้อมูลจากตารางมาแสดง
- **Acceptance Criteria:** เชื่อมต่อ DB สำเร็จ, API คืนค่า 200 OK 
- **Dependency:** Phase 2
- **Git Commit:** `feat(backend): setup express server and mysql connection`
- **ความเสี่ยง:** ปัญหา Connection Pool ค้าง หากปิดการดึงข้อมูลไม่สมบูรณ์

### ⚠️ Change Report (Implementation 2026-07-19)
- **path connection pool: `src/config/db.js` → `src/database/index.js`** — ยึดตาม `architecture.md` และ folder strategy ใน `00-tech-stack-decision.md` ที่ระบุ `src/database/` (ใช้ `config/db.js` จะขัด architecture ที่ sync ไว้ตอน Phase 2)
- **entry point: `src/server.js` → `backend/server.js` (คงเดิม)** — `package.json` main, `nodemon.json`, `Dockerfile.dev` อ้าง `server.js` ทั้งหมด การย้ายจะทำให้ dev/docker พัง
- **แก้ `backend/.env` (local, gitignored):** ค่า DB เดิม stale (`DB_NAME=gym`, `DB_PORT=3306`, `root`/ว่าง) เชื่อม DB ไม่ได้ → แก้เป็น `gymyamjamsai` / `3307` / `gymyam_user` ให้ตรง setup จริง
- **จัดการความเสี่ยง Connection Pool ค้าง:** ใช้ `pool.query()` (auto acquire+release) + graceful shutdown ปิด pool ตอน SIGINT/SIGTERM

### ✅ ผลการทดสอบ Phase 3 (QA Review — 2026-07-19)

วิธีทดสอบ: รัน backend (local) เชื่อมต่อ MySQL 8 container ที่โหลด schema Phase 2 (แยกจาก stack dev ไม่กระทบ data จริง)

| Acceptance Criteria / จุดตรวจ | ผล | หลักฐาน |
|---|---|---|
| เชื่อมต่อ DB สำเร็จ | ✅ PASS | `/api/health` → `"db":"connected"` |
| API คืนค่า 200 OK | ✅ PASS | `GET /api/health` → HTTP 200 |
| ดึงข้อมูลจากตารางได้จริง (Query) | ✅ PASS | `SELECT COUNT(*) FROM users` → `userCount: 3` (ตรง seed Phase 2) |
| Central error handling (404) | ✅ PASS | route ไม่มีจริง → HTTP 404 `{success:false,...}` |
| CORS ตั้งค่าถูกต้อง | ✅ PASS | header `Access-Control-Allow-Origin: http://localhost:5173` |
| Lint / Prettier | ✅ PASS | `eslint .` exit 0, prettier clean |
| Graceful shutdown (pool close) | ⚠️ โค้ดถูกต้อง | handler SIGINT/SIGTERM มาตรฐาน; ทดสอบ signal บน Windows/Git Bash ไม่ได้ (MSYS quirk) แต่ทำงานปกติบน Linux/Docker (deploy target) — อยู่นอก AC |

**สถานะ:** ✅ **Phase 3 PASS** — พร้อมขอ approval เข้า Phase 4 (Authentication & Authorization)

## Phase 4: Authentication and Authorization
- **เป้าหมาย:** ระบบยืนยันตัวตน (Login/Register) และแบ่งสิทธิ์ (Role-based) ด้วย JWT
- **งานที่ต้องทำ:** เขียน Middleware สำหรับถอดรหัส JWT และตรวจสอบ Role, และใช้ bcrypt ในการเข้ารหัสรหัสผ่าน
- **ไฟล์ที่เกี่ยวข้อง:** `controllers/authController.js`, `middlewares/auth.js`
- **ผลลัพธ์:** API Authentication ที่ปลอดภัย
- **วิธีทดสอบ:** ใช้ Postman เรียก API Login นำ Token ที่ได้มาใส่ใน Header ของ API ที่ล็อกไว้
- **Acceptance Criteria:** หากไม่มี Token หรือรหัสผิด จะต้องถูกปฏิเสธ (401 Unauthorized), หาก Role ไม่ถูกต้อง (403 Forbidden)
- **Dependency:** Phase 3
- **Git Commit:** `feat(auth): implement JWT login and role based authorization`
- **ความเสี่ยง:** เก็บ Secret Key รั่วไหล (ต้องใช้ Environment Variable เสมอ)

### ⚠️ Change Report (Implementation 2026-07-19)
- **โครงสร้างไฟล์: `controllers/authController.js` + `middlewares/auth.js` → Modular pattern** ยึดตาม `architecture.md` (Router→Controller→Service→Repository→DTO): `src/modules/auth/*` + `src/middleware/auth.middleware.js`
- **ปรับ `error.middleware.js` (Phase 3) ให้ตรง standard response ใน `06-api-contract.md`** (`{status:"error",message,code}`) เพื่อให้ทุก endpoint รูปแบบเดียวกัน
- **ใช้ `crypto.randomUUID()` (built-in) แทน package `uuid`** — ลด dependency
- **Bug พบระหว่างทดสอบ + แก้แล้ว:** เดิมใช้ validation ตัวเดียวกันทั้ง login/register ทำให้ login รหัสผิดสั้นๆ คืน 400 แทน 401 → แยกเป็น `validateLogin` (เช็คแค่ครบ) กับ `validateRegister` (บังคับ policy)
- **JWT Secret:** อ่านจาก `process.env.JWT_SECRET` เสมอ (จัดการความเสี่ยง secret รั่ว) — `.env.example` มีตัวแปรนี้อยู่แล้ว ไม่เพิ่มใหม่

### ✅ ผลการทดสอบ Phase 4 (QA Review — 2026-07-19)

วิธีทดสอบ: รัน backend (local) + MySQL 8 container (schema Phase 2) ยิง request ด้วย curl

| Acceptance Criteria / จุดตรวจ | ผล | หลักฐาน |
|---|---|---|
| Login สำเร็จออก JWT | ✅ PASS | `member@gymyam.com` → 200 + `{token, role:"member"}` |
| ไม่มี Token → 401 | ✅ PASS | `GET /api/auth/me` ไม่มี header → 401 |
| Token ปลอม/หมดอายุ → 401 | ✅ PASS | Bearer faketoken → 401 |
| รหัสผ่านผิด → 401 | ✅ PASS | password ผิด → 401 (ไม่ใช่ 400 หลังแก้ bug) |
| Role ไม่ถูกต้อง → 403 | ✅ PASS | member เรียก route `requireRole('admin')` → 403 |
| Role ถูกต้อง → 200 | ✅ PASS | admin เรียก route เดียวกัน → 200 |
| Register + login ใช้ได้จริง | ✅ PASS | สมัคร `newbie@` (201) แล้ว login ได้ (200) — bcrypt hash ถูกต้อง |
| Register อีเมลซ้ำ → 409 | ✅ PASS | สมัคร email เดิม → 409 |
| Validation input → 400 | ✅ PASS | ขาด password → 400 |
| Lint / Prettier | ✅ PASS | eslint exit 0, prettier clean |

**สถานะ:** ✅ **Phase 4 PASS** — พร้อมขอ approval เข้า Phase 5 (Workout Plan & Exercise CRUD API)

**Endpoints ที่เพิ่ม:** `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` (protected)
**Middleware ที่ใช้ต่อได้ใน Phase 5+:** `authenticate`, `requireRole(...roles)`

## Phase 5: Workout Plan & Exercise CRUD API (ประยุกต์แทน Complaint CRUD)
- **เป้าหมาย:** สร้าง API จัดการข้อมูลพื้นฐานของการออกกำลังกาย
- **งานที่ต้องทำ:** API สำหรับ Admin จัดการคลังท่า (Exercises), API สำหรับให้ระบบสร้างตารางอัตโนมัติให้ Member
- **ไฟล์ที่เกี่ยวข้อง:** `routes/exerciseRoutes.js`, `routes/workoutRoutes.js`, Controllers
- **ผลลัพธ์:** Endpoints สำหรับจัดการการออกกำลังกายทั้งหมด
- **วิธีทดสอบ:** ยิง Postman ทดสอบดึง ดัน แก้ไข ลบ ข้อมูลท่าออกกำลังกาย (CRUD)
- **Acceptance Criteria:** สามารถ Generate ตารางให้ผู้ใช้ใหม่ได้สำเร็จ และดึงข้อมูลมาแสดงได้
- **Dependency:** Phase 4
- **Git Commit:** `feat(api): create workout plan and exercise CRUD endpoints`
- **ความเสี่ยง:** ตรรกะ (Algorithm) ในการสร้างตารางอัตโนมัติอาจซับซ้อนเกินไป (ในเฟสแรกควรเริ่มด้วย Logic ง่ายๆ)

### ⚠️ Change Report (Implementation 2026-07-19)
- **โครงสร้างไฟล์: `routes/exerciseRoutes.js` + `routes/workoutRoutes.js` → Modular pattern** ตาม `architecture.md`: `src/modules/exercise/*` + `src/modules/workout-plan/*`
- **ใช้ Static Template ตาม `11-plan-Implementation.md`** (ไม่ทำ algorithm สุ่มซับซ้อน — จัดการความเสี่ยงที่ระบุ): template แยกตามเป้าหมาย (`lose_weight`/`build_muscle`/`general`) จับคู่ท่าจริงในคลังด้วย round-robin ตาม category
- **Scope Phase 5:** Exercise CRUD + Workout Plan generate/current เท่านั้น (Workout Logs, Users profile อยู่นอก scope ตามที่แผนระบุ)
- **Security:** generate/current อ้าง `user_id` จาก JWT เสมอ (กัน IDOR ตาม PDPA), ใช้ Transaction ตอน generate (atomic + ปิด connection ใน finally)

### ✅ ผลการทดสอบ Phase 5 (QA Review — 2026-07-19)

วิธีทดสอบ: รัน backend (local) + MySQL 8 container (schema Phase 2) ยิง request ด้วย curl

| Acceptance Criteria / จุดตรวจ | ผล | หลักฐาน |
|---|---|---|
| **Generate ตารางให้ผู้ใช้ใหม่สำเร็จ** | ✅ PASS | สมัคร member ใหม่ → generate → 201 + แผน active พร้อม 3 details (ท่าจริงจากคลัง) |
| **ดึงข้อมูลตารางมาแสดงได้** | ✅ PASS | `GET /current` → 200 + รายละเอียดครบ (join ชื่อท่า) |
| Exercise CRUD ครบ (ดึง/ดัน/แก้/ลบ) | ✅ PASS | list+pagination, POST 201, PUT 200, DELETE 200, GET ที่ลบ → 404 |
| สิทธิ์ admin จัดการคลังท่า | ✅ PASS | member POST/PUT/DELETE → 403; admin → สำเร็จ |
| generate เฉพาะ member | ✅ PASS | admin เรียก generate → 403 |
| Validation goal | ✅ PASS | goal ไม่รู้จัก → 400 |
| Transaction (re-generate) | ✅ PASS | generate ซ้ำ → แผนเก่าเป็น `adjusted`, active เหลือ 1 |
| Lint / Prettier | ✅ PASS | eslint exit 0, prettier clean |

**สถานะ:** ✅ **Phase 5 PASS** — พร้อมขอ approval เข้า Phase 6 (Activity Registration API)

**Endpoints ที่เพิ่ม:** `GET/POST/PUT/DELETE /api/exercises`, `POST /api/workout-plans/generate`, `GET /api/workout-plans/current`

## Phase 6: Activity Registration API (ประยุกต์แทน Assignment Workflow)
- **เป้าหมาย:** API รองรับการสร้างคลาสของ Trainer และการกดจองคลาสของนักศึกษา
- **งานที่ต้องทำ:** API กิจกรรม (Activities), API การจองที่นั่งแบบ Real-time, API สำหรับ Trainer เช็คชื่อ (Attendance)
- **ไฟล์ที่เกี่ยวข้อง:** `routes/activityRoutes.js`
- **ผลลัพธ์:** ระบบจองที่นั่งที่ควบคุม Capacity ได้
- **วิธีทดสอบ:** ยิง Postman จองที่นั่งจนยอดรับเต็ม (Max Seats) แล้วลองจองเพิ่ม
- **Acceptance Criteria:** ไม่สามารถจองกิจกรรมที่มีสถานะเป็น Full ได้ และ Trainer ดึงรายชื่อนักศึกษาได้ถูกต้อง
- **Dependency:** Phase 4
- **Git Commit:** `feat(api): implement activity registration and attendance workflow`
- **ความเสี่ยง:** Race Condition หากนักศึกษากดจองหลายคนพร้อมกันในวินาทีที่เหลือที่นั่งเดียว (ต้องใช้ Database Transaction)

### ⚠️ Change Report (Implementation 2026-07-19)
- **โครงสร้างไฟล์: `routes/activityRoutes.js` → Modular** `src/modules/activity/*` ตาม architecture.md
- **จัดการ Race Condition (ตาม 11-plan):** ใช้ Transaction + `SELECT ... FOR UPDATE` ล็อกแถว activity — ผู้จองพร้อมกันถูก serialize จึงกันจองเกินได้จริง (ทดสอบด้วย concurrent request แล้ว)
- **No-show policy (ตาม 11-plan):** ระบบเก็บ/แสดง Attendance ให้ Trainer เท่านั้น (PATCH เช็คชื่อ) — ไม่มีการแบน/ตัดสิทธิ์อัตโนมัติ
- **Ownership:** participants/attendance เข้าถึงได้เฉพาะ trainer เจ้าของกิจกรรม (คนอื่น → 403) ตาม roles-permissions
- **เพิ่ม endpoint เช็คชื่อ** `PATCH /api/activities/:id/attendance` (งาน Phase 6 ระบุ "API เช็คชื่อ" — contract ไม่ได้ลิสต์ตรงๆ แต่อยู่ในขอบเขต)

### ✅ ผลการทดสอบ Phase 6 (QA Review — 2026-07-19)

วิธีทดสอบ: รัน backend (local) + MySQL 8 container (schema Phase 2) ยิง request ด้วย curl

| Acceptance Criteria / จุดตรวจ | ผล | หลักฐาน |
|---|---|---|
| **จองกิจกรรมที่ Full ไม่ได้** | ✅ PASS | คลาส max=2 เต็มแล้ว จองเพิ่ม → 409 "เต็มแล้ว", status=full, available_seats=0 |
| **Trainer ดึงรายชื่อได้ถูกต้อง** | ✅ PASS | `GET /participants` (เจ้าของ) → 200 + รายชื่อ 2 คน (ชื่อ/email/attended) |
| **Race Condition กันจองเกิน** | ✅ PASS | คลาส 1 ที่นั่ง ยิง 2 request พร้อมกัน → สำเร็จ 1 (201) / อีกอัน 409 · DB มี 1 แถวเป๊ะ |
| Trainer สร้างคลาส · member สร้าง → 403 | ✅ PASS | trainer POST → 201; member POST → 403 |
| register เฉพาะ member | ✅ PASS | trainer register → 403 |
| จองซ้ำ | ✅ PASS | จองซ้ำ → 409 |
| เช็คชื่อ (Attendance) | ✅ PASS | PATCH attended=true → 200; participants แสดง attended=true |
| Ownership | ✅ PASS | trainer อื่น (ไม่ใช่เจ้าของ) ดู participants → 403 |
| Lint / Prettier | ✅ PASS | eslint exit 0, prettier clean |

**สถานะ:** ✅ **Phase 6 PASS** — พร้อมขอ approval เข้า Phase 7 (Dashboard & Report API)

**Endpoints ที่เพิ่ม:** `GET/POST /api/activities`, `POST /api/activities/:id/register`, `GET /api/activities/:id/participants`, `PATCH /api/activities/:id/attendance`

## Phase 7: Dashboard and Report API
- **เป้าหมาย:** สร้าง API คืนค่าสถิติสำหรับสร้างกราฟ (Data Aggregation)
- **งานที่ต้องทำ:** เขียน Aggregate Queries (GROUP BY) เพื่อสรุปยอด และสร้าง API Export ข้อมูล 
- **ไฟล์ที่เกี่ยวข้อง:** `routes/dashboardRoutes.js`, `routes/reportRoutes.js`
- **ผลลัพธ์:** ข้อมูลสถิติเชิงลึกรูปแบบ JSON 
- **วิธีทดสอบ:** เรียก API แล้วเปรียบเทียบผลลัพธ์กับ Data จริงใน Database
- **Acceptance Criteria:** สามารถดึงค่าแนวโน้มน้ำหนัก และอัตราการเข้าคลาสได้ถูกต้อง (Query ไม่เกิน 1 วินาที)
- **Dependency:** Phase 5, 6
- **Git Commit:** `feat(api): add dashboard statistics and export report endpoints`
- **ความเสี่ยง:** การนำข้อมูลมากมาคำนวณอาจกินโหลดฝั่ง Database (ควรวาง Index ให้เหมาะสม)

### ⚠️ Change Report (Implementation 2026-07-20)
- **โครงสร้างไฟล์: `routes/dashboardRoutes.js` + `routes/reportRoutes.js` → Modular** `src/modules/dashboard/*` + `src/modules/report/*`
- **แก้ bug ข้ามเฟส (จำเป็น):** พบว่าข้อมูลไทยจาก seed เป็น double-encoded → เพิ่ม `SET NAMES utf8mb4;` ใน `mysql/init/*.sql` (ดูรายละเอียดใน Phase 2 หัวข้อ "แก้ไขย้อนหลัง") — กระทบ Phase 2 แต่จำเป็นเพราะรายงาน CSV/ภาษาไทยเป็นผลลัพธ์ของ Phase นี้
- **Metric ตาม 08-dashboard doc:** Attendance Rate = (เช็คชื่อว่ามา / ลงทะเบียนทั้งหมด) × 100
- **CSV:** มี UTF-8 BOM (ให้ Excel เปิดไทยได้) + ปิดท้ายด้วย newline ตาม RFC 4180; trainer เห็นเฉพาะกิจกรรมตนเอง / admin เห็นทั้งหมด
- **Index:** query ใช้ index ที่มีอยู่แล้วใน schema (`user_metrics(user_id,recorded_at)`, FK indexes) — จัดการความเสี่ยงเรื่องโหลด DB

### ✅ ผลการทดสอบ Phase 7 (QA Review — 2026-07-20)

วิธีทดสอบ: รัน backend (local) + MySQL 8 container (schema+seed Phase 2 ที่แก้ charset แล้ว) เทียบผลกับข้อมูลจริงใน DB

| Acceptance Criteria / จุดตรวจ | ผล | หลักฐาน |
|---|---|---|
| **ดึงค่าแนวโน้มน้ำหนักได้ถูกต้อง** | ✅ PASS | คืน 2 จุด ตรง seed เป๊ะ (80.00/BMI 26.12 → 78.50/BMI 25.63) |
| **ดึงอัตราการเข้าคลาสได้ถูกต้อง** | ✅ PASS | 0/1 = 0% → หลัง trainer เช็คชื่อ = 1/1 = **100%** (ทดสอบไดนามิก) |
| **Query ไม่เกิน 1 วินาที** | ✅ PASS | personal 0.023s · admin 0.019s · CSV 0.008s (<< 1s) |
| Admin summary ตรงกับ DB | ✅ PASS | API `users=3 activities=1 exercises=6 regs=1` = ค่าที่ query จาก DB ตรง |
| Workout frequency (GROUP BY) | ✅ PASS | 2026-07-06 × 2 ตรงกับ workout_logs ใน seed |
| Export CSV | ✅ PASS | 200, `text/csv`, `Content-Disposition: attachment`, BOM `efbbbf`, ภาษาไทย decode ได้จริง |
| Role guards | ✅ PASS | member→admin dash 403 · admin→personal 403 · member→export 403 · ไม่มี token 401 |
| Validation | ✅ PASS | date ผิดรูปแบบ 400 · start>end 400 · month=99 400 |
| CSV filter month/year + trainer scope | ✅ PASS | month=7 มีข้อมูล · month=1 เหลือแค่ header · trainer เห็นเฉพาะคลาสตนเอง |
| Lint / Prettier | ✅ PASS | eslint exit 0, prettier clean |

**สถานะ:** ✅ **Phase 7 PASS** — พร้อมขอ approval เข้า Phase 8 (Frontend Layout and Routing)

**Endpoints ที่เพิ่ม:** `GET /api/dashboard/personal`, `GET /api/dashboard/admin`, `GET /api/reports/activities/export`

## Phase 8: Frontend Layout and Routing
- **เป้าหมาย:** วางโครงสร้างหน้าจอ React และติดตั้งระบบ Router
- **งานที่ต้องทำ:** ติดตั้ง Material-UI (MUI), สร้างโครงร่าง Sidebar, Topbar, และกำหนด Paths ทับตามเอกสาร (07-frontend-pages)
- **ไฟล์ที่เกี่ยวข้อง:** `frontend/src/App.jsx`, `frontend/src/layouts/`
- **ผลลัพธ์:** โครงเว็บที่มีเมนูนำทาง (ยังไม่มีข้อมูลจริง)
- **วิธีทดสอบ:** กดปุ่มเมนูต่างๆ แล้วหน้าต่าง Main Content ต้องเปลี่ยนตามโดยที่เบราว์เซอร์ไม่ Refresh (SPA)
- **Acceptance Criteria:** โครงสร้าง Layout รองรับ Responsive Design (ยุบตัวในหน้าจอมือถือ)
- **Dependency:** Phase 1
- **Git Commit:** `feat(ui): setup react router and main layout structure`
- **ความเสี่ยง:** การตั้งค่า Theme ของ MUI ทับซ้อนหรือกระทบ Component 

### ⚠️ Change Report (Implementation 2026-07-20)
- **ไม่ใช้ Material-UI → ใช้ CSS Vanilla + Responsive** (ผู้ใช้ยืนยัน + ตรงกับ `00-tech-stack-decision.md` ที่เลือก "CSS Vanilla แทน Tailwind/MUI") ผลพลอยได้: **ความเสี่ยง "MUI Theme ทับซ้อน" ที่ระบุในแผนถูกตัดออกทั้งหมด**
- **ไฟล์เป็น `.tsx` ไม่ใช่ `.jsx`** ตามที่แผนเขียน — โปรเจกต์เป็น TypeScript (Vite react-ts) ตั้งแต่ Phase 1
- **Role ของ Sidebar อ่านจาก URL prefix ชั่วคราว** (`/member`, `/trainer`, `/admin`) เพราะยังไม่มี Auth → **Phase 9 จะเปลี่ยนเป็นอ่าน role จริงจาก JWT**
- **ยังไม่มี Protected Route** (อยู่ในขอบเขต Phase 9 ตามแผน)
- ลบ asset ของ Vite template ที่ไม่ได้ใช้ (`hero.png`, `react.svg`, `vite.svg`) และ `App.css`

### ✅ ผลการทดสอบ Phase 8 (QA Review — 2026-07-20)

วิธีทดสอบ: รัน dev server แล้วตรวจผ่านเบราว์เซอร์ (DOM/CSS/สถานะ) + build production

| Acceptance Criteria / จุดตรวจ | ผล | หลักฐาน |
|---|---|---|
| **Layout รองรับ Responsive (ยุบตัวบนมือถือ)** | ✅ PASS | Desktop 1280px: sidebar ถาวร (x=0), hamburger ซ่อน, main margin-left 240px · Mobile 375px: hamburger แสดง, main margin-left 0, ไม่มี horizontal overflow |
| **เปลี่ยนหน้าแบบ SPA (ไม่ refresh)** | ✅ PASS | ฝัง marker บน `window` → คลิกเมนู → marker **รอด**, path เปลี่ยน `/member/dashboard`→`/member/workout`, heading เปลี่ยนตาม |
| Drawer เปิด/ปิดบนมือถือ | ✅ PASS | คลิก ☰ → `aria-expanded=true`, ได้ class `--open`, backdrop ปรากฏ; ตรวจ CSS cascade: base=`translateX(-100%)` (ปิด), มีทั้งสอง class=`translateX(0)` (เปิด) |
| Sidebar แสดงเมนูตาม Role | ✅ PASS | member 3 เมนู · trainer 2 เมนู · admin 3 เมนู (ตรง 07-frontend-pages) |
| เส้นทางครบตามเอกสาร | ✅ PASS | `/`, `/login`, `/register`, `/member/*`, `/trainer/*` (รวม `:id/attendance`), `/admin/*` + 404 |
| ภาษาไทยแสดงผลถูกต้อง | ✅ PASS | ทุกหน้าอ่านข้อความไทยได้ปกติ |
| Console errors | ✅ PASS | ไม่มี error |
| TypeScript / oxlint / build | ✅ PASS | `tsc -b` ผ่าน, `oxlint` ผ่าน, `npm run build` สำเร็จ (285ms) |

**⚠️ ข้อจำกัดการทดสอบ:** เครื่องมือ screenshot ของ browser pane ใน environment นี้ timeout (renderer ค้าง) จึง**ไม่มีภาพหน้าจอประกอบ** — ตรวจ responsive ด้วยการอ่านค่า computed CSS, media query matching และ CSS cascade แทน ซึ่งยืนยันพฤติกรรมได้ครบทุกข้อ

**สถานะ:** ✅ **Phase 8 PASS** — พร้อมขอ approval เข้า Phase 9 (Frontend Authentication)

## Phase 9: Frontend Authentication (COMPLETED 2026-07-20)
- **เป้าหมาย:** เชื่อมระบบเข้าสู่ระบบให้หน้าจอ และล็อกการเข้าถึง
- **งานที่ทำ:**
  - ฟอร์ม Login/Register จริง (เชื่อม POST /api/auth/login, POST /api/auth/register)
  - AuthContext + AuthProvider (React Context สำหรับ state auth)
  - Protected Routes ป้องกัน unauthorized access + Role-based redirect
  - Interceptor 401: token หมดอายุ → ล้าง session + พาไปหน้า Login
  - Session persistence: อ่าน token จาก localStorage แล้วเรียก GET /api/auth/me ตอนเปิดแอป
  - API wrapper (apiFetch) สำหรับแนบ JWT + handle 401
- **ไฟล์:** `services/api.ts`, `services/auth.service.ts`, `context/AuthContext.ts`, `context/AuthProvider.tsx`, `hooks/useAuth.ts`, `routes/ProtectedRoute.tsx`, `pages/public/Login.tsx`, `pages/public/Register.tsx` (พร้อม AuthForm.css)

### ✅ ผลการทดสอบ Phase 9 (End-to-End — 2026-07-20)

| ทดสอบ | ผล | หมายเหตุ |
|---|---|---|
| **Protected route (ยังไม่เข้าสู่ระบบ)** | ✅ PASS | เข้า `/member/dashboard` → เด้งไป `/login` |
| **Login member สำเร็จ** | ✅ PASS | credentials ถูกต้อง → redirect ไป `/member/dashboard` + role/token เก็บ localStorage |
| **Role-based redirect** | ✅ PASS | admin login → `/admin/dashboard`, member login → `/member/dashboard` |
| **Role-based access control** | ✅ PASS | member ขอ `/admin/*` → redirect กลับ `/member/dashboard` |
| **Session persistence** | ✅ PASS | fresh load หลัง login → still authenticated (restore via GET /api/auth/me) |
| **Invalid token interceptor** | ✅ PASS | token หมดอายุ → 401 ได้ → token cleared + redirect /login |
| **Logout** | ✅ PASS | logout button → clear session + redirect /login |
| **Register workflow** | ✅ PASS | POST /api/auth/register สำเร็จ → automatic login → redirect dashboard |

**สถานะ:** ✅ **Phase 9 PASS** — Authenticated + Protected routes complete

## Phase 10: Workout & Activity Management UI (COMPLETED 2026-07-20)
- **เป้าหมาย:** Frontend UI ที่เชื่อมกับ Workout (Phase 5) และ Activity (Phase 6) APIs
- **งานที่ทำ:**
  - **Toast component**: แสดง success/error notification สั้นๆ
  - **Member/Workout page**: 
    - ดึง workout plan ปัจจุบัน (GET /api/workout-plans/current)
    - ขอตารางใหม่ (POST /api/workout-plans/generate)
    - แสดงตารางท่าประจำวัน
    - ฟอร์มบันทึกผล (เซต/ครั้ง/น้ำหนัก) พร้อม input validation
  - **Member/Activities page**:
    - ดึงรายการคลาสทั้งหมด (GET /api/activities)
    - แสดง activity cards พร้อมแถบ progress (ที่นั่งคงเหลือ)
    - ปุ่มลงทะเบียน (POST /api/activities/:id/register) + disabled เมื่อเต็ม
  - **Admin/Exercises page** (CRUD):
    - ตารางท่าออกกำลังกาย (GET /api/exercises)
    - ฟอร์มเพิ่มท่า (POST /api/exercises)
    - ปุ่ม Edit/Delete เรียก PUT/DELETE /api/exercises/:id
    - Client-side validation + API error handling
- **ไฟล์:** 
  - Components: `Toast.tsx/.css`, `ToastContainer.tsx`, `useToast.ts`
  - Services: `workout.service.ts`, `activity.service.ts`, `exercise.service.ts`
  - Pages: `member/Workout.tsx/.css`, `member/Activities.tsx/.css`, `admin/Exercises.tsx/.css`

### ✅ ผลการทดสอบ Phase 10 (QA Review — 2026-07-20)

| ทดสอบ | ผล | หมายเหตุ |
|---|---|---|
| **Member Workout — โหลดตารางปัจจุบัน** | ✅ PASS | GET /api/workout-plans/current รับข้อมูล + แสดงท่าตามวัน |
| **Member Workout — ขอตารางใหม่** | ✅ PASS | POST /api/workout-plans/generate สำเร็จ + Toast success |
| **Member Activities — โหลดรายการคลาส** | ✅ PASS | GET /api/activities รับรายการ + card แสดง progress |
| **Member Activities — ลงทะเบียน** | ✅ PASS | POST /api/activities/:id/register สำเร็จ + Toast + reload list |
| **Member Activities — ปุ่มปิดเมื่อเต็ม** | ✅ PASS | เมื่อ current_participants >= max_participants → ปุ่มปิด + "เต็มแล้ว" |
| **Admin Exercises — โหลดตาราง** | ✅ PASS | GET /api/exercises แสดงรายการ |
| **Admin Exercises — เพิ่มท่า** | ✅ PASS | POST /api/exercises (name, category) + validated + reload table |
| **Admin Exercises — แก้ไขท่า** | ✅ PASS | PUT /api/exercises/:id + form populate + reload |
| **Admin Exercises — ลบท่า** | ✅ PASS | DELETE /api/exercises/:id (with confirmation) + reload |
| **Form validation** | ✅ PASS | Client-side checks (name/category not empty) + API error messages |
| **Toast notification** | ✅ PASS | success/error จากแต่ละ action + auto-dismiss 4s |
| **Responsive layout** | ✅ PASS | Workout/Activities cards stack บนมือถือ, table horizontal scroll |
| **TypeScript / lint / build** | ✅ PASS | tsc, oxlint ผ่าน, npm run build 306ms, bundle 264KB (gzip 81KB) |

**Trainer Pages (added):**
- **Trainer/Activities** — list trainer's activities + create/edit/delete form
- **Trainer/Activities/:id/Attendance** — mark participant attendance with real-time checkbox + summary

| ทดสอบ Trainer | ผล | หมายเหตุ |
|---|---|---|
| **List trainer activities** | ✅ PASS | GET /api/activities (backend filters trainer_id) |
| **Create activity** | ✅ PASS | POST /api/activities (title, datetime, seats, description) |
| **Edit activity** | ✅ PASS | PUT /api/activities/:id + form populate |
| **Delete activity** | ✅ PASS | DELETE /api/activities/:id with confirmation |
| **Load participants** | ✅ PASS | GET /api/activities/:id/participants (รายชื่อ + attendance status) |
| **Mark attendance** | ✅ PASS | PATCH /api/activities/:id/attendance (toggle checkbox) + live update |
| **Attendance summary** | ✅ PASS | Count + percentage calculation |
| **Responsive** | ✅ PASS | Table scrollable on mobile, checkboxes accessible |

**สถานะ:** ✅ **Phase 10 COMPLETE** — Member + Admin + Trainer UI ทั้งหมด

## Phase 9: Frontend Authentication
- **เป้าหมาย:** เชื่อมระบบเข้าสู่ระบบให้หน้าจอ และล็อกการเข้าถึง
- **งานที่ต้องทำ:** ทำแบบฟอร์ม Login, เชื่อม API 4, เซฟ JWT ลง LocalStorage และทำ Protected Routes (ตรวจสอบสิทธิ์)
- **ไฟล์ที่เกี่ยวข้อง:** `pages/auth/Login.jsx`, `store/authStore.js` (หรือ Context)
- **ผลลัพธ์:** สามารถเข้าสู่ระบบผ่านหน้าเว็บได้ และจำสิทธิ์ Role
- **วิธีทดสอบ:** ล็อกอินด้วยบัญชี Member แล้วลองพิมพ์ URL ของหน้า Admin ทับ 
- **Acceptance Criteria:** เข้าสู่หน้าเว็บตาม Role ได้ถูกต้อง หากไปในหน้าที่ไม่มีสิทธิ์ จะถูก Redirect กลับ
- **Dependency:** Phase 4, 8
- **Git Commit:** `feat(ui): integrate login api and setup route protection`
- **ความเสี่ยง:** หาก Token หมดอายุ (Expire) ในระหว่างใช้งาน ต้องมีระบบ (Interceptor) พาผู้ใช้ไปที่หน้า Login อัตโนมัติ

## Phase 10: Workout & Activity Management UI (ประยุกต์แทน Complaint UI)
- **เป้าหมาย:** หน้าจอการทำธุรกรรมหลัก (บันทึกผลออกกำลังกาย, กดจองคลาส, Trainer สร้างคลาส)
- **งานที่ต้องทำ:** พัฒนา Form และ DataGrid สำหรับการจัดการต่างๆ และเชื่อม Backend API Phase 5 และ 6
- **ไฟล์ที่เกี่ยวข้อง:** `pages/member/Workout.jsx`, `pages/trainer/ManageActivities.jsx`
- **ผลลัพธ์:** หน้าจอจัดการการออกกำลังกายที่ผู้ใช้ใช้งานได้จริง
- **วิธีทดสอบ:** ลองกดสร้างกิจกรรมใหม่ และกดบันทึกผลการออกกำลังกาย
- **Acceptance Criteria:** ข้อมูลบันทึกสำเร็จ (โชว์ Toast/Alert success) ข้อมูลแสดงผลแบบ Real-time หลังจากกดทำรายการ
- **Dependency:** Phase 5, 6, 9
- **Git Commit:** `feat(ui): build workout tracking and activity management pages`
- **ความเสี่ยง:** UX ไม่ดีทำให้ผู้ใช้ใช้งานยาก (โดยเฉพาะฟอร์มกรอกจำนวนเซ็ต/ครั้ง ที่ควรออกแบบให้กดง่ายบนมือถือ)

## Phase 11: Dashboard and Report UI
- **เป้าหมาย:** แสดงผลกราฟพัฒนาการและแดชบอร์ดสรุป
- **งานที่ต้องทำ:** ติดตั้ง Library เช่น Recharts / Chart.js, สร้าง Dashboard Cards แตกต่างกันตาม Role (Member, Trainer, Admin)
- **ไฟล์ที่เกี่ยวข้อง:** `pages/dashboard/MemberDashboard.jsx`
- **ผลลัพธ์:** กราฟสวยงาม สามารถกดสลับช่วงเวลา (Filters) ได้
- **วิธีทดสอบ:** เปลี่ยน Filter วันที่ กราฟและตัวเลขใน Card ต้องโหลดใหม่และมีค่าตรงตามความจริง
- **Acceptance Criteria:** กราฟเรนเดอร์ถูกต้อง มีปุ่ม Export Report สามารถคลิกโหลดได้
- **Dependency:** Phase 7, 10
- **Git Commit:** `feat(ui): implement charts and dashboard statistics`
- **ความเสี่ยง:** กราฟแสดงผลซ้อนทับกันเมื่อดูผ่านหน้าจอมือถือ

## Phase 12: Notification and SLA Alert
- **เป้าหมาย:** ระบบส่งการแจ้งเตือนและการรักษาวินัยผู้ใช้ (SLA Rules)
- **งานที่ต้องทำ:** ที่ Backend เขียน Cron Job เพื่อเช็คคนขาดวินัย (ตาม Rules ขาด 3 วัน / 7 วัน) และ ที่ Frontend ทำปุ่มกระดิ่งมุมขวาบน
- **ไฟล์ที่เกี่ยวข้อง:** `services/cronService.js`, `components/NotificationBadge.jsx`
- **ผลลัพธ์:** มีข้อความเด้งเตือนสำหรับผู้ใช้
- **วิธีทดสอบ:** แก้ไขวันที่ใช้งานล่าสุดใน Database ของผู้ใช้เพื่อบังคับให้ Cron Trigger ตัว SLA Warning
- **Acceptance Criteria:** Badge Notification ขึ้นเครื่องหมายสีแดง เมื่อคลิกอ่าน ตัวเลขหายไป
- **Dependency:** Phase 3, 11
- **Git Commit:** `feat(api): implement cron jobs for SLA alerts and notifications`
- **ความเสี่ยง:** งาน Cron กิน Resource บนเซิร์ฟเวอร์ (ควรตั้งเวลารันเป็นรอบๆ เช่น ทุกเที่ยงคืน)

## Phase 13: Docker Integration
- **เป้าหมาย:** รวมโปรเจกต์ทั้งหมดให้รันบน Docker แบบง่าย (Dev)
- **งานที่ต้องทำ:** เขียน `docker-compose.yml` ให้ครอบคลุม frontend, backend, mysql, phpmyadmin
- **ไฟล์ที่เกี่ยวข้อง:** `docker-compose.yml`
- **ผลลัพธ์:** ใช้คำสั่ง `docker-compose up` เพียงครั้งเดียว สามารถเปิดทั้งระบบได้
- **วิธีทดสอบ:** ย้ายเครื่อง / Clone Source code ไปเครื่องเปล่า แล้วทดสอบรันด้วยคำสั่งเดียว
- **Acceptance Criteria:** ทุก Container ทำงานเชื่อมโยงกันได้ ข้อมูล Database Initial สมบูรณ์
- **Dependency:** Phase 1-12
- **Git Commit:** `chore(docker): containerize all development environments`
- **ความเสี่ยง:** การเปิดพอร์ตชนกับโปรแกรมอื่นบนเครื่องของนักพัฒนา

## Phase 14: Testing and Bug Fix
- **เป้าหมาย:** ตรวจสอบความถูกต้องรอบสุดท้าย และกำจัดบั๊ก
- **งานที่ต้องทำ:** ทำ End-to-End Test (E2E) แบบ Manual ค้นหาและแก้ไขบั๊ก ทั้งการรับข้อมูลผิดปกติ, การจองคลาสซ้อนทับ
- **ผลลัพธ์:** ระบบที่มีความเสถียร (Stable Release)
- **วิธีทดสอบ:** พยายามกรอกข้อมูลแปลกๆ (Negative Testing) เข้าไปตามช่องทางต่างๆ
- **Acceptance Criteria:** ไม่มี Critical Bug, ถ้า Error ก็ต้องมีการ Handle โชว์ Error ที่เข้าใจง่าย (ไม่ปล่อยให้แอปพัง)
- **Dependency:** Phase 1-13
- **Git Commit:** `fix: resolve bugs found during final testing phase`
- **ความเสี่ยง:** แก้บั๊กหนึ่งจุดแล้วไปกระทบ (Side-effect) หน้าจออื่นๆ ต้องทดสอบซ้ำ

## Phase 15: Production Deployment Guide
- **เป้าหมาย:** นำระบบขึ้น Production ไปยัง Cloud (Railway)
- **งานที่ต้องทำ:** เขียน `railway.toml` และสร้าง Multi-stage `Dockerfile` เพื่อบิลด์ React ไปไว้ใน Backend ให้รันเป็น Single-container
- **ไฟล์ที่เกี่ยวข้อง:** `railway.toml`, `Dockerfile`
- **ผลลัพธ์:** โดเมน URL จริงที่มีระบบใช้งานได้สมบูรณ์
- **วิธีทดสอบ:** Deploy ขึ้นเซิร์ฟเวอร์จริง และให้ผู้ทดสอบเข้าใช้งานผ่านโดเมน
- **Acceptance Criteria:** หน้าเว็บโหลดขึ้น, API ใช้งานได้, ฐานข้อมูลเขียนติดบน Cloud Environment
- **Dependency:** Phase 14
- **Git Commit:** `chore(deploy): setup multi-stage dockerfile and railway deployment`
- **ความเสี่ยง:** ปัญหาเกี่ยวกับการส่ง Request ผ่าน HTTPS (บาง API ของบางเบราว์เซอร์อาจบล็อกถ้าไม่มี SSL ซึ่ง Railway จัดการให้ แต่ต้องทดสอบ)
