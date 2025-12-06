// js/supabase.js
// Supabase client initialization for GitHub Pages (ESM version)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// IMPORTANT: Replace these values with YOUR values
const SUPABASE_URL = "https://ghvfvqqtlyisdrskzgbc.supabase.co";
const SUPABASE_KEY = "sb-publishable_H5PI_4IkPiPeJ7LrzhyVA_BZdKLsS44";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);