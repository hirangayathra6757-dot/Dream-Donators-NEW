// Firebase imports (must be at the top)
import { db } from "./firebase.js";
import { doc, getDoc } from 
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const STORAGE_KEY = "gcc_site_data_v1";

// Load data from Firebase
async function loadSiteData(){

  const docRef = doc(db,"siteContent","main");
  const docSnap = await getDoc(docRef);

  if(docSnap.exists()){

    const data = docSnap.data();

    if(data.heroTitle){
      document.getElementById("heroTitle").innerText = data.heroTitle;
    }

    if(data.heroSubtitle){
      document.getElementById("heroSubtitle").innerText = data.heroSubtitle;
    }

  }

}

// Load local JSON fallback
async function loadData(){
  const local = localStorage.getItem(STORAGE_KEY);

  if(local){
    try { 
      return JSON.parse(local); 
    } catch {}
  }

  const res = await fetch("data.json", { cache: "no-store" });
  return res.json();
}

function formatDate(iso){
  if(!iso) return "Date TBA";

  try{
    return new Intl.DateTimeFormat("en-LK",{
      year:"numeric",
      month:"short",
      day:"numeric"
    }).format(new Date(iso));
  }catch{
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

  stats.forEach((s)=>{
    const box = el("div","stat reveal",
      `<div class="v">${s.value}</div>
       <div class="l">${s.label}</div>`
    );

    row.appendChild(box);
  });
}

function renderEvents(list, elId){
  const elm = document.getElementById(elId);
  elm.innerHTML = "";

  list.forEach((eventItem)=>{

    const item = el("div","event reveal",`
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
  document.getElementById("contactAddress").textContent =
    c.address || "Address will be added soon";

  document.getElementById("contactPhone").textContent =
    c.phone || "Phone number will be added soon";

  document.getElementById("contactEmail").textContent =
    c.email || "Email will be added soon";
}

function renderHero(hero){

  document.getElementById("heroTitle").textContent =
    hero.title || "Gamini Central College";

  document.getElementById("heroSubtitle").textContent =
    hero.subtitle || "";

  document.getElementById("heroCtaPrimary").textContent =
    hero.ctaPrimary || "Explore Journey";

  document.getElementById("heroCtaSecondary").textContent =
    hero.ctaSecondary || "Latest Updates";

}

function initLoader(){

  window.addEventListener("load",()=>{

    const loader = document.getElementById("loader");

    if(!loader) return;

    loader.style.opacity = "0";
    loader.style.pointerEvents = "none";

    setTimeout(()=> loader.remove(),360);

  });

}

function initYear(){
  document.getElementById("year").textContent =
    String(new Date().getFullYear());
}

// Main app start
(async function(){

  initLoader();
  initYear();

  const data = await loadData();

  renderHero(data.hero || {});
  renderStats(data.stats || []);
  renderEvents(data.ongoing || [],"ongoingList");
  renderEvents(data.upcoming || [],"upcomingList");
  renderContact(data.contact || {});

  await loadSiteData();

})();
