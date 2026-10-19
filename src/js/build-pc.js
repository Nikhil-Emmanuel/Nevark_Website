/* Nevark — Build Your PC intro.
   Plays the build video behind the stage cards and steers the page to each stage.
   Built to never trap the visitor (the old version could hang on iOS Safari):
   - play() is called straight away (iOS won't load media before that) and a hard timeout
     falls back to a still image if playback hasn't started;
   - the page always stays scrollable and clickable; any scroll/touch/key hands control to the visitor;
   - "Skip intro" is always available; Save-Data skips the video entirely. */
(function () {
  const $ = (id) => document.getElementById(id);
  const video = $("bg-video");
  if (!video) return;

  const veil = $("video-veil");
  const loadScreen = $("load-screen");
  const loadBar = $("load-bar");
  const tapOverlay = $("tap-overlay");
  const progress = $("scroll-bar");
  const chip = $("stage-chip");
  const flash = $("unlock-flash");
  const skipBtn = $("skip-btn");
  const replayBtn = $("restart-btn");
  const setupWrap = $("setup-image-wrap");
  const stillWrap = $("still-wrap");

  const START_TIMEOUT_MS = 7000;
  const stages = [
    { pct: 0.0, label: "", section: "start" },
    { pct: 0.08, label: "STAGE 01 — THE FOUNDATION", section: "stage1" },
    { pct: 0.28, label: "STAGE 02 — NEURAL PATHWAYS", section: "stage2" },
    { pct: 0.48, label: "STAGE 03 — THE HEARTBEAT", section: "stage3" },
    { pct: 0.66, label: "STAGE 04 — THERMAL MASTERY", section: "stage4" },
    { pct: 0.86, label: "FINAL — ASCENSION", section: "stage5" },
  ];

  const conn = navigator.connection || {};
  const saveData = conn.saveData === true || /(^|-)2g$/.test(conn.effectiveType || "");
  const small = window.matchMedia("(max-width: 768px)").matches || /3g$/.test(conn.effectiveType || "");

  let state = "idle"; // idle | loading | playing | done
  let userInControl = false;
  let stageIdx = -1;
  let chipLabel = "";
  let startTimer = 0;
  let fakeTimer = 0;

  const show = (el) => el && el.classList.add("visible");
  const hide = (el) => el && el.classList.remove("visible");

  function setLoadProgress(pct) {
    if (!loadBar) return;
    loadBar.style.width = `${pct}%`;
    loadBar.parentElement.setAttribute("aria-valuenow", String(Math.round(pct)));
  }

  function closeLoadScreen() {
    clearInterval(fakeTimer);
    if (!loadScreen || loadScreen.hidden) return;
    setLoadProgress(100);
    loadScreen.classList.add("fade");
    setTimeout(() => { loadScreen.hidden = true; loadScreen.classList.remove("fade"); }, 900);
  }

  function setChip(label) {
    if (!chip || label === chipLabel) return;
    chipLabel = label;
    hide(chip);
    setTimeout(() => { chip.textContent = label; if (label) show(chip); }, 220);
  }

  function spawnParticles() {
    const box = $("setup-particles");
    if (!box || box.childElementCount) return;
    for (let i = 0; i < 18; i++) {
      const p = document.createElement("div");
      const sz = Math.random() * 3 + 1;
      p.className = "sp";
      p.style.width = p.style.height = `${sz}px`;
      p.style.left = `${Math.random() * 100}%`;
      p.style.bottom = `${Math.random() * 30}%`;
      p.style.setProperty("--dx", `${(Math.random() - 0.5) * 120}px`);
      p.style.animationDuration = `${6 + Math.random() * 10}s`;
      p.style.animationDelay = `${Math.random() * 8}s`;
      box.appendChild(p);
    }
  }

  /* Final, fully interactive state. Safe to call more than once. */
  function finish({ useStill = false } = {}) {
    if (state === "done") return;
    state = "done";
    clearTimeout(startTimer);
    closeLoadScreen();
    if (tapOverlay) tapOverlay.hidden = true;
    if (skipBtn) skipBtn.hidden = true;
    video.removeEventListener("timeupdate", onTimeUpdate);
    try { video.pause(); } catch (e) { /* ignore */ }
    hide(video); hide(veil); hide(chip);
    if (progress) progress.style.width = "100%";
    if (useStill) { show(stillWrap); } else { show(setupWrap); spawnParticles(); }
    if (flash && !useStill) {
      flash.classList.add("flash");
      setTimeout(() => flash.classList.remove("flash"), 500);
    }
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in-view"));
    if (replayBtn && !useStill) replayBtn.hidden = false;
  }

  function onTimeUpdate() {
    const dur = video.duration;
    if (!dur || !isFinite(dur)) return;
    const p = video.currentTime / dur;
    if (progress) progress.style.width = `${p * 100}%`;

    let idx = 0;
    for (let i = 0; i < stages.length; i++) if (p >= stages[i].pct) idx = i;
    setChip(stages[idx].label);

    if (idx !== stageIdx) {
      stageIdx = idx;
      const sec = $(stages[idx].section);
      if (sec) {
        if (!userInControl) window.scrollTo({ top: sec.offsetTop, behavior: "smooth" });
        const card = sec.querySelector(".reveal");
        if (card) setTimeout(() => card.classList.add("in-view"), 350);
      }
    }
  }

  function onPlaying() {
    if (state === "done") return;
    state = "playing";
    clearTimeout(startTimer);
    closeLoadScreen();
    if (tapOverlay) tapOverlay.hidden = true;
    show(video); show(veil);
    if (skipBtn) skipBtn.hidden = false;
  }

  function askForTap() {
    if (state === "done") return;
    clearTimeout(startTimer);
    closeLoadScreen();
    if (tapOverlay) tapOverlay.hidden = false;
    show(stillWrap);
  }

  function start() {
    state = "loading";
    video.src = small || saveData ? video.dataset.srcSd : video.dataset.srcHd;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.preload = "auto";

    video.addEventListener("playing", onPlaying);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", () => finish(), { once: true });
    video.addEventListener("error", () => finish({ useStill: true }), { once: true });
    video.addEventListener("progress", () => {
      if (state !== "loading" || !video.duration || !video.buffered.length) return;
      setLoadProgress(Math.min(95, (video.buffered.end(video.buffered.length - 1) / video.duration) * 100));
    });

    if (loadScreen) loadScreen.hidden = false;
    let fake = 0;
    fakeTimer = setInterval(() => { fake = Math.min(fake + Math.random() * 9, 88); setLoadProgress(fake); }, 150);

    // If nothing is playing after a few seconds, give the visitor the page instead of a spinner.
    startTimer = setTimeout(() => { if (state === "loading") finish({ useStill: true }); }, START_TIMEOUT_MS);

    video.load();
    const attempt = video.play();
    if (attempt && attempt.catch) {
      attempt.catch((err) => {
        if (state === "done") return;
        if (err && err.name === "NotAllowedError") askForTap(); // e.g. iOS Low Power Mode
        else finish({ useStill: true });
      });
    }
  }

  /* Visitor takes over scrolling: stop steering, keep the video as a backdrop. */
  const takeControl = () => { if (state === "playing") userInControl = true; };
  ["wheel", "touchstart"].forEach((t) => window.addEventListener(t, takeControl, { passive: true }));
  window.addEventListener("keydown", (e) => {
    if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " ", "Tab"].includes(e.key)) takeControl();
  });

  document.querySelectorAll("[data-skip]").forEach((b) => b.addEventListener("click", () => finish()));
  document.querySelector("[data-tap-start]")?.addEventListener("click", () => {
    tapOverlay.hidden = true;
    hide(stillWrap);
    startTimer = setTimeout(() => { if (state !== "playing") finish({ useStill: true }); }, START_TIMEOUT_MS);
    video.play().catch(() => finish({ useStill: true }));
  });
  replayBtn?.addEventListener("click", () => {
    replayBtn.hidden = true;
    hide(setupWrap);
    state = "loading";
    userInControl = false;
    stageIdx = -1;
    video.currentTime = 0;
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", () => finish(), { once: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
    video.play().catch(() => finish({ useStill: true }));
  });

  if (saveData) {
    finish({ useStill: true });
  } else {
    start();
  }
})();
