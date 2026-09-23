const http = require('http');
const app = require('../server');
const connectDB = require('../config/db');
const { seedDefaultsIfNeeded } = require('../utils/seedDefaults');

async function runServeTests() {
  await connectDB();
  await seedDefaultsIfNeeded();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5055, resolve));
  console.log('Test server running on port 5055');

  function request(path) {
    return new Promise((resolve, reject) => {
      http.get(`http://localhost:5055${path}`, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
      }).on('error', reject);
    });
  }

  try {
    console.log('\n--- Test 1: Health Check Endpoint ---');
    const health = await request('/api/health');
    console.log('Status:', health.statusCode);
    const healthJson = JSON.parse(health.body);
    if (health.statusCode === 200 && healthJson.status === 'success') {
      console.log('✓ Health check passed');
    } else {
      throw new Error('Health check failed: ' + health.body);
    }

    console.log('\n--- Test 2: Root SPA HTML Serve ---');
    const root = await request('/');
    console.log('Status:', root.statusCode);
    if (root.statusCode === 200 && root.body.includes('<div id="root">') && root.body.includes('Real Estate CRM')) {
      console.log('✓ Root HTML served successfully with React bundle');
    } else {
      throw new Error('Root serve failed: ' + root.body.slice(0, 200));
    }

    console.log('\n--- Test 3: Deep Route Fallback to SPA (e.g. /dashboard) ---');
    const deepRoute = await request('/dashboard');
    console.log('Status:', deepRoute.statusCode);
    if (deepRoute.statusCode === 200 && deepRoute.body.includes('<div id="root">')) {
      console.log('✓ SPA deep routing fallback passed for /dashboard');
    } else {
      throw new Error('Deep route fallback failed');
    }

    console.log('\n--- Test 4: API 404 Guard for non-existent /api routes ---');
    const notFoundApi = await request('/api/nonexistent');
    console.log('Status:', notFoundApi.statusCode);
    const notFoundJson = JSON.parse(notFoundApi.body);
    if (notFoundApi.statusCode === 404 && notFoundJson.status === 'error') {
      console.log('✓ API 404 guard passed');
    } else {
      throw new Error('API 404 guard failed');
    }

    console.log('\n=======================================');
    console.log('ALL SERVE TESTS PASSED WITH 100% SUCCESS!');
    console.log('=======================================\n');
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  } finally {
    server.close();
    process.exit(0);
  }
}

runServeTests();
