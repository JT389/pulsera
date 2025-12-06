import { supabase } from "../supabase.js";
import { autosave } from "../epcr_autosave.js";

export const template = `
<div class="tab-page active">
  <div class="section-card">
    <div class="section-title">Medications Given</div>
    <textarea id="meds"></textarea>
  </div>
</div>
`;

export async function load(epcrId) {
  const { data } = await supabase
    .from("epcr_medications")
    .select("*")
    .eq("epcr_id", epcrId)
    .single();

  if (!data) return;

  document.getElementById("meds").value = data.meds ?? "";
}

export function enableAutosave(epcrId) {
  autosave(["meds"], async () => {
    await supabase.from("epcr_medications").upsert({
      epcr_id: epcrId,
      meds: document.getElementById("meds").value
    });
  });
}
