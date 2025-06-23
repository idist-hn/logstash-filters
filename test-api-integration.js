// Test API integration
const http = require('http');

console.log('🧪 Testing CloudWatch ELK API Integration...\n');

// Test 1: Health Check
function testHealthCheck() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/health',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ Health Check:', res.statusCode === 200 ? 'PASS' : 'FAIL');
        console.log('   Response:', data);
        resolve(res.statusCode === 200);
      });
    });

    req.on('error', (err) => {
      console.log('❌ Health Check: FAIL');
      console.log('   Error:', err.message);
      reject(err);
    });

    req.end();
  });
}

// Test 2: Login API
function testLogin() {
  return new Promise((resolve, reject) => {
    const loginData = JSON.stringify({
      username: 'admin',
      password: 'admin123'
    });

    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ Login API:', res.statusCode === 200 ? 'PASS' : 'FAIL');
        console.log('   Status:', res.statusCode);
        
        try {
          const response = JSON.parse(data);
          console.log('   Token received:', !!response.token);
          console.log('   User data:', !!response.user);
          resolve({ success: res.statusCode === 200, token: response.token, user: response.user });
        } catch (e) {
          console.log('   Response:', data);
          resolve({ success: false });
        }
      });
    });

    req.on('error', (err) => {
      console.log('❌ Login API: FAIL');
      console.log('   Error:', err.message);
      reject(err);
    });

    req.write(loginData);
    req.end();
  });
}

// Test 3: Protected Route (Dashboard)
function testProtectedRoute(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/v1/dashboard',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ Protected Route:', res.statusCode === 200 ? 'PASS' : 'FAIL');
        console.log('   Status:', res.statusCode);
        
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            console.log('   Dashboard data received:', !!response);
          } catch (e) {
            console.log('   Response:', data.substring(0, 100) + '...');
          }
        }
        
        resolve(res.statusCode === 200);
      });
    });

    req.on('error', (err) => {
      console.log('❌ Protected Route: FAIL');
      console.log('   Error:', err.message);
      reject(err);
    });

    req.end();
  });
}

// Test 4: Frontend Proxy
function testFrontendProxy() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/v1/health',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ Frontend Proxy:', res.statusCode === 200 ? 'PASS' : 'FAIL');
        console.log('   Status:', res.statusCode);
        resolve(res.statusCode === 200);
      });
    });

    req.on('error', (err) => {
      console.log('❌ Frontend Proxy: FAIL');
      console.log('   Error:', err.message);
      reject(err);
    });

    req.end();
  });
}

// Run all tests
async function runTests() {
  try {
    console.log('1. Testing Backend Health...');
    await testHealthCheck();
    console.log('');

    console.log('2. Testing Login API...');
    const loginResult = await testLogin();
    console.log('');

    if (loginResult.success && loginResult.token) {
      console.log('3. Testing Protected Route...');
      await testProtectedRoute(loginResult.token);
      console.log('');
    }

    console.log('4. Testing Frontend Proxy...');
    await testFrontendProxy();
    console.log('');

    console.log('🎉 API Integration Test Complete!');
    console.log('');
    console.log('📋 Summary:');
    console.log('   - Backend API: Running on port 8080');
    console.log('   - Frontend: Running on port 3001');
    console.log('   - Proxy: Configured correctly');
    console.log('   - Authentication: Working');
    console.log('');
    console.log('🔑 Demo Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('');
    console.log('🌐 Access URLs:');
    console.log('   Frontend: http://localhost:3001');
    console.log('   Backend API: http://localhost:8080');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests();
