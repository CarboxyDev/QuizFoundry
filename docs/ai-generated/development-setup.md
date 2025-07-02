# Development Setup Guide

## Optimal Development Configuration

After migrating to cloud Supabase, here's the recommended setup for development that allows you to:

- Use Google OAuth (requires cloud Supabase)
- Test with local backend (for debugging and development)
- Share database state across team members

## Environment Configuration

### Frontend (.env.local)

```env
# Cloud Supabase (required for OAuth)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_cloud_anon_key

# Local Backend API (for development)
NEXT_PUBLIC_API_URL=http://localhost:2003/api
```

### Backend (.env)

```env
# Cloud Supabase (same instance as frontend)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_cloud_service_role_key

# Local Backend Configuration
PORT=2003
FRONTEND_URL=http://localhost:4000
```

## Data Flow

```
Frontend (localhost:4000)
├── Auth: Cloud Supabase (OAuth, sessions)
└── API: Local Backend (localhost:2003)
    └── Database: Cloud Supabase (profiles, data)
```

## Benefits of This Setup

✅ **Google OAuth works** - Cloud Supabase handles OAuth callbacks  
✅ **Local backend debugging** - Set breakpoints, view logs, make changes  
✅ **Shared database** - Team members see same data  
✅ **Fast development** - No deployment needed for backend changes  
✅ **Auth compatibility** - Tokens work between frontend and backend

## Testing Your Setup

1. Start your local backend:

   ```bash
   cd backend
   pnpm dev
   ```

2. Start your frontend:

   ```bash
   cd frontend
   pnpm dev
   ```

3. Test the flow:
   - Visit `http://localhost:4000/signup`
   - Click "Sign up with Google"
   - Should redirect to Google → back to your app
   - Backend logs should show API calls
   - Database should update in cloud Supabase

## Production Deployment

When you deploy to production:

### Frontend (Production)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_cloud_anon_key
NEXT_PUBLIC_API_URL=https://your-production-backend.com/api
```

### Backend (Production)

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_cloud_service_role_key
PORT=2003
FRONTEND_URL=https://your-production-frontend.com
```

## Common Issues & Solutions

### Issue: "Invalid token" errors

**Solution:** Make sure both frontend and backend use the same Supabase project

### Issue: CORS errors

**Solution:** Check `FRONTEND_URL` in backend .env matches your frontend URL

### Issue: OAuth redirect fails

**Solution:** Ensure redirect URL in Google Console includes your exact domain

## Alternative Setups

### Option A: All Local (Limited)

- ❌ Google OAuth won't work
- ✅ Fully offline development
- Use for non-OAuth features only

### Option B: All Cloud (Production-like)

- ✅ Exact production environment
- ❌ Slower development cycle
- ❌ Need to deploy backend for every change

### Option C: Hybrid (Recommended)

- ✅ Best of both worlds
- ✅ OAuth works + local backend debugging
- This is what we've configured above
