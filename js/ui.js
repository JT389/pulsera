// ui.js — Pulsera Tab Switching

document.addEventListener("DOMContentLoaded", () => {

  const buttons = document.querySelectorAll(".tab-btn");
  const sections = document.querySelectorAll(".tab-content");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const tab = btn.dataset.tab;

      sections.forEach((s) => {
        s.classList.remove("active");
        if (s.id === "tab-" + tab) {
          s.classList.add("active");
        }
      });
    });
  });

});
