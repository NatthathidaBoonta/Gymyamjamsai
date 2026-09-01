const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const oldAssetsPath = 'D:\\FinalProject_GYMKaK-main\\Gymkak\\assets';
const newAssetsPath = 'D:\\Gymyamjamsai\\frontend\\public\\exercises';

// Ensure dir exists
if (!fs.existsSync(newAssetsPath)) {
  fs.mkdirSync(newAssetsPath, { recursive: true });
}

// Categorization based on old project
const categories = {
  // Weight - Push
  'Bench Press': { category: 'weight', tags: 'Push (Chest, Shoulders, Triceps)' },
  'Incline Dumbbell Bench Press': { category: 'weight', tags: 'Push (Chest, Shoulders, Triceps)' },
  'Chest Fly': { category: 'weight', tags: 'Push (Chest)' },
  'Shoulder Press': { category: 'weight', tags: 'Push (Shoulders)' },
  'Lateral Raise': { category: 'weight', tags: 'Push (Shoulders)' },
  'Arnold-Press': { category: 'weight', tags: 'Push (Shoulders, Triceps)' },
  'Skullcrusher': { category: 'weight', tags: 'Push (Triceps)' },
  'Triceps Pushdown': { category: 'weight', tags: 'Push (Triceps)' },
  'Triceps Dips': { category: 'weight', tags: 'Push (Triceps, Chest)' },

  // Weight - Pull
  'Pull-ups': { category: 'calisthenics', tags: 'Pull (Back, Biceps)' },
  'Lat Pulldown': { category: 'weight', tags: 'Pull (Back, Biceps)' },
  'Dumbbell Row': { category: 'weight', tags: 'Pull (Back, Biceps)' },
  'Seated Cable Row': { category: 'weight', tags: 'Pull (Back)' },
  'Barbell Curl': { category: 'weight', tags: 'Pull (Biceps)' },
  'Hammer Curl': { category: 'weight', tags: 'Pull (Biceps)' },
  'Wrist Curl': { category: 'weight', tags: 'Pull (Forearms)' },
  'Reverse Barbell Curl': { category: 'weight', tags: 'Pull (Forearms, Biceps)' },
  'Rear Delt Machine Fly': { category: 'weight', tags: 'Pull (Rear Delts)' },

  // Weight - Legs & Core
  'Squats': { category: 'weight', tags: 'Legs (Quads, Glutes)' },
  'Leg Curl': { category: 'weight', tags: 'Legs (Hamstrings)' },
  'Calf Raise': { category: 'weight', tags: 'Legs (Calves)' },
  'Deadlift': { category: 'weight', tags: 'Legs (Hamstrings, Glutes, Back)' },
  'Plank': { category: 'calisthenics', tags: 'Legs (Core)' },
  'Leg Raise': { category: 'calisthenics', tags: 'Legs (Core)' },
  'Russian Twist': { category: 'weight', tags: 'Legs (Core, Obliques)' },
  'Sumo Deadlift': { category: 'weight', tags: 'Legs (Hamstrings, Glutes)' },
  'Lunges': { category: 'weight', tags: 'Legs (Quads, Glutes)' },

  // Calisthenics
  'Dips': { category: 'calisthenics', tags: 'Push (Chest, Triceps)' },
  'Push-ups': { category: 'calisthenics', tags: 'Push (Chest, Shoulders, Triceps)' },
  'Diamond Push-Up': { category: 'calisthenics', tags: 'Push (Triceps, Chest)' },
  'Chin-Up': { category: 'calisthenics', tags: 'Pull (Biceps, Back)' },
  'One Arm Pull-Up': { category: 'calisthenics', tags: 'Pull (Back, Biceps)' },
  'Muscle Up': { category: 'calisthenics', tags: 'Pull/Push (Back, Triceps, Chest)' },
  'Bulgarian Split Squat': { category: 'calisthenics', tags: 'Legs (Quads, Glutes)' },
  'Shrimp Squat': { category: 'calisthenics', tags: 'Legs (Quads)' },
  'Nordic Hamstring Curl': { category: 'calisthenics', tags: 'Legs (Hamstrings)' },
  'Dragon Flag': { category: 'calisthenics', tags: 'Legs (Core)' },
  'Toes to Bar': { category: 'calisthenics', tags: 'Legs (Core)' },
};

// Fixed UUIDs to keep seed working
const fixedUUIDs = {
  'Push-ups': 'e0000001-0000-0000-0000-000000000001',
  'Squats': 'e0000002-0000-0000-0000-000000000002'
};

const gifs = fs.readdirSync(oldAssetsPath).filter(f => f.endsWith('.gif'));

let sqlInserts = "INSERT INTO exercises (id, name, category, media_url, instructions) VALUES\n";
let values = [];

let counter = 3;

gifs.forEach(gif => {
  const baseName = path.basename(gif, '.gif');
  
  // copy file
  const srcFile = path.join(oldAssetsPath, gif);
  // safe filename (replace spaces with dashes)
  const safeName = baseName.replace(/\s+/g, '-').toLowerCase() + '.gif';
  const destFile = path.join(newAssetsPath, safeName);
  
  fs.copyFileSync(srcFile, destFile);
  
  let catData = categories[baseName] || { category: 'weight', tags: 'General' };
  
  let uuid = fixedUUIDs[baseName];
  if (!uuid) {
    uuid = `e0000000-0000-0000-0000-${String(counter).padStart(12, '0')}`;
    counter++;
  }
  
  const instruction = `[${catData.tags}] จัดท่าทางให้ถูกต้อง และควบคุมการเคลื่อนไหว (อ้างอิงท่า ${baseName})`;
  
  const nameSql = baseName.replace(/'/g, "''");
  
  values.push(`  ('${uuid}', '${nameSql}', '${catData.category}', '/exercises/${safeName}', '${instruction}')`);
});

sqlInserts += values.join(",\n") + ";\n";

console.log(sqlInserts);
