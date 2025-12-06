// js/profile.js
import { supabase } from "./supabase.js";

/* =====================================================
   AUTH GUARD — Redirect to login if not logged in
===================================================== */

export async function requireAuth() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    window.location.href = "index.html";
    return null;
  }

  return user;
}

/* =====================================================
   LOAD EMS PROFILE — Loads profile from EMS_Profile table
===================================================== */

export async function loadEMSProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("ems_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Profile load error:", error);
    return null;
  }

  // Cache locally for speed
  localStorage.setItem("ems_profile", JSON.stringify(data));

  return data;
}

/* =====================================================
   LOGOUT
===================================================== */

export async function logout() {
  await supabase.auth.signOut();
  localStorage.clear();
  window.location.href = "index.html";
}
