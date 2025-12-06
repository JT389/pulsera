import { supabase } from "./supabase.js";
import { requireAuth } from "./auth.js";

requireAuth();

document.addEventListener("DOMContentLoaded", async () => {

  const form = document.getElementById("createUserForm");
  const status = document.getElementById("admin-status");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const name = document.getElementById("name").value.trim();
    const role = document.getElementById("role").value;
    const unit = document.getElementById("unit").value.trim();

    status.innerText = "Creating user...";

    // CREATE AUTH USER
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (error) {
      status.innerText = "Error: " + error.message;
      return;
    }

    // INSERT PROFILE
    await supabase.from("profiles").insert({
      user_id: newUser.user.id,
      name,
      role,
      unit
    });

    status.innerText = "User created successfully!";
    form.reset();
  });
});
