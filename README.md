# Breakly - AI-Powered Code Generation Platform

A full-stack code generation platform  featuring real-time streaming code generation, multi-file support, and live preview capabilities.

## Features

- 🚀 Real-time streaming code generation
- 📁 Multi-file project generation
- 👀 Live preview of generated code
- 💾 Project management and persistence
- 🔐 Secure authentication
- 🎨 Syntax highlighting with Monaco Editor
- 📱 Responsive UI design
- 🔄 SSE-based streaming architecture

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL
- JWT Authentication
- Server-Sent Events (SSE)

### Frontend
- React 18 + TypeScript
- Vite
- React Router
- Monaco Editor
- Tailwind CSS
- Axios
- React Hot Toast

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

## Setup

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Database Setup

Create a PostgreSQL database and run the schema:

```bash
psql -U postgres
CREATE DATABASE lovable_clone;
\c lovable_clone
\i backend/src/db/schema.sql
```

### 3. Environment Configuration

**Backend (.env):**
```
PORT=3001
ANTHROPIC_API_KEY=your_anthropic_api_key
JWT_SECRET=your_jwt_secret_here
DATABASE_URL=postgresql://user:pass@localhost:5432/lovable_clone
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:3001
```

### 4. Run Development Servers

```bash
npm run dev
```

This will start:
- Backend server on http://localhost:3001
- Frontend dev server on http://localhost:3000

## Project Structure

```
lovable-clone/
├── backend/          # Express API server
│   ├── src/
│   │   ├── server.ts           # Main server entry
│   │   ├── controllers/        # Route controllers
│   │   ├── middleware/         # Auth & error handling
│   │   ├── routes/            # API routes
│   │   ├── models/            # Database models
│   │   ├── services/          # Business logic
│   │   └── db/               # Database schemas
│   └── package.json
├── frontend/         # React application
│   ├── src/
│   │   ├── App.tsx            # Main app component
│   │   ├── components/        # UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API client
│   │   └── types/           # TypeScript types
│   └── package.json
└── package.json      # Root package file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Projects
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/files` - Get project files

### Code Generation
- `POST /api/generate/stream` - Stream code generation (SSE)

## Usage

1. Register/Login to create an account
2. Create a new project
3. Enter a prompt describing what you want to build
4. Watch as Breakly generates code in real-time
5. View generated files with syntax highlighting
6. Save projects for later use
7. Export code as needed

## Architecture Highlights

### Streaming Implementation

The platform uses Server-Sent Events (SSE) for real-time streaming:

1. **Backend**: Claude SDK streams tokens → Express SSE endpoint → Client
2. **Frontend**: EventSource consumes SSE → React state updates → Monaco Editor

### Code Generation Flow

1. User submits prompt
2. Backend receives request and starts stream
3. Generates code with artifacts
4. Server parses and forwards chunks via SSE
5. Frontend receives chunks and updates UI progressively
6. Generated files are displayed in tabbed interface

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
