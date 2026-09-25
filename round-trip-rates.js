// round-trip-rates.js
// Loads Round Trip rate cards from Firestore (collection: roundTripRates)
// and renders them into #ratesTrack on the homepage. Falls back to the
// static HTML already in the page if Firestore is empty or fails.

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDDMqMXdar86EawwYdMhwSdKKDU-eijSRc",
  authDomain: "ahmedabad-airport-cab.firebaseapp.com",
  projectId: "ahmedabad-airport-cab",
  storageBucket: "ahmedabad-airport-cab.firebasestorage.app",
  messagingSenderId: "82570456282",
  appId: "1:82570456282:web:4302c9c3e9a6c7ae7949e3",
  measurementId: "G-JTYJHB16VD"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function cardHtml(rate) {
  const name = rate.name || "Vehicle";
  const price = rate.price ?? "";
  const persons = rate.persons ?? "";
  const bags = rate.bags ?? "";
  const image = rate.image || "swift-dzire.webp";
  const gradient = rate.gradient || "linear-gradient(135deg,#1b1730,#6a45dc)";
  const safeName = String(name).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  const safePrice = String(price).replace(/'/g, "\\'");

  return `
  <article class="rate-card">
    <div class="rate-photo" style="background-image:url('${escapeHtml(image)}'),${gradient}"></div>
    <div class="rate-body">
      <h3>${escapeHtml(name)}</h3>
      <div class="meta"><span>${escapeHtml(persons)} Persons</span><span>${escapeHtml(bags)} Bags</span></div>
      <div class="price"><small>Round Trip Rate</small><strong><span class="rs">₹</span><span data-count="${escapeHtml(price)}">${escapeHtml(price)}</span><span class="per">/ km</span></strong></div>
      <button type="button" class="btn btn-primary" onclick="bookRateOnWhatsApp('${safeName}','${safePrice}')">Inquiry Now</button>
    </div>
  </article>`;
}

function renderRates(rates) {
  const track = document.getElementById("ratesTrack");
  if (!track || !rates.length) return;
  track.innerHTML = rates.map(cardHtml).join("\n");
  if (typeof window.resetRateSlide === "function") {
    try { window.resetRateSlide(); } catch (e) {}
  }
}

try {
  const q = query(collection(db, "roundTripRates"), orderBy("order", "asc"));
  onSnapshot(
    q,
    (snap) => {
      const rates = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (rates.length) renderRates(rates);
    },
    (err) => {
      console.warn("[round-trip-rates] using static cards:", err.message);
    }
  );
} catch (err) {
  console.warn("[round-trip-rates] init failed:", err);
}
