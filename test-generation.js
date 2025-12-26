const http = require('http');

const postData = JSON.stringify({
  prompt: 'Create a modern landing page for a coffee subscription service with a hero section, pricing cards, and contact form'
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/generate/stream',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS:`, res.headers);

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
    console.log('--- CHUNK RECEIVED ---');
    console.log(chunk.toString().substring(0, 500));
  });

  res.on('end', () => {
    console.log('\n--- COMPLETE RESPONSE ---');
    console.log(data);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(postData);
req.end();

// Timeout after 20 seconds
setTimeout(() => {
  console.log('\n--- TIMEOUT ---');
  process.exit(0);
}, 20000);
