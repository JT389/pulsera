import { supabase } from "./supabase.js";

/* =====================================================
   CONFIG
===================================================== */

const INCIDENT_ID = localStorage.getItem("currentIncidentId");

const incidentName = document.getElementById("incidentName");
const incidentAgency = document.getElementById("incidentAgency");

const countGreen = document.getElementById("countGreen");
const countYellow = document.getElementById("countYellow");
const countRed = document.getElementById("countRed");
const countBlack = document.getElementById("countBlack");
const countNone = document.getElementById("countNone");

const patientList = document.getElementById("patientList");

let currentSort = "newest";
let currentColorFilter = null;
let currentConditionFilter = null;

/* Sorting buttons */
const sortButtons = document.querySelectorAll(".sort-option");

/* Sidebar filtering */
const sidebarFilters = document.querySelectorAll(".sidebar-option");

/* =====================================================
   INITIAL LOAD
===================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  if (!INCIDENT_ID) {
    alert("No incident selected.");
    return;
  }

  await loadIncident();
  await loadPatients();
});

/* =====================================================
   CREATE PATIENT BUTTON
===================================================== */

const createBtn = document.getElementById("createPatientBtn");

if (createBtn) {
  createBtn.addEventListener("click", () => {
    // TEMP: redirect to patient creation page
    // Later we will replace this with a modal
    window.location.href = "epcr.html?new=1";
  });
}


/* =====================================================
   REALTIME UPDATES
===================================================== */

supabase
  .channel("patients-realtime")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "patients",
      filter: `incident_id=eq.${INCIDENT_ID}`,
    },
    async payload => {
      console.log("Realtime update:", payload);
      await loadPatients();
      flashCard(payload.new?.id || payload.old?.id);
    }
  )
  .subscribe();

function flashCard(id) {
  const card = document.getElementById(`patient-${id}`);
  if (!card) return;
  card.classList.add("flash");
  setTimeout(() => card.classList.remove("flash"), 300);
}

/* =====================================================
   LOAD INCIDENT HEADER
===================================================== */

async function loadIncident() {
  const { data, error } = await supabase
    .from("incidents")
    .select("*")
    .eq("id", INCIDENT_ID)
    .single();

  if (error) {
    console.error("Failed to load incident:", error);
    return;
  }

  incidentName.textContent = data.name;
  incidentAgency.textContent = data.agency ?? "Unknown Agency";

  countGreen.textContent = data.green_count ?? 0;
  countYellow.textContent = data.yellow_count ?? 0;
  countRed.textContent = data.red_count ?? 0;
  countBlack.textContent = data.black_count ?? 0;
  countNone.textContent = data.none_count ?? 0;
}

/* =====================================================
   LOAD PATIENT LIST
===================================================== */

async function loadPatients() {
  let query = supabase.from("patients").select("*").eq("incident_id", INCIDENT_ID);

  if (currentColorFilter) query = query.eq("triage_color", currentColorFilter);
  if (currentConditionFilter) query = query.eq("condition", currentConditionFilter);

  if (currentSort === "newest") query = query.order("created_at", { ascending: false });
  if (currentSort === "eta") query = query.order("eta_minutes", { ascending: true, nullsFirst: true });
  if (currentSort === "type") query = query.order("triage_color", { ascending: true });

  const { data, error } = await query;

  if (error) {
    console.error("Failed to load patients:", error);
    return;
  }

  renderPatients(data);
}

/* =====================================================
   RENDER PATIENT CARDS
===================================================== */

function renderPatients(list) {
  patientList.innerHTML = "";

  list.forEach(p => {
    const div = document.createElement("div");
    div.classList.add("patient-card");
    div.id = `patient-${p.id}`;

    div.innerHTML = `
      <div>
        <div class="patient-tag tag-${p.triage_color}">${p.triage_color.toUpperCase()}</div>
        <div class="patient-name">${p.first_name} ${p.last_name}</div>
        <div class="patient-age-gender">${p.age}y • ${p.gender}</div>
        <div class="patient-status">${p.chief_complaint}</div>
      </div>

      <div>
        <div class="patient-status"><strong>Unit:</strong> ${p.unit_assignment ?? "N/A"}</div>
        <div class="patient-status"><strong>ETA:</strong> ${
          p.eta_minutes ? p.eta_minutes + " min" : "Unknown"
        }</div>
      </div>

      <div>
        <div class="patient-status"><strong>Destination:</strong></div>
        <div class="patient-status">${p.facility ?? "Not set"}</div>
      </div>

      <div class="patient-actions">
        <button class="card-btn">Notes</button>
        <button class="card-btn">Tags</button>
        <button class="card-btn">⋮</button>
      </div>
    `;

    div.onclick = () => {
      localStorage.setItem("currentPatientId", p.id);
      window.location.href = "epcr.html";
    };

    patientList.appendChild(div);
  });
}

/* =====================================================
   SORTING UI
===================================================== */

sortButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    sortButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentSort = btn.dataset.sort;
    loadPatients();
  });
});

/* =====================================================
   SIDEBAR FILTER UI
===================================================== */

sidebarFilters.forEach(option => {
  option.addEventListener("click", () => {
    if (option.dataset.color) currentColorFilter = option.dataset.color;
    if (option.dataset.filter) currentConditionFilter = option.dataset.filter;
    loadPatients();
  });
});
