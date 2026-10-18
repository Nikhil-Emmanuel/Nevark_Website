/* Nevark — shared behaviour: nav, mobile menu, email links, reveal-on-scroll, counters */
(function () {
  const doc = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Reveal on scroll (content stays visible if this script never runs) ---- */
  const reveals = [...document.querySelectorAll(".reveal")];
  const vh = window.innerHeight;
  reveals.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (reduceMotion || (r.top < vh && r.bottom > 0)) el.classList.add("in-view");
  });
  doc.classList.add("js"); // same task as above, so nothing already on screen flickers
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in-view"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });
    reveals.filter((el) => !el.classList.contains("in-view")).forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in-view"));
  }

  /* ---- Mobile menu ---- */
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.getElementById("mobile-menu");
  if (toggle && menu) {
    const label = toggle.querySelector("[data-menu-label]");
    const iconOpen = toggle.querySelector("[data-menu-open]");
    const iconClose = toggle.querySelector("[data-menu-close]");
    const setOpen = (open) => {
      menu.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      if (label) label.textContent = open ? "Close menu" : "Open menu";
      if (iconOpen) iconOpen.hidden = open;
      if (iconClose) iconClose.hidden = !open;
      if (open) menu.querySelector("a")?.focus({ preventScroll: true });
    };
    toggle.addEventListener("click", () => setOpen(menu.hidden));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !menu.hidden) { setOpen(false); toggle.focus(); }
    });
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    window.matchMedia("(min-width: 1024px)").addEventListener("change", (e) => { if (e.matches) setOpen(false); });
  }

  /* ---- Desktop nav hover pill ---- */
  const links = document.querySelector("[data-nav-links]");
  const pill = document.getElementById("nav-indicator");
  if (links && pill) {
    const moveTo = (el) => {
      if (!el) { pill.style.opacity = "0"; return; }
      const r = el.getBoundingClientRect();
      const p = links.getBoundingClientRect();
      pill.style.width = `${r.width + 24}px`;
      pill.style.height = `${r.height + 14}px`;
      pill.style.left = `${r.left - p.left - 12}px`;
      pill.style.top = `${r.top - p.top - 7}px`;
      pill.style.opacity = "1";
    };
    links.querySelectorAll(".nav-link").forEach((a) => a.addEventListener("mouseenter", () => moveTo(a)));
    links.addEventListener("mouseleave", () => moveTo(null));
  }

  /* ---- Email: Gmail compose on desktop, native mail app on phones ---- */
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (!isMobile) {
    document.querySelectorAll("[data-email-link][data-gmail]").forEach((a) => {
      a.href = a.dataset.gmail;
      a.target = "_blank";
      a.rel = "noopener";
    });
  }

  /* ---- Count-up numbers (final value is already in the HTML) ---- */
  const counters = document.querySelectorAll("[data-count-to]");
  if (counters.length && !reduceMotion && "IntersectionObserver" in window) {
    const run = (el) => {
      const target = Number(el.dataset.countTo);
      const suffix = el.dataset.suffix || "";
      const start = performance.now();
      const tick = (t) => {
        const p = Math.min((t - start) / 1100, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const co = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { run(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach((el) => co.observe(el));
  }
})();
