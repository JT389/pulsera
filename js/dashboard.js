import { supabase } from "./supabase.js";
import { requireAuth, logout } from "./auth.js";

requireAuth();

document.addEventListener("DOMContentLoaded", async () => {

  // Logout button
  document.getElementById("logout-btn").onclick = logout;

  const { data: userData } = await supabase.auth.getUser();
  const user_id = userData.user.id;

  // Load profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user_id)
    .single();

  document.getElementById("user-name").innerText = profile.name;
  document.getElementById("unit").innerText = profile.unit;

  // Load PCRs
  loadPCRs(user_id);

  // Create new PCR button
  document.getElementById("newPCRBtn").onclick = createNewPCR;
});

async function loadPCRs(user_id) {
  const { data: pcrs } = await supabase
    .from("pcrs")
    .select("*")
    .eq("user_id", user_id)
    .order("updated_at", { ascending: false });

  const container = document.getElementById("pcrList");
  container.innerHTML = "";

  pcrs.forEach((p) => {
    const card = document.createElement("div");
    card.className = "pcr-card";

    card.innerHTML = `
      <h3>${p.patient_name || "Unnamed Patient"}</h3>
      <p>Status: ${p.status}</p>
      <button class="pulsera-btn" onclick="location.href='epcr.html?pcr=${p.id}'">Open</button>
    `;

    container.appendChild(card);
  });
}

async function createNewPCR() {
  const { data: userData } = await supabase.auth.getUser();
  const user_id = userData.user.id;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user_id)
    .single();

  const { data: pcr } = await supabase
    .from("pcrs")
    .insert({
      user_id,
      unit: profile.unit,
      status: "draft",
    })
    .select()
    .single();

  window.location.href = `epcr.html?pcr=${pcr.id}`;
}
