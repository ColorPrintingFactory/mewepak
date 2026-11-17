const bookingForm = document.querySelector('[data-booking-form]');
const dateInput = document.querySelector('#booking-date');
const timezoneSelect = document.querySelector('#booking-timezone');
const slotGrid = document.querySelector('[data-slot-grid]');
const statusBox = document.querySelector('[data-form-status]');
let bookingConfig = null;
let turnstileWidget = null;

function showStatus(message, type='error') { statusBox.textContent=message; statusBox.className=`form-status show ${type}`; }
function setMinDate(){ const now=new Date(); const local=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,10); dateInput.min=local; dateInput.value=local; }

async function loadSlots(){
  const date=dateInput.value;
  bookingForm.elements.time.value='';
  slotGrid.innerHTML='<button class="slot" type="button" disabled>Loading…</button>';
  try {
    const response=await fetch(`/api/booking-slots?date=${encodeURIComponent(date)}`);
    const data=await response.json();
    if(!response.ok) throw new Error(data.error || 'Could not load available times.');
    bookingConfig=data;
    document.querySelector('[data-booking-title]').textContent=data.display_title || 'Meet with Mewepak';
    document.querySelector('[data-booking-location]').textContent=data.display_location || 'Zoom / Factory Visit';
    const zones=data.timezones || {'Asia/Shanghai':'UTC +08:00 China','America/New_York':'New York','Europe/London':'London','Asia/Dubai':'Dubai'};
    const previous=timezoneSelect.value;
    timezoneSelect.innerHTML=Object.entries(zones).map(([zone,label])=>`<option value="${zone}">${label}</option>`).join('');
    timezoneSelect.value=zones[previous] ? previous : (zones[Intl.DateTimeFormat().resolvedOptions().timeZone] ? Intl.DateTimeFormat().resolvedOptions().timeZone : Object.keys(zones)[0]);
    const durations=data.meeting_durations || [15,30];
    document.querySelector('[data-duration-options]').innerHTML=durations.map((d,i)=>`<label class="choice"><input type="radio" name="duration" value="${Number(d)}" ${i===0?'checked':''}><span>${Number(d)} minutes</span></label>`).join('');
    if(!data.slots?.length){slotGrid.innerHTML='<button class="slot" type="button" disabled>No availability</button>';return;}
    slotGrid.innerHTML=data.slots.map(slot=>`<button class="slot" type="button" data-slot="${slot}">${slot}</button>`).join('');
    slotGrid.querySelectorAll('[data-slot]').forEach(button=>button.addEventListener('click',()=>{slotGrid.querySelectorAll('.slot').forEach(x=>x.classList.remove('selected'));button.classList.add('selected');bookingForm.elements.time.value=button.dataset.slot;}));
  } catch(error){slotGrid.innerHTML='<button class="slot" type="button" disabled>Unavailable</button>';showStatus(error.message);}
}

async function configureTurnstile(){
  try{
    const response=await fetch('/api/config'); const config=await response.json();
    if(!config.turnstileSiteKey) return;
    const wait=()=>window.turnstile ? Promise.resolve() : new Promise(resolve=>setTimeout(()=>resolve(wait()),200));
    await wait();
    turnstileWidget=window.turnstile.render(document.querySelector('[data-turnstile]'),{sitekey:config.turnstileSiteKey,theme:'light'});
  }catch{}
}

bookingForm?.addEventListener('submit',async event=>{
  event.preventDefault(); statusBox.className='form-status';
  const data=new FormData(bookingForm); const token=window.turnstile && turnstileWidget!==null ? window.turnstile.getResponse(turnstileWidget) : '';
  if(!data.get('time')) return showStatus('Please choose an available time.');
  if(!token) return showStatus('Please complete the verification before booking.');
  const button=bookingForm.querySelector('[type="submit"]'); button.disabled=true; button.textContent='Booking…';
  try{
    const response=await fetch('/api/bookings',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({date:data.get('date'),time:data.get('time'),timezone:data.get('timezone'),duration:Number(data.get('duration')),meeting_type:data.get('meeting_type'),name:data.get('name'),company:data.get('company'),email:data.get('email'),phone:data.get('phone'),topic:data.get('topic'),turnstile_token:token})});
    const result=await response.json(); if(!response.ok) throw new Error(result.error || 'The booking could not be saved.');
    showStatus('Your consultation request has been received.','success'); bookingForm.reset(); setMinDate(); await loadSlots();
  }catch(error){showStatus(error.message); if(window.turnstile && turnstileWidget!==null) window.turnstile.reset(turnstileWidget);}
  finally{button.disabled=false;button.textContent='Book Consultation';}
});

dateInput?.addEventListener('change',loadSlots);
setMinDate(); loadSlots(); configureTurnstile();
