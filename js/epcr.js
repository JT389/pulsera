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
  loadTab("patient");
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

  if (error) return console.error(error);

  document.getElementById("patientName").textContent =
    `${data.first_name} ${data.last_name}`;
}

/* ==========================================================
   LOAD OR CREATE EPCR
========================================================== */

async function loadOrCreateEpcr() {
  const { data } = await supabase
    .from("epcr")
    .select("*")
    .eq("patient_id", PATIENT_ID)
    .single();

  if (data) {
    EPCR_ID = data.id;
    return;
  }

  const { data: created, error } = await supabase
    .from("epcr")
    .insert({ patient_id: PATIENT_ID })
    .select()
    .single();

  if (error) return console.error(error);

  EPCR_ID = created.id;
}

/* ==========================================================
   TAB SYSTEM
========================================================== */

function setupTabs() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
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

  container.innerHTML = `<div class="loading">Loading...</div>`;

  try {
    const module = await import(`./epcr_tabs/${tabName}.js`);

    container.innerHTML = module.template;

    await module.load(EPCR_ID);
    module.enableAutosave(EPCR_ID);
  } catch (err) {
    console.error(`Failed to load tab: ${tabName}`, err);
    container.innerHTML = `<div class="error">Failed to load tab.</div>`;
  }
}
