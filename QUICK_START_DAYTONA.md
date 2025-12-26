# Quick Start: Daytona Sandbox Integration

Get Daytona sandboxes running in 5 minutes ⚡

## 1. Get API Key (2 min)

```bash
# Visit https://www.daytona.io
# Sign up or login
# Go to Settings → API Keys
# Create new key and copy it
```

## 2. Configure (.env)

```bash
# Add to .env file in project root
DAYTONA_API_KEY=paste_your_key_here
```

## 3. Install Dependencies (1 min)

```bash
cd backend
npm install @daytona/sdk
```

## 4. Register Routes (1 min)

Edit `backend/src/server.ts` and add:

```typescript
import sandboxRoutes from './routes/sandbox';

// Add after other route imports
app.use('/api/sandbox', sandboxRoutes);
```

## 5. Test (1 min)

```bash
npx ts-node scripts/test-daytona.ts
```

Expected output:
```
✅ Daytona service initialized
✅ Sandbox created successfully!
✅ Retrieved sandbox status
✅ Found X sandbox(es)
✅ Sandbox deleted successfully
✅ All tests completed successfully!
```

## 6. Use in Your Code

```typescript
// Generate code with Claude
const generatedCode = {
  'page.tsx': `export default function Home() { return <h1>Hello</h1> }`,
  'layout.tsx': `export default function Layout({ children }) { return children }`,
  'globals.css': `@tailwind base; @tailwind components; @tailwind utilities;`
};

// Create sandbox
const response = await fetch('/api/sandbox/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    generatedCode,
    projectName: 'my-app',
    description: 'AI-generated app'
  })
});

const { previewUrl } = await response.json();

// Share with user
console.log(`🚀 Your app is ready: ${previewUrl}`);
```

## Available Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/sandbox/create` | Create sandbox |
| GET | `/api/sandbox/{id}` | Get status |
| DELETE | `/api/sandbox/{id}` | Delete sandbox |
| GET | `/api/sandbox` | List all |

## Response Examples

### Create Sandbox
```json
{
  "success": true,
  "previewUrl": "https://abc123xyz.daytona.dev",
  "sandboxId": "abc123xyz",
  "sandbox": {
    "status": "running",
    "createdAt": "2024-11-06T10:30:00Z"
  }
}
```

### Get Status
```json
{
  "success": true,
  "sandbox": {
    "sandboxId": "abc123xyz",
    "status": "running",
    "previewUrl": "https://abc123xyz.daytona.dev"
  }
}
```

## File Locations

Key files created:

```
backend/
├── src/
│   ├── services/
│   │   └── daytonaIntegration.ts    ← Core service
│   └── routes/
│       └── sandbox.ts               ← API endpoints
├── package.json                      ← Updated with @daytona/sdk

scripts/
└── test-daytona.ts                  ← Test script

docs/
└── DAYTONA_INTEGRATION.md           ← Full guide
```

## Troubleshooting

### "Daytona service not initialized"
- Check `DAYTONA_API_KEY` is set
- Verify it's a valid key from daytona.io

### "Failed to create sandbox"
- Check backend logs for details
- Verify Daytona API is accessible
- Check generated code format

### Preview URL not working
- Wait 2-3 minutes for build
- Check sandbox status: `GET /api/sandbox/{id}`
- Verify sandbox shows `status: running`

### Dependencies not installing
- Check `package.json` in generated code
- Ensure all packages have compatible versions
- Try reducing dependencies

## Next Steps

1. ✅ Set DAYTONA_API_KEY
2. ✅ Run `npm install @daytona/sdk`
3. ✅ Add routes to server.ts
4. ✅ Run test script
5. 🔄 Integrate with your code generation
6. 🔄 Test end-to-end flow
7. 🔄 Monitor usage in Daytona Dashboard

## Monitoring

View sandboxes in:
- **Daytona Dashboard**: https://daytona.io/dashboard
- **API**: `GET /api/sandbox`

## Performance

- ⚡ Sandbox creation: 30-60 seconds
- ⚡ Build time: 60-120 seconds
- ⚡ Preview access: Immediate after build
- ⚡ Auto-cleanup: 1 hour after creation

## Pricing

| Plan | Cost | Sandboxes |
|------|------|-----------|
| Free | $0 | 3 limited |
| Pro | $0.10/hr | Unlimited |

## Documentation

- **Full Guide**: [DAYTONA_INTEGRATION.md](docs/DAYTONA_INTEGRATION.md)
- **Implementation Summary**: [DAYTONA_IMPLEMENTATION_SUMMARY.md](DAYTONA_IMPLEMENTATION_SUMMARY.md)
- **Official Docs**: https://docs.daytona.io

## Support

- Discord: https://discord.gg/daytona
- Email: support@daytona.io
- GitHub: https://github.com/daytona-io

---

**That's it!** 🎉

Your isolated sandbox generation is now ready to go.

Next: Connect it to your code generation endpoint and start creating!
