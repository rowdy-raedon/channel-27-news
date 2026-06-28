/* ============================================================================
   CHANNEL 27 — contact.js
   Accessible client-side validation with clear errors + a confirmation state.
   NOTE: This validates and confirms on the client. To actually deliver mail,
   point the form at a handler (Formspree, Netlify Forms, or your own endpoint)
   — see README. The success UX below runs after validation passes.
   ========================================================================== */
(function () {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const success = document.getElementById("form-success");
  const fields = {
    name:    { el: form.name,    test: v => v.trim().length >= 2,                       msg: "Please enter your name." },
    email:   { el: form.email,   test: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), msg: "Enter a valid email address." },
    phone:   { el: form.phone,   test: v => v.trim() === "" || /^[\d\s()+\-.]{7,}$/.test(v.trim()), msg: "Enter a valid phone number, or leave it blank." },
    subject: { el: form.subject, test: v => v.trim().length >= 2,                       msg: "Add a short subject." },
    message: { el: form.message, test: v => v.trim().length >= 10,                      msg: "Your message should be at least 10 characters." },
  };

  function setError(key, on) {
    const f = fields[key];
    const wrap = f.el.closest(".field");
    wrap.classList.toggle("invalid", on);
    f.el.setAttribute("aria-invalid", on ? "true" : "false");
  }

  function validateField(key) {
    const f = fields[key];
    const ok = f.test(f.el.value);
    setError(key, !ok);
    return ok;
  }

  // Validate on blur once touched; clear error as the user corrects it.
  Object.keys(fields).forEach(key => {
    const el = fields[key].el;
    el.addEventListener("blur", () => validateField(key));
    el.addEventListener("input", () => {
      if (el.closest(".field").classList.contains("invalid")) validateField(key);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    let firstBad = null;
    let allOk = true;
    Object.keys(fields).forEach(key => {
      const ok = validateField(key);
      if (!ok && !firstBad) firstBad = fields[key].el;
      allOk = allOk && ok;
    });

    if (!allOk) {
      success.classList.remove("show");
      if (firstBad) firstBad.focus();
      return;
    }

    // Passed validation. Show confirmation + reset.
    const name = fields.name.el.value.trim().split(" ")[0];
    success.querySelector("[data-name]").textContent = name ? `Thanks, ${name}!` : "Message sent!";
    success.classList.add("show");
    success.setAttribute("tabindex", "-1");
    success.focus();
    form.reset();
    Object.keys(fields).forEach(key => setError(key, false));
    success.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();
