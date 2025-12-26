# CRITICAL: Restart Instructions

The system prompt and mock data have been updated. **Your backend MUST be restarted to pick up the changes.**

## Quick Restart (Windows)

### 1. Kill all Node processes
Open PowerShell as Administrator and run:
```powershell
Get-Process node | Stop-Process -Force
taskkill /IM node.exe /F
```

Wait 3 seconds.

### 2. Start Backend
Open PowerShell in the backend folder:
```powershell
cd "c:\Users\aweso\OneDrive\Desktop\weakhero\backend"
npm run dev
```

Wait for message: **"✅ Using REAL Claude service"**

### 3. Start Frontend (in a NEW PowerShell window)
```powershell
cd "c:\Users\aweso\OneDrive\Desktop\weakhero\frontend"
npm run dev
```

Wait for message: **"VITE v5.0.0 ready in X ms"**

### 4. Test the fixes
1. Open browser: `http://localhost:3000`
2. Enter prompt: `Create a modern landing page for a coffee subscription service with a hero section, pricing cards, and contact form`
3. Click "Generate Code"
4. Watch the browser console (F12 → Console):
   - Should see: `🔄 Auto-switch check: isGenerating= false, files.length= 3`
   - Should see: `✅ Auto-switching to preview tab`
   - Should see: `✅ Preview HTML ready: [large number] chars`
5. Preview tab should show beautiful rendered page automatically

## What Changed

### System Prompt Fix (`backend/src/services/claudeAgent.ts`)
- Now starts with `# ⚠️ CRITICAL: CODE ONLY`
- Forces Claude to output code blocks ONLY
- No text descriptions or preamble

### Mock Data Fix (`backend/src/services/claudeAgent.ts`)
- Removed descriptive text from mock code generation
- Now generates only code blocks

### Frontend Logging Fix (`frontend/src/components/StreamingPreview.tsx`)
- Added debug logs to auto-switch trigger
- Logs show when preview building happens

## Expected Output

After restart and testing:

**Preview Tab Should Show:**
- ✅ Beautiful hero section with gradient
- ✅ Professional pricing cards
- ✅ Contact form
- ✅ Smooth styling and effects
- ✅ Responsive design

**Browser Console Should Show:**
```
🔍 Building preview from files: [{name: 'index.html', language: 'html'}, ...]
🎨 CSS collected: true, length: [number]
⚙️ JavaScript collected: true, length: [number]
✅ Injected CSS into <head>
✅ Injected JavaScript before </body>
✅ Preview HTML ready: [large number] chars
🔄 Auto-switch check: isGenerating= false, files.length= 3
✅ Auto-switching to preview tab
```

## If It Still Doesn't Work

1. **Check browser console** (F12) - any errors?
2. **Check backend console** - does it say files were parsed?
3. **Are files being generated?** Check if you see the "Code" tab with files listed
4. **Try the mock prompt first** - just say "hello world" to test with mock data

## Files Modified

- `backend/src/services/claudeAgent.ts` - System prompt + mock data
- `frontend/src/components/StreamingPreview.tsx` - Auto-switch logging

---

**DO NOT** skip the restart step. The new system prompt will ONLY work if the backend is restarted.
