# Supabase Authentication Setup Guide

Your Breakly app now uses **Supabase** for authentication! All custom authentication code has been removed and replaced with Supabase Auth.

## ✅ What's Included

Supabase provides all of these features out of the box:

- ✅ **Email/Password Authentication** - Secure signup and login
- ✅ **OAuth Providers** - Google, GitHub, and more
- ✅ **Magic Link Authentication** - Passwordless email login
- ✅ **Email Verification** - Automatic email verification
- ✅ **Password Reset** - Built-in password recovery
- ✅ **Session Management** - Automatic token refresh
- ✅ **JWT Tokens** - Industry-standard authentication
- ✅ **User Management** - Built-in user dashboard

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click **"New Project"**
3. Fill in:
   - **Project Name**: `breakly` (or your preferred name)
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
4. Click **"Create new project"** and wait ~2 minutes

### Step 2: Get API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - Keep this secret!

### Step 3: Configure Environment Variables

#### Backend (.env file in root directory)

Update these values in `.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

#### Frontend (frontend/.env file)

Update these values in `frontend/.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Configure OAuth Providers (Optional)

To enable Google and GitHub login:

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Google**:
   - Follow the Google OAuth setup guide
   - Add your redirect URL: `https://your-project.supabase.co/auth/v1/callback`
3. Enable **GitHub**:
   - Create a GitHub OAuth app
   - Add your redirect URL: `https://your-project.supabase.co/auth/v1/callback`

### Step 5: Configure Email Settings (Optional)

For production, configure email:

1. Go to **Authentication** → **Email Templates**
2. Customize confirmation, magic link, and password reset emails
3. Go to **Settings** → **Auth** → **Email Auth**
4. Configure SMTP settings for custom email delivery

## 📁 What Was Changed

### Removed Files/Code
- ❌ Custom JWT token generation (`jsonwebtoken`)
- ❌ Password hashing (`bcryptjs`)
- ❌ Custom user registration/login logic
- ❌ Manual email verification codes
- ❌ Custom OAuth implementation

### New Files
- ✅ `frontend/src/lib/supabase.ts` - Supabase client configuration
- ✅ `backend/src/lib/supabase.ts` - Backend Supabase utilities
- ✅ Updated `frontend/src/components/AuthModal.tsx` - Supabase-powered auth
- ✅ Updated `backend/src/middleware/auth.ts` - Token verification
- ✅ Updated `backend/src/routes/auth.ts` - Minimal auth routes

## 🔒 Security Benefits

- ✅ **No password storage** - Supabase handles all password hashing
- ✅ **Automatic token rotation** - Secure session management
- ✅ **Built-in rate limiting** - Protection against brute force attacks
- ✅ **Email verification** - Confirmed user emails
- ✅ **GDPR compliant** - Supabase is SOC 2 Type II certified

## 📱 How Users Sign Up/Login

### Email/Password
1. User enters email and password
2. Supabase creates account and sends verification email
3. User clicks verification link
4. User is logged in automatically

### OAuth (Google/GitHub)
1. User clicks "Continue with Google"
2. Redirects to Google for authentication
3. After approval, redirects back to your app
4. User is logged in automatically

### Magic Link
1. User enters email only
2. Supabase sends magic link to email
3. User clicks link
4. User is logged in automatically

## 🧪 Testing Authentication

### Local Development

```bash
# Start your servers
npm run dev
```

1. Go to http://localhost:3000
2. Click on the generate button
3. Auth modal appears
4. Try different auth methods:
   - Email/password signup
   - Email/password signin
   - Magic link (check console for development link)
   - OAuth (if configured)

### Check User in Supabase

1. Go to Supabase dashboard
2. Navigate to **Authentication** → **Users**
3. See all registered users
4. View user metadata, sessions, and more

## 🔧 Customization

### Update Email Templates

Go to **Authentication** → **Email Templates** in Supabase to customize:
- Confirmation email
- Magic link email
- Password reset email
- Email change confirmation

### Add More OAuth Providers

Supabase supports:
- Google ✅
- GitHub ✅
- Apple
- Azure
- Discord
- Facebook
- GitLab
- And more!

## 🚨 Important Security Notes

1. **Never commit** `.env` files to git
2. **Keep service_role key secret** - Only use in backend
3. **Use anon key** for frontend - It's safe to expose
4. **Enable Row Level Security (RLS)** in Supabase for database access

## 📊 Database Schema

Supabase automatically creates the `auth.users` table. You don't need to create a custom users table!

To link user data to projects:

```sql
-- In your projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Users can only see their own projects
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);
```

## 🎉 You're All Set!

Authentication is now powered by Supabase. Enjoy:
- ✅ No password management
- ✅ Built-in security best practices
- ✅ Automatic scaling
- ✅ Professional user management dashboard
- ✅ Free tier: 50,000 monthly active users

## 🆘 Troubleshooting

### "Invalid API key" Error
- Check that you copied the correct keys from Supabase
- Make sure there are no extra spaces in the `.env` files
- Restart your development servers after changing `.env`

### OAuth Not Working
- Verify redirect URLs match exactly in OAuth provider settings
- Check that OAuth is enabled in Supabase dashboard
- Make sure you're using `https://` in production

### Emails Not Sending
- In development, check Supabase dashboard for email links
- For production, configure custom SMTP settings
- Check spam folder for verification emails

---

**Need Help?** Check the [Supabase Documentation](https://supabase.com/docs/guides/auth)
