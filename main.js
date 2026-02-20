// Main JS (ESM) — 3D logo (auto-rotating rigs) + scroll animations (no 3D scroll/mouse control) + data rendering
gsap.registerPlugin(ScrollTrigger);

const DATA_URL = "data.json";
const STORAGE_KEY = "gcc_site_data_v1";

function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

async function loadData(){
  const fromStorage = localStorage.getItem(STORAGE_KEY);
  if(fromStorage){
    try { return JSON.parse(fromStorage); } catch(e){ /* ignore */ }
  }
  const res = await fetch(DATA_URL, { cache: "no-store" });
  return res.json();
}

function formatDate(iso){
  try{
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(undefined, { year:"numeric", month:"short", day:"2-digit" });
  }catch(e){
    return iso;
  }
}

function renderStats(stats){
  const row = document.getElementById("statsRow");
  row.innerHTML = "";
  for(const s of stats){
    const el = document.createElement("div");
    el.className = "stat";
    el.innerHTML = `<div class="v">${s.value}</div><div class="l">${s.label}</div>`;
    row.appendChild(el);
  }
}

function renderTimeline(items){
  const wrap = document.getElementById("timelineCards");
  wrap.innerHTML = "";
  items.forEach((t, i) => {
    const card = document.createElement("div");
    card.className = "card timeline-card";
    card.innerHTML = `
      <div class="year">${t.year}</div>
      <div>
        <div class="title">${t.title}</div>
        <p class="text">${t.text}</p>
      </div>
    `;
    wrap.appendChild(card);

    // subtle entrance
    gsap.from(card, {
      opacity: 0,
      y: 18,
      duration: .55,
      ease: "power2.out",
      scrollTrigger: {
        trigger: card,
        start: "top 85%",
      }
    });
  });

  // progress bar for timeline
  ScrollTrigger.create({
    trigger: ".section-journey",
    start: "top 70%",
    end: "bottom 65%",
    onUpdate: (self) => {
      const p = clamp(self.progress, 0, 1);
      document.getElementById("timelineProgress").style.height = (p * 100).toFixed(1) + "%";
      // 3D is now independent from scroll (disabled)
    }
  });
}

function renderEvents(list, elId){
  const el = document.getElementById(elId);
  el.innerHTML = "";
  list.forEach(e => {
    const div = document.createElement("div");
    div.className = "event";
    div.innerHTML = `
      <div class="left">
        <div class="t">${e.title}</div>
        <div class="meta">${formatDate(e.date)} • ${e.location}</div>
      </div>
      <div class="tag">${e.tag || "Event"}</div>
    `;
    el.appendChild(div);
  });
}

function renderContact(c){
  document.getElementById("contactAddress").textContent = c.address || "—";
  document.getElementById("contactPhone").textContent = c.phone || "—";
  document.getElementById("contactEmail").textContent = c.email || "—";
}

function renderHero(hero){
  document.getElementById("heroTitle").textContent = hero.title || "Gamini Central College";
  document.getElementById("heroSubtitle").textContent = hero.subtitle || "";
  document.getElementById("heroCtaPrimary").textContent = hero.ctaPrimary || "Explore Journey";
  document.getElementById("heroCtaSecondary").textContent = hero.ctaSecondary || "Latest Updates";
}

document.getElementById("year").textContent = String(new Date().getFullYear());

// -------------- 3D SCENE --------------
let scene, camera, renderer, group, crestDisk, ring, glow;
function init3D(){
  const canvas = document.getElementById("scene");

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0.8, 4.2);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

  // lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(3, 4, 4);
  scene.add(key);

  const rim = new THREE.PointLight(0xffd45a, 2.0, 12);
  rim.position.set(-2.8, 1.8, 2.5);
  scene.add(rim);

  group = new THREE.Group();
  scene.add(group);

  // disk with logo texture
  const tex = new THREE.TextureLoader().load("assets/logo.png");
  tex.colorSpace = THREE.SRGBColorSpace;

  const diskGeo = new THREE.CylinderGeometry(1.05, 1.05, 0.18, 80, 1, true);
  const diskMat = new THREE.MeshStandardMaterial({
    color: 0x0a6b2e,
    roughness: 0.3,
    metalness: 0.35,
    emissive: new THREE.Color(0x001a0b),
  });
  const disk = new THREE.Mesh(diskGeo, diskMat);
  group.add(disk);

  // front face
  const faceGeo = new THREE.CircleGeometry(1.05, 80);
  const faceMat = new THREE.MeshStandardMaterial({
    map: tex,
    transparent: true,
    roughness: 0.55,
    metalness: 0.05,
  });
  crestDisk = new THREE.Mesh(faceGeo, faceMat);
  crestDisk.position.z = 0.091;
  group.add(crestDisk);

  // back face (subtle)
  const backMat = new THREE.MeshStandardMaterial({
    color: 0x081208,
    roughness: 0.7,
    metalness: 0.15
  });
  const back = new THREE.Mesh(faceGeo, backMat);
  back.position.z = -0.091;
  back.rotation.y = Math.PI;
  group.add(back);

  // ring
  const ringGeo = new THREE.TorusGeometry(1.15, 0.07, 18, 120);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xffd45a,
    roughness: 0.22,
    metalness: 0.85,
    emissive: new THREE.Color(0x2a1f00),
    emissiveIntensity: 0.25,
  });
  ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI * 0.5;
  group.add(ring);

  // glow plane (fake bloom)
  const glowGeo = new THREE.PlaneGeometry(5.5, 5.5);
  const glowMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    map: makeRadialGradientTexture()
  });
  glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.z = -1.1;
  group.add(glow);

  group.rotation.y = -0.6;
  group.rotation.x = 0.18;

  // hero parallax
  gsap.to(".hero-bg", {
    scale: 1.12,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });

  animate();
}

function makeRadialGradientTexture(){
  const s = 256;
  const c = document.createElement("canvas");
  c.width = s; c.height = s;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
  g.addColorStop(0, "rgba(11,209,106,0.85)");
  g.addColorStop(0.45, "rgba(255,212,90,0.35)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0,0,s,s);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function resize(){
  const canvas = document.getElementById("scene");
  if(!renderer || !camera) return;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);

function animate(){
  requestAnimationFrame(animate);

  const t = performance.now() * 0.001; // seconds

  // Keep logo stable (no scroll / no mouse)
  group.rotation.x = 0.18;
  group.rotation.y = -0.6;

  // Subtle futuristic float
  group.position.y = Math.sin(t * 0.8) * 0.04;

  // Only the ring rotates around the logo
  ring.rotation.y += 0.01;                 // main spin
  ring.rotation.z = Math.sin(t * 0.6) * 0.15; // gentle wobble

  // idle glow motion
  glow.rotation.z -= 0.002;

  renderer.render(scene, camera);
}


// -------------- INIT --------------
(async function(){
  const data = await loadData();

  renderHero(data.hero || {});
  renderStats(data.stats || []);
  renderTimeline(data.timeline || []);
  renderEvents(data.ongoing || [], "ongoingList");
  renderEvents(data.upcoming || [], "upcomingList");
  renderContact(data.contact || {});

  init3D();
  resize();
})();
