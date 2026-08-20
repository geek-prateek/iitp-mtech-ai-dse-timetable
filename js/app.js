let currentFilter = "all";
let selectedProgram = localStorage.getItem("iitp-ai-dse-program") || "mtech-ai-dse";
let storedElective = localStorage.getItem("iitp-ai-dse-elective");

// Backward compatibility: if storedElective is a full name, map it to an ID
if (storedElective && storedElective.length > 5) {
  if (storedElective.includes("Computational")) storedElective = "cda";
  else if (storedElective.includes("Pattern")) storedElective = "pr";
  else if (storedElective.includes("Machine")) storedElective = "aml";
  else storedElective = null;
}
let selectedElective = storedElective || "cda";

const timetableEl = document.getElementById("timetable");
const courseGridEl = document.getElementById("courseGrid");
const todayTitleEl = document.getElementById("todayTitle");
const todayClassesEl = document.getElementById("todayClasses");
const programSelectEl = document.getElementById("programSelect");
const electiveSelectEl = document.getElementById("electiveSelect");

function initSelectors() {
  programSelectEl.innerHTML = PROGRAMS.map(p => 
    `<option value="${p.id}">${p.name}</option>`
  ).join("");
  
  programSelectEl.value = selectedProgram;
  updateElectiveOptions();
}

function updateElectiveOptions() {
  const program = PROGRAMS.find(p => p.id === selectedProgram);
  const electives = program ? program.electives : [];
  
  electiveSelectEl.innerHTML = electives.map(id => {
    const c = getCourse(id);
    return `<option value="${c.id}">${c.name}</option>`;
  }).join("");
  
  // If current elective is not in this program's electives, default to the first one
  if (!electives.includes(selectedElective)) {
    selectedElective = electives[0] || "";
    localStorage.setItem("iitp-ai-dse-elective", selectedElective);
  }
  
  electiveSelectEl.value = selectedElective;
}

function getCourse(id) {
  return COURSES.find(course => course.id === id);
}

function getToday() {
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
}

function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getHoliday(date = new Date()) {
  return HOLIDAYS.find(holiday => holiday.date === getDateKey(date));
}

function parseClockTime(value) {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3].toUpperCase();

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return (hours * 60) + minutes;
}

function parseTimeRange(time) {
  const parts = time.split(/\s*[–-]\s*/);
  if (parts.length !== 2) return null;

  const start = parseClockTime(parts[0]);
  const end = parseClockTime(parts[1]);

  if (start === null || end === null) return null;
  return { start, end };
}

function formatClockTime(totalMinutes) {
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;

  return `${hours12}:${String(minutes).padStart(2, "0")} ${period}`;
}

function formatTimeRange(start, end) {
  return `${formatClockTime(start)} - ${formatClockTime(end)}`;
}

function buildTimetableRows(displayTimes) {
  const rows = [];
  let latestEnd = null;

  displayTimes.forEach(time => {
    const range = parseTimeRange(time);

    if (range && latestEnd !== null && range.start > latestEnd) {
      rows.push({
        type: "gap",
        time: formatTimeRange(latestEnd, range.start)
      });
    }

    rows.push({ type: "class", time });

    if (range) {
      latestEnd = latestEnd === null ? range.end : Math.max(latestEnd, range.end);
    }
  });

  return rows;
}

function getMeetingUrl(course) {
  return course.moodleUrl;
}

function renderCourseLinks(course) {
  if (!course.moodleUrl) return `<span class="join-btn disabled">Moodle link unavailable</span>`;
  return `<a class="join-btn" target="_blank" rel="noopener" href="${course.moodleUrl}">Join on Moodle</a>`;
}

function renderImportantLinks() {
  const grid = document.getElementById("importantLinksGrid");
  if (!grid) return;
  grid.innerHTML = IMPORTANT_LINKS.map(link => `
    <a class="important-link-card" href="${link.url}" target="_blank" rel="noopener noreferrer">
      <span class="important-link-icon" aria-hidden="true">${link.icon}</span>
      <span class="important-link-label">${link.label}</span>
    </a>
  `).join("");
}

function updateHeaders() {
  const program = PROGRAMS.find(p => p.id === selectedProgram);
  if (program) {
    document.getElementById("programTitle").textContent = program.shortName;
    document.title = `IIT Patna — ${program.shortName} | 2026-27`;
  }
}

function renderTimetable() {
  timetableEl.innerHTML = "";
  
  // Calculate active times for the current program/elective
  const activeTimes = new Set();
  
  SCHEDULE.forEach(item => {
    const course = getCourse(item.course);
    if (!course) return;
    
    // Only consider courses that are regular or the currently selected elective
    if (course.type === "regular" || course.id === selectedElective) {
      activeTimes.add(item.time);
    }
  });
  
  // Filter TIMES to only include active ones, preserving chronological order
  const displayTimes = TIMES.filter(time => activeTimes.has(time));
  const timetableRows = buildTimetableRows(displayTimes);

  if (displayTimes.length === 0) {
     timetableEl.innerHTML = "<div class='muted' style='padding: 20px;'>No classes scheduled for the selected courses.</div>";
     return;
  }

  const timeHeader = document.createElement("div");
  timeHeader.className = "time-head";
  timeHeader.textContent = "TIME";
  timetableEl.appendChild(timeHeader);

  const today = getToday();
  const holiday = getHoliday();

  DAYS.forEach(day => {
    const header = document.createElement("div");
    const isHolidayToday = day === today && holiday;
    header.className = `grid-head ${day === today ? "today" : ""} ${isHolidayToday ? "holiday" : ""}`;
    header.textContent = isHolidayToday ? `${day} Holiday` : day;
    timetableEl.appendChild(header);
  });

  timetableRows.forEach(row => {
    const timeEl = document.createElement("div");
    timeEl.className = `time-head ${row.type === "gap" ? "gap" : ""}`;
    timeEl.textContent = row.time;
    timetableEl.appendChild(timeEl);

    DAYS.forEach(day => {
      const slot = document.createElement("div");

      if (row.type === "gap") {
        slot.className = "slot gap";
        slot.textContent = "—";
        timetableEl.appendChild(slot);
        return;
      }

      if (day === today && holiday) {
        slot.className = "slot holiday";
        slot.innerHTML = `
          <div class="slot-title">Holiday</div>
          <div class="slot-code">${holiday.name}</div>
        `;
        timetableEl.appendChild(slot);
        return;
      }
    
      if (day === "Friday") {
        slot.className = "slot leave";
        slot.textContent = "FULL DAY LEAVE";
        timetableEl.appendChild(slot);
        return;
      }
    
      // Find a schedule item that matches the day, time, and is either regular or the selected elective
      const item = SCHEDULE.find(s => s.day === day && s.time === row.time && (getCourse(s.course).type === "regular" || s.course === selectedElective));
    
      if (!item) {
        slot.className = "slot empty";
        slot.textContent = "—";
        timetableEl.appendChild(slot);
        return;
      }

      const course = getCourse(item.course);
      slot.className = `slot ${course.type} ${item.showLabTag ? "lab" : ""}`;

      if (currentFilter !== "all" && course.type !== currentFilter) {
        slot.classList.add("dimmed");
      }

      if (course.type === "elective") {
        slot.classList.add("selected-elective");
      }

      slot.innerHTML = `
        <div class="slot-title">${course.shortName}</div>
        <div class="slot-code">${course.code}</div>
        <div class="slot-prof">${course.professor}</div>
        <div class="slot-time">${item.time}</div>
        ${item.showLabTag ? '<span class="badge">Lab</span>' : ''}
      `;

      slot.addEventListener("click", () => {
        const url = getMeetingUrl(course);
        if (url) window.open(url, "_blank", "noopener,noreferrer");
      });

      timetableEl.appendChild(slot);
    });
  });
}

function renderCourses() {
  courseGridEl.innerHTML = "";
  
  const program = PROGRAMS.find(p => p.id === selectedProgram);
  const programElectives = program ? program.electives : [];

  COURSES.forEach(course => {
    // Only render regular courses and electives that belong to this program
    if (course.type === "elective" && !programElectives.includes(course.id)) return;

    const card = document.createElement("article");
    card.className = `course-card ${course.type}`;

    if (!course.moodleUrl) {
      card.classList.add("disabled");
    }

    card.innerHTML = `
      <div class="course-type">${course.type === "regular" ? "Regular Course" : "Elective Course"}</div>
      <h3>${course.name}</h3>
      <div class="course-code">${course.code}</div>
      <div class="course-prof">👨‍🏫 ${course.professor}</div>
      <div class="link-row">
        ${renderCourseLinks(course)}
      </div>
    `;

    courseGridEl.appendChild(card);
  });
}

function renderToday() {
  const today = getToday();
  const holiday = getHoliday();
  todayTitleEl.textContent = holiday ? `${today} Holiday` : today;

  if (holiday) {
    todayClassesEl.innerHTML = `
      <div class="today-item holiday">
        <strong>${holiday.name}</strong>
        <span>No classes scheduled today</span>
      </div>
    `;
    return;
  }

  if (today === "Friday") {
    todayClassesEl.innerHTML = `
      <div class="today-item">
        <strong>Full Day Leave</strong>
        <span>No classes scheduled</span>
      </div>
    `;
    return;
  }

  const todaySchedule = SCHEDULE
    .filter(item => item.day === today && (getCourse(item.course).type === "regular" || item.course === selectedElective))
    .map(item => ({ item, course: getCourse(item.course) }));

  if (!todaySchedule.length) {
    todayClassesEl.innerHTML = `<div class="muted">No classes scheduled today.</div>`;
    return;
  }

  // Sort them by time order based on the TIMES array index
  todaySchedule.sort((a, b) => TIMES.indexOf(a.item.time) - TIMES.indexOf(b.item.time));

  todayClassesEl.innerHTML = todaySchedule.map(({ item, course }) => `
    <div class="today-item">
      <strong>${item.time}</strong>
      <span>${course.shortName}${item.showLabTag ? " · Lab" : ""}</span>
    </div>
  `).join("");
}

function renderAll() {
  updateHeaders();
  renderImportantLinks();
  renderTimetable();
  renderCourses();
  renderToday();
}

document.querySelectorAll("[data-filter]").forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    renderTimetable();
  });
});

programSelectEl.addEventListener("change", event => {
  selectedProgram = event.target.value;
  localStorage.setItem("iitp-ai-dse-program", selectedProgram);
  updateElectiveOptions();
  renderAll();
});

electiveSelectEl.addEventListener("change", event => {
  selectedElective = event.target.value;
  localStorage.setItem("iitp-ai-dse-elective", selectedElective);
  renderAll();
});

document.getElementById("todayBtn").addEventListener("click", () => {
  const today = getToday();
  const header = [...document.querySelectorAll(".grid-head")].find(el => el.textContent.startsWith(today));
  if (header) header.scrollIntoView({ behavior: "smooth", inline: "center", block: "start" });
});

document.querySelector('[data-filter="all"]').classList.add("active");

initSelectors();
renderAll();
