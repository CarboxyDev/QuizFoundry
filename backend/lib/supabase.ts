import { createClient } from "@supabase/supabase-js";

// Auth client for verifying user JWT tokens from frontend
// Uses anon key to properly verify tokens issued by Supabase Auth
const supabaseAuth = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Service role client for database operations with RLS
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Admin client for operations that need to bypass RLS
// (user creation, system-level operations)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: "public",
    },
  }
);

export default supabase;
export { supabaseAdmin, supabaseAuth };
