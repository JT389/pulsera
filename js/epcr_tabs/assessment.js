import { supabase } from "../supabase.js";
import { autosave } from "../epcr_autosave.js";

export const template = `
<div class="tab-page active">
  <div class="section-card">
    <div class="section-title">General Assessment</div>
    <textarea id="assessmentNotes"></textarea>
  </div>
</div>
`;

export async function load(epcrId) {
  const { data } = await supabase
    .from("epcr_assessment")
    .select("*")
    .eq("epcr_id", epcrId)
    .single();

  if (!data) return;

  document.getElementById("assessmentNotes").value = data.assessment ?? "";
}

export function enableAutosave(epcrId) {
  autosave(["assessmentNotes"], async () => {
    await supabase.from("epcr_assessment").upsert({
      epcr_id: epcrId,
      assessment: document.getElementById("assessmentNotes").value
    });
  });
}
