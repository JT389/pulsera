// js/auth.js
import { supabase } from "./supabase.js";

// Redirect to login if not authenticated
export async function requireAuth() {
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    window.location.href = "index.html";
  }
}

// LOGIN FUNCTION
export async function login(email, password) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

// LOGOUT FUNCTION
export async function logout() {
  await supabase.auth.signOut();
  window.location.href = "index.html";
}
