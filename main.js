
import { db } from "./firebase.js";
import { doc, getDoc, collection, getDocs } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

async function loadMain(){
 const docRef = doc(db,"siteContent","main");
 const snap = await getDoc(docRef);

 if(snap.exists()){
  const d = snap.data();
  document.getElementById("heroTitle").innerText = d.heroTitle || "";
  document.getElementById("heroSubtitle").innerText = d.heroSubtitle || "";
  document.getElementById("whatsappLink").href = d.whatsapp || "#";
  document.getElementById("facebookLink").href = d.facebook || "#";
 }
}

async function loadEvents(){
 const qs = await getDocs(collection(db,"events"));
 const container = document.getElementById("eventsContainer");
 container.innerHTML = "";

 qs.forEach(doc=>{
  const e = doc.data();

  container.innerHTML += `
  <div class="card glass">
   <h3>${e.title}</h3>
   <p>${e.date}</p>
   <p>${e.location}</p>
   <p>${e.description}</p>
  </div>
  `;
 });
}

async function loadNews(){
 const qs = await getDocs(collection(db,"news"));
 const container = document.getElementById("newsContainer");
 container.innerHTML="";

 qs.forEach(doc=>{
  const n = doc.data();

  container.innerHTML += `
  <div class="card glass">
   <h3>${n.title}</h3>
   <p>${n.date}</p>
   <p>${n.content}</p>
  </div>
  `;
 });
}

async function loadGallery(){
 const qs = await getDocs(collection(db,"gallery"));
 const container = document.getElementById("galleryContainer");
 container.innerHTML="";

 qs.forEach(doc=>{
  const g = doc.data();

  container.innerHTML += `
  <div class="card glass">
   <img src="${g.coverImage}" style="width:100%;border-radius:10px;">
   <h3>${g.title}</h3>
   <a href="${g.facebookLink}" target="_blank">View Album</a>
  </div>
  `;
 });
}

loadMain();
loadEvents();
loadNews();
loadGallery();
