// Back-page trial form: prototype only, nothing is sent.
(function () {
  var form = document.getElementById('begin-form');
  if (!form) return;
  var input = form.querySelector('input[type="email"]');
  var msg = document.getElementById('email-msg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = input.value.trim();
    if (!v || !input.checkValidity()) {
      input.setAttribute('aria-invalid', 'true');
      msg.className = 'begin-form__msg is-error';
      msg.textContent = v ? 'That address is missing something. Check for the @ and the part after it.' : 'Add the email you would like your studio account under.';
      input.focus();
      return;
    }
    input.removeAttribute('aria-invalid');
    msg.className = 'begin-form__msg is-ok';
    msg.textContent = 'Thank you. This is a prototype, so no account was created and nothing was sent.';
  });
  input.addEventListener('input', function () {
    if (input.getAttribute('aria-invalid')) { input.removeAttribute('aria-invalid'); msg.textContent = ''; msg.className = 'begin-form__msg'; }
  });
})();
