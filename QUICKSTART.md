# Quick Start Guide

Get up and running with Lovable Clone in 5 minutes!

## 1. Prerequisites Check

Make sure you have:
- ✅ Node.js 18+ installed
- ✅ PostgreSQL 14+ installed and running
- ✅ Anthropic API key ([Get one](https://console.anthropic.com/))

## 2. Quick Setup

```bash
# 1. Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE lovable_clone;"

# 2. Install all dependencies
npm run install:all

# 3. Setup backend environment
cd backend
cp .env.example .env
# Edit .env with your ANTHROPIC_API_KEY and DATABASE_URL

# 4. Run database migrations
npm run db:migrate

# 5. Setup frontend environment
cd ../frontend
cp .env.example .env

# 6. Start development servers (from root)
cd ..
npm run dev
```

## 3. Configure Environment Variables

### Backend (.env)
```env
ANTHROPIC_API_KEY=sk-ant-api03-YOUR-KEY-HERE
DATABASE_URL=postgresql://postgres:password@localhost:5432/lovable_clone
JWT_SECRET=your-super-secret-key-minimum-32-characters
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
```

## 4. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

- Backend API: `http://localhost:3001`
- Frontend: `http://localhost:3000`

## 5. Create Account & Generate Code

1. Click "Sign up" and create an account
2. Create a new project
3. Enter a prompt like:
   ```
   Create a React Todo app with TypeScript, including add, delete,
   complete tasks, and local storage persistence
   ```
4. Click "Generate Code" and watch the magic! ✨

## Common Issues

### Database Connection Error
```bash
# Ensure PostgreSQL is running
# Windows: net start postgresql
# Mac/Linux: sudo service postgresql start
```

### Port Already in Use
```bash
# Change PORT in backend/.env to something else (e.g., 3002)
# Update VITE_API_URL in frontend/.env accordingly
```

### API Key Invalid
- Verify your Anthropic API key at https://console.anthropic.com/
- Make sure it starts with `sk-ant-api03-`
- Ensure you have credits available

## What You Get

✅ Real-time streaming code generation
✅ Multi-file project support
✅ Monaco code editor (VS Code editor)
✅ Project management dashboard
✅ Authentication & user accounts
✅ PostgreSQL database persistence
✅ TypeScript throughout
✅ Production-ready architecture

## Project Structure

```
lovable-clone/
├── backend/          # Express + TypeScript API
│   ├── src/
│   │   ├── server.ts           # Main server
│   │   ├── services/
│   │   │   └── claudeAgent.ts  # Claude SDK integration
│   │   ├── controllers/        # Route handlers
│   │   ├── routes/            # API routes
│   │   └── models/            # Database models
│   └── package.json
├── frontend/         # React + TypeScript UI
│   ├── src/
│   │   ├── App.tsx            # Main app
│   │   ├── components/        # UI components
│   │   ├── hooks/
│   │   │   └── useStreamingGeneration.ts  # SSE hook
│   │   └── services/
│   │       └── api.ts         # API client
│   └── package.json
└── README.md
```

## Next Steps

- 📖 Read [README.md](./README.md) for detailed documentation
- 🔧 Check [SETUP.md](./SETUP.md) for advanced setup options
- ✨ Explore [FEATURES.md](./FEATURES.md) for all features
- 🚀 Start generating code!

## Need Help?

- Check [SETUP.md](./SETUP.md) for detailed troubleshooting
- Review console logs for error messages
- Ensure all environment variables are set correctly

## Example Prompts to Try

```
1. "Create a React weather app with TypeScript that fetches data from
    OpenWeatherMap API"

2. "Build a Node.js Express REST API for a blog with PostgreSQL"

3. "Generate a Python Flask app with user authentication and JWT"

4. "Create a Vue.js dashboard with charts using Chart.js"

5. "Build a Next.js landing page with Tailwind CSS"
```

Happy coding! 🎉
