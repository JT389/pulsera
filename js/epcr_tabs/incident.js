import { supabase } from "../supabase.js";
import { autosave } from "../epcr_autosave.js";

export const template = `
<div class="tab-page active">
  <div class="section-card">
    <div class="section-title">Incident Details</div>

    <label>Incident Location</label>
    <input id="incidentLoc">

    <label>Nature of Call</label>
    <input id="incidentNature">
  </div>
</div>
`;

export async function load(epcrId) {
  const { data } = await supabase
    .from("epcr_incident")
    .select("*")
    .eq("epcr_id", epcrId)
    .single();

  if (!data) return;

  document.getElementById("incidentLoc").value = data.location ?? "";
  document.getElementById("incidentNature").value = data.nature ?? "";
}

export function enableAutosave(epcrId) {
  autosave(["incidentLoc", "incidentNature"], async () => {
    await supabase.from("epcr_incident").upsert({
      epcr_id: epcrId,
      location: document.getElementById("incidentLoc").value,
      nature: document.getElementById("incidentNature").value
    });
  });
}
