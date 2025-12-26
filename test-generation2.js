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

  let buffer = '';
  let chunkCount = 0;

  res.on('data', (chunk) => {
    chunkCount++;
    buffer += chunk.toString();
  });

  res.on('end', () => {
    console.log('\n=== COMPLETE RESPONSE ===\n');

    // Split by newlines and parse each line
    const lines = buffer.split('\n');
    let fileCompleteCount = 0;
    let doneMessage = false;

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.substring(6));
          if (data.type === 'file_complete') {
            fileCompleteCount++;
            console.log(`\n📄 FILE COMPLETE #${fileCompleteCount}:`);
            console.log(`  - fileName: ${data.fileName}`);
            console.log(`  - language: ${data.language}`);
            console.log(`  - content length: ${data.content ? data.content.length : 0}`);
            console.log(`  - first 100 chars: ${data.content ? data.content.substring(0, 100) : 'N/A'}`);
          } else if (data.type === 'done') {
            doneMessage = true;
            console.log(`\n✅ DONE MESSAGE:`, data);
          }
        } catch (e) {
          // Skip parse errors
        }
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`  - Total lines received: ${lines.length}`);
    console.log(`  - File complete messages: ${fileCompleteCount}`);
    console.log(`  - Done message received: ${doneMessage}`);
    console.log(`  - Total buffer length: ${buffer.length}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(postData);
req.end();

// Timeout after 30 seconds
setTimeout(() => {
  console.log('\n=== TIMEOUT ===');
  process.exit(0);
}, 30000);
