# Fix for "No preview available yet" Issue

## Problem Identified
After clicking "Generate Code", the preview shows "No preview available yet" instead of displaying the generated website.

**Root Cause**: The backend's streaming response was never completing. The `message_stop` event handler was inside the stream loop and never executed properly, so:
1. `file_complete` messages were never sent to the frontend
2. Frontend's `generatedFiles` array stayed empty
3. Preview HTML couldn't be built

## Changes Made

### File: `backend/src/services/claudeAgent.ts`

**1. Improved File Parsing Regex** (lines 189-252)
- Made regex more flexible to handle various code block formats
- Added fallback parsing for malformed blocks
- Better error handling with detailed logging

**2. Fixed Stream Completion Handling** (lines 119-185)
- Moved `message_stop` handling to properly exit the loop
- Added `hasCompleted` flag to ensure files are parsed
- Moved file parsing outside the loop to guarantee execution
- Added better error handling and logging

**Key changes:**
```typescript
// OLD: message_stop handler was inside the for...await loop but kept looping
// NEW: Explicitly break out of loop on message_stop, then process files

if (chunk.type === 'message_stop') {
  console.log('✅ message_stop event received');
  hasCompleted = true;
  break; // Exit the loop when stream is done
}

// Process completion moved outside loop
if (hasCompleted || fullContent.length > 0) {
  // Parse files and send to client
  ...
}
```

**3. Enhanced Debugging** (lines 154-162)
- Added detailed console logs showing:
  - Stream completion status
  - Full content length and preview
  - Number of parsed files
  - Each file's name and language
  - File sending progress

## Testing

### Test 1: Simple "Hello World" page
✅ **PASSED** - Files were successfully parsed and sent

### Test 2: Your Coffee Landing Page
⚠️ **NEEDS SERVER RESTART** - The backend server needs to reload the updated code

## What You Need To Do

1. **Restart the backend server**:
   ```bash
   # Stop the currently running server (if it's in a terminal)
   # Press Ctrl+C

   # Then restart it:
   cd backend
   npm run dev
   ```

2. **Try code generation again**:
   - Go to the frontend
   - Enter your prompt
   - Click "Generate Code"
   - You should now see the preview with your coffee landing page!

3. **Monitor the console** (backend terminal):
   - You should see logs like:
     ```
     ✅ message_stop event received
     ✅ Stream complete. Parsing files from content...
     📦 Parsed files: 1
     📄 File #1: index.html
     📤 Sending file 1/1: index.html
     🎉 Generation complete!
     ```

## Why This Works Now

The previous implementation had the file parsing logic inside the `for await` loop but it would never execute because:
1. The loop would wait indefinitely for more stream events
2. `message_stop` event handling was correct, but the subsequent code was still inside the loop
3. The stream would never properly terminate

Now:
1. We explicitly `break` out of the loop on `message_stop`
2. File parsing happens after the loop completes
3. Files are immediately sent to the frontend
4. Frontend receives `file_complete` messages and can build the preview

## Files Modified
- `backend/src/services/claudeAgent.ts`

## Expected Behavior After Fix
1. Click "Generate Code"
2. Code generation starts (you see streaming content)
3. **NEW**: When complete, `file_complete` messages are sent immediately
4. Frontend automatically switches to preview tab
5. Preview shows the generated website!

---

If you still see "No preview available yet" after restarting the server:
1. Check backend console for error messages
2. Ensure ANTHROPIC_API_KEY environment variable is set
3. The system will fall back to mock mode with sample HTML if no API key is found
