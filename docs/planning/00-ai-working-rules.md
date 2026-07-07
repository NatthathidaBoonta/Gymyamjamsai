# AI Working Rules — Gymyamjamsai

> **ช่วงที่ 0: เตรียมกติกาและบริบท**
> เอกสารนี้กำหนดกติกาการทำงานร่วมกับ AI ตลอดทุก Phase ของโปรเจกต์
> AI ต้องอ่านและปฏิบัติตามเอกสารนี้ก่อนเริ่มงานทุกครั้ง

---

## 1. General AI Rules

- AI ต้องอ่าน `SKILL.md` และ `docs/planning/00-ai-working-rules.md` ก่อนเริ่มงานทุกครั้ง
- AI ต้องทำงานตาม Phase ที่ได้รับมอบหมายเท่านั้น ห้ามทำข้ามหรือล่วงหน้า
- AI ต้องแจ้งให้ทราบเมื่อจบ Phase และขอ approval ก่อนเริ่ม Phase ถัดไป
- AI ต้องรายงานทุกไฟล์ที่สร้าง แก้ไข หรือลบ
- AI ต้องแสดงเหตุผลทุกครั้งที่ต้องเปลี่ยนแผนจาก Planning เดิม
- AI ต้องไม่ตัดสินใจเรื่อง Architecture, Tech Stack หรือ Business Logic โดยไม่ได้รับอนุญาต

---

## 2. Planning Rules

- ห้ามเขียน Code ใดๆ ก่อนที่ Planning จะสมบูรณ์และได้รับ approval
- AI ต้องอ่านเอกสาร planning ทั้งหมดที่เกี่ยวข้องก่อนเสนอ Implementation Plan
- Planning ต้องครอบคลุม: Requirements, Database Design, API Contract, Frontend Pages, Roles & Permissions
- ทุก Planning Document ต้องระบุ: วัตถุประสงค์, ขอบเขต, สิ่งที่ไม่ครอบคลุม (Out of Scope)
- หากข้อมูลใน Requirement ไม่ครบ AI ต้องถามก่อน ไม่ใช่สมมติเอง

---

## 3. Implementation Rules

- AI ต้องอ่าน `docs/planning/10-implementation-plan.md` ก่อนทำแต่ละ Phase เสมอ
- ทำเฉพาะ Phase ที่ระบุในคำสั่งเท่านั้น
- ทุก Phase ต้องมีก่อนจบ: วิธีรัน, วิธีทดสอบ, Acceptance Criteria Checklist
- ทุก Phase ต้องจบด้วย Git Commit Message ที่แนะนำ
- ทุก Phase ต้องมี Phase Completion Report
- ห้ามข้าม step ใน Phase เพื่อความรวดเร็ว

---

## 4. Phase Control Rules

- ทุก Phase เริ่มได้เมื่อได้รับ explicit approval จากผู้ใช้เท่านั้น
- AI ต้องแจ้งเมื่อจบ Phase และรายงานผลลัพธ์
- ถ้าพบปัญหาระหว่าง Phase ต้องแจ้งทันที ไม่ใช่แก้เองโดยไม่บอก
- ถ้า Phase ต้องเปลี่ยนแผน AI ต้อง propose แผนใหม่และรอ approval ก่อน
- ห้าม rollback Phase โดยไม่แจ้ง

---

## 5. Code Generation Rules

- เขียน Code เฉพาะที่อยู่ใน scope ของ Phase ที่กำลังทำ
- ทุก function/method ต้องมี comment อธิบายวัตถุประสงค์
- ห้ามใช้ library ใหม่ที่ไม่ได้ระบุใน Planning โดยไม่ได้รับอนุญาต
- Code ต้องสอดคล้องกับ API Contract ที่กำหนดใน `docs/planning/06-api-contract.md`
- ห้ามเปลี่ยน Database Schema โดยไม่อัปเดต `docs/planning/05-database-design.md`
- ต้องระบุว่าไฟล์ใดถูกสร้าง/แก้ไข/ลบทุกครั้ง

---

## 6. Debugging Rules

- เมื่อพบ Bug ต้องวิเคราะห์ Root Cause ก่อนเสนอวิธีแก้
- แสดง Error message และ Stack trace ที่เกี่ยวข้อง
- อธิบายว่าทำไมถึงเกิด Bug และ Fix อย่างไร
- ถ้า Fix กระทบ scope นอก Phase ปัจจุบัน ต้องแจ้งก่อน
- บันทึก Bug และวิธีแก้ลงใน Documentation ถ้าเป็น issue สำคัญ

---

## 7. Documentation Rules

- อัปเดต Document ทุกครั้งที่ตัดสินใจเปลี่ยน Architecture, API หรือ Database Schema
- ห้ามให้ Code ล้ำหน้า Document
- ทุกไฟล์ documentation ต้องมี: วันที่อัปเดต, เวอร์ชัน, ผู้อัปเดต (ถ้ามี)
- ใช้ภาษาที่ชัดเจน เหมาะกับทั้ง Developer และ Non-developer อ่าน
- ตารางใช้สำหรับข้อมูลเชิงเปรียบเทียบหรือ Spec

---

## 8. Testing Rules

- ทุก Phase ต้องมี Test Cases ที่ระบุวิธีทดสอบ (Manual หรือ Automated)
- Acceptance Criteria ต้องชัดเจน วัดผลได้
- API Endpoint ทุกตัวต้องมี Test Case
- ถ้ามี Unit Test ต้องผ่านทั้งหมดก่อน Phase Completion
- ระบุว่าทดสอบด้วยอะไร (Postman, curl, Browser, Jest เป็นต้น)

---

## 9. Git Commit Rules

- ทุก Phase ต้องเสนอ Commit Message ตาม Conventional Commits
- Format: `<type>(<scope>): <subject>`
- Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`
- ห้าม commit secrets, tokens, passwords หรือ production credentials
- ตรวจ `git status` ก่อน commit ทุกครั้ง
- ตรวจว่า `.env` ไม่ถูก track ก่อน commit

---

## 10. Forbidden Actions

| ห้ามทำ | เหตุผล |
|---|---|
| เขียน Code ก่อน Planning เสร็จ | ทำให้ทิศทางผิดพลาด |
| ทำ Phase ถัดไปโดยไม่ได้รับ approval | ควบคุม scope ไม่ได้ |
| เพิ่ม Feature นอกแผน | Scope creep |
| เปลี่ยน Tech Stack โดยไม่แจ้ง | กระทบ Architecture ทั้งหมด |
| เปลี่ยน DB Schema โดยไม่อัปเดต doc | Document ไม่ sync กับ Code |
| เปลี่ยน API Contract โดยไม่แจ้ง | Frontend-Backend desync |
| Commit `.env` หรือ secrets | Security risk |
| ใช้ `localhost` ระหว่าง Docker services | Connection fail |
| ใส่ `version:` ใน docker-compose.yml | Deprecated, warning/error |
| Bind mount `node_modules` | Architecture mismatch |

---

## 11. Required Output Format

ทุก response ที่เกี่ยวกับ implementation ต้องมีส่วนนี้:

```
### 📁 Files Changed
- [CREATE] path/to/new-file.js
- [MODIFY] path/to/existing-file.js
- [DELETE] path/to/removed-file.js

### ▶️ How to Run
<คำสั่งที่ใช้รัน>

### 🧪 How to Test
<ขั้นตอนทดสอบ>

### ✅ Acceptance Criteria
- [ ] criteria 1
- [ ] criteria 2

### 💬 Recommended Commit Message
feat(phase-X): <description>
```

---

## 12. How AI Should Ask Questions

- ถามก่อนลงมือเสมอเมื่อ Requirement ไม่ชัดเจน
- ถามเป็นข้อๆ ไม่ถามรวมกันสับสน
- ระบุว่าคำตอบจะส่งผลกระทบต่ออะไร
- อย่าถามคำถามที่ไม่จำเป็น ถามเฉพาะที่ block การทำงาน
- ใช้ตัวอย่างประกอบเมื่อต้องการ clarify

ตัวอย่าง:
```
ฉันต้องการทราบเรื่องต่อไปนี้ก่อนดำเนินการ:

1. [คำถาม] — เพราะถ้าตอบ A จะออกแบบ X, ถ้าตอบ B จะออกแบบ Y
2. [คำถาม] — คำตอบนี้จะกระทบ Database Schema
```

---

## 13. How AI Should Handle Unclear Requirements

1. ระบุว่าส่วนใดไม่ชัดเจน
2. เสนอ assumption ที่สมเหตุสมผลพร้อมเหตุผล
3. ขอ approval จาก stakeholder ก่อนดำเนินการ
4. บันทึก assumption ลงใน Planning Document
5. ถ้า assumption ผิด ต้องแก้ทั้ง Code และ Document

---

## 14. How AI Should Report Changes

ทุกครั้งที่มีการเปลี่ยนแผนหรือ decision ใหม่ ต้องรายงานในรูปแบบ:

```
### ⚠️ Change Report

**เปลี่ยนอะไร**: <อธิบาย>
**เหตุผล**: <ทำไมต้องเปลี่ยน>
**กระทบอะไร**: <ไฟล์, Phase, Document ที่ต้องอัปเดต>
**ต้องการ Approval**: Yes / No
```

---

## 15. Docker Development Rules

- ใช้ `docker-compose.yml` สำหรับ development environment เท่านั้น
- ห้ามใส่ `version:` attribute ใน `docker-compose.yml`
- Frontend ใช้ port 5173, Backend ใช้ port 5000
- หลีกเลี่ยง port 5000 บน macOS เพราะ AirPlay Receiver อาจ conflict (ใช้ 5001 แทน)
- MySQL ใช้ host port 3307 map ไป container port 3306
- phpMyAdmin ใช้ host port 8081 map ไป container port 80
- Apple Silicon: ระบุ `platform: linux/amd64` เฉพาะ service ที่ไม่รองรับ ARM
- ใช้ bind mounts สำหรับ source code
- ใช้ anonymous volume สำหรับ `node_modules`
- Backend/phpMyAdmin ติดต่อ DB ผ่าน service name `mysql` (หรือ `db`) และ port 3306
- MySQL ต้องมี healthcheck
- Service ที่ต้องการ DB ต้องใช้ `depends_on` พร้อม `condition: service_healthy`
- เมื่อเพิ่ม package ใหม่ ต้อง rebuild container ด้วย `docker-compose up --build`

---

## 16. Git / GitHub Workflow Rules

- ก่อน commit ต้องรัน `git status` และตรวจว่า `.env` ไม่ถูก track
- `.gitignore` ต้องครอบคลุม: `.env`, `node_modules/`, `dist/`, `*.log`, `.DS_Store`
- ใช้ Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `style:`
- ทุก Phase ต้องเสนอ commit message ที่ชัดเจน
- อัปเดต `README.md` เมื่อคำสั่งรัน, dependency, port หรือ workflow เปลี่ยน
- ใช้ GitHub CLI (`gh`) ได้ แต่ต้องแจ้งก่อนทำขั้นตอน login/authorize
- ห้าม commit secrets, production credentials, tokens หรือข้อมูลส่วนบุคคลจริง
- README ควรมีหัวข้อ: Project Name, Description, Tech Stack, Install/Run, Port Mapping, Docker Commands, Folder Structure, License/Owner

---

## 17. Skill / Project Instruction Rules

- AI ต้องอ่าน project instruction หรือ skill ที่เกี่ยวข้องก่อนเริ่มงานกับโปรเจกต์
- ถ้ามี `.agents/skills/[skill-name]/SKILL.md` ต้องใช้เป็น source of truth ร่วมกับ planning docs
- ชื่อ skill ใช้ lowercase และ `-` คั่น เช่น `gymyamjamsai-dev`
- `SKILL.md` ต้องมี YAML frontmatter: `name` และ `description`
- skill ต้องระบุ: When to Use, When NOT to Use, Architecture, Service Map & Ports, Network Rules, Environment Variables, Commands, Coding Guidelines, Output Format, Examples
- ข้อมูลยาว เช่น API spec, DB schema ให้อ้างอิงจาก `docs/planning/` แทนการ copy ลง skill
- เมื่อ architecture, ports, service หรือ convention เปลี่ยน ต้องอัปเดต skill และ planning docs ให้ตรงกัน

---

## 18. Environment & Secret Handling Rules

- ใช้ `.env` สำหรับ local development
- ใช้ `.env.example` สำหรับตัวอย่างค่า (ใช้ placeholder เท่านั้น)
- ห้ามใส่ secret จริงใน source code, prompt, README หรือ planning docs
- Production environment ตั้งค่าผ่าน platform env vars (Railway Variables)
- เมื่อแสดงตัวอย่าง config ให้ใช้ placeholder เช่น `your_password_here`
- `.env` ต้องอยู่ใน `.gitignore` เสมอ
- ทุกครั้งที่เพิ่ม env var ใหม่ ต้องอัปเดต `.env.example` ด้วย
