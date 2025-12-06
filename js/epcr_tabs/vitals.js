import { supabase } from "../supabase.js";
import { autosave } from "../epcr_autosave.js";

export const template = `
<div class="tab-page active">
  <div class="section-card">
    <div class="section-title">Vitals</div>

    <label>Heart Rate</label>
    <input id="hr" type="number">

    <label>Respirations</label>
    <input id="rr" type="number">

    <label>Blood Pressure</label>
    <input id="bp">
  </div>
</div>
`;

export async function load(epcrId) {
  const { data } = await supabase
    .from("epcr_vitals")
    .select("*")
    .eq("epcr_id", epcrId)
    .single();

  if (!data) return;

  document.getElementById("hr").value = data.hr ?? "";
  document.getElementById("rr").value = data.rr ?? "";
  document.getElementById("bp").value = data.bp ?? "";
}

export function enableAutosave(epcrId) {
  autosave(["hr", "rr", "bp"], async () => {
    await supabase.from("epcr_vitals").upsert({
      epcr_id: epcrId,
      hr: document.getElementById("hr").value,
      rr: document.getElementById("rr").value,
      bp: document.getElementById("bp").value
    });
  });
}
