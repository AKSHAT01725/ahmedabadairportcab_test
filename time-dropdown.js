/* time-dropdown.js
   Turns the "Pickup Time" field into a dropdown list of
   15-minute slots (12:00 AM ... 11:45 PM), like a native time list:
     - selected slot highlighted in purple, ▲ / ▼ arrows + mouse wheel to scroll
     - opens under the field (flips above it if there is no room below)
     - keyboard: Enter / Space / ↓ opens, ↑ ↓ change slot, Esc closes
   Works on: the booking form (#timeText: index.html, booking-results.html) and the Gujarat tour
   pages (#tourTime). The value written to the field is "hh:mm AM/PM" (e.g. "01:15 PM"), so all
   existing code that reads it (URL params, WhatsApp text, leads) keeps working.
   Tour pages also get: clicking anywhere on the Pickup Date field opens its calendar.

   USAGE: add   <script src="time-dropdown.js"></script>   just before </body>,
   AFTER the page's own inline scripts. Nothing else to change. */
(function () {
  'use strict';
  var input = document.getElementById('timeText') || document.getElementById('tourTime');
  if (!input) return;
  var field = input.closest('.field') || input.closest('.tour-field') || input.parentNode;

  /* ---------- styles (injected, so no extra CSS file is needed) ---------- */
  var css =
    '#timePicker,#timePop{display:none!important}' +              /* old hour/minute/AM-PM popups: never shown */
    '#timeText,#tourTime{cursor:pointer}' +
    '.time-drop{display:none;position:fixed;z-index:1000;width:150px;background:#fff;border:1px solid #e4dff0;' +
      'border-radius:18px;box-shadow:0 20px 44px rgba(53,35,89,.22);padding:2px 0 4px;overflow:hidden}' +
    '.time-drop.open{display:block}' +
    '.td-arrow{display:flex;align-items:center;justify-content:center;width:100%;height:24px;border:0;background:#fff;cursor:pointer;padding:0}' +
    '.td-arrow:before{content:"";border-left:6px solid transparent;border-right:6px solid transparent}' +
    '.td-up:before{border-bottom:8px solid #8b8a99}' +
    '.td-down:before{border-top:8px solid #8b8a99}' +
    '.td-arrow:hover:before{opacity:.65}' +
    '.td-list{position:relative;max-height:192px;overflow-y:auto;overscroll-behavior:contain;margin:0 8px;' +
      'scrollbar-width:thin;scrollbar-color:#c4c2cf transparent}' +
    '.td-list::-webkit-scrollbar{width:5px}.td-list::-webkit-scrollbar-thumb{background:#c4c2cf;border-radius:4px}' +
    '.td-opt{display:block;width:100%;border:0;border-bottom:1px solid #dcdae4;background:#f4f3f7;color:#5d5c70;' +
      'font-family:inherit;font-size:14px;font-weight:600;padding:9px 0;text-align:center;cursor:pointer}' +
    '.td-opt:hover{background:#ebe6f8}' +
    '.td-opt.sel{background:linear-gradient(135deg,#7c3aed,#6d24db);color:#fff;font-weight:800;border-bottom-color:transparent}';
  var st = document.createElement('style');
  st.id = 'time-dropdown-css';
  st.textContent = css;
  document.head.appendChild(st);

  /* ---------- markup ---------- */
  input.removeAttribute('onclick');                                 /* detach the old popup opener */
  input.setAttribute('aria-haspopup', 'listbox');
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('autocomplete', 'off');

  var drop = document.createElement('div');
  drop.className = 'time-drop';
  drop.id = 'timeDrop';
  drop.innerHTML =
    '<button type="button" class="td-arrow td-up" aria-label="Earlier times"></button>' +
    '<div class="td-list" id="timeList" role="listbox" aria-label="Pickup time"></div>' +
    '<button type="button" class="td-arrow td-down" aria-label="Later times"></button>';
  document.body.appendChild(drop);                                  /* on <body>: no parent's overflow:hidden / transform can clip it */

  var list = drop.querySelector('.td-list');

  function fmt(idx) {                                               /* slot index 0..95 -> "hh:mm AM" */
    var h24 = Math.floor(idx / 4), m = (idx % 4) * 15;
    var h = h24 % 12 || 12;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ' ' + (h24 >= 12 ? 'PM' : 'AM');
  }
  function snap(str) {                                              /* any "h:mm AM" (or now) -> next 15-min slot index */
    var t = String(str || '').match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i), h, m;
    if (t) { h = parseInt(t[1], 10) % 12; if (/pm/i.test(t[3])) h += 12; m = parseInt(t[2], 10); }
    else { var n = new Date(); h = n.getHours(); m = n.getMinutes(); }
    m = Math.ceil(m / 15) * 15;
    if (m === 60) { m = 0; h = (h + 1) % 24; }
    return h * 4 + m / 15;
  }

  var html = '';
  for (var i = 0; i < 96; i++) html += '<button type="button" class="td-opt" role="option" data-i="' + i + '">' + fmt(i) + '</button>';
  list.innerHTML = html;
  var opts = list.querySelectorAll('.td-opt');

  var current = 0;
  function setSlot(idx) {
    current = Math.max(0, Math.min(95, idx));
    input.value = fmt(current);
    for (var k = 0; k < opts.length; k++) {
      var on = k === current;
      opts[k].classList.toggle('sel', on);
      opts[k].setAttribute('aria-selected', on ? 'true' : 'false');
    }
  }
  function centerSelected() {
    var s = opts[current];
    list.scrollTop = s.offsetTop - (list.clientHeight - s.offsetHeight) / 2;
  }
  function isOpen() { return drop.classList.contains('open'); }
  function place() {
    /* position:fixed is relative to the viewport unless an ancestor has a transform/filter, in which case it
       is relative to that ancestor. Measure where (0,0) really is, then correct for it. */
    drop.style.left = '0px'; drop.style.top = '0px';
    var o = drop.getBoundingClientRect();
    var r = input.getBoundingClientRect(), h = drop.offsetHeight, w = drop.offsetWidth;
    var avail = window.innerHeight - r.bottom - 64;                 /* 64px ~ the sticky bottom bar */
    var up = avail < h && r.top > avail;
    var L = Math.max(8, Math.min(r.left + 10, window.innerWidth - w - 8));
    var T = Math.max(8, up ? r.top - h - 6 : r.bottom + 6);
    drop.style.left = (L - o.left) + 'px';
    drop.style.top = (T - o.top) + 'px';
  }
  function open() {
    drop.classList.add('open');
    place();
    centerSelected();
    input.setAttribute('aria-expanded', 'true');
  }
  function close() {
    drop.classList.remove('open');
    input.setAttribute('aria-expanded', 'false');
  }

  /* ---------- events ---------- */
  input.addEventListener('click', function () { isOpen() ? close() : open(); });
  list.addEventListener('click', function (e) {
    var b = e.target.closest('.td-opt');
    if (!b) return;
    setSlot(parseInt(b.getAttribute('data-i'), 10));
    close();
    input.focus();
  });
  drop.querySelector('.td-up').addEventListener('click', function () { list.scrollBy({ top: -120, behavior: 'smooth' }); });
  drop.querySelector('.td-down').addEventListener('click', function () { list.scrollBy({ top: 120, behavior: 'smooth' }); });
  document.addEventListener('click', function (e) { if (!field.contains(e.target) && !drop.contains(e.target)) close(); });
  drop.addEventListener('mousedown', function (e) { if (e.target.closest('.td-arrow,.td-opt')) e.preventDefault(); });  /* keep focus (purple outline) on the field */
  window.addEventListener('resize', function () { if (isOpen()) place(); });
  window.addEventListener('scroll', function (e) { if (isOpen() && e.target !== list) place(); }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen()) { open(); return; }
      setSlot(current + (e.key === 'ArrowDown' ? 1 : -1));
      centerSelected();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();                                           /* stop Enter from submitting the form */
      isOpen() ? close() : open();
    }
  });

  /* ---------- tour pages: click anywhere on the date field to open the calendar ---------- */
  var tourDate = document.getElementById('tourDate');
  if (tourDate && typeof tourDate.showPicker === 'function') {
    tourDate.addEventListener('click', function () { try { tourDate.showPicker(); } catch (e) {} });
  }

  /* ---------- initial value: keep whatever the page already put in the field, snapped to a slot ---------- */
  /* a ?time=... in the URL (results page) wins over the page's own parsing, which can't read zero-padded hours like "01:45 PM" */
  var qt = '';
  try { qt = new URLSearchParams(window.location.search).get('time') || ''; } catch (e) {}
  setSlot(snap(/\d{1,2}:\d{2}\s*(AM|PM)/i.test(qt) ? qt : input.value));
  /* results page: refresh the summary chip / WhatsApp link so they show the same normalised time */
  if (typeof renderTripBar === 'function') { try { renderTripBar(); } catch (e) {} }
  if (typeof updateWhatsAppLink === 'function') { try { updateWhatsAppLink(); } catch (e) {} }
})();
