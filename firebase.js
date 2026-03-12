
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDXaOOUvqZeWB9yC8KsjOYrqNV0IgSkRwE",
  authDomain: "gamini-central-college-site.firebaseapp.com",
  projectId: "gamini-central-college-site",
  storageBucket: "gamini-central-college-site.firebasestorage.app",
  messagingSenderId: "10088428066",
  appId: "1:10088428066:web:5409a5c0cb8657061fd07b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
