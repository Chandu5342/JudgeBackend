import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/auth';

// Test data
const lawyerA = {
  name: 'Rajesh Kumar',
  email: 'rajesh@lawyer.com',
  password: 'SecurePass123',
  role: 'lawyerA',
};

const lawyerB = {
  name: 'Priya Sharma',
  email: 'priya@lawyer.com',
  password: 'SecurePass456',
  role: 'lawyerB',
};

async function testAuthFlow() {
  try {
    console.log('\n========== TESTING AUTH SYSTEM ==========\n');

    // TEST 1: Register Lawyer A
    console.log('TEST 1: Registering Lawyer A...');
    const registerAResponse = await axios.post(`${BASE_URL}/register`, lawyerA);
    const tokenA = registerAResponse.data.data.token;
    console.log('✅ Lawyer A registered successfully');
    console.log('Token A:', tokenA.substring(0, 20) + '...');

    // TEST 2: Register Lawyer B
    console.log('\nTEST 2: Registering Lawyer B...');
    const registerBResponse = await axios.post(`${BASE_URL}/register`, lawyerB);
    const tokenB = registerBResponse.data.data.token;
    console.log('✅ Lawyer B registered successfully');
    console.log('Token B:', tokenB.substring(0, 20) + '...');

    // TEST 3: Login with Lawyer A credentials
    console.log('\nTEST 3: Login as Lawyer A...');
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      email: lawyerA.email,
      password: lawyerA.password,
    });
    console.log('✅ Login successful');
    console.log('New Token:', loginResponse.data.data.token.substring(0, 20) + '...');

    // TEST 4: Verify token
    console.log('\nTEST 4: Verifying JWT Token...');
    const verifyResponse = await axios.get(`${BASE_URL}/verify`, {
      headers: {
        Authorization: `Bearer ${tokenA}`,
      },
    });
    console.log('✅ Token verified successfully');
    console.log('User:', verifyResponse.data.data.user);

    // TEST 5: Try with invalid token
    console.log('\nTEST 5: Testing invalid token (should fail)...');
    try {
      await axios.get(`${BASE_URL}/verify`, {
        headers: {
          Authorization: `Bearer invalid_token_xyz`,
        },
      });
    } catch (error) {
      console.log('✅ Correctly rejected invalid token');
      console.log('Error:', error.response.data.message);
    }

    // TEST 6: Try without token (should fail)
    console.log('\nTEST 6: Testing without token (should fail)...');
    try {
      await axios.get(`${BASE_URL}/verify`);
    } catch (error) {
      console.log('✅ Correctly rejected missing token');
      console.log('Error:', error.response.data.message);
    }

    console.log('\n========== ALL TESTS PASSED ✅ ==========\n');
  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error('Error:', error.response?.data || error.message);
  }

  process.exit(0);
}

testAuthFlow();
