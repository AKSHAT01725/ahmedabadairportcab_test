// round-trip-rates.js
// Loads Round Trip rate cards from Firestore (collection: roundTripRates)
// - Rebuilds #ratesTrack on index.html
// - Dispatches window event so booking-results.html can update VEHICLES[]
// Safe to load alongside firebase-leads.js (reuses existing Firebase app).

import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
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

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
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

function normName(name) {
  return String(name || "").toLowerCase().replace(/\s+/g, " ").trim();
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
  <article class="rate-card" data-vehicle-rate="${escapeHtml(name)}">
    <div class="rate-photo" style="background-image:url('${escapeHtml(image)}'),${gradient}"></div>
    <div class="rate-body">
      <h3>${escapeHtml(name)}</h3>
      <div class="meta"><span>${escapeHtml(persons)} Persons</span><span>${escapeHtml(bags)} Bags</span></div>
      <div class="price"><small>Round Trip Rate</small><strong><span class="rs">₹</span><span data-count="${escapeHtml(price)}" data-rate-price="1">${escapeHtml(price)}</span><span class="per">/ km</span></strong></div>
      <button type="button" class="btn btn-primary" onclick="bookRateOnWhatsApp('${safeName}','${safePrice}')">Inquiry Now</button>
    </div>
  </article>`;
}

function applyToTrack(rates) {
  const track = document.getElementById("ratesTrack");
  if (!track || !rates.length) return;
  track.innerHTML = rates.map(cardHtml).join("\n");
  if (typeof window.resetRateSlide === "function") {
    try { window.resetRateSlide(); } catch (e) {}
  }
}

function applyToExistingCards(rates) {
  const byName = new Map();
  rates.forEach((r) => byName.set(normName(r.name), r));

  document.querySelectorAll("article.rate-card").forEach((card) => {
    const h3 = card.querySelector("h3");
    if (!h3) return;
    const rate = byName.get(normName(h3.textContent));
    if (!rate) return;

    const price = rate.price ?? "";
    const persons = rate.persons;
    const bags = rate.bags;
    const image = rate.image;
    const name = rate.name || h3.textContent.trim();

    const numSpan = card.querySelector("[data-rate-price], .price [data-count]");
    if (numSpan) {
      numSpan.setAttribute("data-count", String(price));
      numSpan.textContent = String(price);
    }

    const metaSpans = card.querySelectorAll(".meta span");
    if (metaSpans.length >= 1 && persons != null && persons !== "") {
      metaSpans[0].textContent = `${persons} Persons`;
    }
    if (metaSpans.length >= 2 && bags != null && bags !== "") {
      metaSpans[1].textContent = `${bags} Bags`;
    }

    const photo = card.querySelector(".rate-photo");
    if (photo && image) {
      const gradient = rate.gradient || "linear-gradient(135deg,#1b1730,#6a45dc)";
      photo.style.backgroundImage = `url('${image}'),${gradient}`;
    }

    const btn = card.querySelector("button.btn, .btn-primary");
    if (btn) {
      const safeName = String(name).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
      const safePrice = String(price).replace(/'/g, "\\'");
      btn.setAttribute("onclick", `bookRateOnWhatsApp('${safeName}','${safePrice}')`);
    }
  });
}

function publishRates(rates) {
  if (!rates || !rates.length) return;
  window.AAC_ROUND_TRIP_RATES = rates;
  applyToTrack(rates);
  applyToExistingCards(rates);
  document.dispatchEvent(new CustomEvent("aac-rates-updated", { detail: rates }));
  // Also call global hook if booking-results defined it
  if (typeof window.applyAdminRates === "function") {
    try { window.applyAdminRates(rates); } catch (e) { console.warn(e); }
  }
}

try {
  const q = query(collection(db, "roundTripRates"), orderBy("order", "asc"));
  onSnapshot(
    q,
    (snap) => {
      const rates = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (rates.length) publishRates(rates);
      else console.warn("[round-trip-rates] no documents in roundTripRates");
    },
    (err) => {
      console.warn("[round-trip-rates] snapshot error:", err.message);
    }
  );
} catch (err) {
  console.warn("[round-trip-rates] init failed:", err);
}
