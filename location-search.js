/* Ahmedabad Airport Cab — From/To autocomplete + swap.
   Runs entirely offline against window.AAC_LOCATIONS (india-locations.js). */
(function () {
  var LABEL = { state: 'State', ut: 'Union Territory', district: 'District', city: 'City / Town', airport: 'Airport' };
  // Gujarat first, then the states this service runs to most often.
  var STATE_BOOST = {
    'Gujarat': 0, 'Rajasthan': 1, 'Maharashtra': 2, 'Madhya Pradesh': 3,
    'Delhi': 4, 'Goa': 5, 'Uttar Pradesh': 6, 'Haryana': 7
  };
  var TYPE_BOOST = { city: 1, district: 1, airport: 2, state: 3, ut: 3 };
  // Places people actually book to — surfaced above same-tier matches.
  var PROMINENT = {};
  ('Ahmedabad|Vadodara|Surat|Rajkot|Bhavnagar|Jamnagar|Gandhinagar|Gandhidham|Bhuj|Junagadh|Anand|Nadiad|Mehsana|Bharuch|Ankleshwar|Vapi|Valsad|Navsari|Morbi|Porbandar|Dwarka|Somnath|Diu|Kevadiya|Statue of Unity|Ambaji|Palitana|Sasan Gir|Kutch|'
 +'Mumbai|Pune|Nashik|Shirdi|Nagpur|Navi Mumbai|Thane|Lonavala|Mahabaleshwar|'
 +'Jaipur|Udaipur|Jodhpur|Mount Abu|Ajmer|Pushkar|Jaisalmer|Bikaner|Kota|Nathdwara|Khatu Shyam|Ramdevra|Kumbhalgarh|Sri Ganganagar|Nagaur|Pali|Balotra|Beawar|Jalore|Sojat|'
 +'Delhi|Gurugram|Noida|Chandigarh|Amritsar|Ludhiana|'
 +'Indore|Bhopal|Ujjain|Jabalpur|Gwalior|Omkareshwar|Khajuraho|'
 +'Bengaluru|Hyderabad|Chennai|Kolkata|Goa|Panaji|Kochi|Lucknow|Varanasi|Agra|Mathura|Ayodhya|Prayagraj|Haridwar|Rishikesh|Dehradun|Shimla|Manali|Jammu|Srinagar|Katra'
 ).split('|').forEach(function (n, i) { PROMINENT[n.toLowerCase()] = i; });

  function isSubsequence(q, s) {
    var i = 0;
    for (var j = 0; j < s.length && i < q.length; j++) if (s[j] === q[i]) i++;
    return i === q.length;
  }

  function score(o, q) {
    var n = o.ln, tier = -1;
    if (n === q) tier = 0;
    else if (n.indexOf(q) === 0) tier = 1;
    else if (o.words.some(function (w) { return w.indexOf(q) === 0; })) tier = 2;
    else if (o.la.some(function (a) { return a.indexOf(q) === 0; })) tier = 2;
    else if (n.indexOf(q) > -1) tier = 3;
    else if (o.la.some(function (a) { return a.indexOf(q) > -1; })) tier = 4;
    else if (q.length >= 2 && isSubsequence(q, n)) tier = 5;
    if (tier < 0) return null;
    var sb = STATE_BOOST[o.s !== '' ? o.s : o.n];
    if (sb === undefined) sb = 9;
    var tb = TYPE_BOOST[o.t];
    if (tb === undefined) tb = 4;
    var pi = PROMINENT[n];
    var pr = pi === undefined ? 120 : pi * 0.4;
    return tier * 1000 + pr + sb * 30 + tb * 8 + Math.min(o.n.length, 30) / 60;
  }

  window.AACSearchLocations = function (q, limit) {
    q = (q || '').trim().toLowerCase();
    if (q.length < 1) return [];
    var data = window.AAC_LOCATIONS || [], out = [];
    for (var i = 0; i < data.length; i++) {
      var sc = score(data[i], q);
      if (sc !== null) out.push({ o: data[i], sc: sc });
    }
    out.sort(function (a, b) { return a.sc - b.sc; });
    return out.slice(0, limit || 10).map(function (r) {
      return { name: r.o.n, type: r.o.t, label: LABEL[r.o.t] || 'Location', state: r.o.s };
    });
  };

  // ---- UI wiring -------------------------------------------------------
  function esc(v) {
    return String(v).replace(/[&<>'"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c];
    });
  }

  function boxFor(k) { return document.getElementById(k + 'Suggest'); }

  window.closeSuggest = function (k) {
    var b = boxFor(k);
    if (b) b.classList.remove('open');
  };

  function render(k, q) {
    var box = boxFor(k);
    if (!box) return;
    var res = window.AACSearchLocations(q, 10);
    box.innerHTML = '';
    if (!res.length) {
      box.innerHTML = '<div style="padding:12px;color:#777;font-size:12.5px">No match found. You can still use the place you typed.</div>';
      box.classList.add('open');
      return;
    }
    res.forEach(function (r) {
      var sub = r.state && r.state !== r.name ? r.label + ' · ' + r.state : r.label;
      var b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = '<strong>' + esc(r.name) + '</strong><small>' + esc(sub) + '</small>';
      b.addEventListener('mousedown', function (e) { e.preventDefault(); });
      b.onclick = function () {
        var input = document.getElementById(k);
        input.value = r.name;
        window.closeSuggest(k);
        input.dispatchEvent(new Event('change', { bubbles: true }));
      };
      box.appendChild(b);
    });
    box.classList.add('open');
  }

  // keep the old name working for any inline handlers still on the page
  window.search = function (k, q) { render(k, q); };

  window.swapLocations = function () {
    var a = document.getElementById('from'), b = document.getElementById('to');
    if (!a || !b) return;
    var tmp = a.value; a.value = b.value; b.value = tmp;
    window.closeSuggest('from'); window.closeSuggest('to');
    a.dispatchEvent(new Event('change', { bubbles: true }));
    b.dispatchEvent(new Event('change', { bubbles: true }));
    var btn = document.querySelector('.swap');
    if (btn) { btn.classList.remove('spun'); void btn.offsetWidth; btn.classList.add('spun'); }
  };

  function init() {
    ['from', 'to'].forEach(function (k) {
      var i = document.getElementById(k);
      if (!i || i.dataset.aacBound) return;
      i.dataset.aacBound = '1';
      i.setAttribute('autocomplete', 'off');
      i.addEventListener('input', function () { render(k, i.value); });
      i.addEventListener('focus', function () { if (i.value.trim()) render(k, i.value); });
      i.addEventListener('keydown', function (e) {
        var box = boxFor(k);
        if (!box || !box.classList.contains('open')) return;
        var items = [].slice.call(box.querySelectorAll('button'));
        if (!items.length) return;
        var cur = items.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') { e.preventDefault(); (items[cur + 1] || items[0]).focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); (items[cur - 1] || items[items.length - 1]).focus(); }
        else if (e.key === 'Enter' && cur === -1) { e.preventDefault(); items[0].click(); }
        else if (e.key === 'Escape') { window.closeSuggest(k); }
      });
    });

    var btn = document.querySelector('.swap');
    if (btn && !btn.dataset.aacBound) {
      btn.dataset.aacBound = '1';
      btn.type = 'button';
      btn.addEventListener('click', function (e) { e.preventDefault(); window.swapLocations(); });
    }

    document.addEventListener('click', function (e) {
      ['from', 'to'].forEach(function (k) {
        var i = document.getElementById(k);
        if (!i) return;
        var f = i.closest('.field');
        if (f && !f.contains(e.target)) window.closeSuggest(k);
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
