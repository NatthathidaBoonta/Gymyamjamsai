# Documentation Structure — Gymyamjamsai

> **ช่วงที่ 0: เตรียมกติกาและบริบท**
> เอกสารนี้กำหนดโครงสร้างไฟล์และโฟลเดอร์ documentation ของโปรเจกต์

---

## 1. โครงสร้างโฟลเดอร์ `docs/`

```
docs/
├── planning/               # เอกสาร Planning และ Architecture ทั้งหมด
├── testing/                # Test Plans, Test Cases, Bug Reports
└── deployment/             # คู่มือ Deploy, Environment Setup, Runbook
```

---

## 2. โครงสร้าง `docs/planning/`

```
docs/planning/
├── 00-tech-stack-decision.md       # เลือก Tech Stack และเหตุผล
├── 00-ai-working-rules.md          # กติกาการทำงานร่วมกับ AI
├── 00-documentation-structure.md   # ไฟล์นี้ — โครงสร้าง docs ทั้งหมด
├── 00-git-workflow.md              # Git Workflow และ Commit Rules
├── 00-readiness-check.md           # ตรวจความพร้อมก่อน Planning
├── 01-system-overview.md           # ภาพรวมระบบ, Actor, Feature หลัก
├── 02-requirements.md              # Functional + Non-Functional Requirements
├── 03-roles-permissions.md         # Role, Permission, Access Control
├── 04-user-workflow.md             # User Journey, Workflow Diagram
├── 05-database-design.md           # ERD, Table Schema, Index Strategy
├── 06-api-contract.md              # API Endpoints, Request/Response spec
├── 07-frontend-pages.md            # Pages, Components, Routing
├── 08-dashboard-report.md          # Dashboard, Report, Notification design
├── 09-docker-architecture.md       # Docker Compose, Service Map, Network
├── PROJECT_CONTEXT.md              # Context สรุปสำหรับส่งให้ AI ก่อน Implementation
└── 10-implementation-plan.md       # Implementation Phases, Tasks, Acceptance Criteria
```

---

## 3. โครงสร้าง `docs/testing/`

```
docs/testing/
├── test-plan.md                    # Test Strategy และ Scope
├── unit-test-cases.md              # Unit Test Cases (Backend)
├── integration-test-cases.md       # Integration Test Cases (API)
├── e2e-test-cases.md               # End-to-End Test Cases (Frontend)
└── bug-reports/                    # Bug Reports ที่พบระหว่างพัฒนา
    └── YYYY-MM-DD-bug-description.md
```

---

## 4. โครงสร้าง `docs/deployment/`

```
docs/deployment/
├── railway-deployment.md           # คู่มือ Deploy บน Railway
├── environment-variables.md        # รายการ env vars ทั้งหมด (ไม่มี value จริง)
├── docker-production.md            # คู่มือ Deploy ด้วย Docker (on-premise)
└── runbook.md                      # คู่มือ Operations, Troubleshooting
```

---

## 5. รายชื่อไฟล์ Planning ที่ต้องสร้าง

| ไฟล์ | วัตถุประสงค์ | ต้องสร้างก่อน |
|---|---|---|
| `00-tech-stack-decision.md` | กำหนด Tech Stack และเหตุผล | — |
| `00-ai-working-rules.md` | กติกาการทำงานกับ AI | — |
| `00-documentation-structure.md` | โครงสร้าง docs (ไฟล์นี้) | — |
| `00-git-workflow.md` | Git Workflow | — |
| `00-readiness-check.md` | ตรวจความพร้อม | ไฟล์ 00 ทั้งหมด |
| `01-system-overview.md` | ภาพรวมระบบ | 00-tech-stack-decision |
| `02-requirements.md` | Requirements | 01-system-overview |
| `03-roles-permissions.md` | Roles & Permissions | 02-requirements |
| `04-user-workflow.md` | User Journey | 02-requirements, 03-roles |
| `05-database-design.md` | DB Schema | 02-requirements, 03-roles |
| `06-api-contract.md` | API Endpoints | 05-database-design |
| `07-frontend-pages.md` | Pages & Components | 06-api-contract |
| `08-dashboard-report.md` | Dashboard & Reports | 07-frontend-pages |
| `09-docker-architecture.md` | Docker Setup | 00-tech-stack-decision |
| `PROJECT_CONTEXT.md` | Context สรุปสำหรับ AI | ไฟล์ 01-09 ทั้งหมด |
| `10-implementation-plan.md` | Implementation Plan | PROJECT_CONTEXT |

---

## 6. ลำดับการสร้างไฟล์

### ช่วงที่ 0 — เตรียมกติกา (ทำก่อน Planning)

```
1. 00-tech-stack-decision.md
2. 00-ai-working-rules.md
3. 00-documentation-structure.md  (ไฟล์นี้)
4. 00-git-workflow.md
5. 00-readiness-check.md
```

### ช่วงที่ 1 — Planning Only

```
6.  01-system-overview.md
7.  02-requirements.md
8.  03-roles-permissions.md
9.  04-user-workflow.md
10. 05-database-design.md
11. 06-api-contract.md
12. 07-frontend-pages.md
13. 08-dashboard-report.md
14. 09-docker-architecture.md
15. PROJECT_CONTEXT.md
16. 10-implementation-plan.md
```

### ช่วงที่ 2 — Implementation

```
สร้าง/อัปเดตไฟล์ใน docs/testing/ ตาม Phase ที่พัฒนา
สร้าง/อัปเดตไฟล์ใน docs/deployment/ ก่อน Deploy
```

---

## 7. วัตถุประสงค์ของแต่ละไฟล์

| ไฟล์ | วัตถุประสงค์ | ผู้อ่านหลัก |
|---|---|---|
| `00-tech-stack-decision.md` | บันทึก technology decisions และเหตุผล | Developer, AI |
| `00-ai-working-rules.md` | กติกาควบคุม AI ตลอด project | AI |
| `00-documentation-structure.md` | Map ของ documentation ทั้งหมด | Developer, AI |
| `00-git-workflow.md` | Branch, commit convention, rollback | Developer |
| `00-readiness-check.md` | Gate check ก่อนเข้า Planning | PM, Developer |
| `01-system-overview.md` | ภาพรวมระบบ, Actor, Core Features | ทุกคน |
| `02-requirements.md` | Functional + Non-functional requirements | Developer, PM, AI |
| `03-roles-permissions.md` | ตาราง Role-Permission | Developer, AI |
| `04-user-workflow.md` | User journey, process flow | Developer, UX, AI |
| `05-database-design.md` | ERD, Schema, constraints | Developer, AI |
| `06-api-contract.md` | API spec ทุก endpoint | Frontend, Backend, AI |
| `07-frontend-pages.md` | Pages, routing, component tree | Frontend, AI |
| `08-dashboard-report.md` | Dashboard design, notification | Developer, AI |
| `09-docker-architecture.md` | Service map, network, volumes | DevOps, Developer |
| `PROJECT_CONTEXT.md` | Context สรุปส่งให้ AI ก่อนทุก Phase | AI |
| `10-implementation-plan.md` | Phase breakdown, tasks, criteria | Developer, AI |

---

## 8. กติกาการตั้งชื่อไฟล์

| กติกา | ตัวอย่าง |
|---|---|
| ใช้ตัวเลขนำหน้า 2 หลักสำหรับไฟล์ Planning | `01-system-overview.md` |
| คำนำหน้า `00-` สำหรับ setup/meta documents | `00-tech-stack-decision.md` |
| ใช้ kebab-case ทั้งหมด | `database-design.md` ✅ `DatabaseDesign.md` ❌ |
| นามสกุล `.md` เสมอ | `api-contract.md` |
| ชื่อต้องสื่อความหมายชัดเจน | `06-api-contract.md` ✅ `api.md` ❌ |
| ห้ามใช้ช่องว่าง | `system-overview.md` ✅ `system overview.md` ❌ |
| Bug report ใช้ format: `YYYY-MM-DD-description.md` | `2026-07-07-login-fix.md` |

---

## 9. กติกาการเขียน Markdown

### โครงสร้างทั่วไป

```markdown
# ชื่อเอกสาร — ชื่อโปรเจกต์

> **ช่วงที่ X: ชื่อช่วง**
> คำอธิบายสั้นของเอกสารนี้

---

## หัวข้อหลัก

### หัวข้อย่อย

เนื้อหา...
```

### กติกาการใช้ Heading

| Heading | ใช้สำหรับ |
|---|---|
| `#` | ชื่อเอกสาร (1 ไฟล์ มี 1 ตัว) |
| `##` | หัวข้อหลักของเอกสาร |
| `###` | หัวข้อย่อย |
| `####` | รายละเอียดเพิ่มเติม |

### กติกาอื่นๆ

- ใช้ตาราง (`|---|`) สำหรับข้อมูลเชิงเปรียบเทียบ
- ใช้ code block (` ``` `) สำหรับ code, command, JSON example
- ใช้ emoji สำหรับ visual grouping เช่น ✅ ❌ ⚠️ 📁
- ระบุ `> **ช่วงที่ X:**` ทุกเอกสารเพื่อบอก context
- ใช้ `---` เพื่อแบ่งส่วน
- ทุกตารางต้องมี header row

---

## 10. วิธีใช้เอกสารเหล่านี้กับ AI ในแต่ละ Phase

### ก่อนเริ่มงานกับ AI ทุกครั้ง

1. ส่ง context ให้ AI: `PROJECT_CONTEXT.md`
2. ระบุ Phase ที่ต้องการทำ
3. อ้างอิง planning docs ที่เกี่ยวข้อง

### ตัวอย่างการส่ง Context ให้ AI

```
อ่าน docs/planning/PROJECT_CONTEXT.md และ docs/planning/10-implementation-plan.md
แล้วทำ Phase 2: Authentication Module
```

### ช่วงที่ 0 (Setup)

ส่ง: `00-ai-working-rules.md` + `00-tech-stack-decision.md`

### ช่วงที่ 1 (Planning)

ส่ง: ไฟล์ `00-` ทั้งหมด + ไฟล์ที่กำลังสร้าง

### ช่วงที่ 2 (Implementation)

ส่ง: `PROJECT_CONTEXT.md` + `10-implementation-plan.md` + เอกสาร Planning ที่ Phase นั้นต้องการ

### ตาราง: Planning Doc ที่แต่ละ Phase ต้องอ้างอิง

| Phase | เอกสารที่ต้องอ่าน |
|---|---|
| Phase 1: Project Setup | `00-tech-stack-decision.md`, `09-docker-architecture.md` |
| Phase 2: Auth | `02-requirements.md`, `03-roles-permissions.md`, `05-database-design.md`, `06-api-contract.md` |
| Phase 3: Core Features | `02-requirements.md`, `05-database-design.md`, `06-api-contract.md`, `07-frontend-pages.md` |
| Phase 4: Dashboard | `08-dashboard-report.md`, `07-frontend-pages.md` |
| Phase 5: Deploy | `09-docker-architecture.md`, `docs/deployment/` |
