// blog-list.js — loads blog cards from Firestore collection "blogs"
import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getFirestore, collection, query, orderBy, onSnapshot
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
const PER_PAGE = 6;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

function cardHtml(b, index) {
  const page = Math.floor(index / PER_PAGE) + 1;
  const num = String(index + 1).padStart(2, "0");
  const title = b.title || "Blog";
  const paragraph = b.paragraph || "";
  const url = b.url || "#";
  const image = b.image || "blog-ahmedabad-airport-cab-service.webp";
  return `<article class="blog-card" data-page="${page}">
<a class="blog-card-img" href="${escapeHtml(url)}"><img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" loading="lazy"></a>
<div class="blog-card-body">
<div class="num">BLOG ${num}</div>
<h2><a href="${escapeHtml(url)}">${escapeHtml(title)}</a></h2>
<p>${escapeHtml(paragraph)}</p>
<a class="read" href="${escapeHtml(url)}">Read article <i class="fas fa-arrow-right"></i></a>
</div>
</article>`;
}

function buildPagination(totalPages, current) {
  const wrap = document.querySelector(".blog-pagination");
  if (!wrap) return;
  if (totalPages <= 1) {
    wrap.style.display = "none";
    return;
  }
  wrap.style.display = "";
  let nums = "";
  for (let i = 1; i <= totalPages; i++) {
    nums += `<button type="button" class="page-btn${i === current ? " active" : ""}" data-page="${i}">${i}</button>`;
  }
  wrap.innerHTML = `
    <button type="button" class="page-arrow" id="pagePrev" ${current === 1 ? "disabled" : ""} aria-label="Previous">‹</button>
    <div class="page-nums">${nums}</div>
    <button type="button" class="page-arrow" id="pageNext" ${current === totalPages ? "disabled" : ""} aria-label="Next">›</button>
  `;
  bindPagination(totalPages, current);
}

function showPage(page, totalPages) {
  const cards = Array.from(document.querySelectorAll("#blogGrid .blog-card"));
  cards.forEach((card) => {
    card.style.display = parseInt(card.getAttribute("data-page"), 10) === page ? "" : "none";
  });
  buildPagination(totalPages, page);
}

function bindPagination(totalPages, current) {
  document.querySelectorAll(".page-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      showPage(parseInt(btn.getAttribute("data-page"), 10), totalPages);
    });
  });
  const prev = document.getElementById("pagePrev");
  const next = document.getElementById("pageNext");
  if (prev) prev.addEventListener("click", () => { if (current > 1) showPage(current - 1, totalPages); });
  if (next) next.addEventListener("click", () => { if (current < totalPages) showPage(current + 1, totalPages); });
}

function renderBlogs(blogs) {
  const grid = document.getElementById("blogGrid");
  if (!grid) return;
  if (!blogs.length) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#777;padding:40px 16px">No blog posts yet.</p>';
    const wrap = document.querySelector(".blog-pagination");
    if (wrap) wrap.style.display = "none";
    return;
  }
  grid.innerHTML = blogs.map((b, i) => cardHtml(b, i)).join("\n");
  const totalPages = Math.max(1, Math.ceil(blogs.length / PER_PAGE));
  showPage(1, totalPages);
}

try {
  const q = query(collection(db, "blogs"), orderBy("order", "asc"));
  onSnapshot(
    q,
    (snap) => {
      const blogs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (blogs.length) renderBlogs(blogs);
      // if empty, keep static HTML fallback already in the page
    },
    (err) => console.warn("[blog-list]", err.message)
  );
} catch (err) {
  console.warn("[blog-list] init failed", err);
}
