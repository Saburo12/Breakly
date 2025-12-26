# Quick Demo Without Database

If you don't have PostgreSQL installed, you can still test the code generation!

## Steps:

### 1. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Backend (Minimal)

Create `backend/.env`:
```env
PORT=3001
ANTHROPIC_API_KEY=your-api-key-here
JWT_SECRET=any-random-string-at-least-32-characters-long
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**Note:** You MUST get an Anthropic API key from https://console.anthropic.com/

### 3. Configure Frontend

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001
```

### 4. Comment Out Database Code (Temporary)

We'll skip authentication for now and just test code generation.

### 5. Start Backend
```bash
cd backend
npm run dev
```

### 6. Start Frontend (in new terminal)
```bash
cd frontend
npm run dev
```

### 7. Test Code Generation

Open browser to `http://localhost:3000/generate` and try generating code!

The `/generate` route doesn't require authentication and will work without database.
