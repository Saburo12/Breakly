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

let fileCompleteCount = 0;
let doneReceived = false;

const req = http.request(options, (res) => {
  console.log(`✅ Starting code generation...`);
  let buffer = '';

  res.on('data', (chunk) => {
    buffer += chunk.toString();

    // Parse lines that end with \n\n
    const messages = buffer.split('\n\n');
    buffer = messages.pop() || '';

    for (const msg of messages) {
      if (msg.startsWith('data: ')) {
        try {
          const data = JSON.parse(msg.substring(6));
          if (data.type === 'file_complete') {
            fileCompleteCount++;
            console.log(`📄 File #${fileCompleteCount}: ${data.fileName} (${data.language})`);
          } else if (data.type === 'done') {
            doneReceived = true;
            console.log(`\n✅ GENERATION COMPLETE - ${data.filesGenerated} files created`);
          }
        } catch (e) {
          //
        }
      }
    }
  });

  res.on('end', () => {
    if (doneReceived && fileCompleteCount > 0) {
      console.log(`\n🎉 SUCCESS! Preview should now work!`);
      process.exit(0);
    } else {
      console.log(`\n❌ FAILED - Files: ${fileCompleteCount}, Done: ${doneReceived}`);
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Error: ${e.message}`);
  process.exit(1);
});

req.write(postData);
req.end();

setTimeout(() => {
  console.log(`❌ TIMEOUT after 40 seconds`);
  process.exit(1);
}, 40000);
