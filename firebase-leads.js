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
const EMAILJS_TEMPLATE_ID = "template_ugqgur9";
const NOTIFY_EMAIL = "ahmedabadairportcab@gmail.com";

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

function formatDate(value) {
  if (!value) return "";
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(value);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function buildMessage(lead) {
  if (lead.type === "booking") {
    const rows = [];
    const route = lead.from && lead.to
      ? `${lead.from} → ${lead.to}`
      : (lead.from || lead.to || "—");

    rows.push(["Route", route]);

    const pickup = [formatDate(lead.date), lead.time].filter(Boolean).join(" / ");
    if (pickup) rows.push(["Pickup Date & Time", pickup]);

    if (lead.returnDate) rows.push(["Return Date", formatDate(lead.returnDate)]);
    if (lead.category) rows.push(["Booking Type", lead.category]);
    if (lead.mode) rows.push(["Trip Mode", lead.mode]);
    if (lead.vehicle) rows.push(["Vehicle", lead.vehicle]);
    if (lead.price) rows.push(["Fare / Rate", lead.price]);
    if (lead.phone) rows.push(["Phone Number", lead.phone]);
    if (lead.package) rows.push(["Package", lead.package]);

    const body = rows.map(([label, value]) => `
      <tr>
        <td style="padding:10px 12px;border:1px solid #e3e3e8;font-weight:700;color:#333;vertical-align:top;">${escapeHtml(label)}</td>
        <td style="padding:10px 12px;border:1px solid #e3e3e8;color:#333;">${escapeHtml(value)}</td>
      </tr>`).join("");

    return `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#222;">
        <h3 style="margin:0 0 14px;font-size:18px;">Booking Details</h3>
        <table style="width:100%;max-width:680px;border-collapse:collapse;font-size:14px;">
          <tbody>${body}</tbody>
        </table>
      </div>`;
  }

  const lines = [];
  const label = {
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
  const page = window.location.pathname.split("/").pop() || "index.html";
  const receivedAt = new Date().toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });

  const record = {
    ...lead,
    status: "new",
    page,
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
      to_email: NOTIFY_EMAIL,
      subject: `Ahmedabad Airport Cab — new ${lead.type || "enquiry"}`,
      message: buildMessage(lead),
      page,
      received_at: receivedAt
    });
  } catch (err) {
    console.error("[AACLeads] Email send failed:", err);
  }
}

window.AACLeads = { submit };
