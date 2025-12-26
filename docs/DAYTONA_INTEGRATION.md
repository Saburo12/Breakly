# Daytona Sandbox Integration Guide

This guide explains how to use Daytona to create isolated sandbox environments for AI-generated code.

## Overview

Instead of saving generated code files locally, the system creates **isolated Daytona sandboxes** where:
- Each generated project runs in a **completely isolated environment**
- Users get a **public preview URL** to access the running application
- The sandbox **auto-stops after 1 hour** of inactivity
- Multiple sandboxes can run **concurrently**
- Complete **separation of concerns** from the main codebase

## Architecture

```
User Request
    ↓
Claude AI generates code
    ↓
Backend receives generated code (Map<filename, content>)
    ↓
Daytona Service creates sandbox
    ↓
NextJS app initialized in sandbox
    ↓
npm install && npm build && npm start
    ↓
Preview URL returned to user
    ↓
User accesses live app at https://{sandboxId}.daytona.dev
```

## Setup

### 1. Get Daytona API Key

1. Visit [Daytona.io](https://www.daytona.io)
2. Sign up or log in
3. Go to Settings → API Keys
4. Create a new API key
5. Copy the key

### 2. Configure Environment

Add to `.env`:
```env
DAYTONA_API_KEY=your_api_key_here
```

### 3. Install Dependencies

```bash
cd backend
npm install @daytona/sdk
```

## Usage

### Creating a Sandbox

**HTTP Request:**
```bash
POST /api/sandbox/create
Content-Type: application/json
Authorization: Bearer {token}

{
  "generatedCode": {
    "page.tsx": "export default function Home() { ... }",
    "layout.tsx": "export default function RootLayout(...) { ... }",
    "globals.css": "@tailwind base; @tailwind components; ..."
  },
  "projectName": "my-awesome-app",
  "description": "AI-generated landing page"
}
```

**Response:**
```json
{
  "success": true,
  "sandbox": {
    "sandboxId": "abc123xyz",
    "workspaceName": "my-awesome-app",
    "previewUrl": "https://abc123xyz.daytona.dev",
    "apiUrl": "https://api-abc123xyz.daytona.dev",
    "status": "running",
    "createdAt": "2024-11-06T10:30:00Z"
  },
  "previewUrl": "https://abc123xyz.daytona.dev",
  "message": "Sandbox created..."
}
```

### Getting Sandbox Status

```bash
GET /api/sandbox/{sandboxId}
Authorization: Bearer {token}
```

### Listing All Sandboxes

```bash
GET /api/sandbox
Authorization: Bearer {token}
```

### Deleting a Sandbox

```bash
DELETE /api/sandbox/{sandboxId}
Authorization: Bearer {token}
```

## Code Generation Flow

### 1. Generation Request

User submits prompt from frontend:
```typescript
const response = await api.post('/api/generate/sandbox', {
  prompt: 'Create a modern landing page for a coffee subscription',
});

const { sandbox, previewUrl } = response.data;
console.log(`Visit: ${previewUrl}`);
```

### 2. Backend Processing

The backend:
1. Receives the generation request
2. Calls Claude AI to generate code
3. Parses generated files (HTML, CSS, JavaScript, etc.)
4. Converts HTML to NextJS components
5. Creates sandbox via Daytona
6. Returns preview URL

### 3. Generated Project Structure

```
sandbox-root/
├── package.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
└── public/
    └── assets/
```

## File Conversion

### HTML → NextJS

Generated HTML:
```html
<div class="hero">
  <h1>Welcome</h1>
</div>
```

Converted to NextJS:
```typescript
// app/page.tsx
export default function Home() {
  return (
    <div className="hero">
      <h1>Welcome</h1>
    </div>
  )
}
```

### CSS → Tailwind

Automatically converts to Tailwind utility classes or wraps in `globals.css`.

## Auto-Stop Behavior

Sandboxes automatically stop after 1 hour of inactivity to conserve resources.

**Options:**
- `autoStop: 1` → 1 hour (default)
- `autoStop: 2` → 2 hours
- `autoStop: 24` → 24 hours

To prevent auto-stop, manually restart before the timeout.

## Environment Variables in Sandbox

Sandboxes support environment variables:

```typescript
const sandbox = await daytona.createSandbox(codeMap, {
  environment: {
    'NEXT_PUBLIC_API_URL': 'https://api.example.com',
    'ANALYTICS_KEY': 'key123',
  }
});
```

Access in NextJS:
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

## Error Handling

### Daytona Service Not Available

If `DAYTONA_API_KEY` is not set:
```json
{
  "error": "Sandbox service not available",
  "message": "Daytona SDK is not configured..."
}
```

### Invalid Generated Code

If code format is invalid:
```json
{
  "error": "Invalid request",
  "message": "generatedCode must be an object with filename -> content mapping"
}
```

### Sandbox Creation Failed

```json
{
  "error": "Failed to create sandbox",
  "message": "Specific error details..."
}
```

## Testing

Run the test script:

```bash
export DAYTONA_API_KEY=your_api_key
npx ts-node scripts/test-daytona.ts
```

This will:
1. Create a test sandbox
2. Get sandbox status
3. List all sandboxes
4. Delete the test sandbox

## Performance

- **Sandbox Creation**: 30-60 seconds
- **Build Time**: 60-120 seconds (depends on dependencies)
- **Preview Access**: Immediate after build
- **Resource Cleanup**: Automatic after 1 hour

## Limitations

- Sandboxes auto-stop after configured timeout
- Maximum sandbox size: ~1GB
- Network access is limited to public URLs
- Database connections not supported in free tier
- File uploads limited to 100MB

## Advanced Usage

### Custom Build Scripts

Override default build process:

```typescript
const sandbox = await daytona.createSandbox(codeMap, {
  buildScript: 'npm run custom-build',
  startScript: 'npm run start:prod'
});
```

### Persistent Data

Store data in sandbox tmpfs or uploaded files:

```typescript
const sandbox = await daytona.createSandbox(codeMap, {
  storage: {
    tmpfs: '1GB',
    persistent: false,
  }
});
```

### Multi-Stage Deployment

```typescript
// Stage 1: Development
const devSandbox = await daytona.createSandbox(codeMap, {
  environment: { MODE: 'development' }
});

// Stage 2: Production
const prodSandbox = await daytona.createSandbox(codeMap, {
  environment: { MODE: 'production' }
});
```

## Troubleshooting

### Sandbox Not Starting

1. Check Daytona Dashboard for errors
2. Verify dependencies in `package.json`
3. Review build logs
4. Check `DAYTONA_API_KEY` is valid

### Preview URL Not Accessible

1. Wait 2-3 minutes for build to complete
2. Check sandbox status: `GET /api/sandbox/{id}`
3. Verify sandbox is in `running` state
4. Try accessing preview URL directly

### Build Failures

Common issues:
- **Missing dependencies**: Add to `package.json`
- **Incompatible versions**: Use compatible package versions
- **Memory limit**: Use lightweight alternatives
- **Timeout**: Increase `autoStop` timeout

## Security

### Sandboxes are Isolated

- Each sandbox runs in **separate container**
- No access to host filesystem
- Network traffic is monitored
- Resource limits enforced

### API Security

- All requests require authentication
- API keys stored securely
- Rate limiting enabled
- CORS restricted

## Cost

Daytona pricing:
- Free tier: Limited sandboxes
- Pro tier: ~$0.10/hour per sandbox
- Enterprise: Custom pricing

## Support

- [Daytona Documentation](https://docs.daytona.io)
- [API Reference](https://docs.daytona.io/api)
- [Community Discord](https://discord.gg/daytona)

## Next Steps

1. Set `DAYTONA_API_KEY` in `.env`
2. Run test script to verify setup
3. Update API route in `backend/src/server.ts`
4. Test with generated code
5. Monitor sandbox usage in Daytona Dashboard
