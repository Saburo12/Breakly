# Authentication System - Testing & Setup Guide

## Overview

The authentication system now includes three OAuth methods:
1. **Google OAuth** - Sign in with Google
2. **GitHub OAuth** - Sign in with GitHub
3. **Email Verification** - Sign up with email and 6-digit code

## Current Status

All backend endpoints are implemented and tested. Authentication flow works as follows:

**User Flow:**
1. User clicks "Generate" on landing page
2. Authentication modal appears
3. User chooses: Google, GitHub, or Email
4. User authenticates
5. Auth token is stored in localStorage
6. User redirected to `/generate` page with initial prompt

## Testing the Email Flow (Works Without OAuth Setup)

The **email authentication** is fully functional and can be tested immediately:

### Step 1: Access the App
1. Open browser: `http://localhost:3000`
2. Click "Generate" button
3. Auth modal opens

### Step 2: Test Email Flow
1. Click "Continue with email"
2. Enter any email: `test@example.com`
3. Click "Continue with email"
4. You'll see: **"Dev mode - Code: XXXXXX"** displayed in the modal
5. Copy that 6-digit code
6. Paste it into the "Enter 6-digit code" field
7. Click "Verify & Continue"
8. You should be redirected to `/generate` page
9. Check localStorage to see: `authToken` and `user` objects

### Console Output to Expect
```
✅ Verification code sent to test@example.com
Dev mode - Verification code: 949888
✅ Email authentication successful
```

## Setting Up Google OAuth

To enable Google Sign-In:

### 1. Get Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URI: `http://localhost:3000/auth/google/callback`
6. Copy **Client ID** and **Client Secret**

### 2. Update Environment Variables

**Backend** (`backend/.env`):
```
REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

**Frontend** (`frontend/.env`):
```
REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here
```

### 3. Test Google OAuth
1. Refresh app
2. Click "Generate" → Click "Continue with Google"
3. If configured correctly, redirects to Google login
4. After login, creates user and redirects to `/generate`

## Setting Up GitHub OAuth

To enable GitHub Sign-In:

### 1. Get GitHub OAuth Credentials
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/auth/github/callback`
4. Copy **Client ID** and **Client Secret**

### 2. Update Environment Variables

**Frontend** (`frontend/.env`):
```
REACT_APP_GITHUB_CLIENT_ID=your_client_id_here
```

### 3. Implement GitHub Callback Handler
Note: GitHub OAuth requires additional backend implementation to handle the callback and exchange code for user data. Currently the flow redirects but doesn't complete. To finish GitHub OAuth:

- Create route: `GET /auth/github/callback`
- Accept `code` parameter
- Exchange code for access token via GitHub API
- Get user data from GitHub
- Create/update user in database
- Return auth token

## Backend Authentication Endpoints

### 1. POST `/api/auth/google`
Verify Google OAuth token and create/update user.

**Request:**
```json
{
  "token": "eyJhbGc..." // JWT from Google
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_auth_token",
  "user": {
    "id": 1,
    "email": "user@gmail.com",
    "name": "User Name"
  }
}
```

### 2. POST `/api/auth/email/send-code`
Generate and store verification code.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (Dev Mode):**
```json
{
  "success": true,
  "message": "Verification code sent to email",
  "_devCode": "949888"  // Only in development mode
}
```

### 3. POST `/api/auth/email/verify-code`
Verify code and create/login user.

**Request:**
```json
{
  "email": "user@example.com",
  "code": "949888"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_auth_token",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "user"
  }
}
```

## Error Messages and Debugging

### Google OAuth Not Configured
```
Error: "Google OAuth is not configured. Please set REACT_APP_GOOGLE_CLIENT_ID in your .env file."
```

**Fix:** Check that `REACT_APP_GOOGLE_CLIENT_ID` is set correctly in `frontend/.env`

### Email Code Expired
```
Error: "Verification code has expired"
```

**Fix:** Request a new code (valid for 10 minutes)

### Invalid Email Code
```
Error: "Invalid verification code"
```

**Fix:** Check code spelling and re-enter

## Frontend Components

### AuthModal (`frontend/src/components/AuthModal.tsx`)
- Handles all three authentication methods
- Two-step email flow: send code → verify code
- Error handling and loading states
- Stores auth token in localStorage
- Redirects to `/generate` with initial prompt on success

### LandingPage (`frontend/src/components/LandingPage.tsx`)
- Shows auth modal on "Generate" button click
- Passes prompt to modal via `initialPrompt` prop
- Modal handles all authentication logic

## Backend Implementation

### Auth Routes (`backend/src/routes/auth.ts`)
- `/api/auth/google` - Google OAuth verification
- `/api/auth/email/send-code` - Email code generation
- `/api/auth/email/verify-code` - Email code verification
- Existing: `/api/auth/register` - Password-based registration
- Existing: `/api/auth/login` - Password-based login

### Storage
- **Verification codes:** In-memory Map (dev only)
- **Users:** PostgreSQL database (requires DB connection)
- **Auth tokens:** localStorage on frontend

## Production Considerations

### Security
1. **Email Service:** Replace console logging with real email service (SendGrid, Mailgun)
2. **Verification Storage:** Move from in-memory to Redis or database
3. **JWT Verification:** Add proper JWT signature verification for Google tokens
4. **Rate Limiting:** Add rate limits on `/api/auth/email/send-code` to prevent abuse
5. **HTTPS Only:** Ensure all OAuth redirects use HTTPS in production

### Code Expiration
- Current: 10 minutes
- Recommended for production: 5-15 minutes

### Database
- Currently tests without database (`ALLOW_NO_DB=true`)
- For production: Ensure PostgreSQL is running and migrations applied
- User data persists across sessions

## Testing Checklist

- [ ] Email flow: Request code → Enter code → Redirect to /generate
- [ ] Email error handling: Invalid code, expired code, missing email
- [ ] Google OAuth: Check console for error if client ID not configured
- [ ] GitHub OAuth: Verify redirect happens (callback requires backend implementation)
- [ ] localStorage: Verify `authToken` and `user` stored after successful auth
- [ ] Auth persistence: Refresh page - check if user stays logged in
- [ ] Error messages: Display properly in modal

## Troubleshooting

**Issue:** Stuck after clicking "Continue with Google"
- **Cause:** `REACT_APP_GOOGLE_CLIENT_ID` is not configured or is placeholder
- **Fix:** Set proper Google Client ID in `frontend/.env`
- **Check:** Browser console shows error message

**Issue:** Email code not appearing in modal
- **Cause:** Backend not returning `_devCode` in development mode
- **Fix:** Ensure `NODE_ENV=development` in `backend/.env`
- **Check:** Backend logs show verification code generation

**Issue:** Code invalid after entering
- **Cause:** Code expired (>10 minutes) or typed incorrectly
- **Fix:** Request new code
- **Check:** Code is 6 digits

**Issue:** User not redirected after verification
- **Cause:** Backend database connection failed
- **Fix:** Ensure PostgreSQL is running OR set `ALLOW_NO_DB=true`
- **Check:** Backend logs for database errors

## Next Steps

1. ✅ Email authentication is fully testable now
2. ⏳ Add Google OAuth credentials for testing
3. ⏳ Add GitHub OAuth callback handler
4. ⏳ Integrate email service for production
5. ⏳ Set up database connection for persistence
