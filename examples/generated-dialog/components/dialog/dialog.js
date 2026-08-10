// Adapted upstream behavior. No visual-system dependency should be added here.
document.querySelectorAll('[data-dialog-trigger]').forEach(trigger => trigger.addEventListener('click', () => document.getElementById(trigger.dataset.dialogTrigger)?.showModal()))
