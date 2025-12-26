# Lovable Clone - Setup Guide

Complete setup instructions for the Lovable Clone code generation platform.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **PostgreSQL** 14.x or higher ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn** (comes with Node.js)
- **Anthropic API Key** ([Get one here](https://console.anthropic.com/))

## Step 1: Clone and Navigate

```bash
cd lovable-clone
```

## Step 2: Database Setup

### Create Database

1. Start PostgreSQL service:
```bash
# Windows
net start postgresql

# macOS/Linux
sudo service postgresql start
```

2. Create the database:
```bash
psql -U postgres
CREATE DATABASE lovable_clone;
\q
```

3. Run the schema:
```bash
psql -U postgres -d lovable_clone -f backend/src/db/schema.sql
```

Alternatively, use the npm script after installing dependencies:
```bash
cd backend
npm run db:migrate
```

## Step 3: Environment Configuration

### Backend Environment

1. Copy the example file:
```bash
cd backend
cp .env.example .env
```

2. Edit `backend/.env` with your values:
```env
PORT=3001
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/lovable_clone
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**Important:**
- Replace `ANTHROPIC_API_KEY` with your actual API key from Anthropic
- Replace `your_password` in DATABASE_URL with your PostgreSQL password
- Generate a secure JWT_SECRET (at least 32 characters)

### Frontend Environment

1. Copy the example file:
```bash
cd frontend
cp .env.example .env
```

2. Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001
```

## Step 4: Install Dependencies

### Option A: Install All at Once (Recommended)

From the root directory:
```bash
npm run install:all
```

### Option B: Install Separately

Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd frontend
npm install
```

Root:
```bash
cd ..
npm install
```

## Step 5: Start the Application

### Development Mode (Recommended)

From the root directory, start both servers:
```bash
npm run dev
```

This will start:
- Backend API server on `http://localhost:3001`
- Frontend dev server on `http://localhost:3000`

### Start Servers Separately

Backend:
```bash
cd backend
npm run dev
```

Frontend (in a new terminal):
```bash
cd frontend
npm run dev
```

## Step 6: Create Your First Account

1. Open your browser and navigate to `http://localhost:3000`
2. Click "Sign up" or navigate to `/register`
3. Fill in your details:
   - Name (optional)
   - Email
   - Password (minimum 6 characters)
4. Click "Create Account"
5. You'll be automatically logged in and redirected to the dashboard

## Step 7: Generate Your First Code

1. From the dashboard, click "New Project"
2. Enter a project name and optionally select a framework
3. Click into the project
4. In the prompt area, describe what you want to build, for example:
   ```
   Create a React Todo app with TypeScript that includes:
   - Add new todos
   - Mark todos as complete
   - Delete todos
   - Filter by status
   - Save to local storage
   ```
5. Click "Generate Code" or press `Ctrl/Cmd + Enter`
6. Watch as the code streams in real-time!
7. Click "Save" to save the generated files to your project

## Troubleshooting

### Database Connection Issues

**Error:** `connection refused` or `password authentication failed`

**Solution:**
1. Verify PostgreSQL is running:
   ```bash
   # Windows
   sc query postgresql

   # macOS/Linux
   sudo service postgresql status
   ```
2. Check your DATABASE_URL in `.env`
3. Verify your PostgreSQL password is correct

### Port Already in Use

**Error:** `Port 3001 already in use`

**Solution:**
1. Change the PORT in `backend/.env`
2. Update VITE_API_URL in `frontend/.env` to match

### CORS Errors

**Error:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution:**
1. Verify FRONTEND_URL in `backend/.env` matches your frontend URL
2. Restart the backend server

### Anthropic API Errors

**Error:** `Invalid API key` or `401 Unauthorized`

**Solution:**
1. Verify your ANTHROPIC_API_KEY in `backend/.env`
2. Check that your API key is active at https://console.anthropic.com/
3. Ensure you have sufficient credits

### TypeScript Errors

**Error:** Type errors during build

**Solution:**
```bash
# Backend
cd backend
npx tsc --noEmit

# Frontend
cd frontend
npx tsc --noEmit
```

## Production Build

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
npm run preview
```

## Project Structure

```
lovable-clone/
├── backend/                 # Express API server
│   ├── src/
│   │   ├── server.ts       # Main entry point
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth & error handling
│   │   ├── routes/         # API routes
│   │   ├── models/         # Database models
│   │   ├── services/       # Claude service
│   │   └── db/            # Database schema
│   └── package.json
├── frontend/               # React application
│   ├── src/
│   │   ├── App.tsx        # Main app
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API client
│   │   └── types/        # TypeScript types
│   └── package.json
└── README.md
```

## Default Credentials

The database schema includes a sample user for testing:
- Email: `demo@example.com`
- Password: `password123`

**Note:** In production, remove this user and implement proper password hashing!

## Next Steps

- Explore the code generation interface
- Try different prompts and frameworks
- Save and organize your projects
- Customize the system prompt in `backend/src/services/claudeAgent.ts`
- Add more features!

## Support

For issues and questions:
1. Check this setup guide
2. Review the troubleshooting section
3. Check the logs in the console
4. Open an issue on GitHub

## Security Notes

**Before deploying to production:**

1. Change all default passwords and secrets
2. Use environment-specific `.env` files
3. Enable HTTPS
4. Set up proper database backups
5. Implement rate limiting
6. Add request validation
7. Set up monitoring and logging
8. Review CORS settings

Happy coding! 🚀
