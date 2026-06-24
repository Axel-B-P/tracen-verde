import { createClient } from "@supabase/supabase-js";

// External Supabase project (publishable anon key — safe to expose client-side)
const SUPABASE_URL = "https://wpfhyrccqmbkwvzdbvsj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwZmh5cmNjcW1ia3d2emRidnNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNjM1NTcsImV4cCI6MjA5NzgzOTU1N30.3VYUI_u6m_PrZYVn_t4uE50hOG0HrRBOIjFjii4riOE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
