import { supabase } from "./supabase.js";

/* ==========================================================
   CONFIG
========================================================== */

const PATIENT_ID = localStorage.getItem("currentPatientId");
let PCR_ID = null;

const autosaveLabel = document.getElementById("autosave");

/* Field mapping between inputs and database columns */
const FIELD_MAP = {
  firstName: "first_name",
  lastName: "last_name",
  dob: "dob",
  gender: "gender",
  chiefComplaint: "chief_complaint",
  incidentLoc: "incident_location",
  incidentNature: "incident_nature",
  assessmentNotes: "assessment",
  hr: "vital_hr",
  rr: "vital_rr",
  bp: "vital_bp",
  meds: "medications",
  timeline: "timeline"
};

/* ==========================================================
   INITIALIZATION
========================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  if (!PATIENT_ID) {
    alert("No patient selected.");
    return;
  }

  await loadPatientHeader();
  await loadOrCreatePCR();
  await loadPCRData();
  prepareAutosave();
  setupTabs();
  setupSignaturePads();
});

/* ==========================================================
   LOAD PATIENT NAME FOR HEADER
========================================================== */

async function loadPatientHeader() {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", PATIENT_ID)
    .single();

  if (error) {
    console.error("Failed to load patient:", error);
    return;
  }

  document.getElementById("patientName").textContent =
    `${data.first_name} ${data.last_name}`;
}

/* ==========================================================
   LOAD OR CREATE PCR RECORD
========================================================== */

async function loadOrCreatePCR() {
  const { data, error } = await supabase
    .from("pcrs")
    .select("*")
    .eq("patient_id", PATIENT_ID)
    .single();

  if (data) {
    PCR_ID = data.id;
    return;
  }

  // Create if none exists
  const { data: created, error: createErr } = await supabase
    .from("pcrs")
    .insert({ patient_id: PATIENT_ID })
    .select()
    .single();

  if (createErr) {
    console.error("Failed to create PCR:", createErr);
    return;
  }

  PCR_ID = created.id;
}

/* ==========================================================
   LOAD EXISTING PCR DATA INTO THE FORM
========================================================== */

async function loadPCRData() {
  const { data, error } = await supabase
    .from("pcrs")
    .select("*")
    .eq("id", PCR_ID)
    .single();

  if (error) {
    console.error("Failed to load PCR:", error);
    return;
  }

  // Populate fields
  for (const [elementId, columnName] of Object.entries(FIELD_MAP)) {
    const el = document.getElementById(elementId);
    if (el && data[columnName] !== null) el.value = data[columnName];
  }

  autosaveLabel.textContent = "Saved";
}

/* ==========================================================
   AUTOSAVE ENGINE
========================================================== */

function prepareAutosave() {
  for (const elementId of Object.keys(FIELD_MAP)) {
    const el = document.getElementById(elementId);
    if (!el) continue;

    el.addEventListener("input", () => queueAutosave(elementId));
  }
}

let autosaveTimer = null;

function queueAutosave(elementId) {
  autosaveLabel.textContent = "Saving…";

  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => saveField(elementId), 500);
}

async function saveField(elementId) {
  const column = FIELD_MAP[elementId];
  const value = document.getElementById(elementId).value;

  const { error } = await supabase
    .from("pcrs")
    .update({ [column]: value })
    .eq("id", PCR_ID);

  if (error) {
    console.error("Autosave error:", error);
    autosaveLabel.textContent = "Error";
    return;
  }

  autosaveLabel.textContent = "Saved";
}

/* ==========================================================
   TAB SYSTEM
========================================================== */

function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  const pages = document.querySelectorAll(".tab-page");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;

      tabs.forEach((t) => t.classList.remove("active"));
      pages.forEach((p) => p.classList.remove("active"));

      tab.classList.add("active");
      document.getElementById(`page-${target}`).classList.add("active");
    });
  });
}

/* ==========================================================
   SIGNATURE PAD HANDLING
========================================================== */

function setupSignaturePads() {
  setupSignatureCanvas("sigPatient", "sig_patient");
  setupSignatureCanvas("sigMedic", "sig_medic");

  document.getElementById("clearPatientSig").onclick = () =>
    clearSignature("sigPatient", "sig_patient");

  document.getElementById("clearMedicSig").onclick = () =>
    clearSignature("sigMedic", "sig_medic");
}

function setupSignatureCanvas(canvasId, column) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");
  let drawing = false;

  canvas.addEventListener("mousedown", () => (drawing = true));
  canvas.addEventListener("mouseup", async () => {
    drawing = false;
    await saveSignature(canvasId, column);
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(e.clientX - rect.left, e.clientY - rect.top, 2, 0, Math.PI * 2);
    ctx.fill();
  });
}

async function saveSignature(canvasId, column) {
  autosaveLabel.textContent = "Saving…";

  const canvas = document.getElementById(canvasId);
  const dataURL = canvas.toDataURL();

  const { error } = await supabase
    .from("pcrs")
    .update({ [column]: dataURL })
    .eq("id", PCR_ID);

  if (error) {
    console.error("Signature save failed:", error);
    autosaveLabel.textContent = "Error";
    return;
  }

  autosaveLabel.textContent = "Saved";
}

function clearSignature(canvasId, column) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  saveSignature(canvasId, column);
}
