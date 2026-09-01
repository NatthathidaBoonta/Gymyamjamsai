# Gym Yamjamsai - Comprehensive Testing Plan

**Status:** Phase 12 (Notifications) + Phase 14 (Bug Fixes) Complete | Ready for Phase 15 (Production Deployment)

**Last Updated:** 2026-07-20

---

## 1. Test Environment Setup

### 1.1 Local Development Testing
```bash
# Terminal 1: Start full stack
docker-compose -f docker-compose.yml up -d

# Verify services
docker-compose ps

# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test

# Verify database
docker exec gymyamjamsai_mysql mysql -uroot -prootpassword -e "SELECT * FROM gymyamjamsai.users LIMIT 1;"
```

### 1.2 Test Database Initialization
- Database auto-initializes from `mysql/init/*.sql` on first docker-compose up
- Tables: users, workouts, exercises, notifications
- Seeds: Admin user (email: admin@test.com, password: admin123)

### 1.3 Test User Accounts
```
Admin Account:
  Email: admin@test.com
  Password: admin123
  Role: admin

Trainer Account:
  Email: trainer@test.com
  Password: trainer123
  Role: trainer

Member Account:
  Email: member@test.com
  Password: member123
  Role: member

Member Account 2:
  Email: member2@test.com
  Password: member123
  Role: member
```

---

## 2. API Contract & Integration Tests

### 2.1 Authentication Endpoints
**POST /api/auth/register**
```json
Request: {
  "email": "newuser@test.com",
  "password": "Test@123",
  "firstName": "John",
  "lastName": "Doe"
}
Expected: 201, JWT token, user object
Test: Create account → Login → Access protected endpoint
```

**POST /api/auth/login**
```json
Request: { "email": "member@test.com", "password": "member123" }
Expected: 200, JWT token in response
Test: Login → Store token → Use in Authorization header
```

**POST /api/auth/logout** (optional)
```json
Expected: 200, success message
Test: Login → Logout → Verify token rejected
```

### 2.2 Authorization Tests
**Role-Based Access Control**
- ✅ Admin can GET /api/admin/dashboard (member/trainer blocked)
- ✅ Trainer can GET /api/trainer/clients (member/admin blocked)
- ✅ Member can GET /api/member/dashboard (trainer/admin blocked)
- ✅ 401 response when no token provided
- ✅ 403 response when insufficient role

### 2.3 Workout Plan Endpoints
**GET /api/workout-plans**
```json
Expected Response: {
  "status": "success",
  "data": [{
    "id": "uuid",
    "user_id": "uuid",
    "name": "Push Day",
    "description": "Chest, shoulders, triceps",
    "week_count": 4,
    "created_at": "2026-07-20T10:00:00Z"
  }]
}
Critical Checks:
- API returns array not paginated response
- Verify field names match TypeScript interfaces
```

**GET /api/workout-plans/:id**
```json
Expected Response: {
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Push Day",
    "schedule": [{
      "id": "uuid",
      "day": 1,
      "day_of_week": "Monday",
      "exercise": {
        "id": "uuid",
        "name": "Barbell Bench Press",
        "category": "Chest"
      },
      "sets": 4,
      "reps": 8,
      "weight": 100
    }]
  }
}
Critical Checks:
- day field is NUMBER (1-7)
- day_of_week field is STRING ("Monday")
- exercise is OBJECT with id, name, category (not flat exercise_name/category)
```

**POST /api/workout-plans**
```json
Request: {
  "name": "Leg Day",
  "description": "Quad, hamstring, glute focused",
  "week_count": 4
}
Expected: 201, created plan object with ID
Test: Create plan → Retrieve → Verify in list
```

**POST /api/workout-plans/:id/schedule**
```json
Request: {
  "day_of_week": "Monday",
  "exercise_id": "uuid",
  "sets": 4,
  "reps": 8,
  "weight": 100
}
Expected: 201, schedule entry
Critical: day_of_week must map to day NUMBER (1-7)
```

### 2.4 Exercise Endpoints
**GET /api/exercises**
```json
Expected Response: {
  "status": "success",
  "data": {
    "items": [
      { "id": "uuid", "name": "Barbell Bench Press", "category": "Chest" },
      ...
    ],
    "total": 42,
    "page": 1,
    "limit": 20
  }
}
Critical: API returns paginated {items, total, page, limit}
Service layer must extract items array for frontend
```

**GET /api/exercises?category=Chest**
```json
Expected: Filtered results by category
Test: Query different categories, verify pagination
```

### 2.5 Notification Endpoints
**GET /api/notifications**
```json
Expected Response: {
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "title": "Workout Reminder",
      "message": "Time for your workout",
      "type": "reminder",
      "is_read": false,
      "created_at": "2026-07-20T10:00:00Z"
    }
  ]
}
Query Params: ?limit=20&offset=0
Test: Pagination, verify newest first
```

**GET /api/notifications/unread-count**
```json
Expected: { "status": "success", "data": 5 }
Test: Mark notification as read → Count should decrease
```

**PATCH /api/notifications/:id/read**
```json
Expected: 200, updated notification
Test: Toggle is_read flag
```

**POST /api/notifications/read-all**
```json
Expected: 200, marked all as read
Test: Verify unread count = 0
```

**DELETE /api/notifications/:id**
```json
Expected: 200, success message
Test: Verify deleted from list
```

---

## 3. Frontend Component Tests

### 3.1 Authentication Flow
**Login Page (Frontend: /login)**
- [ ] Email input validation (required, valid format)
- [ ] Password input validation (required, min 6 chars)
- [ ] Submit button disabled while loading
- [ ] Error message on failed login (401)
- [ ] Redirect to /member/dashboard on success
- [ ] JWT token stored in localStorage
- [ ] Token used in Authorization header for API calls

**Register Page (Frontend: /register)**
- [ ] All required fields validated
- [ ] Password confirmation validation
- [ ] Submit button disabled while loading
- [ ] Success message shows
- [ ] Auto-redirect to login after success
- [ ] Duplicate email error (409)

**401 Interceptor**
- [ ] Expired token triggers logout
- [ ] User redirected to login
- [ ] Token cleared from localStorage

### 3.2 Dashboard Components

**Member Dashboard (/member/dashboard)**
- [ ] Renders without errors (ErrorBoundary catches crashes)
- [ ] Loads user stats: current weight, total workouts, average attendance
- [ ] Displays attendance_rate as NUMBER, not object
- [ ] Shows workout history chart (Recharts)
- [ ] Progress bar displays correctly
- [ ] Notification bell shows unread count badge

**Admin Dashboard (/admin/dashboard)**
- [ ] Loads member statistics
- [ ] average_attendance_rate field displays correctly
- [ ] Charts render properly
- [ ] Filter by role works (member, trainer, admin)
- [ ] Export user data button (if implemented)

**Trainer Dashboard (/trainer/dashboard)**
- [ ] Loads assigned clients
- [ ] Shows workout plans for each client
- [ ] Can create new workout plan
- [ ] Can assign workout to client

### 3.3 Notification Bell Component
**Desktop (width > 900px)**
- [ ] Bell icon visible in header
- [ ] Unread count badge shows (red, top-right)
- [ ] Click opens dropdown panel (360px wide)
- [ ] Displays 5 most recent notifications
- [ ] Each notification shows: title, message, timestamp
- [ ] "Mark as read" button works
- [ ] "Delete" button works
- [ ] "Mark all as read" button updates all
- [ ] "View All" link navigates to /member/notifications
- [ ] Click outside closes dropdown
- [ ] Real-time polling updates count every 30 seconds

**Mobile (width < 900px)**
- [ ] Bell icon responsive
- [ ] Dropdown width 100% - 32px
- [ ] Notification text wraps properly
- [ ] Touch-friendly button sizes (min 44px)

**Dark Mode**
- [ ] Badge color visible on dark background
- [ ] Dropdown background correct
- [ ] Text contrast meets WCAG AA

### 3.4 Notifications Page (/member/notifications)
- [ ] Displays all notifications in table format
- [ ] Filter buttons work: All, Unread, Read
- [ ] "Mark all as read" button visible
- [ ] Each notification has: title, message, timestamp, actions
- [ ] "Mark as read" toggles button
- [ ] "Delete" removes from list
- [ ] Pagination: 20 per page
- [ ] Responsive: stacks on mobile

### 3.5 Workout Plan Pages
**Create Workout Plan**
- [ ] Form validates: name (required), description, week_count (1-52)
- [ ] Submit button disabled while loading
- [ ] Success message shows
- [ ] Redirects to plan details
- [ ] API receives correct payload

**View Workout Plan**
- [ ] Displays schedule sorted by day
- [ ] Each day shows exercises with: name, category, sets, reps, weight
- [ ] Add exercise to day works
- [ ] Remove exercise works
- [ ] Exercise autocomplete/dropdown functional
- [ ] No console errors

**Edit Workout Plan**
- [ ] Can edit plan name/description
- [ ] Can reorder exercises
- [ ] Changes persisted to API
- [ ] Proper error handling for API failures

### 3.6 Exercise Library
- [ ] List displays all exercises (paginated)
- [ ] Filter by category works
- [ ] Search by name works (if implemented)
- [ ] Images load correctly (if images added)
- [ ] Click exercise shows details/modal
- [ ] Can add exercise to workout plan

---

## 4. Database & Data Integrity Tests

### 4.1 Database Schema Validation
```sql
-- Verify tables exist with correct columns
SHOW TABLES;
DESCRIBE users;
DESCRIBE workouts;
DESCRIBE workout_plans;
DESCRIBE workout_schedule;
DESCRIBE exercises;
DESCRIBE notifications;

-- Verify indexes for performance
SHOW INDEX FROM users;
SHOW INDEX FROM notifications;
```

**Expected Tables:**
- ✅ users (id, email, password_hash, firstName, lastName, role, created_at)
- ✅ workouts (id, user_id, name, date, duration, calories)
- ✅ workout_plans (id, user_id, name, description, week_count, created_at)
- ✅ workout_schedule (id, plan_id, day_of_week, exercise_id, sets, reps, weight)
- ✅ exercises (id, name, category, description)
- ✅ notifications (id, user_id, title, message, type, is_read, created_at)

### 4.2 Foreign Key & Constraint Tests
- [ ] Cannot create workout_plan with non-existent user_id
- [ ] Cannot add exercise to schedule with non-existent exercise_id
- [ ] Cannot create notification for non-existent user_id
- [ ] Deleting user cascades to workouts/plans/notifications (if configured)

### 4.3 Data Validation
- [ ] User email is unique (cannot register twice)
- [ ] User passwords are hashed with bcrypt (never stored plain text)
- [ ] JWT tokens properly signed and verified
- [ ] Notification timestamps in UTC
- [ ] Numeric fields (sets, reps, weight) are valid numbers

### 4.4 Workflow Tests
**Complete User Journey - Member**
1. [ ] Register new account
2. [ ] Verify email exists in database
3. [ ] Login with credentials
4. [ ] Receive JWT token
5. [ ] Access member dashboard
6. [ ] Create workout plan
7. [ ] View plan details
8. [ ] Add exercises to plan
9. [ ] Receive notification (trigger manually via API)
10. [ ] See notification in bell + page
11. [ ] Mark notification as read
12. [ ] Verify is_read flag in database
13. [ ] Logout

**Complete User Journey - Trainer**
1. [ ] Login as trainer
2. [ ] Access trainer dashboard
3. [ ] View assigned members
4. [ ] Create workout plan for member
5. [ ] Assign plan to member
6. [ ] Member sees plan in their account
7. [ ] Trainer sees member's progress

**Complete User Journey - Admin**
1. [ ] Login as admin
2. [ ] Access admin dashboard
3. [ ] View all users and statistics
4. [ ] See attendance metrics
5. [ ] View member details
6. [ ] (Create/edit/delete users if implemented)

---

## 5. Docker Integration Tests

### 5.1 Docker Compose Health Checks
```bash
# Verify all services healthy
docker-compose ps
# Expected: All services with status "Up" and health check passing

# Check service logs for errors
docker-compose logs backend | grep -i error
docker-compose logs frontend | grep -i error
docker-compose logs mysql | grep -i error

# Test inter-container networking
docker exec gymyamjamsai_backend curl http://mysql:3306  # Should connect
docker exec gymyamjamsai_frontend curl http://backend:5000  # Should connect
```

### 5.2 Docker Image Tests
```bash
# Verify images built correctly
docker images | grep gymyamjamsai

# Test backend image
docker run -p 5000:5000 \
  -e DB_HOST=host.docker.internal \
  -e JWT_SECRET=test-secret \
  gymyamjamsai_backend:latest

# Test frontend image
docker run -p 80:80 gymyamjamsai_frontend:latest
# Visit http://localhost:80 should load app
```

### 5.3 Volume & Persistence Tests
- [ ] Database volume persists across container restarts
- [ ] Application logs persist
- [ ] Environment changes in .env apply on restart

### 5.4 Environment Variable Tests
- [ ] Backend reads PORT, DB_HOST, JWT_SECRET correctly
- [ ] Frontend reads VITE_API_URL correctly
- [ ] Missing env variables use defaults (or fail gracefully)

---

## 6. Security Tests

### 6.1 Authentication & Authorization
- [ ] 401 returned for missing Authorization header
- [ ] 401 returned for invalid JWT token
- [ ] 403 returned for insufficient permissions (role-based)
- [ ] Passwords hashed with bcrypt (never plain text in database)
- [ ] JWT_SECRET is strong (min 32 chars in production)
- [ ] Tokens expire after JWT_EXPIRES_IN time
- [ ] Logout invalidates token (if session tracking implemented)

### 6.2 Input Validation & XSS Prevention
- [ ] Email fields reject invalid formats
- [ ] SQL injection attempts rejected (parameterized queries)
- [ ] HTML injection in text fields escaped
- [ ] File uploads validated (if implemented)
- [ ] Rate limiting on auth endpoints (if implemented)

### 6.3 CORS & CSRF Protection
- [ ] CORS only allows FRONTEND_ORIGIN domain
- [ ] Cross-origin requests with wrong origin rejected
- [ ] Credentials sent in Authorization header (not cookies)

### 6.4 HTTPS & TLS
- [ ] Production deployment uses HTTPS only
- [ ] Redirect HTTP → HTTPS
- [ ] Security headers present: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- [ ] (Test with SSL certificate from Let's Encrypt)

---

## 7. Performance & Load Testing

### 7.1 Response Time Benchmarks
**Acceptable Response Times:**
- Login: < 200ms
- List workouts: < 300ms
- Create plan: < 200ms
- Get notifications: < 150ms
- Dashboard load: < 500ms (including all API calls)

**Measure with:**
```javascript
// In browser console
console.time('api-call');
fetch('/api/workouts').then(() => console.timeEnd('api-call'));
```

### 7.2 Database Query Performance
- [ ] Notifications query uses indexes (user_id, is_read)
- [ ] List workouts doesn't N+1 query (join, don't loop)
- [ ] Pagination limits database scan

### 7.3 Frontend Performance
- [ ] Page loads in < 3 seconds (first paint)
- [ ] Notifications poll every 30s (not on every interaction)
- [ ] No memory leaks (check DevTools → Memory tab)
- [ ] No infinite loops (check console for repeated logs)

### 7.4 Basic Load Test (Manual)
```bash
# Simulate 10 concurrent API calls
for i in {1..10}; do
  curl -s http://localhost:5000/api/notifications \
    -H "Authorization: Bearer $TOKEN" &
done
wait

# Expected: All complete in < 2 seconds
```

---

## 8. Error Handling & Resilience

### 8.1 Frontend Error Handling
- [ ] ErrorBoundary catches React component crashes
- [ ] Shows error message instead of blank page
- [ ] "Back to home" button works
- [ ] API errors display user-friendly messages
- [ ] Network timeouts handled gracefully
- [ ] Missing data doesn't crash UI

### 8.2 Backend Error Handling
- [ ] 404 for missing endpoints
- [ ] 400 for invalid request data
- [ ] 500 with generic message (never expose internals)
- [ ] Error logging to console/file
- [ ] Unhandled promise rejections caught
- [ ] Database connection errors don't crash server

### 8.3 Graceful Degradation
- [ ] If notifications API is slow, bell still works
- [ ] If image CDN is down, page still loads
- [ ] If one dashboard chart fails, others display
- [ ] Missing exercises don't break workout page

---

## 9. Test Execution Checklist

### Phase 1: Static Analysis (No Manual Testing)
- [ ] Run TypeScript compiler: `cd frontend && npx tsc --noEmit`
- [ ] Check for linting errors: `cd frontend && npm run lint` (if configured)
- [ ] Verify no hardcoded secrets in code

### Phase 2: Unit Testing (Backend Services)
```bash
cd backend
npm test
# Expected: All tests pass, coverage > 70%
```

### Phase 3: API Integration Testing
```bash
# Terminal 1: Start backend + database
docker-compose up -d mysql backend

# Terminal 2: Run API tests
cd backend
npm run test:api

# Manual API testing with curl/Postman
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"member@test.com","password":"member123"}'
```

### Phase 4: Frontend Component Testing
```bash
cd frontend
npm run test
# If no tests exist, create them using Vitest + React Testing Library
```

### Phase 5: Manual UI Testing (Browser)
- [ ] Open http://localhost:5173 in Chrome/Firefox
- [ ] Follow user journeys from Section 4.4
- [ ] Test on multiple screen sizes (mobile/tablet/desktop)
- [ ] Test in dark mode
- [ ] Test with DevTools Network Throttling (Slow 3G)

### Phase 6: Docker Integration Testing
```bash
docker-compose up -d
# Wait 5 seconds for MySQL initialization
docker-compose exec mysql mysql -uroot -prootpassword -e "SELECT 1;"

# Test frontend accessibility
open http://localhost:5173

# Test backend API
curl http://localhost:5000/api/health

# Check logs for errors
docker-compose logs --tail=20
```

### Phase 7: Production Build Testing
```bash
# Build images with Dockerfile.prod
docker build -f backend/Dockerfile.prod -t gymyamjamsai_backend:latest backend/
docker build -f frontend/Dockerfile.prod -t gymyamjamsai_frontend:latest frontend/

# Run with production image
docker run -p 5000:5000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=$(openssl rand -hex 32) \
  gymyamjamsai_backend:latest
```

---

## 10. Test Results Tracking

### Test Run Template
```
Test Run Date: 2026-07-20
Environment: Docker Compose (Local)
Tester: [Name]
Status: PASS / FAIL

Tests Passed: 47/50
Tests Failed: 3
Critical Issues: 0
Blockers: 0

Failed Tests:
1. [Component/Test Name] - [Error description]
2. [Component/Test Name] - [Error description]
3. [Component/Test Name] - [Error description]

Notes:
- Notification polling works reliably
- Database transactions consistent
- No memory leaks detected

Sign-off: [Name, Date]
```

---

## 11. Ready for Production Deployment (Phase 15)

**Pre-Deployment Checklist:**
- [ ] All tests from Section 9 (Phases 1-7) passing
- [ ] No console errors or warnings
- [ ] JWT_SECRET set to strong random value in .env.production
- [ ] FRONTEND_ORIGIN matches production domain
- [ ] Database credentials match production database
- [ ] VITE_API_URL points to production backend
- [ ] Dockerfile.prod images built and tested
- [ ] docker-compose.prod.yml created (if using compose in prod)
- [ ] Security headers configured (nginx/server)
- [ ] HTTPS/SSL certificates ready
- [ ] Monitoring/logging service configured (Sentry, LogRocket, etc.)

**After Deployment (Post-Live Checks):**
- [ ] Smoke test: Login → View dashboard → Create plan → Receive notification
- [ ] Monitor error logs (Sentry/LogRocket)
- [ ] Check database replication (if applicable)
- [ ] Verify backup jobs running
- [ ] Monitor server health (CPU, memory, disk)
- [ ] Load test (if applicable)
- [ ] User acceptance testing (UAT)

---

## 12. Known Limitations & Future Work

**Current Limitations:**
- No automated UI tests (manual testing only)
- No load test infrastructure
- No database backup/restore tested
- Email notifications not implemented (mock only)
- Session tokens don't persist on server side

**Future Testing Enhancements:**
- Add E2E tests with Cypress/Playwright
- Add visual regression testing
- Add performance profiling (Lighthouse)
- Add accessibility testing (axe-core)
- Add database backup/restore testing
- Add multi-environment testing (staging)
- Add chaos engineering tests (failure scenarios)

---

## 13. Contact & Escalation

**Test Environment Issues:**
- Container won't start: Check `docker-compose logs`
- Database connection error: Verify MYSQL_* env vars
- Port conflicts: `sudo lsof -i :5000` to find process

**Production Issues:**
- Contact DevOps for server access
- Check monitoring dashboard (Sentry, etc.)
- Rollback to previous version if critical

---

**Testing Plan Complete** ✅

This plan covers functional, integration, security, performance, and Docker-specific testing. Execute sequentially and document results for audit trail before production deployment.
