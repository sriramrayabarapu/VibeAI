const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

async function runTests() {
  console.log("====================================================");
  console.log("🚀 STARTING AUTOMATED TEST SUITE FOR VIBEAI FEATURES");
  console.log("====================================================");

  let passed = 0;
  let failed = 0;

  // Helper to assert
  function assert(condition, message) {
    if (condition) {
      console.log(`✅ Passed: ${message}`);
      passed++;
    } else {
      console.error(`❌ Failed: ${message}`);
      failed++;
    }
  }

  // Helper to fetch text
  function get(url) {
    return new Promise((resolve, reject) => {
      http.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
      }).on('error', reject);
    });
  }

  // Helper to post json
  function post(url, payload) {
    return new Promise((resolve, reject) => {
      const dataStr = JSON.stringify(payload);
      const u = new URL(url);
      const req = http.request({
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + u.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': dataStr.length
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      });
      req.on('error', reject);
      req.write(dataStr);
      req.end();
    });
  }

  try {
    // Test 1: Root serves home.html
    const rootRes = await get(`${BASE_URL}/`);
    assert(rootRes.status === 200 && rootRes.body.includes('<title>VibeAI</title>'), "Root URL '/' redirects/serves home.html");

    // Test 2: style.css is served
    const cssRes = await get(`${BASE_URL}/style.css`);
    assert(cssRes.status === 200 && cssRes.body.includes('VibeAI - MASTER NEUMORPHISM'), "Static file '/style.css' is served correctly and contains Neumorphism headers");

    // Test 3: script.js is served
    const jsRes = await get(`${BASE_URL}/script.js`);
    assert(jsRes.status === 200 && jsRes.body.includes('showPage'), "Static file '/script.js' is served correctly");

    // Test 4: AI /generate endpoint blocks empty messages
    const aiRes = await post(`${BASE_URL}/generate`, {});
    assert(aiRes.status === 400, "AI /generate endpoint blocks empty messages with 400 Bad Request");

    // Test 5: Verify script.js song list
    const scriptContent = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
    assert(scriptContent.includes('Naatu Naatu') && scriptContent.includes('Kesariya'), "Verify script.js has correct preset song list");

    // Test 6: Verify home.html elements
    const htmlContent = fs.readFileSync(path.join(__dirname, 'home.html'), 'utf8');
    assert(htmlContent.includes('note-bubble') && htmlContent.includes('avatar-wrapper'), "Verify home.html contains overhauled profile layout elements");

  } catch (err) {
    console.error("Test execution interrupted by error:", err);
    failed++;
  }

  console.log("====================================================");
  console.log("📊 TEST SUITE SUMMARY:");
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log("====================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Start tests
setTimeout(runTests, 1000);
