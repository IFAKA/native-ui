document.querySelectorAll('[data-dialog-trigger]').forEach(trigger => trigger.addEventListener('click', () => document.getElementById(trigger.dataset.dialogTrigger)?.showModal()))
