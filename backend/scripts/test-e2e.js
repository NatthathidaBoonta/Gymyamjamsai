/**
 * E2E Test Script for Phase 14
 * Run: node scripts/test-e2e.js
 */

const API_URL = 'http://localhost:5000/api';

async function fetchAPI(endpoint, method = 'GET', body = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_URL}${endpoint}`, options);
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function runTests() {
  console.log('--- Starting E2E Tests ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Negative Test: Login with empty fields
    const loginFail = await fetchAPI('/auth/login', 'POST', { email: '', password: '' });
    assert(loginFail.status === 400, `Empty login fields return 400 (got: ${JSON.stringify(loginFail.data)})`);

    // 2. Login as Trainer and Member
    const trainerLogin = await fetchAPI('/auth/login', 'POST', { email: 'trainer@gymyam.com', password: 'Trainer@123' });
    const trainerToken = trainerLogin.data.data ? trainerLogin.data.data.token : trainerLogin.data.token;

    const userLogin = await fetchAPI('/auth/login', 'POST', { email: 'member@gymyam.com', password: 'Member@123' });
    const userToken = userLogin.data.data ? userLogin.data.data.token : userLogin.data.token;

    // 3. Create Activity 1 (10:00)
    const baseDate = new Date();
    baseDate.setHours(10, 0, 0, 0); // Today at 10:00
    
    const act1 = await fetchAPI('/activities', 'POST', {
      title: 'Yoga Class 1',
      max_seats: 10,
      datetime: baseDate.toISOString()
    }, trainerToken);
    assert(act1.status === 201, `Activity 1 created (got: ${act1.status} - ${JSON.stringify(act1.data)})`);
    const act1Id = act1.data.data ? act1.data.data.id : act1.data.id;

    // 4. Create Activity 2 (11:00) -> Overlaps with Act 1
    const act2Date = new Date(baseDate.getTime() + 60 * 60 * 1000); // 11:00
    const act2 = await fetchAPI('/activities', 'POST', {
      title: 'Yoga Class 2',
      max_seats: 10,
      datetime: act2Date.toISOString()
    }, trainerToken);
    assert(act2.status === 201, 'Activity 2 created');
    const act2Id = act2.data.data ? act2.data.data.id : act2.data.id;

    // 5. Create Activity 3 (13:00) -> Does not overlap
    const act3Date = new Date(baseDate.getTime() + 3 * 60 * 60 * 1000); // 13:00
    const act3 = await fetchAPI('/activities', 'POST', {
      title: 'Yoga Class 3',
      max_seats: 10,
      datetime: act3Date.toISOString()
    }, trainerToken);
    assert(act3.status === 201, 'Activity 3 created');
    const act3Id = act3.data.data ? act3.data.data.id : act3.data.id;

    // 6. User registers for Act 1
    const reg1 = await fetchAPI(`/activities/${act1Id}/register`, 'POST', {}, userToken);
    assert(reg1.status === 201, 'User registered for Activity 1');

    // 7. Overlap Test: User registers for Act 2
    const reg2 = await fetchAPI(`/activities/${act2Id}/register`, 'POST', {}, userToken);
    const reg2ErrMsg = (reg2.data.message || reg2.data.error || JSON.stringify(reg2.data));
    assert(reg2.status === 409 && reg2ErrMsg.includes('ซ้อนทับกัน'), 'Overlap registration rejected (409) ' + reg2ErrMsg);

    // 8. No Overlap Test: User registers for Act 3
    const reg3 = await fetchAPI(`/activities/${act3Id}/register`, 'POST', {}, userToken);
    assert(reg3.status === 201, 'Non-overlapping registration allowed');

    // 9. Negative Test: Create activity with negative seats
    const badAct = await fetchAPI('/activities', 'POST', {
      title: 'Bad Class',
      max_seats: -5,
      datetime: baseDate.toISOString()
    }, trainerToken);
    assert(badAct.status === 400, 'Negative seats rejected (400)');

  } catch (err) {
    console.error('Test Execution Failed:', err);
  }

  console.log(`\n--- Test Summary: ${passed} Passed, ${failed} Failed ---`);
}

runTests();
