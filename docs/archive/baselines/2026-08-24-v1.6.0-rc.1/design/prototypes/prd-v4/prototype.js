const params = new URLSearchParams(window.location.search);
const allowedScreens = new Set(["setup-ready", "privacy", "setup-error", "validation"]);
const screen = allowedScreens.has(params.get("screen")) ? params.get("screen") : "setup-ready";

document.body.dataset.screen = screen;
document.querySelectorAll("[data-panel]").forEach((panel) => {
  panel.hidden = panel.dataset.panel !== screen;
});
document.querySelectorAll("[data-nav]").forEach((link) => {
  if (link.dataset.nav === screen) link.setAttribute("aria-current", "page");
});

document.querySelectorAll(".mode-option input").forEach((input) => {
  input.addEventListener("change", () => {
    document.querySelectorAll(".mode-option").forEach((option) => option.classList.remove("selected"));
    input.closest(".mode-option").classList.add("selected");
  });
});

document.querySelector("[data-theme-toggle]")?.addEventListener("click", () => {
  document.documentElement.dataset.theme = document.documentElement.dataset.theme === "dark" ? "" : "dark";
});

document.querySelector("[data-browse]")?.addEventListener("click", () => {
  document.querySelector("#notes-path")?.focus();
});

document.querySelector("[data-finish]")?.addEventListener("click", () => {
  window.location.href = "?screen=validation";
});

document.querySelector("[data-retry]")?.addEventListener("click", (event) => {
  event.currentTarget.textContent = "检查通过 ✓";
  event.currentTarget.disabled = true;
  const status = document.querySelector(".retry-success");
  if (status) status.hidden = false;
});

document.querySelector("[data-change-path]")?.addEventListener("click", () => {
  window.location.href = "?screen=setup-ready";
});
