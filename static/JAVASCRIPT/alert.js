(function () {
  window.customAlert = function (message, callback = () => {}) {
    const alertBox = document.getElementById('custom-alert');
    const alertMsg = document.getElementById('custom-alert-message');
    const okBtn = document.getElementById('custom-alert-ok');

    if (!alertBox || !alertMsg || !okBtn) {
      console.error("Custom alert elements not found in DOM");
      return;
    }

    alertMsg.textContent = message;
    alertBox.classList.remove('hidden');

    const handleClose = () => {
      alertBox.classList.add('hidden');
      okBtn.removeEventListener('click', handleClose);
      callback();
    };

    okBtn.addEventListener('click', handleClose);
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
