/* Nevark — About page: wireframe parallax scene + chapter fade-ins.
   Port of the original about.html (Three.js from esm.sh + GSAP ScrollTrigger), now bundled and
   self-hosted so it passes the CSP. Bundled by esbuild at build time into /js/about-scene.js.
   Without JS (or if this file fails to load) every chapter is simply visible. */
import {
  Scene, PerspectiveCamera, WebGLRenderer, Group, Mesh, MeshBasicMaterial,
  SphereGeometry, BoxGeometry, OctahedronGeometry, TetrahedronGeometry, TorusGeometry,
} from "three";

/* ---------- Chapter text: fade up when the block's top passes 80% of the viewport,
   fade back down when scrolling above it again (same as the old ScrollTrigger setup) ---------- */
const blocks = [...document.querySelectorAll("[data-fx]")];
const story = document.querySelector(".about-story");
if (story && "IntersectionObserver" in window) {
  story.classList.add("fx-ready");
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const items = e.target.querySelectorAll(".fx");
      if (e.isIntersecting) items.forEach((el) => el.classList.add("fx-in"));
      else if (e.boundingClientRect.top > 0) items.forEach((el) => el.classList.remove("fx-in"));
    }
  }, { rootMargin: "0px 0px -20% 0px" });
  blocks.forEach((b) => io.observe(b));
}

/* ---------- Three.js scene ---------- */
const canvas = document.getElementById("about-scene");
let renderer;
try {
  renderer = canvas && new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
} catch {
  renderer = null; // no WebGL: the canvas stays a plain dark backdrop
}

if (renderer) {
  const scene = new Scene();
  const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.setClearColor(0x0a0a0a, 1);
  camera.position.z = 15;

  // Parallax groups: foreground (fastest), mid-ground, background (slowest)
  const parallaxGroups = [new Group(), new Group(), new Group()];
  parallaxGroups.forEach((g) => scene.add(g));

  const mat = (color, opacity) => new MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity });
  const brightMaterial = mat(0xffffff, 0.9);
  const accentMaterial = mat(0x60a5fa, 0.8);
  const dustMaterial = mat(0x71717a, 0.5);
  const highlightMaterial = mat(0xfbbf24, 0.7);

  function createGeometry(type, size, material) {
    let geometry;
    switch (type) {
      case "sphere": geometry = new SphereGeometry(size, 16, 16); break;
      case "box": geometry = new BoxGeometry(size, size, size); break;
      case "octahedron": geometry = new OctahedronGeometry(size); break;
      case "tetrahedron": geometry = new TetrahedronGeometry(size); break;
      case "torus": geometry = new TorusGeometry(size, size * 0.3, 8, 16); break;
      default: geometry = new SphereGeometry(size, 12, 12);
    }
    return new Mesh(geometry, material);
  }

  const shapes = [];
  const shapeTypes = ["sphere", "box", "octahedron", "tetrahedron", "torus"];
  const materials = [brightMaterial, accentMaterial, highlightMaterial];
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // [layer, size(min, range), spread x/y, z(min, range), speed(min, range), rotation, material]
  const layers = [
    { size: [0.6, 1.2], spread: [50, 35], z: [5, 10], speed: [0.9, 0.6], rot: 0.025, material: () => pick(materials) },
    { size: [0.8, 1.5], spread: [70, 45], z: [-5, 15], speed: [0.5, 0.4], rot: 0.018, material: () => brightMaterial },
    { size: [0.5, 2.0], spread: [90, 60], z: [-20, 20], speed: [0.15, 0.25], rot: 0.012, material: () => dustMaterial },
  ];
  layers.forEach((l, layer) => {
    for (let i = 0; i < 20; i++) {
      const shape = createGeometry(pick(shapeTypes), Math.random() * l.size[1] + l.size[0], l.material());
      shape.position.set((Math.random() - 0.5) * l.spread[0], (Math.random() - 0.5) * l.spread[1], Math.random() * l.z[1] + l.z[0]);
      shape.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      parallaxGroups[layer].add(shape);
      shapes.push({ mesh: shape, rotationSpeed: (Math.random() - 0.5) * l.rot });
    }
  });

  let scrollProgress = 0;
  let mouseX = 0;
  let mouseY = 0;
  const readScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = max > 0 ? window.scrollY / max : 0;
  };
  readScroll();
  window.addEventListener("scroll", readScroll, { passive: true });
  document.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  }, { passive: true });

  let running = false;
  let raf = 0;
  function animate() {
    if (!running) return;
    raf = requestAnimationFrame(animate);

    // Parallax movement based on scroll
    parallaxGroups[0].position.y = scrollProgress * 25;
    parallaxGroups[1].position.y = scrollProgress * 15;
    parallaxGroups[2].position.y = scrollProgress * 8;

    // Mouse parallax
    parallaxGroups[0].rotation.x = mouseY * 0.12; parallaxGroups[0].rotation.y = mouseX * 0.12;
    parallaxGroups[1].rotation.x = mouseY * 0.06; parallaxGroups[1].rotation.y = mouseX * 0.06;
    parallaxGroups[2].rotation.x = mouseY * 0.03; parallaxGroups[2].rotation.y = mouseX * 0.03;

    const now = Date.now();
    for (const { mesh, rotationSpeed } of shapes) {
      mesh.rotation.x += rotationSpeed;
      mesh.rotation.y += rotationSpeed * 0.8;
      mesh.rotation.z += rotationSpeed * 0.5;
      mesh.position.y += Math.sin(now * 0.001 + mesh.position.x) * 0.015; // floating
      if (mesh.position.y < -40) mesh.position.y = 40;
      else if (mesh.position.y > 40) mesh.position.y = -40;
    }
    renderer.render(scene, camera);
  }
  const start = () => { if (!running) { running = true; raf = requestAnimationFrame(animate); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      readScroll();
    }, 150);
  }, { passive: true });
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  renderer.render(scene, camera);
  start();
}
