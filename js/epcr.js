import { supabase } from "./supabase.js";

/* ==========================================================
   CONFIG / GLOBALS
========================================================== */

let EPCR_ID = null;
const PATIENT_ID = localStorage.getItem("currentPatientId");

document.addEventListener("DOMContentLoaded", async () => {
  if (!PATIENT_ID) {
    alert("No patient selected.");
    return;
  }

  await loadPatientHeader();
  await loadOrCreateEpcr();

  setupTabs();
  loadTab("patient"); // Default tab
});

/* ==========================================================
   LOAD PATIENT HEADER
========================================================== */

async function loadPatientHeader() {
  const { data, error } = await supabase
    .from("patients")
    .select("first_name, last_name")
    .eq("id", PATIENT_ID)
    .single();

  if (error) {
    console.error("Failed to load patient header:", error);
    return;
  }

  document.getElementById("patientName").textContent =
    `${data.first_name} ${data.last_name}`;
}

/* ==========================================================
   LOAD OR CREATE EPCR RECORD
========================================================== */

async function loadOrCreateEpcr() {
  // Look for existing record
  const { data, error } = await supabase
    .from("pcrs")
    .select("*")
    .eq("patient_id", PATIENT_ID)
    .maybeSingle();

  if (error) console.warn("EPCR lookup error:", error);

  if (data) {
    EPCR_ID = data.id;
    return;
  }

  // Create one if none exists
  const { data: created, error: insertErr } = await supabase
    .from("pcrs")
    .insert({ patient_id: PATIENT_ID })
    .select()
    .single();

  if (insertErr) {
    console.error("Failed to create PCR record:", insertErr);
    return;
  }

  EPCR_ID = created.id;
}

/* ==========================================================
   TAB SYSTEM
========================================================== */

function setupTabs() {
  const tabs = document.querySelectorAll(".tab");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      loadTab(tab.dataset.tab);
    });
  });
}

/* ==========================================================
   LOAD A DYNAMIC TAB MODULE
========================================================== */

async function loadTab(tabName) {
  const container = document.getElementById("epcrContent");

  container.innerHTML = `
    <div class="loading">
      <span>Loading ${tabName}...</span>
    </div>
  `;

  try {
    // Dynamic import of tab
    const module = await import(`./epcr_tabs/${tabName}.js`);

    // Inject HTML template
    container.innerHTML = module.template;

    // Load PCR data for this tab
    if (module.load) await module.load(EPCR_ID);

    // Enable autosave if provided
    if (module.enableAutosave) module.enableAutosave(EPCR_ID);

  } catch (err) {
    console.error(`Failed to load tab '${tabName}'`, err);

    container.innerHTML = `
      <div class="error">
        Error: Could not load ${tabName} tab.
      </div>
    `;
  }
}
