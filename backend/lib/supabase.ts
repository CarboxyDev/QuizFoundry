import { createClient } from "@supabase/supabase-js";

// Service role client for backend operations
// Note: We use the service role key for all backend operations
// as we handle authentication manually via middleware
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
export { supabaseAdmin };
