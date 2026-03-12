const STORAGE_KEY = "gcc_site_data_v1";

async function loadData(){
  const local = localStorage.getItem(STORAGE_KEY);
  if(local){
    try { return JSON.parse(local); } catch {}
  }
  const res = await fetch("data.json", { cache: "no-store" });
  return res.json();
}

function formatDate(iso){
  if(!iso) return "Date TBA";
  try {
    return new Intl.DateTimeFormat("en-LK", { year: "numeric", month: "short", day: "numeric" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function el(tag, cls, html){
  const node = document.createElement(tag);
  if(cls) node.className = cls;
  if(html !== undefined) node.innerHTML = html;
  return node;
}

function renderStats(stats){
  const row = document.getElementById("statsRow");
  row.innerHTML = "";
  stats.forEach((s) => {
    const box = el("div", "stat reveal", `<div class="v">${s.value}</div><div class="l">${s.label}</div>`);
    row.appendChild(box);
  });
}

function renderTimeline(items){
  const wrap = document.getElementById("timelineCards");
  const progressEl = document.getElementById("timelineProgress");
  wrap.innerHTML = "";

  items.forEach((t, i) => {
    const card = el("article", "card timeline-card glass-card reveal", `
      <div class="year">${t.year}</div>
      <div>
        <div class="title">${t.title}</div>
        <p class="text">${t.text}</p>
      </div>
    `);
    card.dataset.index = String(i);
    wrap.appendChild(card);
  });

  const cards = [...wrap.querySelectorAll(".timeline-card")];
  const section = document.querySelector(".section-journey");

  function updateTimeline(){
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    const start = vh * 0.2;
    const end = rect.height - vh * 0.45;
    const raw = (-rect.top + start) / Math.max(end, 1);
    const progress = Math.max(0, Math.min(1, raw));
    progressEl.style.height = `${(progress * 100).toFixed(1)}%`;

    let activeIndex = 0;
    cards.forEach((card, i) => {
      const cRect = card.getBoundingClientRect();
      const centerDistance = Math.abs((cRect.top + cRect.height / 2) - vh * 0.45);
      if (i === 0 || centerDistance < Math.abs((cards[activeIndex].getBoundingClientRect().top + cards[activeIndex].getBoundingClientRect().height / 2) - vh * 0.45)) {
        activeIndex = i;
      }
    });
    cards.forEach((card, i) => card.classList.toggle("active", i === activeIndex));
  }

  window.addEventListener("scroll", updateTimeline, { passive: true });
  window.addEventListener("resize", updateTimeline);
  updateTimeline();
}

function renderEvents(list, elId){
  const elm = document.getElementById(elId);
  elm.innerHTML = "";
  list.forEach((eventItem) => {
    const item = el("div", "event reveal", `
      <div class="left">
        <div class="t">${eventItem.title}</div>
        <div class="meta">${formatDate(eventItem.date)} • ${eventItem.location}</div>
      </div>
      <div class="tag">${eventItem.tag || "Event"}</div>
    `);
    elm.appendChild(item);
  });
}

function renderContact(c){
  document.getElementById("contactAddress").textContent = c.address || "Address will be added soon";
  document.getElementById("contactPhone").textContent = c.phone || "Phone number will be added soon";
  document.getElementById("contactEmail").textContent = c.email || "Email will be added soon";
}

function renderHero(hero){
  document.getElementById("heroTitle").textContent = hero.title || "Gamini Central College";
  document.getElementById("heroSubtitle").textContent = hero.subtitle || "";
  document.getElementById("heroCtaPrimary").textContent = hero.ctaPrimary || "Explore Journey";
  document.getElementById("heroCtaSecondary").textContent = hero.ctaSecondary || "Latest Updates";
}

function socialLink(label, href){
  if(!href) return null;
  const a = el("a", "social-pill", label);
  a.href = href;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  return a;
}

function renderSocial(social = {}){
  const heroLinks = document.getElementById("heroSocialLinks");
  const contactLinks = document.getElementById("contactSocialLinks");
  const actions = document.getElementById("galleryActions");

  [heroLinks, contactLinks, actions].forEach((node) => node.innerHTML = "");

  const whatsapp = socialLink("WhatsApp Channel", social.whatsappChannel);
  const facebook = socialLink("Facebook Page", social.facebookPage);

  [whatsapp, facebook].forEach((link) => {
    if(link){
      heroLinks.appendChild(link.cloneNode(true));
      contactLinks.appendChild(link.cloneNode(true));
      actions.appendChild(link);
    }
  });
}

function renderAlbums(social = {}){
  const grid = document.getElementById("albumGrid");
  grid.innerHTML = "";
  const albums = Array.isArray(social.facebookAlbums) ? social.facebookAlbums : [];

  if(!albums.length){
    grid.appendChild(el("div", "empty-state glass-card", "Facebook album preview cards will appear here after you add album links in the admin page."));
    return;
  }

  albums.forEach((album) => {
    const card = el("article", "album-card glass-card reveal");
    const cover = el("img", "album-cover");
    cover.src = album.cover || "assets/campus_walk.jpg";
    cover.alt = album.title || "Facebook album";
    cover.loading = "lazy";

    const body = el("div", "album-body");
    body.innerHTML = `
      <h3 class="album-title">${album.title || "Album"}</h3>
      <p class="album-desc">${album.description || "Facebook album preview"}</p>
      <div class="album-actions"></div>
    `;
    const actions = body.querySelector(".album-actions");

    if(album.link){
      const open = socialLink("Open Album", album.link);
      actions.appendChild(open);
    }
    if(social.facebookPage){
      const page = socialLink("Facebook Page", social.facebookPage);
      actions.appendChild(page);
    }

    card.appendChild(cover);
    card.appendChild(body);
    grid.appendChild(card);
  });
}

function initReveal(){
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if(entry.isIntersecting){
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));
}

function initLoader(){
  window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    if(!loader) return;
    loader.style.opacity = "0";
    loader.style.pointerEvents = "none";
    setTimeout(() => loader.remove(), 360);
  });
}

function initYear(){
  document.getElementById("year").textContent = String(new Date().getFullYear());
}

(async function(){
  initLoader();
  initYear();

  const data = await loadData();
  renderHero(data.hero || {});
  renderStats(data.stats || []);
  renderTimeline(data.timeline || []);
  renderEvents(data.ongoing || [], "ongoingList");
  renderEvents(data.upcoming || [], "upcomingList");
  renderContact(data.contact || {});
  renderSocial(data.social || {});
  renderAlbums(data.social || {});
  initReveal();
})();
import { db } from "./firebase.js";
import { doc, getDoc } from 
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

async function loadSiteData(){

const docRef = doc(db,"siteContent","main");
const docSnap = await getDoc(docRef);

if(docSnap.exists()){

const data = docSnap.data();

document.getElementById("heroTitle").innerText = data.heroTitle;
document.getElementById("heroSubtitle").innerText = data.heroSubtitle;

}

}

loadSiteData();
