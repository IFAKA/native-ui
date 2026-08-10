const copyButtons = document.querySelectorAll("[data-copy-source]");
for (const button of copyButtons) {
  button.addEventListener("click", async () => {
    const source = document.querySelector(button.dataset.copySource);
    const status = document.querySelector(button.dataset.copyStatus);
    if (!source || !navigator.clipboard?.writeText) { if (status) status.textContent = "Select the code to copy it."; return; }
    try { await navigator.clipboard.writeText(source.textContent); if (status) status.textContent = "Copied."; }
    catch { if (status) status.textContent = "Copy was unavailable; select the code instead."; }
  });
}

for (const button of document.querySelectorAll("[data-dialog-open]")) {
  button.addEventListener("click", () => {
    const dialog = document.getElementById(button.dataset.dialogOpen);
    if (dialog?.showModal) dialog.showModal();
  });
}
