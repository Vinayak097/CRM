// Test script that starts server briefly and tests lead creation
import { spawn } from 'child_process';

async function testLeadCreation() {
  console.log('🚀 Starting backend server...');

  // Start the server
  const server = spawn('npx', ['tsx', 'src/server.ts'], {
    cwd: './backend',
    stdio: ['inherit', 'pipe', 'pipe']
  });

  let serverOutput = '';
  server.stdout.on('data', (data) => {
    const output = data.toString().trim();
    serverOutput += output + '\n';
    if (output) console.log('SERVER:', output);
  });

  server.stderr.on('data', (data) => {
    const error = data.toString().trim();
    if (error) console.error('SERVER ERROR:', error);
  });

  // Wait for server to start
  console.log('⏳ Waiting for server to start...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  try {
    console.log('🔍 Checking if server is responding...');

    // Test health check with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const healthResponse = await fetch('http://localhost:3000/health', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!healthResponse.ok) {
        throw new Error(`Health check failed: ${healthResponse.status}`);
      }

      const healthData = await healthResponse.json();
      console.log('✅ Health check successful:', healthData);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw new Error(`Cannot connect to server: ${fetchError.message}`);
    }

    console.log('📡 Testing login...');

    // Test login
    const loginController = new AbortController();
    const loginTimeoutId = setTimeout(() => loginController.abort(), 5000);

    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@avacasa.com',
        password: 'admin123'
      }),
      signal: loginController.signal
    });

    clearTimeout(loginTimeoutId);
    const loginData = await loginResponse.json();
    console.log('📄 Login response:', loginData);

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} ${JSON.stringify(loginData)}`);
    }

    console.log('✅ Login successful');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a bit

    console.log('📡 Testing leads GET request (should fail auth)...');

    // First test GET request to see if route is accessible
    const getLeadsController = new AbortController();
    const getTimeoutId = setTimeout(() => getLeadsController.abort(), 5000);

    try {
      const getResponse = await fetch('http://localhost:3000/api/leads', {
        signal: getLeadsController.signal
      });
      clearTimeout(getTimeoutId);

      const getData = await getResponse.json();
      console.log('📄 GET /api/leads response:', getData);
      console.log('📄 GET status:', getResponse.status);
    } catch (error) {
      clearTimeout(getTimeoutId);
      console.log('📄 GET request failed:', error.message);
    }

    console.log('📡 Testing lead creation...');

    // Test lead creation
    const leadController = new AbortController();
    const leadTimeoutId = setTimeout(() => leadController.abort(), 10000);

    const leadResponse = await fetch('http://localhost:3000/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': loginResponse.headers.get('set-cookie') || ''
      },
      body: JSON.stringify({
        identity: {
          fullName: 'Test User',
          phone: '+1122334455'
        }
      }),
      signal: leadController.signal
    });

    clearTimeout(leadTimeoutId);
    const leadData = await leadResponse.json();
    console.log('📄 Lead creation response:', leadData);
    console.log('📄 Lead response status:', leadResponse.status);

    if (leadResponse.ok) {
      console.log('✅ Lead created successfully!');
    } else {
      console.error('❌ Lead creation failed');
      console.log('📄 Recent server output:');
      console.log(serverOutput.slice(-2000));
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('📄 Final server output:');
    console.log(serverOutput.slice(-3000));
  } finally {
    console.log('🛑 Stopping server...');
    server.kill();
    process.exit(0);
  }
}

testLeadCreation();
