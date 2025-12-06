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

/* ============================
   Load Patient Header
============================ */

async function loadPatientHeader() {
  const { data } = await supabase
    .from("patients")
    .select("first_name, last_name")
    .eq("id", PATIENT_ID)
    .single();

  document.getElementById("patientName").textContent =
    `${data.first_name} ${data.last_name}`;
}

/* ============================
   Load or Create EPCR Record
============================ */

async function loadOrCreateEpcr() {
  const { data } = await supabase
    .from("pcrs")
    .select("*")
    .eq("patient_id", PATIENT_ID)
    .maybeSingle();

  if (data) {
    EPCR_ID = data.id;
    return;
  }

  const { data: created } = await supabase
    .from("pcrs")
    .insert({ patient_id: PATIENT_ID })
    .select()
    .single();

  EPCR_ID = created.id;
  localStorage.setItem("currentEpcrId", EPCR_ID);
}

/* ============================
   Tab System
============================ */

function setupTabs() {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      loadTab(tab.dataset.tab);
    };
  });
}

/* ============================
   Load HTML Tab
============================ */

async function loadTab(tabName) {
  const container = document.getElementById("epcrContent");

  container.innerHTML = `
    <div class="loading">Loading ${tabName}...</div>
  `;

  try {
    // Fetch HTML tab file
    const res = await fetch(`epcr_tabs/${tabName}.html`);
    if (!res.ok) throw new Error("Tab HTML missing");

    const html = await res.text();
    container.innerHTML = html;

    // Because the HTML contains <script type="module">, execute it manually
    const scripts = container.querySelectorAll("script[type='module']");

    for (let oldScript of scripts) {
      const newScript = document.createElement("script");
      newScript.type = "module";
      newScript.textContent = oldScript.textContent;
      document.body.appendChild(newScript);
      oldScript.remove();
    }

  } catch (err) {
    console.error(err);
    container.innerHTML = `
      <div class="error">Failed to load ${tabName} tab.</div>
    `;
  }
}

