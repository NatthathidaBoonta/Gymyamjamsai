<#
.SYNOPSIS
  Import สคีมา + ข้อมูลตัวอย่างขึ้น TiDB Cloud (หรือ MySQL ระยะไกลอื่น) โดยคงอักษรไทยไว้ถูกต้อง

.DESCRIPTION
  ห้ามใช้ `Get-Content file | docker run -i mysql` — PowerShell 5.1 จะแปลง stdin เป็น code page ของ console
  ทำให้อักษรไทยกลายเป็น "?" ก่อนถึง MySQL
  สคริปต์นี้ mount โฟลเดอร์ mysql/init เข้า container แล้วให้ mysql client อ่านไฟล์ตรงๆ ด้วย `source`
  พร้อม --default-character-set=utf8mb4 จึงไม่ผ่านการแปลงใดๆ

.EXAMPLE
  $env:MYSQL_PWD = '<รหัสผ่าน TiDB>'
  .\deploy\tidb-import.ps1 -DbHost gateway01.ap-southeast-1.prod.aws.tidbcloud.com -User '2AbCdEf.root' -Reset

.PARAMETER Reset
  ล้างทุกตารางก่อน (deploy/tidb-reset.sql) — ข้อมูลเดิมหายทั้งหมด
#>
param(
  [Parameter(Mandatory = $true)] [string] $DbHost,
  [Parameter(Mandatory = $true)] [string] $User,
  [int]    $Port     = 4000,
  [string] $Database = 'gymyamjamsai',
  [switch] $Reset
)

$ErrorActionPreference = 'Stop'
# ให้ผลลัพธ์ภาษาไทยจาก docker แสดงบน console ได้ถูกต้อง
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

if (-not $env:MYSQL_PWD) {
  Write-Host 'ตั้งรหัสผ่านก่อน:  $env:MYSQL_PWD = ''<รหัสผ่าน>''' -ForegroundColor Yellow
  exit 1
}

$root    = Split-Path -Parent $PSScriptRoot
$initDir = Join-Path $root 'mysql\init'
$deploy  = $PSScriptRoot

# ลำดับต้องตรงนี้ (03-course-chat ต้องมาก่อน 04 เพราะ 04 ใช้สถานะ approved)
$files = @(
  '01-schema.sql',
  '02-seed.sql',
  '03-clean-exercises.sql',
  '03-course-chat.sql',
  '04-sample-accounts.sql',
  '05-exercise-details.sql'
)

function Invoke-SqlFile([string] $mountDir, [string] $fileName) {
  # ไฟล์ถูกอ่านภายใน container เป็น bytes UTF-8 ดิบ → ไม่ถูก PowerShell แปลง
  docker run --rm `
    -e MYSQL_PWD `
    -v "${mountDir}:/sql:ro" `
    mysql:8 mysql `
      --host=$DbHost --port=$Port --user=$User `
      --ssl-mode=REQUIRED `
      --default-character-set=utf8mb4 `
      --database=$Database `
      -e "source /sql/$fileName"
  if ($LASTEXITCODE -ne 0) { throw "FAIL $fileName (exit $LASTEXITCODE)" }
}

if ($Reset) {
  Write-Host '>> ล้างตารางเดิม (tidb-reset.sql)' -ForegroundColor Red
  Invoke-SqlFile $deploy 'tidb-reset.sql'
}

foreach ($f in $files) {
  Write-Host ">> $f" -ForegroundColor Cyan
  Invoke-SqlFile $initDir $f
}

# ตรวจว่าอักษรไทยเข้าถูกต้อง
Write-Host '>> ตรวจสอบภาษาไทย' -ForegroundColor Cyan
docker run --rm -e MYSQL_PWD mysql:8 mysql `
  --host=$DbHost --port=$Port --user=$User --ssl-mode=REQUIRED `
  --default-character-set=utf8mb4 --database=$Database `
  -e "SELECT name, muscle_group FROM exercises LIMIT 3; SELECT first_name, last_name FROM user_profiles LIMIT 3;"

Write-Host 'เสร็จ — ถ้าเห็นภาษาไทยด้านบน (ไม่ใช่ ???) แปลว่าถูกต้อง' -ForegroundColor Green
