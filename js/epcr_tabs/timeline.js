import { supabase } from "../supabase.js";
import { autosave } from "../epcr_autosave.js";

export const template = `
<div class="tab-page active">
  <div class="section-card">
    <div class="section-title">Timeline Events</div>
    <textarea id="timeline"></textarea>
  </div>
</div>
`;

export async function load(epcrId) {
  const { data } = await supabase
    .from("epcr_timeline")
    .select("*")
    .eq("epcr_id", epcrId)
    .single();

  if (!data) return;

  document.getElementById("timeline").value = data.timeline ?? "";
}

export function enableAutosave(epcrId) {
  autosave(["timeline"], async () => {
    await supabase.from("epcr_timeline").upsert({
      epcr_id: epcrId,
      timeline: document.getElementById("timeline").value
    });
  });
}
