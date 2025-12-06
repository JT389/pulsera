// js/supabase.js
// Supabase client initialization for GitHub Pages (ESM version)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://ghvfvqqtlyisdrskzgbc.supabase.co";

// 🔥 IMPORTANT: USE THE EXACT PUBLISHABLE KEY — NOT THE SECRET KEY
const SUPABASE_KEY = "sb_publishable_H5PI_4lIkPiPeJ7lrzhyVA_BZdKlS44";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
