# Running on Daytona

This project is configured to run as an isolated environment on **Daytona**.

## Prerequisites

- [Daytona CLI](https://www.daytona.io/) installed
- Git configured
- Valid Anthropic API key (for Claude code generation)

## Quick Start

### 1. Create a Daytona Workspace

```bash
daytona create weakhero
```

Daytona will automatically detect the `.daytona.yml` configuration and set up the isolated environment.

### 2. Configure Environment Variables

When prompted, provide your environment variables:

```
ANTHROPIC_API_KEY=your_api_key_here
DATABASE_URL=postgresql://postgres:password@localhost:5432/lovable_clone (optional)
NODE_ENV=development
MOCK_CLAUDE=false
```

### 3. Start Development Servers

The workspace will automatically run:
- **Backend API** on port 3001
- **Frontend** on port 3000

### 4. Access the Application

Once both servers are running, open:
```
http://localhost:3000
```

## Environment Variables

### Required
- **ANTHROPIC_API_KEY** - Your Anthropic Claude API key for code generation

### Optional
- **DATABASE_URL** - PostgreSQL connection string (defaults to localhost:5432)
- **NODE_ENV** - Environment mode (default: development)
- **MOCK_CLAUDE** - Set to "true" to run without API key (demo mode)

## Project Structure

```
weakhero/
├── backend/              # Express.js API server
│   ├── src/
│   │   ├── server.ts     # Main server file
│   │   ├── services/
│   │   │   └── claudeAgent.ts  # Claude SDK integration
│   │   └── routes/
│   └── package.json
├── frontend/             # React + Vite frontend
│   ├── src/
│   │   ├── App.tsx
│   │   ├── hooks/
│   │   │   └── useStreamingGeneration.ts
│   │   └── services/
│   │       └── api.ts
│   └── package.json
├── .daytona.yml          # Daytona configuration
├── docker-compose.yml    # PostgreSQL setup
└── package.json          # Root workspace config
```

## Features

### Code Generation
- Real-time streaming code generation using Claude AI
- Generates HTML, CSS, JavaScript projects
- Live preview in browser
- File management and download

### Architecture
- **Frontend**: React with Vite for fast development
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL (optional)
- **AI Integration**: Anthropic Claude SDK

## Development Workflow in Daytona

1. **Make changes** to code in your editor
2. **Backend auto-reloads** on changes (tsx watch)
3. **Frontend auto-reloads** on changes (Vite HMR)
4. **Preview changes** immediately at http://localhost:3000

## Troubleshooting

### Port Already in Use
If ports 3000, 3001, or 5432 are already in use:
- Kill existing processes: `pkill -f "node\|postgres"`
- Restart Daytona workspace: `daytona restart weakhero`

### API Key Issues
- Ensure ANTHROPIC_API_KEY is set in environment
- For demo mode without API key, set MOCK_CLAUDE=true

### Database Connection Issues
- PostgreSQL is optional - the system works without it
- If you need persistence, ensure PostgreSQL is running
- Check DATABASE_URL environment variable

## Building for Production

```bash
daytona exec weakhero npm run build
```

This will:
1. Build backend TypeScript files
2. Build frontend React + Vite assets
3. Generate optimized production bundles

## More Information

- [Daytona Documentation](https://www.daytona.io/docs)
- [Anthropic Claude Documentation](https://docs.anthropic.com/)
- [Claude Code SDK](https://github.com/anthropics/claude-code)
