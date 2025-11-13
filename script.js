/* Load posts from entries.json (always fresh from GitHub) */
let posts = {};

// ⚡ Change these values once — your GitHub username & repo
const username = "parmeshwarekah";
const repo = "blogs";
const path = "entries.json";

// ✅ Always fetch the latest version directly (bypasses caching)
const apiUrl = `https://raw.githubusercontent.com/${username}/${repo}/main/${path}?t=${Date.now()}`;

fetch(apiUrl, { cache: "no-store" })
  .then(res => {
    if (!res.ok) throw new Error("entries.json not found");
    return res.json();
  })
  .then(data => {
    posts = data;
    console.log("✅ Loaded posts from entries.json:", posts);

    populateMonthYearControls();
    buildCalendar(+monthSelect.value, +yearSelect.value);

    const dateToLoad = location.hash?.slice(1) || fmtLocal(new Date());
    renderPost(dateToLoad);
  })
  .catch(err => {
    console.error("⚠️ Failed to load entries.json, using localStorage fallback.", err);
    posts = JSON.parse(localStorage.getItem("journalPosts") || "{}");
    populateMonthYearControls();
    buildCalendar(+monthSelect.value, +yearSelect.value);
    const dateToLoad = location.hash?.slice(1) || fmtLocal(new Date());
    renderPost(dateToLoad);
  });

/* -------- DOM + UI -------- */
const el = s => document.querySelector(s);
const panel = el("#panel");
const hamb = el("#hamb");
const closeHamb = el("#closePanelBtn");
const monthSelect = el("#monthSelect");
const yearSelect = el("#yearSelect");
const calendar = el("#calendar");
const todayBtn = el("#todayBtn");
const postArea = el("#post");

function fmtLocal(d) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

function renderPost(dateKey) {
  const p = posts[dateKey];
  postArea.innerHTML = "";
  if (p) {
    postArea.innerHTML = `
      <h2>${p.title}</h2>
      <div class="timestamp">[${p.time} | ${dateKey}]</div>
      <p>${p.text.replace(/\n/g, "<br>")}</p>
      <p>— P.E.</p>
    `;
  } else {
    postArea.innerHTML = `
      <h2>No entry for this day</h2>
      <div class="timestamp">[${dateKey}]</div>
      <p>Silence — no words were placed here today.</p>
    `;
  }
}

/* Calendar utilities */
const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

function populateMonthYearControls() {
  const now = new Date();
  const startYear = 1970;
  const endYear = now.getFullYear() + 100;
  monthSelect.innerHTML = monthNames.map((m, i) => `<option value="${i}">${m}</option>`).join("");
  let opts = "";
  for (let y = startYear; y <= endYear; y++) {
    opts += `<option value="${y}">${y}</option>`;
  }
  yearSelect.innerHTML = opts;
  monthSelect.value = now.getMonth();
  yearSelect.value = now.getFullYear();
}

function buildCalendar(month, year) {
  calendar.innerHTML = "";
  const wk = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  wk.forEach(w => {
    const elw = document.createElement("div");
    elw.className = "weekday";
    elw.textContent = w;
    calendar.appendChild(elw);
  });

  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const todayStr = fmtLocal(new Date());

  for (let i = 0; i < startDay; i++) {
    const blank = document.createElement("div");
    blank.className = "day disabled";
    calendar.appendChild(blank);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dd = new Date(year, month, d);
    const key = fmtLocal(dd);
    const dayEl = document.createElement("button");
    dayEl.className = "day";
    dayEl.textContent = d;
    dayEl.setAttribute("data-key", key);
    if (key === todayStr) dayEl.classList.add("today");

    dayEl.addEventListener("click", () => {
      document.querySelectorAll(".day.selected").forEach(el => el.classList.remove("selected"));
      dayEl.classList.add("selected");
      togglePanel(false);
      location.hash = key;
      if (typeof loadEntriesForDate === "function") {
        loadEntriesForDate(key);
      } else {
        renderPost(key);
      }
    });

    calendar.appendChild(dayEl);
  }

  if (location.hash) {
    const sel = calendar.querySelector(`[data-key="${location.hash.slice(1)}"]`);
    if (sel) sel.classList.add("selected");
  }
}

/* Panel toggle */
function togglePanel(open) {
  if (open) {
    panel.classList.add("open");
    hamb.style.display = "none";
    closeHamb.style.display = "block";
    panel.setAttribute("aria-hidden", "false");
  } else {
    panel.classList.remove("open");
    hamb.style.display = "block";
    closeHamb.style.display = "none";
    panel.setAttribute("aria-hidden", "true");
  }
}

/* Events */
hamb.addEventListener("click", () => togglePanel(true));
closeHamb.addEventListener("click", () => togglePanel(false));
todayBtn.addEventListener("click", () => {
  const today = new Date();
  monthSelect.value = today.getMonth();
  yearSelect.value = today.getFullYear();
  buildCalendar(today.getMonth(), today.getFullYear());
});
monthSelect.addEventListener("change", () => buildCalendar(+monthSelect.value, +yearSelect.value));
yearSelect.addEventListener("change", () => buildCalendar(+monthSelect.value, +yearSelect.value));

populateMonthYearControls();
buildCalendar(+monthSelect.value, +yearSelect.value);
