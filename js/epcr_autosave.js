export function autosave(fields, callback) {
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("input", () => {
      document.getElementById("autosave").textContent = "Saving...";

      clearTimeout(el._saveTimeout);
      el._saveTimeout = setTimeout(async () => {
        await callback();
        document.getElementById("autosave").textContent = "Saved";
      }, 600);
    });
  });
}
