/* Nevark — animated wave lines behind the home-page metrics card.
   Only animates while the section is on screen. */
(function () {
  const section = document.querySelector("[data-waves]");
  const canvas = section && section.querySelector("canvas");
  const ctx = canvas && canvas.getContext("2d");
  if (!ctx) return;

  const waves = Array.from({ length: 8 }, () => ({
    val: Math.random() * 0.5 + 0.2,
    tgt: Math.random() * 0.5 + 0.2,
    spd: Math.random() * 0.01 + 0.005,
  }));
  let t = 0, running = false, visible = false, raf = 0;

  function resize() {
    canvas.width = section.clientWidth;
    canvas.height = section.clientHeight;
  }

  function draw() {
    const w = canvas.width, h = canvas.height;
    const mobile = w < 768;
    const count = mobile ? 4 : waves.length;
    const step = mobile ? 4 : 2;
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < count; i++) {
      const wv = waves[i];
      if (Math.random() < 0.02) wv.tgt = Math.random() * 0.6 + 0.2;
      wv.val += (wv.tgt - wv.val) * wv.spd;
      const f = wv.val * 7;
      ctx.beginPath();
      for (let x = 0; x <= w; x += step) {
        const nx = (x / w) * 2 - 1;
        const y = Math.sin((nx + i * 0.05 + t) * 6) * Math.cos((nx + t) * 3) * f * 8 + h / 2;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(${79 + f * 60},${70 + f * 100},229,0.5)`;
      ctx.lineWidth = 1 + i * 0.25;
      ctx.stroke();
    }
  }

  function loop() {
    if (!running) return;
    t += 0.003;
    draw();
    raf = requestAnimationFrame(loop);
  }
  function update() {
    const should = visible && !document.hidden;
    if (should && !running) { running = true; raf = requestAnimationFrame(loop); }
    if (!should && running) { running = false; cancelAnimationFrame(raf); }
  }

  resize();
  draw();
  window.addEventListener("resize", () => { resize(); draw(); }, { passive: true });
  document.addEventListener("visibilitychange", update);
  new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; update(); }).observe(section);
})();
