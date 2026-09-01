# Backup and Restore Plan: Gymyamjamsai

เอกสารฉบับนี้กำหนดนโยบายและขั้นตอนสำหรับการสำรองข้อมูล (Backup) และกู้คืนข้อมูล (Restore) สำหรับระบบ Gymyamjamsai (MySQL 8 ภายใต้ Docker Compose และ Persistent Volumes)

---

## 1. Database Backup Strategy
- **เครื่องมือ:** ใช้คำสั่ง `mysqldump` ผ่านการรันแบบชั่วคราว (Exec) เข้าไปใน MySQL Container
- **รูปแบบ:** การสำรองข้อมูลแบบ Logical Backup (ได้เป็นไฟล์ `.sql`) ซึ่งสามารถนำไป Restore บน Database Version ที่ใกล้เคียงกันได้ง่าย
- **เป้าหมาย:** ทำ Full Backup วันละครั้ง และเก็บรักษาในสถานที่ปลอดภัย

## 2. File Upload Backup Strategy
- **เป้าหมาย:** สำรองไฟล์ใน Volume `app_uploads` (โฟลเดอร์สำหรับเก็บภาพโปรไฟล์/รูปภาพกิจกรรม ถ้ามี)
- **เครื่องมือ:** ใช้ `tar` ในการบีบอัดโฟลเดอร์จาก Host Machine โดยตรง
- **ความสัมพันธ์:** ควรสำรองข้อมูลไฟล์ไปพร้อมๆ กับการสำรอง Database เพื่อให้ File Path ใน DB ชี้ตรงกับภาพที่มีอยู่จริง

## 3. Backup Frequency
- **Daily Full Backup:** ทุกวันเวลา 02:00 น. (ช่วงเวลาที่มีผู้ใช้งานน้อยที่สุด)

## 4. Backup Retention (การเก็บรักษา)
- **Local Storage:** เก็บข้อมูลย้อนหลัง 7 วันบนเครื่อง Server หลัก
- **Off-site Storage:** ไฟล์ Backup ที่เกิน 7 วัน จะถูกนำไปเก็บแบบระยะยาว (Archive) ไว้ที่ Cloud Storage (เช่น Amazon S3) เป็นเวลา 30-90 วัน ขึ้นอยู่กับนโยบายบริษัท

## 5. Backup Storage Location
- **Local:** `/var/backups/gymyamjamsai/` (ต้องสร้างโฟลเดอร์เตรียมไว้)
- **Off-site:** AWS S3 Bucket `s3://company-backup-bucket/gymyamjamsai/`

---

## 6. Manual Backup Command
หากต้องการสำรองข้อมูลด่วนก่อนทำการอัปเดตระบบ ให้รันคำสั่งบนเครื่อง Host (ที่รัน Docker) ดังนี้:

### 6.1 Database Backup
```bash
# กำหนดชื่อไฟล์พร้อมเวลา
BACKUP_FILE="/var/backups/gymyamjamsai/db_backup_$(date +%F_%H-%M-%S).sql"

# สั่ง mysqldump ผ่าน docker exec
sudo docker exec gymyamjamsai_mysql_prod mysqldump \
  -u <DB_USER> -p'<DB_PASSWORD>' \
  --databases gymyamjamsai_prod > $BACKUP_FILE

echo "Backup Database completed: $BACKUP_FILE"
```

### 6.2 File Upload Backup
```bash
# บีบอัด Volume (สมมติเก็บที่ ./app_uploads)
FILE_BACKUP="/var/backups/gymyamjamsai/uploads_backup_$(date +%F_%H-%M-%S).tar.gz"

sudo tar -czvf $FILE_BACKUP ./app_uploads

echo "Backup Files completed: $FILE_BACKUP"
```

---

## 7. Restore Command (การกู้คืน)

> **คำเตือน:** การ Restore เป็นการเขียนทับข้อมูลทั้งหมด โปรดประเมินผลกระทบและสำรองข้อมูลชุดปัจจุบันก่อนทำเสมอ

### 7.1 กู้คืน Database
```bash
# 1. นำเข้าไฟล์ SQL กลับเข้าไปใน Container
cat /var/backups/gymyamjamsai/db_backup_<วันที่>.sql | sudo docker exec -i gymyamjamsai_mysql_prod mysql -u <DB_USER> -p'<DB_PASSWORD>'

# 2. ตรวจสอบข้อมูลเบื้องต้น
sudo docker exec -it gymyamjamsai_mysql_prod mysql -u <DB_USER> -p'<DB_PASSWORD>' -e "SHOW TABLES IN gymyamjamsai_prod;"
```

### 7.2 กู้คืน File Uploads
```bash
# 1. ระงับการใช้งาน Container ของแอป (เพื่อป้องกันการเขียนทับไฟล์)
sudo docker-compose -f docker-compose.prod.yml stop backend

# 2. ลบเนื้อหาใน Volume ปัจจุบัน
sudo rm -rf ./app_uploads/*

# 3. แตกไฟล์ Backup กลับเข้าไป
sudo tar -xzvf /var/backups/gymyamjamsai/uploads_backup_<วันที่>.tar.gz -C .

# 4. สตาร์ท Container กลับคืน
sudo docker-compose -f docker-compose.prod.yml start backend
```

---

## 8. Scheduled Backup with Cron
สร้าง Bash Script `backup.sh` ไว้ที่ `/opt/gymyamjamsai/scripts/backup.sh`:

```bash
#!/bin/bash
DATE=$(date +%F)
BACKUP_DIR="/var/backups/gymyamjamsai"
DB_USER="<DB_USER>"
DB_PASS="<DB_PASSWORD>"

# 1. Backup DB
docker exec gymyamjamsai_mysql_prod mysqldump -u $DB_USER -p"$DB_PASS" gymyamjamsai_prod > $BACKUP_DIR/db_$DATE.sql

# 2. Backup Files (ระบุ path ของ volume จริง)
tar -czvf $BACKUP_DIR/uploads_$DATE.tar.gz /path/to/gymyamjamsai/app_uploads

# 3. ลบไฟล์เก่าเกิน 7 วัน
find $BACKUP_DIR -type f -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -type f -name "*.tar.gz" -mtime +7 -delete
```
ตั้งสิทธิ์ executable: `chmod +x backup.sh`
เพิ่มเข้า Crontab (`sudo crontab -e`):
```text
# รันทุกเวลา 02:00 น.
0 2 * * * /opt/gymyamjamsai/scripts/backup.sh >> /var/log/gym_backup.log 2>&1
```

---

## 9. Backup Verification (การตรวจสอบ)
- ตั้งค่าให้ Script ทรงแจ้งเตือนทางอีเมล หรือ Line Notify เมื่อการรัน Cronjob สำเร็จหรือล้มเหลว
- แอดมินต้องสุ่มดาวน์โหลดไฟล์ `.sql` มาเช็คโครงสร้าง (หัวไฟล์ควรมีเวอร์ชัน mysqldump และท้ายไฟล์ต้องไม่มีบรรทัดขาดหาย) อย่างน้อยเดือนละ 1 ครั้ง

## 10. Recovery Test (ซ้อมหนีไฟ)
- **ความถี่:** ควรกำหนดวันทดสอบกู้คืนระบบอย่างน้อยทุกๆ 6 เดือน
- **วิธีการ:** นำไฟล์ Backup ล่าสุดไป Restore ลงเครื่องจำลอง (Staging Environment) แล้วเปิดใช้งานระบบว่าข้อมูลครบถ้วน และผู้ใช้สามารถ Login ได้หรือไม่

## 11. Security Considerations
- **สิทธิการเข้าถึง:** โฟลเดอร์ `/var/backups` ต้องถูกอ่าน/เขียนได้โดย `root` เท่านั้น (`chmod 700 /var/backups`)
- **การเข้ารหัส (Encryption):** หาก Backup ถูกส่งไปฝากนอกบริษัท ควรใช้ `gpg` หรือ Zip-password เข้ารหัสไฟล์ทับอีกชั้นก่อนส่ง
- **ไม่เก็บรหัสผ่านเปลือย:** หากเป็นไปได้ควรใช้ `--login-path` ของ MySQL หรือใช้ไฟล์ `.my.cnf` ในการยืนยันตัวตน เพื่อหลีกเลี่ยงการโดนขโมย Password ผ่านหน้า History ของ Bash

## 12. Disaster Recovery Notes
ในกรณีที่ Server เครื่องหลักพังทั้งหมด (Hard Drive Failure, ภัยพิบัติ):
1. **RTO (Recovery Time Objective):** ตั้งเป้ากู้คืนระบบภายใน 4 ชั่วโมง
2. **RPO (Recovery Point Objective):** ข้อมูลสูญหายไม่เกิน 24 ชั่วโมง (เพราะแบ็คอัพวันละครั้ง)
3. ให้ Provision Server ใหม่ ติดตั้ง Docker แล้วดึงไฟล์ `docker-compose.prod.yml` พร้อมไฟล์ Backup ชุดล่าสุดจาก S3 ลงมา Restore ทันที
