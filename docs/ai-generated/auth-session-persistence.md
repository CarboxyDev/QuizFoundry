# Auth Session Persistence: 2-Week Login Implementation

This document summarizes the changes made to enable persistent user sessions ("keep users logged in for 2 weeks") in the mono-sandbox project.

---

## 1. Supabase Auth Config Changes

**File:** `supabase/config.toml`

- **Set JWT expiry to 1 week (Supabase max):**
  ```toml
  jwt_expiry = 604800  # 1 week in seconds
  ```
- **Enable 2-week session persistence:**
  ```toml
  [auth.sessions]
  timebox = "14d"           # Absolute session lifetime
  inactivity_timeout = "14d" # Session expires after 14 days of inactivity
  ```

---

## 2. Frontend: Refresh Token Logic

**Files:**

- `frontend/src/lib/auth.ts`
- `frontend/src/hooks/auth/useAuth.tsx`

### a. Add Refresh Logic

- Added `refreshAuthSession()` in `lib/auth.ts`:
  - Uses Supabase client to refresh the session with the stored refresh token.
  - Updates localStorage with new tokens.
  - Returns the new session or clears auth if refresh fails.

### b. Use Refresh on Mount

- In `AuthProvider` (`useAuth.tsx`):
  - On mount, if the access token is expired, attempts to refresh the session before logging out.
  - If refresh succeeds, user stays logged in; if not, user is logged out.

---

## 3. User Experience

- Users stay logged in for up to 2 weeks, even if their access token expires, as long as the refresh token is valid.
- No more frequent logouts after 1 hour.

---

## 4. Summary Table

| Change Area   | Before           | After (Now)      |
| ------------- | ---------------- | ---------------- |
| JWT Expiry    | 1 hour           | 1 week           |
| Session Max   | N/A              | 2 weeks          |
| Refresh Logic | Not implemented  | Implemented      |
| UX            | Frequent logouts | Persistent login |

---

**All changes are now live.**
