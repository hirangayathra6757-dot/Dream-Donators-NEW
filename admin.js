
import { db, storage, auth } from "./firebase.js";
import { doc, setDoc, addDoc, collection }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { signInWithEmailAndPassword }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { ref, uploadBytes, getDownloadURL }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

async function login(){
 const email = document.getElementById("email").value;
 const password = document.getElementById("password").value;

 try{
  await signInWithEmailAndPassword(auth,email,password);
  document.getElementById("loginBox").style.display="none";
  document.getElementById("dashboard").style.display="block";
 }catch(e){
  alert("Login failed");
 }
}

async function saveMain(){

 const heroTitle = document.getElementById("heroTitleInput").value;
 const heroSubtitle = document.getElementById("heroSubtitleInput").value;
 const whatsapp = document.getElementById("whatsappInput").value;
 const facebook = document.getElementById("facebookInput").value;

 await setDoc(doc(db,"siteContent","main"),{
  heroTitle,heroSubtitle,whatsapp,facebook
 });

 alert("Saved");
}

async function uploadImage(file){
 const r = ref(storage,"images/"+file.name);
 await uploadBytes(r,file);
 return await getDownloadURL(r);
}

async function addEvent(){

 const title = document.getElementById("eventTitle").value;
 const date = document.getElementById("eventDate").value;
 const location = document.getElementById("eventLocation").value;
 const description = document.getElementById("eventDesc").value;

 await addDoc(collection(db,"events"),{
  title,date,location,description
 });

 alert("Event Added");
}

window.login = login;
window.saveMain = saveMain;
window.addEvent = addEvent;
