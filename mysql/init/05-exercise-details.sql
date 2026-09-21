-- ============================================================
-- 05-exercise-details.sql — รายละเอียดท่าแบบเต็ม + ระบบเสนอแก้ไขท่า (Trainer → Admin อนุมัติ)
-- ------------------------------------------------------------
-- รันอัตโนมัติตอนสร้าง container ครั้งแรก
-- ใส่ลง DB เดิม: docker exec -i gymyamjamsai-mysql mysql -ugymyam_user -pgymyam_password gymyamjamsai < mysql/init/05-exercise-details.sql
-- (ALTER TABLE จะ error "Duplicate column" ถ้าเคยรันแล้ว — ข้ามได้ ส่วน UPDATE/CREATE รันซ้ำได้)
-- ============================================================

SET NAMES utf8mb4;

-- ------------------------------------------------------------
-- exercises: ฟิลด์รายละเอียดเพิ่มเติม
-- ------------------------------------------------------------
ALTER TABLE exercises
  ADD COLUMN muscle_group VARCHAR(100) NULL AFTER category,
  ADD COLUMN equipment    VARCHAR(100) NULL AFTER muscle_group,
  ADD COLUMN difficulty   ENUM('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'beginner' AFTER equipment,
  ADD COLUMN tips         TEXT NULL AFTER instructions;

-- workout_plans: จำเป้าหมายที่ใช้สร้างแผน (เดิม frontend เดาเป็น general ทุกครั้งที่โหลด)
ALTER TABLE workout_plans
  ADD COLUMN goal VARCHAR(50) NULL AFTER user_id;

-- ------------------------------------------------------------
-- exercise_suggestions — Trainer เสนอแก้ไขรายละเอียดท่า, Admin อนุมัติ/ปฏิเสธ
-- payload เก็บเฉพาะฟิลด์ที่เสนอเปลี่ยน (JSON) เมื่ออนุมัติจะ merge ลง exercises
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exercise_suggestions (
  id           VARCHAR(36)  PRIMARY KEY,
  exercise_id  VARCHAR(36)  NOT NULL,
  trainer_id   VARCHAR(36)  NOT NULL,
  payload      JSON         NOT NULL,
  note         VARCHAR(500) NULL,               -- เหตุผลจาก trainer
  status       ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  reviewed_by  VARCHAR(36)  NULL,
  review_note  VARCHAR(500) NULL,
  reviewed_at  DATETIME     NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_suggestions_exercise FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
  CONSTRAINT fk_suggestions_trainer  FOREIGN KEY (trainer_id)  REFERENCES users(id)     ON DELETE CASCADE,
  CONSTRAINT fk_suggestions_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id)     ON DELETE SET NULL,
  INDEX idx_suggestions_status (status, created_at),
  INDEX idx_suggestions_trainer (trainer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- เนื้อหาภาษาไทยของท่าทั้ง 39 ท่า (ขั้นตอนคั่นด้วยขึ้นบรรทัดใหม่)
-- ------------------------------------------------------------
UPDATE exercises SET muscle_group='ไหล่, หลังแขน', equipment='ดัมเบล + ม้านั่ง', difficulty='intermediate',
  instructions='นั่งบนม้านั่งพนักตั้ง ถือดัมเบลระดับไหล่ ฝ่ามือหันเข้าหาตัว\nดันดัมเบลขึ้นพร้อมหมุนข้อมือให้ฝ่ามือหันออกเมื่อสุดแขน\nลดลงช้าๆ พร้อมหมุนกลับสู่ท่าเริ่มต้น',
  tips='อย่าล็อกข้อศอกตอนสุดแขน · หลังแนบพนักตลอด · เริ่มจากน้ำหนักเบาเพราะการหมุนข้อมือใช้แรงมากกว่าที่คิด' WHERE id='ex001';
UPDATE exercises SET muscle_group='ต้นแขนด้านหน้า', equipment='บาร์เบล', difficulty='beginner',
  instructions='ยืนเท้ากว้างเท่าไหล่ จับบาร์เบลหงายมือ กว้างเท่าไหล่\nงอข้อศอกยกบาร์ขึ้นถึงระดับอก ข้อศอกแนบลำตัว\nลดลงช้าๆ จนแขนเหยียดเกือบสุด',
  tips='ห้ามเหวี่ยงลำตัวช่วย · ข้อศอกอยู่กับที่ · เกร็งกล้ามท้องกันหลังแอ่น' WHERE id='ex002';
UPDATE exercises SET muscle_group='อก, ไหล่หน้า, หลังแขน', equipment='บาร์เบล + ม้านั่ง', difficulty='intermediate',
  instructions='นอนหงายบนม้านั่ง ตาอยู่ใต้บาร์ เท้าวางราบกับพื้น\nจับบาร์กว้างกว่าไหล่เล็กน้อย ยกออกจากแร็ค\nลดบาร์ลงแตะกลางอกโดยควบคุม แล้วดันขึ้นจนแขนเหยียด',
  tips='ต้องมีคนช่วย spot เมื่อเล่นหนัก · สะบักหุบเข้าหากันตลอดเซต · ข้อศอกทำมุม ~45° กับลำตัว ไม่กางออก 90°' WHERE id='ex003';
UPDATE exercises SET muscle_group='ต้นขาหน้า, สะโพก', equipment='ม้านั่ง (ดัมเบลเสริมได้)', difficulty='intermediate',
  instructions='ยืนหันหลังให้ม้านั่ง วางหลังเท้าข้างหนึ่งบนม้านั่ง\nย่อตัวลงจนต้นขาหน้าขนานพื้น เข่าหน้าไม่เลยปลายเท้า\nดันส้นเท้าหน้ากลับขึ้นสู่ท่ายืน ทำครบแล้วสลับข้าง',
  tips='เท้าหน้าห่างม้านั่งประมาณ 2 ช่วงเท้า · ลำตัวเอนหน้าเล็กน้อยได้ · ถ้าเสียสมดุลให้จับสิ่งของข้างตัว' WHERE id='ex004';
UPDATE exercises SET muscle_group='น่อง', equipment='ไม่ต้องใช้ (ดัมเบลเสริมได้)', difficulty='beginner',
  instructions='ยืนปลายเท้าบนขอบขั้นบันได ส้นเท้าลอย\nเขย่งขึ้นสุดแล้วค้าง 1 วินาที\nลดส้นเท้าลงต่ำกว่าขั้นบันไดจนรู้สึกยืดน่อง',
  tips='ทำช้าทั้งขึ้นและลง · ทำครั้งละมากๆ (15–25) เพราะน่องทนทาน · เข่าเหยียดตรงแต่ไม่ล็อก' WHERE id='ex005';
UPDATE exercises SET muscle_group='อก', equipment='ดัมเบล + ม้านั่ง', difficulty='beginner',
  instructions='นอนหงายบนม้านั่ง ถือดัมเบลเหนืออก ฝ่ามือหันเข้าหากัน\nกางแขนออกเป็นวงโค้ง ข้อศอกงอเล็กน้อยคงที่ จนรู้สึกยืดอก\nหุบแขนกลับมาเหมือนกอดต้นไม้',
  tips='ห้ามลดแขนต่ำกว่าระดับม้านั่ง · ใช้น้ำหนักเบากว่า bench press มาก · มุมข้อศอกคงที่ตลอด' WHERE id='ex006';
UPDATE exercises SET muscle_group='หลัง, ต้นแขนด้านหน้า', equipment='บาร์โหน', difficulty='intermediate',
  instructions='โหนบาร์หงายมือ กว้างเท่าไหล่ แขนเหยียดสุด\nดึงตัวขึ้นจนคางพ้นบาร์ ข้อศอกชี้ลงพื้น\nลดตัวลงช้าๆ จนแขนเหยียดสุด',
  tips='ถ้ายังทำไม่ได้ ใช้ยางยืดช่วยหรือทำเฉพาะช่วงลง (negative) · ไม่แกว่งตัว · หายใจออกตอนดึงขึ้น' WHERE id='ex007';
UPDATE exercises SET muscle_group='หลังล่าง, สะโพก, ต้นขาหลัง', equipment='บาร์เบล', difficulty='advanced',
  instructions='ยืนเท้ากว้างเท่าสะโพก บาร์อยู่เหนือกลางเท้า\nย่อจับบาร์นอกเข่า หลังตรง อกเปิด\nดันพื้นด้วยเท้า ยกบาร์ชิดขาขึ้นจนยืนตรง แล้วลดลงตามทางเดิม',
  tips='ท่าที่บาดเจ็บง่ายที่สุดถ้าหลังงอ — เรียนฟอร์มกับผู้ฝึกสอนก่อน · บาร์ต้องชิดขาตลอด · เริ่มจากบาร์เปล่า' WHERE id='ex008';
UPDATE exercises SET muscle_group='หลังแขน, อกด้านใน', equipment='ไม่ต้องใช้', difficulty='intermediate',
  instructions='ท่าวิดพื้น วางมือชิดกันให้นิ้วโป้งและนิ้วชี้ประกบเป็นรูปเพชร\nลดอกลงแตะหลังมือ ข้อศอกแนบลำตัว\nดันขึ้นจนแขนเหยียด',
  tips='ถ้าข้อมือเจ็บให้ทำบนเข่าก่อน · ลำตัวตรงเป็นไม้กระดาน · ทำได้น้อยครั้งกว่า push-up ปกติเป็นเรื่องปกติ' WHERE id='ex009';
UPDATE exercises SET muscle_group='อกล่าง, หลังแขน', equipment='บาร์คู่ (dip bar)', difficulty='intermediate',
  instructions='ยกตัวบนบาร์คู่ แขนเหยียด เอนตัวหน้าเล็กน้อย\nงอข้อศอกลดตัวลงจนต้นแขนขนานพื้น\nดันตัวขึ้นจนแขนเหยียด',
  tips='ห้ามลงลึกเกินจนไหล่ตึง · เอนหน้ามากขึ้น = เน้นอก, ตัวตรง = เน้นหลังแขน · ใช้เครื่องช่วย (assisted) ถ้ายังไม่ไหว' WHERE id='ex010';
UPDATE exercises SET muscle_group='กล้ามท้องทั้งชุด', equipment='ม้านั่ง', difficulty='advanced',
  instructions='นอนหงายบนม้านั่ง จับขอบม้านั่งเหนือศีรษะ\nยกทั้งลำตัวและขาขึ้นตรงเป็นเส้นเดียว น้ำหนักอยู่ที่ไหล่บน\nลดลงช้าๆ โดยรักษาลำตัวให้ตรงตลอด ห้ามงอสะโพก',
  tips='ท่าขั้นสูงมาก — ควรทำ leg raise และ plank ได้ดีก่อน · ช่วงลดลงคือหัวใจของท่า ทำให้ช้าที่สุด' WHERE id='ex011';
UPDATE exercises SET muscle_group='หลัง, ต้นแขนด้านหน้า', equipment='ดัมเบล + ม้านั่ง', difficulty='beginner',
  instructions='วางเข่าและมือข้างเดียวกันบนม้านั่ง หลังขนานพื้น\nอีกมือถือดัมเบล ดึงขึ้นชิดสะโพก ข้อศอกชี้ขึ้นข้างหลัง\nลดลงช้าๆ จนแขนเหยียด ทำครบแล้วสลับข้าง',
  tips='ดึงด้วยหลัง ไม่ใช่แขน — คิดว่าดึงข้อศอกไปข้างหลัง · ไม่บิดลำตัว · หลังตรงเสมอ' WHERE id='ex012';
UPDATE exercises SET muscle_group='ต้นแขนด้านหน้า, ปลายแขน', equipment='ดัมเบล', difficulty='beginner',
  instructions='ยืนถือดัมเบลข้างลำตัว ฝ่ามือหันเข้าหาลำตัว (จับแบบค้อน)\nงอข้อศอกยกดัมเบลขึ้นถึงไหล่โดยไม่หมุนข้อมือ\nลดลงช้าๆ',
  tips='ข้อศอกอยู่ที่เดิม · ทำสลับข้างหรือพร้อมกันก็ได้ · ดีสำหรับคนที่ barbell curl แล้วข้อมือเจ็บ' WHERE id='ex013';
UPDATE exercises SET muscle_group='อกบน, ไหล่หน้า', equipment='ดัมเบล + ม้านั่งปรับเอียง', difficulty='intermediate',
  instructions='ปรับม้านั่งเอียง 30–45° นอนหงาย ถือดัมเบลระดับอก\nดันดัมเบลขึ้นเหนืออกจนแขนเหยียด\nลดลงช้าๆ จนดัมเบลอยู่ระดับอก',
  tips='เอียงเกิน 45° จะกลายเป็นท่าไหล่ · ดัมเบลไม่ต้องแตะกันตอนสุดแขน · เท้าวางราบพื้น' WHERE id='ex014';
UPDATE exercises SET muscle_group='หลังกว้าง (lats)', equipment='เครื่อง lat pulldown', difficulty='beginner',
  instructions='นั่งล็อกเข่าใต้แผ่นรอง จับบาร์กว้างกว่าไหล่\nดึงบาร์ลงมาถึงระดับอกบน ข้อศอกชี้ลง\nปล่อยกลับขึ้นช้าๆ จนแขนเหยียด',
  tips='ห้ามดึงลงหลังคอ · เอนตัวหลังได้เล็กน้อย (~15°) · คิดว่าดึงข้อศอกลงกระเป๋ากางเกง' WHERE id='ex015';
UPDATE exercises SET muscle_group='ไหล่ด้านข้าง', equipment='ดัมเบล', difficulty='beginner',
  instructions='ยืนถือดัมเบลข้างลำตัว ข้อศอกงอเล็กน้อย\nกางแขนออกด้านข้างจนขนานพื้น\nลดลงช้าๆ',
  tips='ใช้น้ำหนักเบา — ท่านี้เหวี่ยงง่ายมาก · ยกไม่เกินระดับไหล่ · นิ้วก้อยสูงกว่านิ้วโป้งเล็กน้อยตอนสุดท่า' WHERE id='ex016';
UPDATE exercises SET muscle_group='ต้นขาหลัง', equipment='เครื่อง leg curl', difficulty='beginner',
  instructions='นอนคว่ำบนเครื่อง แผ่นรองอยู่เหนือข้อเท้า\nงอเข่าดึงส้นเท้าเข้าหาสะโพก\nปล่อยกลับช้าๆ จนขาเหยียดเกือบสุด',
  tips='สะโพกแนบเบาะตลอด ห้ามยกก้น · ช่วงปล่อยกลับช้ากว่าช่วงดึง' WHERE id='ex017';
UPDATE exercises SET muscle_group='ท้องล่าง, สะโพกหน้า', equipment='ไม่ต้องใช้', difficulty='beginner',
  instructions='นอนหงาย มือวางใต้ก้นหรือข้างลำตัว ขาเหยียด\nยกขาขึ้นจนตั้งฉากกับพื้น หลังล่างแนบพื้น\nลดขาลงช้าๆ โดยไม่ให้ส้นเท้าแตะพื้น',
  tips='ถ้าหลังล่างแอ่นให้งอเข่าเล็กน้อย · ยิ่งลดขาลงช้ายิ่งได้ผล · หายใจออกตอนยกขึ้น' WHERE id='ex018';
UPDATE exercises SET muscle_group='ต้นขาหน้า, สะโพก', equipment='ไม่ต้องใช้ (ดัมเบลเสริมได้)', difficulty='beginner',
  instructions='ยืนตรง ก้าวเท้าหนึ่งไปข้างหน้ายาวประมาณ 1 ช่วงขา\nย่อลงจนเข่าหลังเกือบแตะพื้น เข่าหน้าอยู่เหนือข้อเท้า\nดันเท้าหน้ากลับมายืนตรง สลับข้าง',
  tips='ลำตัวตั้งตรง ไม่ก้ม · เข่าหน้าไม่บิดเข้าด้านใน · ก้าวยาวขึ้น = เน้นสะโพก, สั้นลง = เน้นต้นขาหน้า' WHERE id='ex019';
UPDATE exercises SET muscle_group='หลัง, อก, หลังแขน (ทั้งตัวบน)', equipment='บาร์โหน', difficulty='advanced',
  instructions='โหนบาร์คว่ำมือ เหวี่ยงตัวเล็กน้อยเพื่อสร้างโมเมนตัม\nดึงตัวขึ้นแรงและเร็วจนอกพ้นบาร์ พลิกข้อมือขึ้นเหนือบาร์\nดันแขนเหยียดเหมือน dip แล้วลดลงตามลำดับย้อนกลับ',
  tips='ต้องทำ pull-up ได้ 10+ ครั้งและ dip 15+ ครั้งก่อน · ฝึกช่วง transition แยกด้วยยางยืด · ระวังข้อมือและไหล่' WHERE id='ex020';
UPDATE exercises SET muscle_group='ต้นขาหลัง', equipment='ที่ยึดข้อเท้า / คู่ฝึก', difficulty='advanced',
  instructions='คุกเข่า ให้คู่ฝึกจับข้อเท้าหรือยึดไว้กับที่\nลำตัวตรงจากเข่าถึงศีรษะ ค่อยๆ เอนตัวลงข้างหน้าช้าที่สุด\nใช้มือรับพื้นเมื่อไม่ไหว แล้วดันตัวกลับขึ้น',
  tips='ท่านี้เน้นช่วงลดลง (eccentric) เท่านั้น · เริ่ม 3–5 ครั้งพอ ปวดกล้ามวันถัดไปแรงมาก · สะโพกเหยียดตรงตลอด' WHERE id='ex021';
UPDATE exercises SET muscle_group='หลัง, ต้นแขนด้านหน้า, กล้ามท้อง', equipment='บาร์โหน', difficulty='advanced',
  instructions='โหนบาร์ด้วยมือเดียว อีกมือแตะข้อมือหรือลำตัว\nดึงตัวขึ้นจนคางพ้นบาร์โดยไม่บิดตัว\nลดลงช้าๆ อย่างควบคุม',
  tips='ต้องทำ pull-up ธรรมดาได้ 15–20 ครั้งก่อน · ฝึกด้วย archer pull-up ก่อน · ระวังข้อศอกอักเสบ เพิ่มปริมาณช้าๆ' WHERE id='ex022';
UPDATE exercises SET muscle_group='กล้ามท้องทั้งชุด, ไหล่', equipment='ไม่ต้องใช้', difficulty='beginner',
  instructions='นอนคว่ำ ยกตัวขึ้นด้วยปลายแขนและปลายเท้า ข้อศอกใต้ไหล่\nลำตัวตรงเป็นเส้นเดียวจากศีรษะถึงส้นเท้า\nค้างไว้ตามเวลา หายใจปกติ',
  tips='เกร็งก้นและท้องเพื่อไม่ให้สะโพกตกหรือยกสูง · เริ่ม 20–30 วินาที · คุณภาพสำคัญกว่าเวลา' WHERE id='ex023';
UPDATE exercises SET muscle_group='หลังกว้าง, ต้นแขนด้านหน้า', equipment='บาร์โหน', difficulty='intermediate',
  instructions='โหนบาร์คว่ำมือ กว้างกว่าไหล่เล็กน้อย แขนเหยียดสุด\nดึงตัวขึ้นจนคางพ้นบาร์ อกเปิด\nลดลงช้าๆ จนแขนเหยียดสุด',
  tips='เริ่มด้วย negative pull-up หรือยางยืดถ้ายังทำไม่ได้ · ห้ามแกว่ง · สะบักกดลงก่อนดึง' WHERE id='ex024';
UPDATE exercises SET muscle_group='อก, ไหล่หน้า, หลังแขน', equipment='ไม่ต้องใช้', difficulty='beginner',
  instructions='วางมือกว้างกว่าไหล่เล็กน้อย ลำตัวตรงจากหัวถึงส้นเท้า\nลดอกลงจนเกือบแตะพื้น ข้อศอกทำมุม ~45° กับลำตัว\nดันขึ้นจนแขนเหยียด',
  tips='ถ้ายังไม่ไหวให้วางเข่าหรือวางมือบนที่สูง · เกร็งท้องกันสะโพกตก · มองพื้นข้างหน้าเล็กน้อย ไม่ก้มคอ' WHERE id='ex025';
UPDATE exercises SET muscle_group='ไหล่หลัง, หลังบน', equipment='เครื่อง rear delt / pec deck (กลับด้าน)', difficulty='beginner',
  instructions='นั่งหันหน้าเข้าเครื่อง อกแนบเบาะ จับมือจับด้านหน้า\nกางแขนออกไปข้างหลังจนอยู่แนวเดียวกับไหล่\nปล่อยกลับช้าๆ',
  tips='ใช้น้ำหนักเบา ท่านี้กล้ามเนื้อเล็ก · ข้อศอกงอเล็กน้อยคงที่ · ไม่ยกไหล่ขึ้นหาหู' WHERE id='ex026';
UPDATE exercises SET muscle_group='ปลายแขน, ต้นแขนด้านหน้า', equipment='บาร์เบล / EZ bar', difficulty='beginner',
  instructions='ยืนจับบาร์คว่ำมือ กว้างเท่าไหล่\nงอข้อศอกยกบาร์ขึ้นถึงระดับอก ข้อศอกแนบตัว\nลดลงช้าๆ',
  tips='น้ำหนักจะเบากว่า curl ปกติมาก · ข้อมือตรง ไม่งอลง · ดีสำหรับป้องกันข้อศอกเทนนิส' WHERE id='ex027';
UPDATE exercises SET muscle_group='ท้องด้านข้าง (obliques)', equipment='ไม่ต้องใช้ (แผ่นน้ำหนักเสริมได้)', difficulty='beginner',
  instructions='นั่งเข่างอ เท้ายกลอยพื้นเล็กน้อย เอนตัวหลัง 45°\nประสานมือ บิดลำตัวแตะพื้นข้างสะโพกซ้าย แล้วขวา\nนับซ้าย+ขวา = 1 ครั้ง',
  tips='บิดจากลำตัว ไม่ใช่แค่แกว่งแขน · หลังตรง ไม่งอ · ถ้าหลังล่างเจ็บให้วางเท้าบนพื้น' WHERE id='ex028';
UPDATE exercises SET muscle_group='หลังกลาง, หลังกว้าง', equipment='เครื่อง cable row', difficulty='beginner',
  instructions='นั่งเท้ายันแผ่นรอง เข่างอเล็กน้อย จับมือจับ\nดึงมือจับเข้าหาท้อง สะบักบีบเข้าหากัน อกเปิด\nปล่อยกลับช้าๆ ให้สะบักยืดออก',
  tips='ลำตัวตั้งตรงคงที่ ไม่โยกหน้า-หลัง · ข้อศอกชิดลำตัว · หยุดค้าง 1 วินาทีตอนดึงสุด' WHERE id='ex029';
UPDATE exercises SET muscle_group='ไหล่, หลังแขน', equipment='ดัมเบล / บาร์เบล', difficulty='intermediate',
  instructions='นั่งหรือยืน ถือน้ำหนักระดับไหล่ ฝ่ามือหันหน้า\nดันขึ้นเหนือศีรษะจนแขนเหยียด\nลดลงช้าๆ จนถึงระดับหู',
  tips='เกร็งท้องและก้นถ้ายืน กันหลังแอ่น · ไม่ล็อกข้อศอกสุด · ดัมเบลอยู่แนวเดียวกับหู ไม่ไปข้างหน้า' WHERE id='ex030';
UPDATE exercises SET muscle_group='ต้นขาหน้า, สะโพก, การทรงตัว', equipment='ไม่ต้องใช้', difficulty='advanced',
  instructions='ยืนขาเดียว มือข้างหนึ่งจับข้อเท้าอีกข้างไว้ข้างหลัง\nย่อลงช้าๆ จนเข่าหลังแตะพื้น ลำตัวเอนหน้า\nดันขึ้นด้วยขาเดียว',
  tips='ฝึก Bulgarian split squat ให้แข็งแรงก่อน · เริ่มด้วยการจับสิ่งของช่วยทรงตัว · ทำบนเบาะรองเข่า' WHERE id='ex031';
UPDATE exercises SET muscle_group='หลังแขน', equipment='EZ bar / ดัมเบล + ม้านั่ง', difficulty='intermediate',
  instructions='นอนหงาย ถือบาร์เหนืออก แขนเหยียด\nงอเฉพาะข้อศอก ลดบาร์ลงมาที่หน้าผาก ต้นแขนอยู่กับที่\nเหยียดแขนกลับขึ้น',
  tips='ข้อศอกชี้เพดานตลอด ไม่กางออก · ถ้าข้อศอกเจ็บให้ลดบาร์ไปหลังศีรษะแทน · ใช้น้ำหนักที่ควบคุมได้แน่นอน' WHERE id='ex032';
UPDATE exercises SET muscle_group='ต้นขาหน้า, สะโพก, ต้นขาหลัง', equipment='ไม่ต้องใช้ (บาร์เบลเสริมได้)', difficulty='beginner',
  instructions='ยืนเท้ากว้างเท่าไหล่ ปลายเท้าเปิดออกเล็กน้อย\nดันสะโพกไปข้างหลังพร้อมย่อเข่า จนต้นขาขนานพื้นหรือต่ำกว่า\nดันส้นเท้ากลับขึ้นยืนตรง',
  tips='เข่าไปทางเดียวกับปลายเท้า · หลังตรง อกเปิด มองตรง · น้ำหนักลงส้นเท้าและกลางเท้า ไม่ใช่ปลายเท้า' WHERE id='ex033';
UPDATE exercises SET muscle_group='สะโพก, ต้นขาด้านใน, หลังล่าง', equipment='บาร์เบล', difficulty='intermediate',
  instructions='ยืนเท้ากว้างกว่าไหล่มาก ปลายเท้าเปิด 45°\nย่อจับบาร์ด้านในเข่า หลังตรง อกเปิด\nดันพื้นด้วยเท้า ยืนขึ้นจนตรง แล้วลดลงตามทางเดิม',
  tips='ลำตัวตั้งตรงกว่า deadlift ปกติ · เข่าดันออกไปทางปลายเท้า · เหมาะกับคนขายาวหรือหลังล่างไม่แข็งแรง' WHERE id='ex034';
UPDATE exercises SET muscle_group='กล้ามท้อง, สะโพกหน้า, มือ', equipment='บาร์โหน', difficulty='advanced',
  instructions='โหนบาร์ แขนเหยียด ลำตัวนิ่ง\nยกขาตรงขึ้นจนปลายเท้าแตะบาร์\nลดลงช้าๆ อย่างควบคุม ไม่แกว่ง',
  tips='เริ่มจาก hanging knee raise → hanging leg raise → toes to bar · กดสะบักลงก่อนยกขา · ใช้สายรัดข้อมือถ้ามือหมดแรงก่อนท้อง' WHERE id='ex035';
UPDATE exercises SET muscle_group='หลังแขน', equipment='ม้านั่ง / เก้าอี้', difficulty='beginner',
  instructions='นั่งขอบม้านั่ง มือจับขอบข้างสะโพก เลื่อนสะโพกออกมาหน้าม้านั่ง\nงอข้อศอกลดตัวลงจนต้นแขนขนานพื้น\nดันขึ้นจนแขนเหยียด',
  tips='ข้อศอกชี้ไปข้างหลังตรงๆ ไม่กางออก · หลังชิดม้านั่ง · เหยียดขาตรง = ยากขึ้น, งอเข่า = ง่ายขึ้น' WHERE id='ex036';
UPDATE exercises SET muscle_group='หลังแขน', equipment='เครื่อง cable + บาร์/เชือก', difficulty='beginner',
  instructions='ยืนหน้าเครื่อง cable จับบาร์ ข้อศอกแนบลำตัว ต้นแขนตั้งฉากพื้น\nดันบาร์ลงจนแขนเหยียดสุด\nปล่อยกลับช้าๆ จนปลายแขนขนานพื้น',
  tips='ข้อศอกอยู่กับที่ ห้ามขยับไปข้างหน้า · เอนตัวหน้าเล็กน้อย · ใช้เชือกแล้วแยกมือตอนสุดท่าจะได้ triceps ด้านนอกมากขึ้น' WHERE id='ex037';
UPDATE exercises SET muscle_group='ปลายแขน (ด้านใน)', equipment='ดัมเบล / บาร์เบล + ม้านั่ง', difficulty='beginner',
  instructions='นั่ง วางปลายแขนบนต้นขาหรือม้านั่ง หงายมือ ข้อมือพ้นขอบ\nงอข้อมือยกน้ำหนักขึ้น\nลดลงช้าๆ ให้ข้อมือแอ่นลง',
  tips='ปลายแขนแนบที่รองตลอด ขยับเฉพาะข้อมือ · ทำครั้งละมากๆ (15–20) · ทำ reverse wrist curl คู่กันเพื่อสมดุล' WHERE id='ex038';
UPDATE exercises SET muscle_group='ทั้งตัว (คาร์ดิโอ)', equipment='ไม่ต้องใช้', difficulty='beginner',
  instructions='ยืนตรง เท้าชิด แขนแนบลำตัว\nกระโดดแยกเท้ากว้างกว่าไหล่พร้อมยกแขนขึ้นตบเหนือศีรษะ\nกระโดดกลับท่าเริ่มต้น ทำต่อเนื่องเป็นจังหวะ',
  tips='ลงพื้นด้วยปลายเท้าเบาๆ เข่างอเล็กน้อย · ใช้เป็นท่าวอร์มอัพ 1–2 นาที · ถ้าเข่าไม่ดีให้ก้าวแยกทีละข้างแทนกระโดด' WHERE id='ex039';
