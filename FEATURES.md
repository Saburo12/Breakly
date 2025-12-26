# Lovable Clone - Features

## Core Features

### 1. Real-Time Streaming Code Generation
- **Live Streaming**: Watch code being generated character by character
- **Server-Sent Events (SSE)**: Efficient real-time updates from server to client
- **Progressive Rendering**: See code as it's being created, not after completion
- **Cancellation Support**: Stop generation mid-stream if needed

### 2. Multi-File Project Support
- **Intelligent Parsing**: Automatically detects and separates multiple files from Claude's response
- **File Management**: View, edit, and organize generated files
- **Project Persistence**: Save entire projects to database
- **File Tabs**: Easy navigation between multiple generated files

### 3. Authentication & Authorization
- **JWT-based Auth**: Secure token-based authentication
- **User Registration**: Create new accounts with email/password
- **Protected Routes**: Secure API endpoints and pages
- **Session Management**: Persistent login sessions

### 4. Project Management
- **CRUD Operations**: Create, Read, Update, Delete projects
- **Project Dashboard**: Visual overview of all projects
- **Framework Tags**: Organize by technology stack
- **Search & Filter**: Find projects quickly (ready for implementation)
- **Generation History**: Track all code generation attempts

### 5. Advanced Code Editor
- **Monaco Editor**: Same editor as VS Code
- **Syntax Highlighting**: Support for 50+ languages
- **Dark Theme**: Professional code viewing experience
- **Line Numbers**: Easy code reference
- **Code Folding**: Collapse/expand code blocks

### 6. Intelligent Prompting
- **Context-Aware**: System prompt optimized for code generation
- **Best Practices**: Generates production-ready code with error handling
- **TypeScript Support**: Automatically includes types when requested
- **Framework Specific**: Tailored output based on technology choice

### 7. User Interface
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Split-Screen View**: Prompt input alongside live preview
- **Toast Notifications**: User-friendly success/error messages
- **Loading States**: Clear feedback during operations
- **Empty States**: Helpful guidance when no data exists

### 8. Developer Experience
- **TypeScript Throughout**: Full type safety on frontend and backend
- **Error Boundaries**: Graceful error handling
- **Hot Module Replacement**: Instant updates during development
- **ESLint**: Code quality enforcement
- **Modular Architecture**: Easy to extend and maintain

## Technical Implementation

### Backend Architecture
- **Express.js**: Fast, minimal web framework
- **PostgreSQL**: Robust relational database
- **Anthropic SDK**: Official Claude AI integration
- **Streaming API**: Efficient SSE implementation
- **Middleware Stack**: Auth, error handling, logging
- **Connection Pooling**: Optimized database connections

### Frontend Architecture
- **React 18**: Modern UI framework with hooks
- **Vite**: Lightning-fast build tool
- **React Router**: Client-side routing
- **Axios**: HTTP client with interceptors
- **Custom Hooks**: Reusable logic (useStreamingGeneration)
- **Monaco Editor**: Professional code editor

### Security Features
- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure, stateless authentication
- **CORS Protection**: Controlled cross-origin requests
- **SQL Injection Prevention**: Parameterized queries
- **Input Validation**: Server-side validation
- **XSS Protection**: Sanitized inputs

### Performance Optimizations
- **Database Indexing**: Optimized queries
- **Connection Pooling**: Reuse database connections
- **Lazy Loading**: Components loaded on demand
- **Code Splitting**: Smaller bundle sizes
- **Caching**: Browser and API caching
- **Streaming**: Reduced time-to-first-byte

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/files` - Get project files
- `DELETE /api/projects/:projectId/files/:fileId` - Delete file

### Code Generation
- `POST /api/generate/stream` - Stream code generation (SSE)
- `POST /api/generate` - Generate code (non-streaming)
- `POST /api/generate/save` - Save generated files to project

## Database Schema

### Users Table
- User accounts with authentication
- Email, password hash, name
- Created/updated timestamps

### Projects Table
- User-owned projects
- Name, description, framework
- Foreign key to users
- Cascading deletes

### Files Table
- Generated code files
- Project association
- File metadata (name, type, language, path)
- Unique constraint on project_id + path

### Generations Table
- Generation history and tracking
- Prompt, status, error messages
- Files generated count
- Completion timestamps

## Supported Languages

The platform can generate code in any language Claude supports, with special highlighting for:

- TypeScript/JavaScript (tsx, ts, jsx, js)
- Python (py)
- Java (java)
- C/C++ (c, cpp)
- HTML/CSS (html, css)
- Go (go)
- Rust (rs)
- Ruby (rb)
- PHP (php)
- SQL (sql)
- And many more...

## Use Cases

1. **Rapid Prototyping**: Generate MVPs quickly
2. **Learning**: See how experienced developers structure code
3. **Boilerplate Generation**: Create project scaffolding
4. **Component Creation**: Generate React/Vue/Angular components
5. **API Development**: Create REST/GraphQL endpoints
6. **Database Schemas**: Generate migrations and models
7. **Test Generation**: Create unit and integration tests
8. **Documentation**: Generate README files and docs

## Future Enhancements (Roadmap)

- [ ] Real-time collaboration
- [ ] Code diff visualization
- [ ] Version control integration (Git)
- [ ] Export to GitHub/GitLab
- [ ] Template library
- [ ] Code review features
- [ ] AI-powered code suggestions
- [ ] Multi-language prompts
- [ ] Voice input support
- [ ] Browser-based code execution
- [ ] Plugin system
- [ ] Custom system prompts per project
- [ ] Team workspaces
- [ ] Usage analytics
- [ ] Cost tracking

## Limitations

- **API Rate Limits**: Subject to Anthropic API limits
- **Token Limits**: 8000 max tokens per generation
- **File Size**: 10MB request limit
- **Database Storage**: Limited by PostgreSQL instance
- **Concurrent Generations**: One at a time per user (by design)

## Configuration Options

### Claude Service
- Model: `claude-sonnet-4-5-20250929`
- Max Tokens: `8000`
- Temperature: `0.7`
- System Prompt: Customizable in `claudeAgent.ts`

### Server
- Port: Configurable via `.env`
- CORS: Configurable origins
- Body Parser Limit: `10MB`
- JWT Expiration: `7 days`

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Mobile Support

Responsive design optimized for:
- Tablets (iPad, Android tablets)
- Mobile phones (limited functionality)
- Desktop browsers (optimal experience)

---

For more information, see the main [README.md](./README.md) and [SETUP.md](./SETUP.md).
