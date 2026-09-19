// firebase-leads.js
// Shared lead-capture helper for Ahmedabad Airport Cab.
// Saves every booking / contact / tour enquiry to Firestore (collection: "leads")
// and emails a copy via EmailJS. Included on every page that has a form.
//
// Usage from any inline <script> on the page (after this module has loaded):
//   window.AACLeads.submit({ type: 'booking', category, mode, vehicle, price, from, to, date, time, phone });
//
// This never blocks or breaks the existing WhatsApp redirect — every failure
// is caught and logged to the console only.

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
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

const EMAILJS_PUBLIC_KEY = "R-O0mEeDWaIb3gaFR";
const EMAILJS_SERVICE_ID = "service_xcyzcbr";
const EMAILJS_TEMPLATE_ID = "template_colpchh";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const LEADS_COLLECTION = "leads";

let emailjsReadyPromise = null;

// EmailJS's browser SDK is loaded as a classic global script on the page
// (see the <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js">
// tag next to this module's <script> tag). We just wait for it to be ready
// and initialise it lazily so script order on the page never matters.
function ensureEmailJS() {
  if (emailjsReadyPromise) return emailjsReadyPromise;
  emailjsReadyPromise = new Promise((resolve, reject) => {
    const start = Date.now();
    (function check() {
      if (window.emailjs) {
        try {
          window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
        } catch (e) { /* already initialised */ }
        resolve(window.emailjs);
        return;
      }
      if (Date.now() - start > 8000) {
        reject(new Error("emailjs script did not load in time"));
        return;
      }
      setTimeout(check, 100);
    })();
  });
  return emailjsReadyPromise;
}

function buildMessage(lead) {
  const lines = [];
  const label = {
    booking: "New cab booking",
    contact: "New contact enquiry",
    tour: "New Gujarat tour enquiry"
  }[lead.type] || "New enquiry";
  lines.push(label);
  lines.push("");
  Object.entries(lead).forEach(([key, value]) => {
    if (!value || key === "type") return;
    lines.push(`${key}: ${value}`);
  });
  return lines.join("\n");
}

/**
 * Save a lead to Firestore and email a copy. Safe to call without awaiting;
 * returns a promise that never throws (errors are caught and logged).
 * @param {Object} lead - free-form fields describing the enquiry, plus a "type".
 */
async function submit(lead) {
  const record = {
    ...lead,
    status: "new",
    page: window.location.pathname.split("/").pop() || "index.html",
    createdAt: serverTimestamp()
  };

  try {
    await addDoc(collection(db, LEADS_COLLECTION), record);
  } catch (err) {
    console.error("[AACLeads] Firestore save failed:", err);
  }

  try {
    const emailjs = await ensureEmailJS();
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      ...lead,
      subject: `Ahmedabad Airport Cab — new ${lead.type || "enquiry"}`,
      message: buildMessage(lead)
    });
  } catch (err) {
    console.error("[AACLeads] Email send failed:", err);
  }
}

window.AACLeads = { submit };
