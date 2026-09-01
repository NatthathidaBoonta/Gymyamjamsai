const fs = require('fs');

const seedPath = 'D:\\Gymyamjamsai\\mysql\\init\\02-seed.sql';
let seedContent = fs.readFileSync(seedPath, 'utf8');

// The SQL block from our previous script execution
const newSqlBlock = `INSERT INTO exercises (id, name, category, media_url, instructions) VALUES
  ('e0000000-0000-0000-0000-000000000003', 'Arnold-Press', 'weight', '/exercises/arnold-press.gif', '[Push (Shoulders, Triceps)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Arnold-Press)'),
  ('e0000000-0000-0000-0000-000000000004', 'Barbell Curl', 'weight', '/exercises/barbell-curl.gif', '[Pull (Biceps)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Barbell Curl)'),
  ('e0000000-0000-0000-0000-000000000005', 'Bench Press', 'weight', '/exercises/bench-press.gif', '[Push (Chest, Shoulders, Triceps)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Bench Press)'),
  ('e0000000-0000-0000-0000-000000000006', 'Bulgarian Split Squat', 'calisthenics', '/exercises/bulgarian-split-squat.gif', '[Legs (Quads, Glutes)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Bulgarian Split Squat)'),
  ('e0000000-0000-0000-0000-000000000007', 'Calf Raise', 'weight', '/exercises/calf-raise.gif', '[Legs (Calves)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Calf Raise)'),
  ('e0000000-0000-0000-0000-000000000008', 'Chest Fly', 'weight', '/exercises/chest-fly.gif', '[Push (Chest)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Chest Fly)'),
  ('e0000000-0000-0000-0000-000000000009', 'Chin-Up', 'calisthenics', '/exercises/chin-up.gif', '[Pull (Biceps, Back)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Chin-Up)'),
  ('e0000000-0000-0000-0000-000000000010', 'Deadlift', 'weight', '/exercises/deadlift.gif', '[Legs (Hamstrings, Glutes, Back)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Deadlift)'),
  ('e0000000-0000-0000-0000-000000000011', 'Diamond Push-Up', 'calisthenics', '/exercises/diamond-push-up.gif', '[Push (Triceps, Chest)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Diamond Push-Up)'),
  ('e0000000-0000-0000-0000-000000000012', 'Dips', 'calisthenics', '/exercises/dips.gif', '[Push (Chest, Triceps)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Dips)'),
  ('e0000000-0000-0000-0000-000000000013', 'Dragon Flag', 'calisthenics', '/exercises/dragon-flag.gif', '[Legs (Core)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Dragon Flag)'),
  ('e0000000-0000-0000-0000-000000000014', 'Dumbbell Row', 'weight', '/exercises/dumbbell-row.gif', '[Pull (Back, Biceps)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Dumbbell Row)'),
  ('e0000000-0000-0000-0000-000000000015', 'Hammer Curl', 'weight', '/exercises/hammer-curl.gif', '[Pull (Biceps)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Hammer Curl)'),
  ('e0000000-0000-0000-0000-000000000016', 'Incline Dumbbell Bench Press', 'weight', '/exercises/incline-dumbbell-bench-press.gif', '[Push (Chest, Shoulders, Triceps)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Incline Dumbbell Bench Press)'),
  ('e0000000-0000-0000-0000-000000000017', 'Lat Pulldown', 'weight', '/exercises/lat-pulldown.gif', '[Pull (Back, Biceps)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Lat Pulldown)'),
  ('e0000000-0000-0000-0000-000000000018', 'Lateral Raise', 'weight', '/exercises/lateral-raise.gif', '[Push (Shoulders)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Lateral Raise)'),
  ('e0000000-0000-0000-0000-000000000019', 'Leg Curl', 'weight', '/exercises/leg-curl.gif', '[Legs (Hamstrings)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Leg Curl)'),
  ('e0000000-0000-0000-0000-000000000020', 'Leg Raise', 'calisthenics', '/exercises/leg-raise.gif', '[Legs (Core)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Leg Raise)'),
  ('e0000000-0000-0000-0000-000000000021', 'Lunges', 'weight', '/exercises/lunges.gif', '[Legs (Quads, Glutes)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Lunges)'),
  ('e0000000-0000-0000-0000-000000000022', 'Muscle Up', 'calisthenics', '/exercises/muscle-up.gif', '[Pull/Push (Back, Triceps, Chest)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Muscle Up)'),
  ('e0000000-0000-0000-0000-000000000023', 'Nordic Hamstring Curl', 'calisthenics', '/exercises/nordic-hamstring-curl.gif', '[Legs (Hamstrings)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Nordic Hamstring Curl)'),
  ('e0000000-0000-0000-0000-000000000024', 'One Arm Pull-Up', 'calisthenics', '/exercises/one-arm-pull-up.gif', '[Pull (Back, Biceps)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า One Arm Pull-Up)'),
  ('e0000000-0000-0000-0000-000000000025', 'Plank', 'calisthenics', '/exercises/plank.gif', '[Legs (Core)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Plank)'),
  ('e0000000-0000-0000-0000-000000000026', 'Pull-ups', 'calisthenics', '/exercises/pull-ups.gif', '[Pull (Back, Biceps)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Pull-ups)'),
  ('e0000001-0000-0000-0000-000000000001', 'Push-ups', 'calisthenics', '/exercises/push-ups.gif', '[Push (Chest, Shoulders, Triceps)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Push-ups)'),
  ('e0000000-0000-0000-0000-000000000027', 'Rear Delt Machine Fly', 'weight', '/exercises/rear-delt-machine-fly.gif', '[Pull (Rear Delts)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Rear Delt Machine Fly)'),
  ('e0000000-0000-0000-0000-000000000028', 'Reverse Barbell Curl', 'weight', '/exercises/reverse-barbell-curl.gif', '[Pull (Forearms, Biceps)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Reverse Barbell Curl)'),
  ('e0000000-0000-0000-0000-000000000029', 'Russian Twist', 'weight', '/exercises/russian-twist.gif', '[Legs (Core, Obliques)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Russian Twist)'),
  ('e0000000-0000-0000-0000-000000000030', 'Seated Cable Row', 'weight', '/exercises/seated-cable-row.gif', '[Pull (Back)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Seated Cable Row)'),
  ('e0000000-0000-0000-0000-000000000031', 'Shoulder Press', 'weight', '/exercises/shoulder-press.gif', '[Push (Shoulders)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Shoulder Press)'),
  ('e0000000-0000-0000-0000-000000000032', 'Shrimp Squat', 'calisthenics', '/exercises/shrimp-squat.gif', '[Legs (Quads)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Shrimp Squat)'),
  ('e0000000-0000-0000-0000-000000000033', 'Skullcrusher', 'weight', '/exercises/skullcrusher.gif', '[Push (Triceps)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Skullcrusher)'),
  ('e0000002-0000-0000-0000-000000000002', 'Squats', 'weight', '/exercises/squats.gif', '[Legs (Quads, Glutes)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Squats)'),
  ('e0000000-0000-0000-0000-000000000034', 'Sumo Deadlift', 'weight', '/exercises/sumo-deadlift.gif', '[Legs (Hamstrings, Glutes)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Sumo Deadlift)'),
  ('e0000000-0000-0000-0000-000000000035', 'Toes to Bar', 'calisthenics', '/exercises/toes-to-bar.gif', '[Legs (Core)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Toes to Bar)'),
  ('e0000000-0000-0000-0000-000000000036', 'Triceps Dips', 'weight', '/exercises/triceps-dips.gif', '[Push (Triceps, Chest)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Triceps Dips)'),
  ('e0000000-0000-0000-0000-000000000037', 'Triceps Pushdown', 'weight', '/exercises/triceps-pushdown.gif', '[Push (Triceps)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Triceps Pushdown)'),
  ('e0000000-0000-0000-0000-000000000038', 'Wrist Curl', 'weight', '/exercises/wrist-curl.gif', '[Pull (Forearms)] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า Wrist Curl)');`;

// Find the regex to replace
const regex = /INSERT INTO exercises \(id, name, category, media_url, instructions\) VALUES[\s\S]*?;/;

seedContent = seedContent.replace(regex, newSqlBlock);

fs.writeFileSync(seedPath, seedContent, 'utf8');
console.log("SQL seed replaced successfully.");
