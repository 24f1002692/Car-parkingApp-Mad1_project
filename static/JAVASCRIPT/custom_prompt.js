(function () {
  window.customPrompt = function (options) {
    const {
      heading = "Please Confirm",
      placeholder = "Type something...",
      confirmText = "Submit",
      cancelText = "Cancel",
      validator = (input) => !!input.trim(),   // .trim() removes the whitespace, if string is "   " then .trim() => "" so, !"" is true (empty string means false), !!"" false => and so, validator not proceed the request for empty string
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
              confirmBtn.removeEventListener('click', onConfirm); // remove click events
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
      promptInput.addEventListener('keydown', (e) => {    // as user/ admin is typing in input, so they press many keyboard keys, if they press enter, then we will submit their prompt
      if (e.key === 'Enter') {
          onConfirm();
      }
    });
    cancelBtn.addEventListener('click', onCancel);
    });
  };
})();
