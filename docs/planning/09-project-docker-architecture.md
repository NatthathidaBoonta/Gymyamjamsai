# Project Structure and Docker Architecture: Gymyamjamsai

อ้างอิงจากแผนงานทั้งหมด (Overview, Requirements, Database, API, Frontend, Dashboard) เอกสารนี้จะสรุปการวางโครงสร้างโฟลเดอร์ของโปรเจกต์ (Project Structure) และสถาปัตยกรรมของ Docker สำหรับทั้ง Environment ของ Development และ Production

---

## 1. Project Folder Structure (โครงสร้างโฟลเดอร์)
```text
Gymyamjamsai/
├── backend/                  # Source code สำหรับ Backend (Node.js/Express)
│   ├── src/
│   │   ├── config/           # ตั้งค่าต่างๆ เช่น Database connection
│   │   ├── controllers/      # รับ Request จาก API และส่ง Response
│   │   ├── middlewares/      # Authentication, Validation, File Upload
│   │   ├── models/           # Database queries 
│   │   ├── routes/           # จัดการ API endpoints (/api/...)
│   │   ├── services/         # Business logic
│   │   ├── utils/            # ฟังก์ชันช่วยเหลืออื่นๆ
│   │   └── server.js         # **Backend Entry Point**
│   ├── public/               # (Prod) พื้นที่เสิร์ฟ Frontend build (dist) และไฟล์แนบ
│   └── package.json
├── frontend/                 # Source code สำหรับ Frontend (React/Vite)
│   ├── public/               # Static assets ทั่วไป
│   ├── src/
│   │   ├── assets/           # รูปภาพ, CSS
│   │   ├── components/       # Reusable components (UI)
│   │   ├── layouts/          # โครงสร้าง Layout (Sidebar, Topbar)
│   │   ├── pages/            # หน้าจอหลักต่างๆ แยกตาม Role
│   │   ├── services/         # ไฟล์เชื่อมต่อ API (Axios/Fetch)
│   │   ├── store/            # State management
│   │   ├── utils/            # ฟังก์ชันช่วยเหลือ
│   │   ├── App.jsx           # Root component
│   │   └── main.jsx          # Frontend entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── db/
│   └── init/                 # สคริปต์ SQL เริ่มต้นฐานข้อมูล (ถูก mount เข้า /docker-entrypoint-initdb.d)
├── docs/                     # เอกสาร Planning และ API docs ทั้งหมด
├── nginx/                    # (Prod On-premise) การตั้งค่า Nginx 
│   └── default.conf
├── .env.example              # ตัวอย่าง Environment variables
├── docker-compose.yml        # ตั้งค่า Docker สำหรับโหมด Development
├── docker-compose.prod.yml   # ตั้งค่า Docker สำหรับโหมด Production (On-premise)
├── Dockerfile                # Multi-stage build สำหรับรวม Frontend และ Backend (รันที่ Root)
├── railway.toml              # การตั้งค่าสำหรับ Deploy ขึ้น Railway
└── README.md
```

## 2. คำอธิบายแต่ละโฟลเดอร์ (Folder Descriptions)
- **`backend/`**: รวบรวมโค้ดฝั่งเซิร์ฟเวอร์ โดยมีไฟล์หลักที่ `backend/src/server.js` ซึ่งใน Production จะทำหน้าที่ Serve API (พอร์ต 5000) และทำหน้าที่เสิร์ฟไฟล์เว็บของ Frontend ไปพร้อมกัน
- **`frontend/`**: โค้ดฝั่งไคลเอนต์ เมื่อถึงกระบวนการ Build (Production) จะนำผลลัพธ์ (โฟลเดอร์ `dist/`) ไปวางไว้ใน `backend/public/`
- **`db/init/`**: โฟลเดอร์เก็บไฟล์โครงสร้างตาราง (Table Schema) และข้อมูลจำลอง (Mock Data) สำหรับรันอัตโนมัติเมื่อสร้าง Database Container ครั้งแรก
- **`nginx/`**: เก็บการตั้งค่า Reverse Proxy เฉพาะกรณีที่ต้องการนำโปรเจกต์ไป Deploy แบบ On-premise Server
- **`docs/`**: พื้นที่จัดเก็บเอกสารการออกแบบระบบและข้อกำหนดต่างๆ

---

## 3. Docker Services ที่ต้องมี (Development)
ในไฟล์ `docker-compose.yml` สำหรับโหมด Dev จะประกอบด้วย 4 Services หลัก:
1. **`mysql`**: ฐานข้อมูล MySQL 8 
2. **`phpmyadmin`**: หน้า UI สำหรับจัดการฐานข้อมูล (Tools สำหรับ Dev)
3. **`backend`**: Node.js API (ใช้ Nodemon ในการ Watch file)
4. **`frontend`**: Vite Dev Server (ใช้โหมด HMR สำหรับ Frontend)

## 4. Port ที่ใช้ (Ports Configuration)
| Service | Container Port | Host Port (Dev) |
| :--- | :--- | :--- |
| **Frontend** | 5173 | `5173` |
| **Backend** | 5000 | `5000` |
| **MySQL** | 3306 | `3307` |
| **phpMyAdmin**| 80 | `8081` |

## 5. Network ระหว่าง Containers
- สร้าง Docker Bridge Network (เช่น `gym_network`) เพื่อให้ Service ภายในคุยกันได้
- Backend สามารถเชื่อมต่อไปยังฐานข้อมูลได้โดยใช้ชื่อ Service name คือ `mysql:3306`
- Frontend สามารถเชื่อมต่อ API ของ Backend ผ่านบราวเซอร์ (Localhost) คือ `http://localhost:5000` หรือผ่านการทำ Proxy Configuration ใน Vite

## 6. Volume สำหรับ MySQL
- สร้าง Named Volume (เช่น `mysql_data:/var/lib/mysql`) เพื่อไม่ให้ข้อมูลสูญหายเมื่อ Container ปิดลง
- ทำ Bind Mount สำหรับการรันสคริปต์ Database เริ่มต้น: `./db/init:/docker-entrypoint-initdb.d`

## 7. Environment Variables ที่จำเป็น
**Backend (`backend/.env`):**
- `PORT=5000`
- `DB_HOST=mysql` (ถ้าอยู่ใน Docker) หรือ `localhost` (ถ้ารันนอก Docker)
- `DB_PORT=3306` (หรือ 3307 ถ้ารันนอก Docker)
- `DB_USER=root`
- `DB_PASSWORD=your_password`
- `DB_NAME=gymyamjamsai`
- `JWT_SECRET=your_secret_key`

**Frontend (`frontend/.env`):**
- `VITE_API_URL=http://localhost:5000/api`

---

## 8. Dev Environment (โหมดการพัฒนา)
- ใช้ `docker-compose up -d` เพื่อสตาร์ทระบบ Database ทั้งหมด
- Backend รันด้วย `npm run dev` (ใช้ Nodemon ใน `backend/src/server.js`) เพื่อให้เซิร์ฟเวอร์รีสตาร์ทอัตโนมัติเมื่อมีการแก้โค้ด
- Frontend รันด้วย `npm run dev` (Vite)
- ข้อมูล Database ถูกสร้างอัตโนมัติจากสคริปต์ใน `./db/init/` เฉพาะตอนสร้าง Database Container ครั้งแรก (First start)

## 9. Production Environment (โหมดใช้งานจริง)
ระบบออกแบบมาให้รองรับ 2 Targets จาก `Dockerfile` ไฟล์เดียวที่อยู่ระดับ Root:

### Target A: Deploy บน Cloud Platform (Railway)
- **ไฟล์บังคับการ:** `Dockerfile` + `railway.toml`
- **โครงสร้าง Architecture:** เป็นแบบ **Single-container** จาก Dockerfile multi-stage build:
  1. *Stage 1 (Build Frontend):* รัน `npm run build` ในโฟลเดอร์ frontend
  2. *Stage 2 (Setup Backend):* คัดลอกโฟลเดอร์ `frontend/dist/` ทั้งหมดมาไว้ที่ `backend/public/`
  3. *Stage 3 (Run):* รันคำสั่งเปิดเซิร์ฟเวอร์ `node backend/src/server.js` 
- **ผลลัพธ์:** Express.js จะทำหน้าที่ 2 อย่างคือ 
  - เสิร์ฟ API ที่ Endpoint `/api`
  - เสิร์ฟหน้าเว็บ React (Static file) ที่พาธหลัก (เช่น `/`) โดย **ไม่ใช้ Nginx**

### Target B: Deploy แบบ On-premise (Server ส่วนตัว)
- **ไฟล์บังคับการ:** `docker-compose.prod.yml` + `nginx/default.conf`
- **โครงสร้าง Architecture:** ใช้ Container แยกกัน 
- Nginx จะทำหน้าที่เป็น Reverse Proxy รับ Request จากภายนอกทั้งหมด แล้วทำการ Routing (เช่น โยนพาธ `/api` ไปให้ Backend container จัดการ และโยนพาธ `/` ให้ Frontend container หรือโฟลเดอร์ Static)

---

## 10. ข้อควรระวังและการจัดการ (Precautions)

1. **เรื่อง CORS (Cross-Origin Resource Sharing):**
   - **Dev Mode:** ต้องตั้งค่าใน Backend (`cors` middleware) ให้ยอมรับ Request จาก `http://localhost:5173` มิฉะนั้นบราวเซอร์จะบล็อกคำขอ หรือแก้โดยใช้ `server.proxy` ในตั้งค่า `vite.config.js`
   - **Prod Mode (Railway):** ปัญหาเรื่อง CORS จะหมดไปโดยธรรมชาติ เนื่องจาก Frontend และ Backend ถูกเสิร์ฟออกมาจากเซิร์ฟเวอร์ Express.js (โดเมน/พอร์ต) เดียวกัน 

2. **เรื่อง Database Connection:**
   - ในโหมด Dev ระวังความสับสนเรื่อง Host/Port:
     - หากคุณรัน Backend แบบ Local (ด้วยคำสั่ง `node` ธรรมดาที่เครื่องของคุณ) ต้องต่อ Database ไปที่ `localhost` พอร์ต `3307`
     - หากคุณรัน Backend แบบ Build เป็น Docker Container ต้องต่อ Database ไปที่ Host `mysql` พอร์ต `3306`

3. **เรื่อง File Upload:**
   - การอัปโหลดรูปภาพกิจกรรมหรือโปรไฟล์ ควรเซฟไว้ในโฟลเดอร์ `backend/public/uploads` เพื่อให้ Express สามารถนำไปเสิร์ฟ (Serve Static) ต่อไปยังหน้าเว็บ (Frontend) ได้เลย
   - **ข้อควรระวังบน Cloud:** ระบบไฟล์บน Railway อาจเป็นแบบ Ephemeral File System (คือไฟล์จะหายทุกครั้งที่โปรเจกต์มีการรีสตาร์ทหรือ Deploy ใหม่) 
     - *การแก้ปัญหา:* ในเฟสเริ่มต้นสามารถเซฟไฟล์ลง Local (ในโฟลเดอร์ public) ได้เพื่อความง่าย แต่ในอนาคต หากไฟล์รูปมีความสำคัญ ควรพิจารณาอัปโหลดรูปไปเก็บไว้ที่ External Storage (เช่น Cloudinary หรือ AWS S3) เพื่อความยั่งยืนของข้อมูล
