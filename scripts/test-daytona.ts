import { DaytonaService } from '../backend/src/services/daytonaIntegration';

/**
 * Test script for Daytona sandbox integration
 * Run with: npx ts-node scripts/test-daytona.ts
 */

async function testDaytonaSandbox() {
  console.log('🧪 Testing Daytona Sandbox Integration\n');

  // Check for API key
  const apiKey = process.env.DAYTONA_API_KEY;
  if (!apiKey) {
    console.error('❌ DAYTONA_API_KEY environment variable not set');
    console.log('\nTo get an API key:');
    console.log('1. Visit https://www.daytona.io');
    console.log('2. Sign up or login');
    console.log('3. Create an API key in your settings');
    console.log('4. Set: export DAYTONA_API_KEY=your_key_here');
    process.exit(1);
  }

  try {
    // Initialize service
    console.log('🔧 Initializing Daytona service...');
    const daytona = new DaytonaService(apiKey);

    if (!daytona.isAvailable()) {
      console.error('❌ Daytona service initialization failed');
      process.exit(1);
    }

    console.log('✅ Daytona service initialized\n');

    // Test 1: Create a simple NextJS sandbox
    console.log('📦 Test 1: Creating sandbox with simple NextJS app...');

    const generatedCode = new Map<string, string>([
      [
        'page.tsx',
        `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-6xl font-bold">Generated with Daytona</h1>
      <p className="text-xl text-gray-600 mt-4">AI-powered isolated sandbox</p>
    </main>
  )
}`,
      ],
      [
        'layout.tsx',
        `import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Generated App',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}`,
      ],
    ]);

    const sandbox = await daytona.createSandbox(generatedCode, {
      projectName: 'test-nextjs-app',
      description: 'Test NextJS application generated via Daytona',
      autoStop: 1,
    });

    console.log('✅ Sandbox created successfully!');
    console.log(`\n📊 Sandbox Details:`);
    console.log(`   - Sandbox ID: ${sandbox.sandboxId}`);
    console.log(`   - Name: ${sandbox.workspaceName}`);
    console.log(`   - Status: ${sandbox.status}`);
    console.log(`   - Preview URL: ${sandbox.previewUrl}`);
    console.log(`   - API URL: ${sandbox.apiUrl}`);
    console.log(`   - Created: ${sandbox.createdAt}\n`);

    // Test 2: Get sandbox status
    console.log('🔍 Test 2: Getting sandbox status...');

    const status = await daytona.getSandboxStatus(sandbox.sandboxId);

    if (status) {
      console.log('✅ Retrieved sandbox status:');
      console.log(`   - Status: ${status.status}`);
      console.log(`   - URL: ${status.previewUrl}\n`);
    } else {
      console.warn('⚠️  Could not retrieve sandbox status\n');
    }

    // Test 3: List all sandboxes
    console.log('📋 Test 3: Listing all sandboxes...');

    const sandboxes = await daytona.listSandboxes();

    console.log(`✅ Found ${sandboxes.length} sandbox(es):`);
    sandboxes.forEach((sb, index) => {
      console.log(`   ${index + 1}. ${sb.workspaceName} (${sb.sandboxId})`);
    });
    console.log();

    // Test 4: Delete sandbox
    console.log('🗑️  Test 4: Deleting sandbox...');

    const deleted = await daytona.deleteSandbox(sandbox.sandboxId);

    if (deleted) {
      console.log(`✅ Sandbox deleted successfully\n`);
    } else {
      console.warn(`⚠️  Could not delete sandbox\n`);
    }

    console.log('✅ All tests completed successfully!');
    console.log('\n📚 Next steps:');
    console.log('1. Update backend/src/server.ts to include sandbox routes');
    console.log('2. Add DAYTONA_API_KEY to your .env file');
    console.log('3. Test the /api/sandbox endpoints with your generated code');
  } catch (error: any) {
    console.error('❌ Test failed with error:');
    console.error(error.message);
    process.exit(1);
  }
}

// Run tests
testDaytonaSandbox();
