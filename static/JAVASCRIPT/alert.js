(function () {
  window.customAlert = function (message, callback = () => {}) {
    const alertBox = document.getElementById('custom-alert');
    const alertMsg = document.getElementById('custom-alert-message');
    const okBtn = document.getElementById('custom-alert-ok');

    if (!alertBox || !alertMsg || !okBtn) {
      console.error("Custom alert elements not found in DOM");
      return Promise.resolve();
    }

    alertMsg.textContent = message;
    alertBox.classList.remove('hidden');
    document.body.classList.add('alert-active');
    void alertBox.offsetWidth;  // forces browser to *recalculate layout*
    alertBox.classList.add('show');

    return new Promise((resolve) => {
      const handleClose = () => {
        alertBox.classList.remove('show');

        setTimeout(() => {
          alertBox.classList.add('hidden');
          document.body.classList.remove('alert-active');
          okBtn.removeEventListener('click', handleClose);
          resolve();
          callback();
        }, 400);
      };

      okBtn.addEventListener('click', handleClose);
    });
  };
})();



// IMPORTANT
// This pattern is used to create a private scope, so that:
// Variables like alertBox, alertMsg, okBtn, and handleClose don't leak into the global scope.
// Only window.customAlert is exposed globally.
// It's cleaner and safer in larger projects where name collisions can occur.


// (function () {
//   // code inside here
// })();
