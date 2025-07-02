# Migration Guide: Local to Cloud Supabase

## Why Migrate for Google OAuth?

Google OAuth requires publicly accessible callback URLs. Local Supabase (localhost) cannot receive OAuth callbacks from Google, so you need cloud Supabase for OAuth to work.

## Option 1: Full Cloud Migration (Recommended)

### Step 1: Create Cloud Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose your region and create the project
3. Wait for it to initialize (usually 2-3 minutes)

### Step 2: Run Your Migration

Your existing migration file will work perfectly:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your new cloud project
supabase link --project-ref your-project-ref

# Push your existing migration
supabase db push
```

### Step 3: Update Environment Variables

**Frontend (.env.local):**

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_new_anon_key
NEXT_PUBLIC_API_URL=http://localhost:2003/api
```

**Backend (.env):**

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_new_service_role_key
PORT=2003
FRONTEND_URL=http://localhost:4000
```

### Step 4: Configure Google OAuth

1. In Supabase Dashboard → Authentication → Providers → Google
2. Enable Google provider
3. Add your Google OAuth credentials
4. Callback URL will be: `https://your-project-ref.supabase.co/auth/v1/callback`

## Option 2: Development with Ngrok (Temporary)

If you want to keep local Supabase for now but test OAuth:

```bash
# Install ngrok
# Expose your local Supabase (usually port 54321)
ngrok http 54321

# Use the ngrok URL in your OAuth setup
# This is only for development/testing
```

## Option 3: Hybrid Setup (Advanced)

- Keep local Supabase for database
- Use cloud Supabase only for Auth
- Requires more complex configuration

## Migration Benefits

✅ **Why migrate to cloud:**

- Google OAuth works immediately
- Better performance and reliability
- Automatic backups
- Real-time features
- Production-ready
- Free tier is generous

✅ **Your current schema will transfer perfectly:**

- `profiles` table
- `onboarding_progress` table
- All RLS policies
- All relationships

## No Data Loss

Since you're in development, you probably don't have important user data yet. But if you do, you can export/import it easily through the Supabase Dashboard.

## Recommendation

**Go with Option 1 (Full Cloud Migration)** because:

1. Your schema is simple and will migrate instantly
2. You're still in development phase
3. Cloud Supabase is free for your use case
4. Google OAuth will work immediately
5. You get production-ready infrastructure
