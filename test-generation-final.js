const http = require('http');

const postData = JSON.stringify({
  prompt: 'Create a simple hello world page'
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

let fileCompleteCount = 0;
let doneReceived = false;
let lastUpdate = Date.now();

const req = http.request(options, (res) => {
  console.log(`Starting request...`);
  let buffer = '';

  res.on('data', (chunk) => {
    lastUpdate = Date.now();
    buffer += chunk.toString();

    // Parse lines that end with \n\n
    const messages = buffer.split('\n\n');
    buffer = messages.pop() || ''; // Keep incomplete message

    for (const msg of messages) {
      if (msg.startsWith('data: ')) {
        try {
          const data = JSON.parse(msg.substring(6));
          if (data.type === 'file_complete') {
            fileCompleteCount++;
            console.log(`✅ File #${fileCompleteCount} received: ${data.fileName}`);
          } else if (data.type === 'done') {
            doneReceived = true;
            console.log(`✅ DONE received - ${data.filesGenerated} files total`);
          }
        } catch (e) {
          // Skip
        }
      }
    }
  });

  res.on('end', () => {
    console.log(`\n✅ Response ended`);
    console.log(`Files received: ${fileCompleteCount}`);
    console.log(`Done message: ${doneReceived}`);
    process.exit(fileCompleteCount > 0 && doneReceived ? 0 : 1);
  });
});

req.on('error', (e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});

req.write(postData);
req.end();

// Timeout after 30 seconds
setTimeout(() => {
  if (!doneReceived) {
    console.log(`❌ TIMEOUT - No done message received after 30 seconds`);
    console.log(`Files received so far: ${fileCompleteCount}`);
    process.exit(1);
  }
}, 30000);
