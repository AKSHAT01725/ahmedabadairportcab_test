// route-template.js — shared across every *-taxi.html route page.
// Drives the "Request a Free Quote" modal, the success confirmation,
// and toast notices introduced with the new route-page structure.

function openRouteQuoteModal(){
  const modal = document.getElementById('routeQuoteModal');
  if(!modal) return;
  const meta = document.getElementById('routeMeta');
  const form = document.getElementById('routeQuoteForm');
  if(form && meta){
    form.reset();
    const pickup = document.getElementById('qPickup');
    const drop = document.getElementById('qDrop');
    if(pickup) pickup.value = meta.dataset.from || '';
    if(drop) drop.value = meta.dataset.to || '';
  }
  const titleEl = document.getElementById('qmTitle');
  if(titleEl && meta){ titleEl.textContent = 'Book ' + meta.dataset.from + ' to ' + meta.dataset.to; }
  modal.classList.add('open');
  document.body.classList.add('modal-locked');
}
function closeRouteQuoteModal(){
  const modal = document.getElementById('routeQuoteModal');
  if(modal){ modal.classList.remove('open'); }
  document.body.classList.remove('modal-locked');
}
function closeRouteSuccessModal(){
  const modal = document.getElementById('routeSuccessModal');
  if(modal){ modal.classList.remove('open'); }
  document.body.classList.remove('modal-locked');
}
function showRouteToast(msg){
  const t = document.getElementById('routeToast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window._routeToastTimer);
  window._routeToastTimer = setTimeout(() => t.classList.remove('show'), 3500);
}
window.openRouteQuoteModal = openRouteQuoteModal;
window.closeRouteQuoteModal = closeRouteQuoteModal;
window.closeRouteSuccessModal = closeRouteSuccessModal;

document.addEventListener('click', function(e){
  if(e.target && e.target.id === 'routeQuoteModal') closeRouteQuoteModal();
  if(e.target && e.target.id === 'routeSuccessModal') closeRouteSuccessModal();
});
document.addEventListener('keydown', function(e){
  if(e.key === 'Escape'){ closeRouteQuoteModal(); closeRouteSuccessModal(); }
});

document.addEventListener('DOMContentLoaded', function(){
  const form = document.getElementById('routeQuoteForm');
  if(!form) return;
  const meta = document.getElementById('routeMeta');
  const wa = '919724429334';

  function isoToday(){
    const d = new Date();
    const off = d.getTimezoneOffset();
    const local = new Date(d.getTime() - off * 60000);
    return local.toISOString().slice(0, 10);
  }
  const dateEl = document.getElementById('qDate');
  if(dateEl){ dateEl.min = isoToday(); }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    const name = document.getElementById('qName').value.trim();
    const phone = document.getElementById('qPhone').value.replace(/\D/g, '');
    const pickup = document.getElementById('qPickup').value.trim();
    const drop = document.getElementById('qDrop').value.trim();
    const date = document.getElementById('qDate').value;
    const time = document.getElementById('qTime').value;

    if(phone.length !== 10){
      showRouteToast('Please enter a valid 10-digit mobile number.');
      return;
    }
    if(!date || date < isoToday()){
      showRouteToast('Please select today or a future pickup date.');
      return;
    }

    const fare = meta ? (meta.dataset.fare || '') : '';
    const btn = document.getElementById('qSubmitBtn');
    if(btn){ btn.disabled = true; btn.textContent = 'Sending…'; }

    if(window.AACLeads){
      window.AACLeads.submit({
        type: 'tour', name, phone, from: pickup, to: drop, date, time,
        tourTitle: (meta ? meta.dataset.from + ' to ' + meta.dataset.to : pickup + ' to ' + drop) + ' — Quote Request'
      });
    }

    const niceDate = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const msg = 'Hello Ahmedabad Airport Cab, I would like a quote for this route.\n\nName: ' + name +
      '\nPickup: ' + pickup + '\nDestination: ' + drop + '\nPickup Date: ' + niceDate +
      '\nPickup Time: ' + time + '\nMobile Number: ' + phone +
      (fare ? '\nStarting Fare: ' + fare : '') +
      '\n\nPlease confirm vehicle availability and the final fare.';
    const waUrl = 'https://wa.me/' + wa + '?text=' + encodeURIComponent(msg);

    // Open WhatsApp synchronously, in direct response to the submit action.
    // Opening it inside a setTimeout breaks the user-gesture chain and gets
    // silently blocked as a popup by most browsers.
    window.open(waUrl, '_blank');

    closeRouteQuoteModal();
    const successModal = document.getElementById('routeSuccessModal');
    const successMsg = document.getElementById('routeSuccessMessage');
    if(successMsg){
      successMsg.innerHTML = 'Your quote request has been received. Our team will contact you shortly on <strong>' + phone + '</strong>. Redirecting you to WhatsApp…';
    }
    if(successModal){ successModal.classList.add('open'); document.body.classList.add('modal-locked'); }

    setTimeout(() => { closeRouteSuccessModal(); }, 2000);

    if(btn){ btn.disabled = false; btn.textContent = 'Send Quote Request'; }
  });
});
