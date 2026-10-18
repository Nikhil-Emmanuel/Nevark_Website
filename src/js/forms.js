/* Nevark — submit FormSubmit forms in place (falls back to a normal POST + /thank-you redirect). */
(function () {
  document.querySelectorAll("form[data-ajax-form]").forEach((form) => {
    const status = form.querySelector("[data-form-status]");
    const button = form.querySelector("[data-submit]");
    const endpoint = form.dataset.ajaxEndpoint;
    if (!endpoint || !window.fetch) return;

    const say = (msg, ok) => {
      if (!status) return;
      status.textContent = msg;
      status.className = `md:col-span-2 text-sm ${ok ? "text-emerald-300" : "text-red-300"}`;
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (form.elements._honey && form.elements._honey.value) return; // bot
      const label = button ? button.textContent : "";
      if (button) { button.disabled = true; button.textContent = "Sending…"; }
      say("", true);
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(form),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || String(data.success) !== "true") throw new Error(data.message || res.statusText);
        form.reset();
        say("Thank you! Your request has been sent. Our team will reach out within 24 hours.", true);
        status && status.focus && status.setAttribute("tabindex", "-1");
        status && status.focus();
      } catch (err) {
        say("We couldn't send that just now. Please try again, or email us at office@nevark.in.", false);
      } finally {
        if (button) { button.disabled = false; button.textContent = label; }
      }
    });
  });
})();
