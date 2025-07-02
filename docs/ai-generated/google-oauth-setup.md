# Google OAuth Setup

This document explains how to set up Google OAuth authentication for the application.

## ⚠️ Important: Cloud Supabase Required

**Google OAuth requires a publicly accessible Supabase instance.** If you're currently using local Supabase, you'll need to migrate to cloud Supabase first. See [migration-guide.md](./migration-guide.md) for detailed instructions.

## Required Environment Variables

### Frontend (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:2003/api
```

### Backend (.env)

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=2003
FRONTEND_URL=http://localhost:4000
```

## Supabase Configuration

1. **Enable Google OAuth Provider**
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable Google provider
   - Add your Google OAuth credentials (Client ID and Secret)

2. **Configure Redirect URLs**
   - Add these URLs to your Google OAuth app:
     - `https://<your-supabase-ref>.supabase.co/auth/v1/callback`
     - `http://localhost:4000/auth/callback` (for development)

3. **Google Cloud Console Setup**
   - Create a new project in Google Cloud Console
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs
   - Copy Client ID and Secret to Supabase

## OAuth Flow

1. User clicks "Sign up with Google" on signup page
2. Redirects to Google OAuth consent screen
3. User authorizes the application
4. Google redirects back to `/auth/callback`
5. Frontend gets Supabase session and calls backend
6. Backend creates user profile if needed
7. User is redirected to onboarding or dashboard

## Database Tables

The application uses these Supabase tables:

- `auth.users` - Managed by Supabase Auth
- `profiles` - User profiles (managed by our app)
- `onboarding_progress` - Onboarding status

## Testing

To test Google OAuth:

1. Set up environment variables
2. Configure Google OAuth in Supabase
3. Start both frontend and backend servers
4. Navigate to signup page and click "Sign up with Google"

## Notes

- Google OAuth users will not have passwords in Supabase Auth
- All Google users must complete onboarding to set their name and role
- The application handles both new and returning Google users
- Profile creation happens automatically on first Google sign-in
