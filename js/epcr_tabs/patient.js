import { supabase } from "../supabase.js";

export async function loadTabData(epcrId) {
  const { data } = await supabase
    .from("epcr_demographics")
    .select("*")
    .eq("epcr_id", epcrId)
    .single();

  if (!data) return;

  document.getElementById("firstName").value = data.first_name ?? "";
  document.getElementById("lastName").value = data.last_name ?? "";
  document.getElementById("dob").value = data.dob ?? "";
  document.getElementById("gender").value = data.gender ?? "";
  document.getElementById("chiefComplaint").value = data.chief_complaint ?? "";
}

/* -----------------------------------------
   AUTOSAVE ENGINE
----------------------------------------- */

export function enableAutosave(epcrId) {
  const fields = ["firstName", "lastName", "dob", "gender", "chiefComplaint"];

  fields.forEach(id => {
    document.getElementById(id).addEventListener("input", () => {
      document.getElementById("autosave").textContent = "Saving…";
      queueSave(epcrId);
    });
  });
}

let saveTimer = null;

function queueSave(epcrId) {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => save(epcrId), 400);
}

async function save(epcrId) {
  await supabase.from("epcr_demographics").upsert({
    epcr_id: epcrId,
    first_name: document.getElementById("firstName").value,
    last_name: document.getElementById("lastName").value,
    dob: document.getElementById("dob").value,
    gender: document.getElementById("gender").value,
    chief_complaint: document.getElementById("chiefComplaint").value
  });

  document.getElementById("autosave").textContent = "Saved";
}
