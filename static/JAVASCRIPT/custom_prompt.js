(function () {
  window.customPrompt = function (options) {
    const {
      heading = "Please Confirm",
      placeholder = "Type something...",
      confirmText = "Submit",
      cancelText = "Cancel",
      validator = (input) => !!input.trim(),       // default: non-empty input
      isUserDashboard = false
    } = options;

    const promptContainer = document.getElementById('customPrompt');
    const promptBox = promptContainer.querySelector('.prompt-box');  
    const promptHeading = document.getElementById('prompt-heading');
    const promptInput = document.getElementById('promptInput');
    const confirmBtn = document.getElementById('promptConfirmBtn');
    const cancelBtn = document.getElementById('promptCancelBtn');

    if (!promptContainer || !promptHeading || !promptInput || !confirmBtn || !cancelBtn) {
      console.error("Custom prompt elements not found in DOM");
      return Promise.reject("Prompt elements missing");
    }

    return new Promise((resolve, reject) => {
        if (isUserDashboard) {
            promptBox.classList.add('user-dashboard');
        } else {
            promptBox.classList.remove('user-dashboard');
        }

        promptHeading.textContent = heading;
        promptInput.placeholder = placeholder;
        promptInput.value = '';
        confirmBtn.textContent = confirmText;
        cancelBtn.textContent = cancelText;
        promptContainer.classList.remove('hidden');
        promptContainer.classList.add('show');
        promptInput.focus();

        const cleanUp = () => {
            promptContainer.classList.remove('show');
            setTimeout(() => {
                promptContainer.classList.add('hidden');
                confirmBtn.removeEventListener('click', onConfirm);
                cancelBtn.removeEventListener('click', onCancel);
            }, 300);
        };

        const onConfirm = () => {
            const value = promptInput.value.trim();
            if (!validator(value)) {
                promptInput.style.border = '1px solid red';
                return;
            }
            cleanUp();
            resolve(true);
        };

        const onCancel = () => {
        cleanUp();
        resolve(false);
        };

        confirmBtn.addEventListener('click', onConfirm);
        cancelBtn.addEventListener('click', onCancel);
    });
  };
})();
