/* Nevark — lightweight particle background.
   Same look as the original background-3d.js, with fixes for phones and low-end devices:
   fewer particles on weak hardware (the old code gave them 500), ~30fps on mobile,
   pauses when hidden/off-screen, and a static frame for prefers-reduced-motion. */
(function () {
  const container = document.getElementById("bg3d-container");
  if (!container) return;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;
  container.appendChild(canvas);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lowEnd = (navigator.deviceMemory && navigator.deviceMemory < 4) ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);
  let isMobile = window.innerWidth < 768;
  const countFor = () => (lowEnd ? 24 : isMobile ? 40 : 80);
  const frameInterval = isMobile || lowEnd ? 1000 / 30 : 0;

  let particles = [];
  let running = false;
  let rafId = 0;
  let last = 0;
  const mouse = { x: null, y: null, radius: 150 };

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    isMobile = window.innerWidth < 768;
    particles = Array.from({ length: countFor() }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * 1000,
      size: Math.random() * 3 + 1,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.5,
      vz: (Math.random() - 0.5) * 0.9,
      opacity: Math.random() * 0.7 + 0.3,
      hue: Math.random() * 60 + 200,
    }));
  }

  function draw() {
    const w = canvas.width, h = canvas.height;
    ctx.fillStyle = "rgba(0, 0, 0, 0.06)";
    ctx.fillRect(0, 0, w, h);
    const pts = [];

    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.z += p.vz;
      if (p.x < 0) p.x = w; else if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; else if (p.y > h) p.y = 0;
      if (p.z < 0) p.z = 1000; else if (p.z > 1000) p.z = 0;

      const s = 1000 / (1000 + p.z);
      const x = (p.x - w / 2) * s + w / 2;
      const y = (p.y - h / 2) * s + h / 2;
      const size = p.size * s;

      if (!isMobile && mouse.x !== null) {
        const dx = mouse.x - x, dy = mouse.y - y;
        const d = Math.hypot(dx, dy);
        if (d < mouse.radius) {
          const f = (mouse.radius - d) / mouse.radius;
          p.x -= dx * f * 0.09; p.y -= dy * f * 0.09;
        }
      }

      const g = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
      g.addColorStop(0, `hsla(${p.hue}, 70%, 60%, ${p.opacity * s})`);
      g.addColorStop(0.5, `hsla(${p.hue}, 70%, 50%, ${p.opacity * s * 0.5})`);
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(x - size, y - size * 3, size * 6, size * 60);
      pts.push(x, y);
    }

    if (!lowEnd) {
      ctx.lineWidth = 0.5;
      for (let i = 0; i < pts.length; i += 2) {
        for (let j = i + 2; j < pts.length; j += 2) {
          const dx = pts[i] - pts[j], dy = pts[i + 1] - pts[j + 1];
          const d2 = dx * dx + dy * dy;
          if (d2 < 22500) {
            const o = (1 - Math.sqrt(d2) / 120) * 0.2;
            if (o <= 0) continue;
            ctx.strokeStyle = `rgba(150, 150, 255, ${o})`;
            ctx.beginPath(); ctx.moveTo(pts[i], pts[i + 1]); ctx.lineTo(pts[j], pts[j + 1]); ctx.stroke();
          }
        }
      }
    }
  }

  function loop(t) {
    if (!running) return;
    rafId = requestAnimationFrame(loop);
    if (frameInterval && t - last < frameInterval) return;
    last = t;
    draw();
  }

  function start() {
    if (running || reduceMotion) return;
    running = true;
    rafId = requestAnimationFrame(loop);
  }
  function stop() { running = false; cancelAnimationFrame(rafId); }

  resize();
  if (reduceMotion) {
    for (let i = 0; i < 40; i++) draw(); // settle into a still frame
  } else {
    start();
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); if (reduceMotion) draw(); }, 250);
  }, { passive: true });

  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  if (!isMobile) {
    window.addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    document.addEventListener("mouseleave", () => { mouse.x = mouse.y = null; });
  }
})();
