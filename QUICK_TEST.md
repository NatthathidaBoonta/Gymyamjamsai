# Quick Feature Testing Checklist

**Date:** 2026-07-21

**Prerequisites:**
- ✅ Backend: http://localhost:5000 (running)
- ✅ Frontend: http://localhost:5176 (running)
- ✅ MySQL: Running in Docker (docker-compose up -d mysql)

---

## Test Accounts

```
Admin:
  Email: admin@test.com
  Password: admin123

Member:
  Email: member@test.com
  Password: member123

Trainer:
  Email: trainer@test.com
  Password: trainer123
```

---

## Manual Testing Checklist

### ✅ Test 1: Authentication Flow
- [ ] Login page loads without errors
- [ ] Enter valid credentials (admin@test.com / admin123)
- [ ] Click "เข้าสู่ระบบ" button
- [ ] Dashboard loads successfully
- [ ] JWT token stored in localStorage (check DevTools → Application)
- [ ] Logout button works

### ✅ Test 2: Member Dashboard
- [ ] Dashboard displays user stats
- [ ] Shows current weight graph (if data exists)
- [ ] Shows total workouts count
- [ ] Shows average attendance rate (as NUMBER, not object)
- [ ] Shows workout history chart
- [ ] No console errors

### ✅ Test 3: Notification Bell (Phase 12)
- [ ] Bell icon visible in header
- [ ] Unread count badge shows (red)
- [ ] Click bell opens dropdown with last 5 notifications
- [ ] "Mark as read" button works
- [ ] "Delete" button removes notification
- [ ] "Mark all as read" updates all notifications
- [ ] "View All" link navigates to /member/notifications
- [ ] Dropdown closes on outside click
- [ ] Real-time polling updates every 30 seconds

### ✅ Test 4: Notifications Page
- [ ] Navigate to /member/notifications
- [ ] Page displays all notifications in table format
- [ ] Filter buttons work: "All", "Unread", "Read"
- [ ] "Mark all as read" button visible and functional
- [ ] Each notification shows: title, message, timestamp
- [ ] Pagination works (20 per page)
- [ ] Responsive on mobile

### ✅ Test 5: Workout Plans
- [ ] Navigate to workout plans section
- [ ] List displays existing plans
- [ ] Can create new plan (if applicable)
- [ ] Click plan shows schedule with exercises
- [ ] Exercises display: name, category, sets, reps, weight
- [ ] Day field shows as NUMBER (1-7, not string)
- [ ] day_of_week shows as STRING ("Monday", etc.)

### ✅ Test 6: Exercise Library
- [ ] Navigate to exercises section
- [ ] List displays all exercises (paginated)
- [ ] Can filter by category
- [ ] Click exercise shows details
- [ ] No console errors
- [ ] Images load (if applicable)

### ✅ Test 7: Error Handling
- [ ] Try accessing protected route without login → redirected to /login
- [ ] Try invalid credentials → error message shows
- [ ] Network error in API → graceful error display (not crash)
- [ ] Component error (if triggered) → ErrorBoundary shows error message

### ✅ Test 8: Responsiveness
- [ ] Open DevTools (F12)
- [ ] Test mobile view (375x667)
- [ ] Test tablet view (768x1024)
- [ ] Test desktop view (1280x720)
- [ ] Layout adjusts correctly
- [ ] No horizontal scrolling

### ✅ Test 9: Dark Mode (if implemented)
- [ ] Toggle dark mode (if button exists)
- [ ] Colors contrast properly
- [ ] Bell badge visible
- [ ] All text readable

### ✅ Test 10: Browser Console
- [ ] Open DevTools Console (F12)
- [ ] No red errors
- [ ] Only info/warning logs (normal)
- [ ] No "ERR_" messages (except blocked resources)

---

## Automated API Testing (Bash/curl)

### Test Backend Health
```bash
curl http://localhost:5000/api/health
# Expected: {"status":"ok"}
```

### Test Login API
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'

# Expected: {"status":"success","data":{"token":"eyJ...","user":{...}}}
```

### Test Notifications API (requires valid token from login)
```bash
TOKEN="<paste-jwt-token-from-login>"

# Get notifications
curl http://localhost:5000/api/notifications \
  -H "Authorization: Bearer $TOKEN"

# Get unread count
curl http://localhost:5000/api/notifications/unread-count \
  -H "Authorization: Bearer $TOKEN"

# Mark as read
curl -X PATCH http://localhost:5000/api/notifications/<notification-id>/read \
  -H "Authorization: Bearer $TOKEN"
```

### Test Workout Plans API
```bash
TOKEN="<paste-jwt-token>"

# Get workout plans
curl http://localhost:5000/api/workout-plans \
  -H "Authorization: Bearer $TOKEN"

# Expected: List of workout plans with proper field names
```

### Test Exercises API
```bash
# Get exercises (paginated)
curl http://localhost:5000/api/exercises

# Expected: {
#   "status":"success",
#   "data":{
#     "items":[...],
#     "total":42,
#     "page":1,
#     "limit":20
#   }
# }
```

---

## Results

### Manual Testing
- [ ] All 10 test categories passed
- [ ] No critical errors
- [ ] UI responsive on all screen sizes
- [ ] Notifications working in real-time

### API Testing
- [ ] Backend health: ✅
- [ ] Login: ✅
- [ ] Notifications: ✅
- [ ] Workout Plans: ✅
- [ ] Exercises: ✅

---

## Issues Found (if any)

List any bugs or issues discovered during testing:

1. [Issue 1]
2. [Issue 2]
3. [Issue 3]

---

## Summary

**Total Tests:** 10 manual categories + 5 API endpoints

**Status:** PASS / FAIL

**Date Tested:** 2026-07-21

**Tester:** [Your Name]

---

## Next Steps

- ✅ If all tests PASS → Proceed to TESTING_PLAN.md (Phase 1-7)
- ❌ If tests FAIL → Document issues and fix before proceeding
