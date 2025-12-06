import { supabase } from "./supabase.js";

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

/* ============================================================
   LOAD PATIENT HEADER
============================================================ */

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

/* ============================================================
   LOAD OR CREATE EPCR RECORD
============================================================ */

async function loadOrCreateEpcr() {
  const { data, error } = await supabase
    .from("pcrs")
    .select("*")
    .eq("patient_id", PATIENT_ID)
    .maybeSingle();

  if (error) console.warn("EPCR lookup error:", error);

  if (data) {
    EPCR_ID = data.id;
    localStorage.setItem("currentEpcrId", EPCR_ID);
    return;
  }

  // Create new PCR record
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
  localStorage.setItem("currentEpcrId", EPCR_ID);
}

/* ============================================================
   TAB SYSTEM
============================================================ */

function setupTabs() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      loadTab(tab.dataset.tab);
    });
  });
}

/* ============================================================
   LOAD TAB (HTML + JS MODULE)
============================================================ */

async function loadTab(tabName) {
  const container = document.getElementById("epcrContent");

  container.innerHTML = `
    <div class="loading">Loading ${tabName}...</div>
  `;

  try {
    /* ----- Load the HTML for the tab ----- */
    const htmlRes = await fetch(`epcr_tabs/${tabName}.html`);
    if (!htmlRes.ok) throw new Error(`Missing HTML for tab: ${tabName}`);

    const html = await htmlRes.text();
    container.innerHTML = html;

    /* ----- Load the JS logic for the tab ----- */
    const module = await import(`./epcr_tabs/${tabName}.js`);

    // Call loadTabData() to populate fields
    if (module.loadTabData) {
      await module.loadTabData(EPCR_ID);
    }

    // Enable autosave if provided
    if (module.enableAutosave) {
      module.enableAutosave(EPCR_ID);
    }

  } catch (err) {
    console.error(`Failed to load tab '${tabName}'`, err);

    container.innerHTML = `
      <div class="error">Failed to load ${tabName} tab.</div>
    `;
  }
}
