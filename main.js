if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

const DATA_URL = "data.json";
const STORAGE_KEY = "gcc_site_data_v1";

function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

async function loadData(){
  const fromStorage = localStorage.getItem(STORAGE_KEY);
  if (fromStorage) {
    try { return JSON.parse(fromStorage); } catch(e) {}
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
  if (!row) return;
  row.innerHTML = "";
  for (const s of stats) {
    const el = document.createElement("div");
    el.className = "stat";
    el.innerHTML = `<div class="v">${s.value}</div><div class="l">${s.label}</div>`;
    row.appendChild(el);
  }
}

function renderTimeline(items){
  const wrap = document.getElementById("timelineCards");
  if (!wrap) return;
  wrap.innerHTML = "";

  items.forEach((t) => {
    const card = document.createElement("div");
    card.className = "card timeline-card glass";
    card.innerHTML = `
      <div class="year">${t.year}</div>
      <div>
        <div class="title">${t.title}</div>
        <p class="text">${t.text}</p>
      </div>
    `;
    wrap.appendChild(card);

    if (window.gsap && window.ScrollTrigger) {
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
    }
  });

  if (window.ScrollTrigger) {
    ScrollTrigger.create({
      trigger: ".section-journey",
      start: "top 70%",
      end: "bottom 65%",
      onUpdate: (self) => {
        const p = clamp(self.progress, 0, 1);
        const line = document.getElementById("timelineProgress");
        if (line) line.style.height = (p * 100).toFixed(1) + "%";
      }
    });
  }
}

function renderEvents(list, elId){
  const el = document.getElementById(elId);
  if (!el) return;
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
  const addressEl = document.getElementById("contactAddress");
  const phoneEl = document.getElementById("contactPhone");
  const emailEl = document.getElementById("contactEmail");

  if (addressEl) addressEl.textContent = c.address || "Contact details will be updated soon";

  if (phoneEl) {
    phoneEl.textContent = c.phone || "Phone number will be updated soon";
    phoneEl.href = c.phone ? `tel:${String(c.phone).replace(/\s+/g, "")}` : "#";
  }

  if (emailEl) {
    emailEl.textContent = c.email || "Official email will be updated soon";
    emailEl.href = c.email ? `mailto:${c.email}` : "#";
  }
}

function renderHero(hero){
  const t = document.getElementById("heroTitle");
  const s = document.getElementById("heroSubtitle");
  const p = document.getElementById("heroCtaPrimary");
  const q = document.getElementById("heroCtaSecondary");
  if (t) t.textContent = hero.title || "Gamini Central College";
  if (s) s.textContent = hero.subtitle || "";
  if (p) p.textContent = hero.ctaPrimary || "Explore Journey";
  if (q) q.textContent = hero.ctaSecondary || "Latest Updates";
}

function renderSocial(social = {}){
  const strip = document.getElementById("socialStrip");
  const whatsappFloat = document.getElementById("whatsappFloat");
  if (!strip) return;

  const hasWhatsApp = Boolean(social.whatsappChannel);
  const hasFacebook = Boolean(social.facebookPage);
  const albums = Array.isArray(social.facebookAlbums) ? social.facebookAlbums.filter(a => a && a.title && a.url) : [];

  if (!hasWhatsApp && !hasFacebook && albums.length === 0) {
    strip.innerHTML = "";
    if (whatsappFloat) whatsappFloat.classList.add("is-hidden");
    return;
  }

  let html = '<div class="social-grid">';

  if (hasWhatsApp) {
    html += `
      <article class="social-card glass">
        <div class="label">WhatsApp Channel</div>
        <h3>School updates on WhatsApp</h3>
        <p>Use this channel for quick notices, schedule updates, and community announcements.</p>
        <div class="social-links">
          <a class="social-link" href="${social.whatsappChannel}" target="_blank" rel="noopener">Open Channel</a>
        </div>
      </article>`;
  }

  if (hasFacebook) {
    html += `
      <article class="social-card glass">
        <div class="label">Facebook Page</div>
        <h3>Photos, posts, and event coverage</h3>
        <p>Connect your page now and later we can switch this to a live gallery after moving to Firebase or a server.</p>
        <div class="social-links">
          <a class="social-link" href="${social.facebookPage}" target="_blank" rel="noopener">Open Facebook</a>
        </div>
      </article>`;
  }

  if (albums.length) {
    html += `
      <article class="social-card glass">
        <div class="label">Facebook Albums</div>
        <h3>Recent photo albums</h3>
        <div class="album-list">
          ${albums.map(a => `
            <div class="album-item">
              <span>${a.title}</span>
              <a href="${a.url}" target="_blank" rel="noopener">Open Album</a>
            </div>
          `).join("")}
        </div>
      </article>`;
  }

  html += "</div>";
  strip.innerHTML = html;

  if (whatsappFloat) {
    if (hasWhatsApp) {
      whatsappFloat.href = social.whatsappChannel;
      whatsappFloat.classList.remove("is-hidden");
    } else {
      whatsappFloat.classList.add("is-hidden");
    }
  }
}

function hideLoader(){
  const loader = document.getElementById("loader");
  if (!loader) return;
  loader.classList.add("is-hidden");
  setTimeout(() => loader.remove(), 400);
}

function initMotion(){
  if (!(window.gsap && window.ScrollTrigger)) return;

  gsap.from(".topbar", {
    opacity: 0,
    y: -24,
    duration: 0.7,
    ease: "power2.out"
  });

  gsap.from(".hero-copy", {
    opacity: 0,
    y: 30,
    duration: 0.8,
    ease: "power2.out"
  });

  gsap.from(".logo-stage", {
    opacity: 0,
    y: 30,
    scale: 0.96,
    duration: 0.85,
    delay: 0.08,
    ease: "power2.out"
  });

  gsap.to(".hero-bg", {
    scale: 1.1,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });

  gsap.to(".hero-logo", {
    y: -10,
    repeat: -1,
    yoyo: true,
    duration: 2.6,
    ease: "sine.inOut"
  });

  gsap.utils.toArray(".card, .panel, .contact-card, .map-card, .social-card").forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 18,
      duration: 0.55,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 86%",
      }
    });
  });
}

document.getElementById("year").textContent = String(new Date().getFullYear());

window.addEventListener("load", () => {
  setTimeout(hideLoader, 180);
});

(async function(){
  try {
    const data = await loadData();
    renderHero(data.hero || {});
    renderStats(data.stats || []);
    renderTimeline(data.timeline || []);
    renderEvents(data.ongoing || [], "ongoingList");
    renderEvents(data.upcoming || [], "upcomingList");
    renderContact(data.contact || {});
    renderSocial(data.social || {});
    initMotion();
  } catch (error) {
    console.error(error);
  } finally {
    hideLoader();
  }
})();
