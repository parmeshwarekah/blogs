/* Simple data store: add posts here. Keys are YYYY-MM-DD */
const posts = {
  "2025-11-12": "[03:00] Read something interesting about ancient minds.",

  // add more entries here
};

const el = (s)=> document.querySelector(s);
const panel = el('#panel');
const hamb = el('#hamb');
const closePanel = el('#closePanel');
const monthSelect = el('#monthSelect');
const yearSelect = el('#yearSelect');
const calendar = el('#calendar');
const todayBtn = el('#todayBtn');
const postArea = el('#post');

function fmt(d){
  return d.toISOString().slice(0,10); // YYYY-MM-DD
}

function renderPost(dateKey){
  const p = posts[dateKey];
  postArea.innerHTML = '';
  if(p){
    postArea.innerHTML = `<h2>${p.title}</h2>
      <div class="timestamp">[${p.time} | ${dateKey}]</div>
      <p>${p.text.replace(/\n/g,'<br>')}</p>
      <p>— P.E.</p>`;
  } else {
    postArea.innerHTML = `<h2>No entry for this day</h2>
      <div class="timestamp">[${dateKey}]</div>
      <p>Silence — no words were placed here today.</p>`;
  }
}

/* calendar utilities */
const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
function populateMonthYearControls(){
  const now = new Date();
  const startYear = now.getFullYear() - 2; // adjustable history
  monthSelect.innerHTML = monthNames.map((m,i)=>`<option value="${i}">${m}</option>`).join('');
  let opts = '';
  for(let y = startYear; y <= now.getFullYear()+1; y++){
    opts += `<option value="${y}">${y}</option>`;
  }
  yearSelect.innerHTML = opts;
  monthSelect.value = now.getMonth();
  yearSelect.value = now.getFullYear();
}

function buildCalendar(month, year){
  calendar.innerHTML = '';
  // weekdays header
  const wk = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  wk.forEach(w=> { const elw = document.createElement('div'); elw.className='weekday'; elw.textContent = w; calendar.appendChild(elw); });

  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();

  // pad blanks
  for(let i=0;i<startDay;i++){
    const blank = document.createElement('div'); blank.className='day disabled'; blank.textContent='';
    calendar.appendChild(blank);
  }

  const todayStr = fmt(new Date());

  for(let d=1; d<=daysInMonth; d++){
    const dd = new Date(year, month, d);
    const key = dd.toISOString().slice(0,10);
    const dayEl = document.createElement('button');
    dayEl.className = 'day';
    dayEl.textContent = d;
    dayEl.setAttribute('data-key', key);
    dayEl.setAttribute('aria-label', `${d} ${monthNames[month]} ${year}`);
    if(key === todayStr) dayEl.classList.add('today');

    // mark if exists
    if(!posts[key]) { /* leave as is, optional style to indicate empty */ }

    dayEl.addEventListener('click', ()=>{
      renderPost(key);
      closePanel.click();
      // update URL hash for direct linking
      location.hash = key;
    });

    calendar.appendChild(dayEl);
  }
}

/* events */
hamb.addEventListener('click', ()=>{ panel.classList.add('open'); panel.setAttribute('aria-hidden','false'); });
closePanel.addEventListener('click', ()=>{ panel.classList.remove('open'); panel.setAttribute('aria-hidden','true'); });
todayBtn.addEventListener('click', ()=> {
  const today = new Date();
  monthSelect.value = today.getMonth();
  yearSelect.value = today.getFullYear();
  buildCalendar(today.getMonth(), today.getFullYear());
});

/* update calendar when selects change */
monthSelect.addEventListener('change', ()=> buildCalendar(+monthSelect.value, +yearSelect.value));
yearSelect.addEventListener('change', ()=> buildCalendar(+monthSelect.value, +yearSelect.value));

/* initialize */
populateMonthYearControls();
buildCalendar(+monthSelect.value, +yearSelect.value);

/* load todays post or post from url-hash */
(function initLoad(){
  let dateToLoad = null;
  if(location.hash && /^#\d{4}-\d{2}-\d{2}$/.test(location.hash)){
    dateToLoad = location.hash.slice(1);
  } else {
    dateToLoad = fmt(new Date());
  }
  // if date not in this month selection, update selects to match
  const d = new Date(dateToLoad);
  if(!isNaN(d)){
    monthSelect.value = d.getMonth();
    yearSelect.value = d.getFullYear();
    buildCalendar(d.getMonth(), d.getFullYear());
    // highlight today's or the chosen day by focusing
    const chosen = calendar.querySelector(`[data-key="${dateToLoad}"]`);
    if(chosen) chosen.focus();
  }
  renderPost(dateToLoad);
})();

/* optional: close panel on outside click */
window.addEventListener('click',(e)=>{
  if(panel.classList.contains('open') && !panel.contains(e.target) && e.target !== hamb){
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden','true');
  }
});
