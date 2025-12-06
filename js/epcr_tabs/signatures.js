import { supabase } from "../supabase.js";

export const template = `
<div class="tab-page active">

  <div class="section-card">
    <div class="section-title">Patient Signature</div>
    <canvas id="sigPatient" class="sig-box"></canvas>
    <button id="clearPatientSig">Clear</button>
  </div>

  <div class="section-card">
    <div class="section-title">Provider Signature</div>
    <canvas id="sigMedic" class="sig-box"></canvas>
    <button id="clearMedicSig">Clear</button>
  </div>

</div>
`;

export async function load(epcrId) {
  const { data } = await supabase
    .from("epcr_signatures")
    .select("*")
    .eq("epcr_id", epcrId)
    .single();

  const patientCanvas = document.getElementById("sigPatient");
  const medicCanvas = document.getElementById("sigMedic");

  if (data?.patient_sig) loadDataUrl(patientCanvas, data.patient_sig);
  if (data?.medic_sig) loadDataUrl(medicCanvas, data.medic_sig);

  setupCanvas(patientCanvas, epcrId, "patient_sig");
  setupCanvas(medicCanvas, epcrId, "medic_sig");
}

export function enableAutosave() {
  // signatures save instantly, no autosave needed
}

function setupCanvas(canvas, epcrId, column) {
  const ctx = canvas.getContext("2d");
  let drawing = false;

  canvas.addEventListener("mousedown", () => drawing = true);
  canvas.addEventListener("mouseup", async () => {
    drawing = false;
    await saveSignature(canvas, epcrId, column);
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(e.clientX - rect.left, e.clientY - rect.top, 2, 0, Math.PI * 2);
    ctx.fill();
  });

  document.getElementById(
    column === "patient_sig" ? "clearPatientSig" : "clearMedicSig"
  ).onclick = () => clearSignature(canvas, epcrId, column);
}

async function saveSignature(canvas, epcrId, column) {
  const png = canvas.toDataURL();

  await supabase.from("epcr_signatures").upsert({
    epcr_id: epcrId,
    [column]: png
  });

  document.getElementById("autosave").textContent = "Saved";
}

function clearSignature(canvas, epcrId, column) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  saveSignature(canvas, epcrId, column);
}

function loadDataUrl(canvas, url) {
  const img = new Image();
  img.onload = () => {
    canvas.getContext("2d").drawImage(img, 0, 0);
  };
  img.src = url;
}
