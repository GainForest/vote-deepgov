// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://pixcymxepjipzhwkfazw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpeGN5bXhlcGppcHpod2tmYXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5MTQ5MTksImV4cCI6MjA1NzQ5MDkxOX0.qjjfIRpMcF3Jxb2o_XMcjUkqQY_wjtDT8V9s-HygcSg";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);