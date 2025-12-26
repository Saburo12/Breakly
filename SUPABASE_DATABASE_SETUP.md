# Supabase Database Migration Guide

Your app has been migrated from PostgreSQL to **Supabase PostgreSQL**! This guide will help you set up the database tables and storage.

## What Changed?

### ✅ Database Layer
- **Removed**: `pg` (node-postgres) Pool
- **Added**: Supabase client with type-safe query builder
- **Removed**: Manual connection pooling
- **Added**: Automatic connection pooling via Supabase

### ✅ Models Migrated
1. **Users** → **Profiles** (works with `auth.users`)
2. **Projects** → UUID-based with RLS policies
3. **Files** → UUID-based with RLS policies
4. **Generations** → UUID-based with RLS policies

### ✅ Security Improvements
- Row Level Security (RLS) policies on all tables
- Users can only access their own data
- Automatic profile creation on signup
- Secure file access based on project ownership

## 🚀 Setup Instructions

### Step 1: Run the SQL Migration

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the sidebar
3. Click **New query**
4. Copy the entire contents of [`supabase-migration.sql`](./supabase-migration.sql)
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl/Cmd + Enter)

This will create:
- ✅ `profiles` table
- ✅ `projects` table
- ✅ `files` table
- ✅ `generations` table
- ✅ Row Level Security (RLS) policies for all tables
- ✅ Automatic profile creation trigger
- ✅ Updated_at timestamp triggers

### Step 2: Set Up Storage Buckets

#### Create Avatars Bucket (Public)

1. Go to **Storage** in the Supabase dashboard
2. Click **Create new bucket**
3. Enter the following:
   - **Name**: `avatars`
   - **Public bucket**: ✅ Enabled
   - **File size limit**: 2MB
   - **Allowed MIME types**: `image/*`
4. Click **Create bucket**

#### Create Project Files Bucket (Private)

1. Click **Create new bucket** again
2. Enter the following:
   - **Name**: `project-files`
   - **Public bucket**: ❌ Disabled
   - **File size limit**: 10MB
   - **Allowed MIME types**: Leave empty (all files)
3. Click **Create bucket**

#### Configure Storage Policies

After creating the buckets, you need to add RLS policies:

**For Avatars Bucket:**

1. Click on the `avatars` bucket
2. Go to **Policies** tab
3. Click **New Policy**
4. Use the following policies:

```sql
-- Allow users to view all avatars (public)
CREATE POLICY "Public avatar access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow users to upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

**For Project Files Bucket:**

```sql
-- Allow users to view own project files
CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to upload project files
CREATE POLICY "Users can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update project files
CREATE POLICY "Users can update files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'project-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete project files
CREATE POLICY "Users can delete files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### Step 3: Verify Backend Configuration

Your backend is already configured! The following files have been updated:

- ✅ `backend/src/db/supabase.ts` - Supabase database client
- ✅ `backend/src/models/ProjectSupabase.ts` - Project model (Supabase)
- ✅ `backend/src/models/ProfileSupabase.ts` - Profile model (Supabase)
- ✅ `backend/src/routes/projects.ts` - Updated to use Supabase models
- ✅ `backend/src/controllers/codeGenController.ts` - Updated to use Supabase models
- ✅ `backend/src/server.ts` - Updated connection test

### Step 4: Test the Database

Restart your backend server and check for the success message:

```bash
✅ Supabase Database client initialized
✅ Supabase database connected successfully
```

## 📊 Database Schema

### Tables

#### `profiles`
- `id` (UUID, FK to auth.users.id)
- `email` (TEXT)
- `name` (TEXT, nullable)
- `avatar_url` (TEXT, nullable)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**RLS**: Users can only view/update their own profile

#### `projects`
- `id` (UUID, primary key)
- `user_id` (UUID, FK to auth.users.id)
- `name` (TEXT)
- `description` (TEXT, nullable)
- `framework` (TEXT, nullable)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**RLS**: Users can only access their own projects

#### `files`
- `id` (UUID, primary key)
- `project_id` (UUID, FK to projects.id)
- `name` (TEXT)
- `content` (TEXT)
- `type` (TEXT, nullable)
- `path` (TEXT, nullable)
- `language` (TEXT, nullable)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)
- **Unique constraint**: `(project_id, path)`

**RLS**: Users can only access files from their own projects

#### `generations`
- `id` (UUID, primary key)
- `project_id` (UUID, FK to projects.id)
- `prompt` (TEXT)
- `status` (TEXT)
- `files_generated` (INTEGER)
- `error_message` (TEXT, nullable)
- `created_at` (TIMESTAMPTZ)
- `completed_at` (TIMESTAMPTZ, nullable)

**RLS**: Users can only access generations from their own projects

## 🔒 Security Features

### Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only read their own data
- Users can only create data linked to their account
- Users can only update/delete their own data
- File access is controlled through project ownership

### Automatic Profile Creation

When a user signs up via Supabase Auth, a profile is automatically created via database trigger.

### Storage Security

- Avatar bucket is public (anyone can view)
- Users can only upload/modify their own avatars
- Project files bucket is private
- Users can only access their own project files

## 🧪 Testing Your Setup

### Test Database Connection

Start your backend:

```bash
npm run dev
```

Look for these success messages:
```
✅ Supabase Admin client initialized
✅ Supabase Database client initialized
✅ Supabase database connected successfully
```

### Test Creating a Project

1. Sign in to your app
2. Create a new project
3. Check Supabase dashboard → Table Editor → `projects`
4. You should see your new project with your `user_id`

### Test File Upload

1. Generate code in your project
2. Save the files
3. Check Supabase dashboard → Table Editor → `files`
4. You should see files linked to your `project_id`

### Test RLS Policies

Try querying another user's data in the Supabase SQL Editor (using your auth token):

```sql
-- This should only return YOUR projects, not other users'
SELECT * FROM projects;
```

## 🔄 Migration from Old PostgreSQL

If you have existing data in the old PostgreSQL database:

### Option 1: Manual Data Migration

Export your data from PostgreSQL and import into Supabase using the SQL Editor.

### Option 2: Fresh Start

Since Supabase Auth handles user management differently (UUID vs integer IDs), starting fresh is recommended. Users will need to sign up again.

## 🆘 Troubleshooting

### "Table does not exist" error

- Make sure you ran the migration SQL in Supabase SQL Editor
- Check that all tables were created successfully
- Verify RLS is enabled on all tables

### "Permission denied" error

- Check that RLS policies are created correctly
- Ensure your auth token is valid
- Verify the user_id matches in the JWT token

### Storage upload fails

- Check that storage buckets are created
- Verify RLS policies are set up for storage.objects
- Ensure file size limits are not exceeded

### Backend won't start

- Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in `.env`
- Check that credentials are correct
- Ensure no typos in environment variable names

## 📚 Next Steps

- [ ] Run SQL migration in Supabase
- [ ] Create storage buckets
- [ ] Set up storage RLS policies
- [ ] Restart backend server
- [ ] Test creating projects
- [ ] Test file generation
- [ ] (Optional) Set up database backups in Supabase

## 🎉 Benefits

- ✅ **Automatic Backups** - Supabase handles daily backups
- ✅ **Scalability** - Auto-scaling with Supabase
- ✅ **Real-time** - Can add real-time subscriptions later
- ✅ **Security** - Built-in RLS and auth integration
- ✅ **Type Safety** - TypeScript types for all queries
- ✅ **Storage** - File uploads handled by Supabase
- ✅ **No DB Management** - No need to run PostgreSQL locally

---

**Need Help?** Check the [Supabase Documentation](https://supabase.com/docs)
