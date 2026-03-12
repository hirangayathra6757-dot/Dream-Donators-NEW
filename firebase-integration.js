
import { db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function loadFirebaseSiteData() {
  try {
    const ref = doc(db, "siteContent", "main");
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;
    return snap.data();
  } catch (e) {
    console.warn("Firebase not ready yet", e);
    return null;
  }
}
