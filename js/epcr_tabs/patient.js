import { supabase } from "../supabase.js";
import { autosave } from "../epcr_autosave.js";

export const template = `
<div class="tab-page active">
  <div class="section-card">
    <div class="section-title">Demographics</div>

    <label>First Name</label>
    <input id="firstName">

    <label>Last Name</label>
    <input id="lastName">

    <label>Date of Birth</label>
    <input id="dob" type="date">

    <label>Gender</label>
    <select id="gender">
      <option value="">Select</option>
      <option>M</option>
      <option>F</option>
      <option>Other</option>
    </select>
  </div>

  <div class="section-card">
    <div class="section-title">Chief Complaint</div>
    <textarea id="chiefComplaint"></textarea>
  </div>
</div>
`;

export async function load(epcrId) {
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

export function enableAutosave(epcrId) {
  autosave(
    ["firstName", "lastName", "dob", "gender", "chiefComplaint"],
    async () => {
      await supabase.from("epcr_demographics").upsert({
        epcr_id: epcrId,
        first_name: document.getElementById("firstName").value,
        last_name: document.getElementById("lastName").value,
        dob: document.getElementById("dob").value,
        gender: document.getElementById("gender").value,
        chief_complaint: document.getElementById("chiefComplaint").value
      });
    }
  );
}
