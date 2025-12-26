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
  },
  timeout: 35000
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);

  let fullContent = '';
  let contentChunks = [];

  res.on('data', (chunk) => {
    const str = chunk.toString();
    const lines = str.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.substring(6));
          if (data.type === 'content' && data.content) {
            fullContent += data.content;
            contentChunks.push(data.content);
          } else if (data.type === 'file_complete') {
            console.log(`\n✅ FILE COMPLETE RECEIVED: ${data.fileName}`);
          } else if (data.type === 'done') {
            console.log(`\n✅ DONE RECEIVED`);
          }
        } catch (e) {
          // skip
        }
      }
    }
  });

  res.on('end', () => {
    console.log(`\n=== ANALYSIS ===`);
    console.log(`Full content length: ${fullContent.length}`);
    console.log(`\nFirst 500 chars:\n${fullContent.substring(0, 500)}`);
    console.log(`\n\nLooking for code blocks...`);

    // Try the regex from the code
    const codeBlockRegex = /```([a-zA-Z0-9\-_]*)\s*([^\n]*?)\n([\s\S]*?)```/g;
    let match;
    let count = 0;

    while ((match = codeBlockRegex.exec(fullContent)) !== null) {
      count++;
      console.log(`\nMatch #${count}:`);
      console.log(`  Language: "${match[1]}"`);
      console.log(`  Filename: "${match[2]}"`);
      console.log(`  Code length: ${match[3].length}`);
      console.log(`  First 100 chars: ${match[3].substring(0, 100)}`);
    }

    if (count === 0) {
      console.log('\n❌ NO MATCHES FOUND!');
      console.log('\nTrying lenient regex...');

      const lenientRegex = /```\n?([\s\S]*?)```/g;
      let match2;
      let count2 = 0;

      while ((match2 = lenientRegex.exec(fullContent)) !== null) {
        count2++;
        console.log(`\nLenient Match #${count2}:`);
        console.log(`  Code length: ${match2[1].length}`);
      }

      if (count2 === 0) {
        console.log('❌ LENIENT REGEX ALSO FOUND NOTHING');
      }
    }
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
  process.exit(1);
});

req.on('timeout', () => {
  console.log('Request timeout!');
  req.destroy();
  process.exit(1);
});

req.write(postData);
req.end();
