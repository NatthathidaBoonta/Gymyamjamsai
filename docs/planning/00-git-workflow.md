# Git Workflow — Gymyamjamsai

> **ช่วงที่ 0: เตรียมกติกาและบริบท**
> เอกสารนี้กำหนด Git Workflow, Commit Convention และ Rollback Strategy สำหรับโปรเจกต์

---

## 1. Branch Strategy

### Branch หลัก

| Branch | วัตถุประสงค์ | Merge จาก | Deploy |
|---|---|---|---|
| `main` | Production-ready code | `develop` เท่านั้น | Railway (auto) |
| `develop` | Integration branch | feature branches | Staging (optional) |

### Branch สำหรับงาน

| รูปแบบ | ใช้สำหรับ | ตัวอย่าง |
|---|---|---|
| `feat/<description>` | Feature ใหม่ | `feat/auth-module` |
| `fix/<description>` | Bug fix | `fix/db-connection` |
| `docs/<description>` | Documentation | `docs/system-overview` |
| `chore/<description>` | Maintenance | `chore/update-deps` |
| `refactor/<description>` | Refactoring | `refactor/extract-repo-layer` |

### กติกา

- ห้าม commit ตรงลง `main`
- ทุก branch ต้อง merge ผ่าน Pull Request
- ลบ branch หลัง merge แล้ว
- Branch ต้อง up-to-date กับ `develop` ก่อน merge

---

## 2. Commit Convention

ใช้ **Conventional Commits** มาตรฐาน

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

| Type | ใช้สำหรับ |
|---|---|
| `feat` | เพิ่ม Feature ใหม่ |
| `fix` | แก้ Bug |
| `docs` | เพิ่ม/แก้ Documentation |
| `chore` | งาน Maintenance (deps, config) |
| `refactor` | Refactor โค้ดโดยไม่เปลี่ยน behavior |
| `test` | เพิ่ม/แก้ Test |
| `style` | แก้ formatting, spacing (ไม่ใช่ CSS) |
| `build` | แก้ build system, docker, CI |
| `perf` | ปรับ performance |

### Scope (ตัวอย่าง)

| Scope | ความหมาย |
|---|---|
| `auth` | Authentication module |
| `profile` | Profile module |
| `exercise` | Exercise module |
| `workout` | Workout Plan module |
| `db` | Database |
| `docker` | Docker configuration |
| `api` | API layer |
| `frontend` | Frontend |
| `backend` | Backend |
| `planning` | Planning documents |
| `deps` | Dependencies |

---

## 3. Commit Message Format

### กติกา

- `<type>` และ `<scope>` ใช้ lowercase
- `<subject>` ใช้ present tense ("add" ไม่ใช่ "added")
- `<subject>` ไม่ขึ้นต้นด้วยตัวพิมพ์ใหญ่
- `<subject>` ไม่มี period (.) ท้าย
- ความยาวไม่เกิน 72 ตัวอักษร
- ถ้ามี body ต้องเว้น 1 บรรทัดจาก subject
- Breaking changes ให้เพิ่ม `BREAKING CHANGE:` ใน footer

### ตัวอย่าง

```
feat(auth): add JWT authentication middleware

fix(db): resolve connection pool timeout on startup

docs(planning): add system overview document

chore(deps): update express to 4.19.2

refactor(backend): extract repository layer from controllers

BREAKING CHANGE: API response format changed to include 'success' field
```

---

## 4. When to Commit

| เวลา | ทำอะไร |
|---|---|
| จบ Planning Step แต่ละขั้น | Commit documentation |
| จบ Implementation Phase | Commit code + docs |
| แก้ Bug สำคัญ | Commit fix |
| เปลี่ยน Config | Commit chore |
| ก่อน merge branch | ตรวจสอบ status ก่อน |
| สิ้นวันทำงาน | Commit งานที่ทำได้ (WIP ได้ ถ้า branch ตัวเอง) |

### ห้าม Commit

- เมื่อ code ยัง broken หรือ build ไม่ผ่าน (บน `main`/`develop`)
- เมื่อ `.env` หรือ secrets อยู่ใน staging area
- เมื่อ `node_modules/` อยู่ใน staging area

---

## 5. Commit per Planning Step

| Planning Step | Commit Message |
|---|---|
| เสร็จ Tech Stack Decision | `docs(planning): add tech stack decision` |
| เสร็จ AI Working Rules | `docs(planning): add AI working rules` |
| เสร็จ Documentation Structure | `docs(planning): add documentation structure` |
| เสร็จ Git Workflow | `docs(planning): add git workflow` |
| เสร็จ Readiness Check | `docs(planning): add readiness check` |
| เสร็จ System Overview | `docs(planning): add system overview` |
| เสร็จ Requirements | `docs(planning): add requirements` |
| เสร็จ Roles & Permissions | `docs(planning): add roles and permissions` |
| เสร็จ User Workflow | `docs(planning): add user workflow` |
| เสร็จ Database Design | `docs(planning): add database design` |
| เสร็จ API Contract | `docs(planning): add API contract` |
| เสร็จ Frontend Pages | `docs(planning): add frontend pages spec` |
| เสร็จ Dashboard & Reports | `docs(planning): add dashboard and report spec` |
| เสร็จ Docker Architecture | `docs(planning): add docker architecture` |
| เสร็จ Project Context | `docs(planning): add project context` |
| เสร็จ Implementation Plan | `docs(planning): add implementation plan` |

---

## 6. Commit per Implementation Phase

| Phase | Commit Message |
|---|---|
| Phase 1: Project Setup | `feat(phase-1): complete project setup and docker config` |
| Phase 2: Auth Module | `feat(auth): implement login and register endpoints` |
| Phase 3: Exercise CRUD | `feat(exercise): implement exercise CRUD API` |
| Phase 4: Workout Plan | `feat(workout): implement workout plan management` |
| Phase 5: Profile | `feat(profile): implement user profile management` |
| Phase 6: Dashboard | `feat(dashboard): implement workout summary dashboard` |
| Phase 7: Frontend Auth | `feat(frontend): implement login and register pages` |
| Phase 8: Frontend Features | `feat(frontend): implement exercise and workout pages` |
| Phase 9: Deploy | `build(deploy): configure railway production deployment` |

---

## 7. Commit after Bug Fix

```
fix(<scope>): <อธิบาย bug ที่แก้>

<อธิบายสาเหตุและวิธีแก้ถ้าซับซ้อน>
```

ตัวอย่าง:
```
fix(db): resolve "Access denied" error from missing DB_USER env var

Changed DB_USERNAME to DB_USER to match database/index.js configuration.
```

---

## 8. Rollback Strategy

### กลับไป Commit ก่อนหน้า (ยังไม่ Push)

```bash
# ยกเลิก commit ล่าสุด แต่เก็บ changes ไว้ (soft reset)
git reset --soft HEAD~1

# ยกเลิก commit และ changes ทั้งหมด (hard reset — ระวัง!)
git reset --hard HEAD~1
```

### กลับไป Commit ก่อนหน้า (Push แล้ว)

```bash
# สร้าง revert commit (แนะนำสำหรับ shared branches)
git revert <commit-hash>

# ดู commit hash
git log --oneline
```

### กลับไปยัง Tag / Version

```bash
# สร้าง tag หลังจบ Phase
git tag phase-1-complete
git push origin phase-1-complete

# กลับไปยัง tag
git checkout phase-1-complete
```

### กติกา Rollback

- บน `main` และ `develop` ใช้ `git revert` ไม่ใช้ `git reset --hard`
- บน feature branch ของตัวเองใช้ `git reset` ได้
- สร้าง Git tag ทุกครั้งที่จบ Phase เพื่อเป็น checkpoint

---

## 9. Files that Should Be Committed

| ไฟล์/โฟลเดอร์ | เหตุผล |
|---|---|
| `frontend/src/**` | Source code |
| `backend/src/**` | Source code |
| `backend/server.js` | Entry point |
| `docker-compose.yml` | Dev environment setup |
| `Dockerfile` | Production build |
| `frontend/Dockerfile.dev` | Dev build |
| `backend/Dockerfile.dev` | Dev build |
| `frontend/package.json` | Dependencies |
| `backend/package.json` | Dependencies |
| `frontend/vite.config.ts` | Build config |
| `.env.example` | Environment template (ไม่มี secret) |
| `.gitignore` | Git ignore rules |
| `README.md` | Project documentation |
| `docs/**/*.md` | Planning documents |
| `.agents/skills/**` | AI skill definitions |
| `db/init/*.sql` | Database init scripts |

---

## 10. Files that Should Not Be Committed

| ไฟล์/โฟลเดอร์ | เหตุผล |
|---|---|
| `.env` | Contains secrets |
| `.env.local` | Local overrides |
| `.env.production` | Production secrets |
| `node_modules/` | ใหญ่มาก, ติดตั้งใหม่ได้ |
| `dist/` | Build output, สร้างใหม่ได้ |
| `build/` | Build output |
| `*.log` | Log files |
| `.DS_Store` | macOS metadata |
| `Thumbs.db` | Windows metadata |
| `*.pem`, `*.key`, `*.cert` | SSL/Key files |
| `coverage/` | Test coverage reports |

---

## 11. Suggested `.gitignore` Rules

```gitignore
# Environment Variables
.env
.env.local
.env.production
.env.*.local

# Dependencies
node_modules/
**/node_modules/

# Build Output
dist/
build/
.vite/

# Logs
*.log
npm-debug.log*
yarn-debug.log*

# OS Files
.DS_Store
Thumbs.db
desktop.ini

# IDE
.idea/
.vscode/settings.json
*.swp
*.swo

# Test Coverage
coverage/
.nyc_output/

# Docker
.docker/

# Certificates / Keys
*.pem
*.key
*.cert
*.p12

# Temporary
tmp/
temp/
*.tmp
```

---

## 12. Example Commit Messages

### Planning Phase

```
docs: add tech stack decision
docs: add AI working rules
docs: add system overview
docs: add project context
docs(planning): add database design with ERD
docs(planning): add API contract for auth module
```

### Implementation Phase

```
feat: complete phase 1 project setup
feat(auth): implement JWT login endpoint
feat(auth): implement register with password hashing
feat(exercise): add exercise list with pagination
feat(workout): implement workout plan CRUD
fix: resolve backend database connection
fix(auth): fix token expiry not being applied
chore: update docker compose configuration
chore(deps): upgrade express to 4.19.2
refactor(backend): extract database pool to singleton module
refactor(auth): separate repository from service layer
build(docker): configure multi-stage production dockerfile
build(railway): add railway.json configuration
test(auth): add integration tests for login endpoint
```

### Maintenance

```
chore: update .gitignore to exclude coverage folder
docs: update README with new port mapping
style: format server.js with consistent indentation
perf(db): add index on users.email column
```
