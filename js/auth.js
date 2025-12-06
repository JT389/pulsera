import { supabase } from "./supabase.js";

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) return { error };

  const userId = data.user.id;

  // Load profile
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (profileErr) {
    return { error: { message: "Profile not found." } };
  }

  // Save session locally
  localStorage.setItem("currentUserId", userId);
  localStorage.setItem("currentUserRole", profile.role);
  localStorage.setItem("currentUserName", profile.name);
  localStorage.setItem("currentUserUnit", profile.unit);

  return { error: null };
}
