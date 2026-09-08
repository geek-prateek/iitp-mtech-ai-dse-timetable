let currentFilter = "all";
let selectedProgram = localStorage.getItem("iitp-ai-dse-program") || "mtech-ai-dse";
let storedElective = localStorage.getItem("iitp-ai-dse-elective");

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

let RESOURCES = [];

function initSelectors() {
  programSelectEl.innerHTML = PROGRAMS.map(p => `<option value="${p.id}">${p.name}</option>`).join("");
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
      rows.push({ type: "gap", time: formatTimeRange(latestEnd, range.start) });
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

function getEffectiveCourseType(course, programId) {
  if (programId === "ms-aics") {
    if (course.id === "fcs") return "none";
    if (course.id === "acs") return "regular";
  }
  return course.type;
}

function renderTimetable() {
  timetableEl.innerHTML = "";
  
  const program = PROGRAMS.find(p => p.id === selectedProgram);
  const programElectives = program ? program.electives : [];
  
  const isVisibleTimetableCourse = course => {
    const type = getEffectiveCourseType(course, selectedProgram);
    return type === "regular" || (type === "elective" && programElectives.includes(course.id));
  };

  const activeTimes = new Set();
  SCHEDULE.forEach(item => {
    const course = getCourse(item.course);
    if (!course) return;
    if (isVisibleTimetableCourse(course)) activeTimes.add(item.time);
  });
  
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

  timetableRows.forEach((row, rowIndex) => {
    const timeEl = document.createElement("div");
    timeEl.className = `time-head ${row.type === "gap" ? "gap" : ""}`;
    timeEl.textContent = row.time;
    timetableEl.style.gridRow = `${rowIndex + 2}`;
    timetableEl.style.gridColumn = "1";
    timetableEl.appendChild(timeEl);

    DAYS.forEach((day, dayIndex) => {
      const slot = document.createElement("div");
      
      if (day === today && holiday) {
        if (rowIndex === 0) {
          slot.className = "slot holiday";
          slot.style.gridRow = `2 / span ${timetableRows.length}`;
          slot.style.gridColumn = `${dayIndex + 2}`;
          slot.style.display = "flex";
          slot.style.flexDirection = "column";
          slot.style.alignItems = "center";
          slot.style.justifyContent = "center";
          slot.style.padding = "0 10px";
          slot.style.textAlign = "center";
          slot.innerHTML = `
            <div class="slot-title" style="font-size: 18px; margin-bottom: 8px;">🎉 Holiday</div>
            <div class="slot-code" style="font-size: 14px; word-break: break-word; overflow-wrap: break-word; max-width: 100%; line-height: 1.4;">${holiday.name}</div>
          `;
          timetableEl.appendChild(slot);
        }
        return;
      }
    
      if (day === "Friday") {
        if (rowIndex === 0) {
          slot.className = "slot leave";
          slot.style.gridRow = `2 / span ${timetableRows.length}`;
          slot.style.gridColumn = `${dayIndex + 2}`;
          slot.style.display = "flex";
          slot.style.alignItems = "center";
          slot.style.justifyContent = "center";
          slot.innerHTML = `
            <div style="writing-mode: vertical-rl; text-orientation: mixed; letter-spacing: 6px; font-size: 18px; font-weight: 900; color: #94a3b8; text-transform: uppercase;">Full Day Leave</div>
          `;
          timetableEl.appendChild(slot);
        }
        return;
      }

      if (row.type === "gap") {
        slot.className = "slot gap";
        slot.textContent = "—";
        timetableEl.appendChild(slot);
        return;
      }

      const items = SCHEDULE
        .filter(s => s.day === day && s.time === row.time)
        .map(item => ({ item, course: getCourse(item.course) }))
        .filter(({ course }) => course && isVisibleTimetableCourse(course));
    
      if (!items.length) {
        slot.className = "slot empty";
        slot.textContent = "—";
        timetableEl.appendChild(slot);
        return;
      }

      const selectedItem = items.find(({ course }) => course.id === selectedElective) || items[0];
      const { item, course } = selectedItem;
      const effectiveType = getEffectiveCourseType(course, selectedProgram);
      slot.className = `slot ${effectiveType} ${item.showLabTag ? "lab" : ""}`;
      slot.dataset.course = course.id;
      slot.dataset.time = item.time;
      slot.dataset.day = day;

      if (
        (currentFilter !== "all" && effectiveType !== currentFilter) ||
        (effectiveType === "elective" && course.id !== selectedElective)
      ) {
        slot.classList.add("dimmed");
      }

      if (effectiveType === "elective" && course.id === selectedElective) {
        slot.classList.add("selected-elective");
      }
      
      if (item.cancelled) {
        slot.classList.add("cancelled");
      }

      slot.innerHTML = `
        <div class="slot-title" style="${item.cancelled ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${course.shortName}</div>
        <div class="slot-code">${course.code}</div>
        <div class="slot-prof">${course.professor}</div>
        <div class="slot-time">${item.time}</div>
        ${item.showLabTag ? '<span class="badge">Lab</span>' : ''}
        ${item.cancelled ? '<span class="badge" style="background: #dc2626; color: white;">Cancelled</span>' : ''}
      `;

      slot.addEventListener("click", () => {
        const url = getMeetingUrl(selectedItem.course);
        if (url) window.open(url, "_blank", "noopener,noreferrer");
      });

      timetableEl.appendChild(slot);
    });
  });
}

function getAttendance(courseId) {
  const data = localStorage.getItem(`attendance_${courseId}`);
  return data ? JSON.parse(data) : { attended: 0, missed: 0 };
}

window.updateAttendance = function(courseId, type, delta) {
  const data = getAttendance(courseId);
  data[type] = Math.max(0, data[type] + delta);
  localStorage.setItem(`attendance_${courseId}`, JSON.stringify(data));
  renderCourses();
};

function renderCourses() {
  courseGridEl.innerHTML = "";
  
  const program = PROGRAMS.find(p => p.id === selectedProgram);
  const programElectives = program ? program.electives : [];

  COURSES.forEach(course => {
    const effectiveType = getEffectiveCourseType(course, selectedProgram);
    if (effectiveType === "none" || (effectiveType === "elective" && !programElectives.includes(course.id))) return;

    const card = document.createElement("article");
    card.className = `course-card ${effectiveType}`;

    if (!course.moodleUrl) card.classList.add("disabled");

    const att = getAttendance(course.id);
    const total = att.attended + att.missed;
    const percent = total === 0 ? 0 : Math.round((att.attended / total) * 100);

    // Get Assignments for this course
    const courseAssignments = (window.ASSIGNMENTS || []).filter(a => a.courseId === course.id);
    let assignmentBtnHtml = "";
    if (courseAssignments.length > 0) {
      assignmentBtnHtml = `<button class="join-btn secondary" onclick="openAssignmentsModal('${course.id}')">Assignments (${courseAssignments.length})</button>`;
    }

    card.innerHTML = `
      <div class="course-type">${effectiveType === "regular" ? "Regular Course" : "Elective Course"}</div>
      <h3>${course.name}</h3>
      <div class="course-code">${course.code}</div>
      <div class="course-prof">👨‍🏫 ${course.professor}</div>
      <div class="link-row">
        ${renderCourseLinks(course)}
        ${assignmentBtnHtml}
      </div>
      <div class="attendance-tracker">
        <div class="attendance-header">
          <span>Attendance: <strong>${percent}%</strong></span>
          <span style="font-size: 11px; color: var(--muted);">${att.attended}/${total} classes</span>
        </div>
        <div class="attendance-controls">
          <div class="attendance-btn-group">
            <button class="att-btn" onclick="updateAttendance('${course.id}', 'attended', -1)">-</button>
            <span class="att-label green">Attended: ${att.attended}</span>
            <button class="att-btn" onclick="updateAttendance('${course.id}', 'attended', 1)">+</button>
          </div>
          <div class="attendance-btn-group">
            <button class="att-btn" onclick="updateAttendance('${course.id}', 'missed', -1)">-</button>
            <span class="att-label red">Missed: ${att.missed}</span>
            <button class="att-btn" onclick="updateAttendance('${course.id}', 'missed', 1)">+</button>
          </div>
        </div>
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
    todayClassesEl.innerHTML = `<div class="today-item holiday"><strong>${holiday.name}</strong><span>No classes scheduled today</span></div>`;
    return;
  }
  if (today === "Friday") {
    todayClassesEl.innerHTML = `<div class="today-item"><strong>Full Day Leave</strong><span>No classes scheduled</span></div>`;
    return;
  }

  const todaySchedule = SCHEDULE
    .filter(item => {
      const course = getCourse(item.course);
      if (!course) return false;
      const effectiveType = getEffectiveCourseType(course, selectedProgram);
      return item.day === today && (effectiveType === "regular" || item.course === selectedElective);
    })
    .map(item => ({ item, course: getCourse(item.course) }));

  if (!todaySchedule.length) {
    todayClassesEl.innerHTML = `<div class="muted">No classes scheduled today.</div>`;
    return;
  }

  todaySchedule.sort((a, b) => TIMES.indexOf(a.item.time) - TIMES.indexOf(b.item.time));

  todayClassesEl.innerHTML = todaySchedule.map(({ item, course }) => `
    <div class="today-item" style="${item.cancelled ? 'opacity: 0.6;' : ''}" onclick="scrollToTimetableClass('${course.id}', '${item.time}', '${today}')">
      <strong>${item.time}</strong>
      <span style="${item.cancelled ? 'text-decoration: line-through;' : ''}">${course.shortName}${item.showLabTag ? " · Lab" : ""}</span>
      ${item.cancelled ? '<span style="color: #dc2626; font-weight: bold; margin-left: auto;">Cancelled</span>' : ''}
    </div>
  `).join("");
}

function renderNotification() {
  const banner = document.querySelector(".notification-banner");
  if (!banner) return;
  if (window.NOTIFICATION && window.NOTIFICATION.trim() !== "") {
    banner.textContent = window.NOTIFICATION;
    banner.style.display = "flex";
  } else {
    banner.style.display = "none";
  }
}

async function fetchResources() {
  try {
    const res = await fetch("https://iitp-timetable-admin-eight.vercel.app/api/resources", { cache: "no-store" });
    if (res.ok) {
      RESOURCES = await res.json();
      renderResources();
    }
  } catch (error) {
    console.error("Failed to fetch resources.", error);
    const grid = document.getElementById("resourceGrid");
    if (grid) grid.innerHTML = "<p class='muted'>Failed to load resources. Try again later.</p>";
  }
}

function renderResources() {
  const grid = document.getElementById("resourceGrid");
  if (!grid) return;
  if (RESOURCES.length === 0) {
    grid.innerHTML = "<p class='muted'>No resources shared yet. Be the first to share!</p>";
    return;
  }

  const grouped = {};
  RESOURCES.forEach(res => {
    const subj = res.subject || "General";
    if (!grouped[subj]) grouped[subj] = [];
    grouped[subj].push(res);
  });

  let html = "";
  for (const [subject, items] of Object.entries(grouped)) {
    html += `
      <div style="grid-column: 1 / -1; margin-top: 10px; padding-bottom: 8px; border-bottom: 2px solid var(--border);">
        <h3 style="margin: 0; color: var(--navy); font-size: 18px;">${subject}</h3>
      </div>
    `;
    html += items.map(res => `
      <article class="course-card" style="display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: start; gap: 10px;">
          <h3 style="margin: 0; font-size: 15px; line-height: 1.3;">
            <a href="${res.url}" target="_blank" style="text-decoration: none; color: var(--text);">${res.title}</a>
          </h3>
          <span class="badge" style="margin: 0; flex-shrink: 0;">${res.type}</span>
        </div>
        <div style="font-size: 12px; color: var(--muted); display: flex; gap: 12px; font-weight: 700;">
          <span>👤 ${res.addedBy || "Anonymous"}</span>
        </div>
        <a href="${res.url}" target="_blank" class="join-btn" style="margin-top: auto; align-self: flex-start; margin-bottom: 0;">Open Link →</a>
      </article>
    `).join("");
  }
  grid.innerHTML = html;
}

document.getElementById("addResourceBtn")?.addEventListener("click", () => {
  const container = document.getElementById("resourceFormContainer");
  const subjSelect = document.getElementById("resSubject");
  if (subjSelect && subjSelect.options.length <= 2) {
    COURSES.forEach(course => {
      const opt = document.createElement("option");
      opt.value = course.shortName;
      opt.textContent = course.shortName;
      subjSelect.appendChild(opt);
    });
  }
  container.style.display = container.style.display === "none" ? "block" : "none";
});

document.getElementById("resourceForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = document.getElementById("resSubmitBtn");
  btn.disabled = true;
  btn.textContent = "Submitting...";

  const newRes = {
    title: document.getElementById("resTitle").value,
    url: document.getElementById("resUrl").value,
    type: document.getElementById("resType").value,
    subject: document.getElementById("resSubject").value,
    addedBy: document.getElementById("resAddedBy").value
  };

  try {
    const res = await fetch("https://iitp-timetable-admin-eight.vercel.app/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRes)
    });
    if (!res.ok) throw new Error("Failed to submit");
    alert("Resource submitted! It will appear once approved by the admin.");
    document.getElementById("resourceForm").reset();
    document.getElementById("resourceFormContainer").style.display = "none";
  } catch (err) {
    alert("An error occurred. Please try again.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Submit Resource";
  }
});

function renderAll() {
  updateHeaders();
  renderImportantLinks();
  renderTimetable();
  renderCourses();
  renderToday();
  renderNotification();
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

async function initApp() {
  try {
    const res = await fetch("https://iitp-timetable-admin-eight.vercel.app/api/timetable", { cache: "no-store" });
    if (res.ok) {
      const dynamicData = await res.json();
      window.PROGRAMS = dynamicData.PROGRAMS || PROGRAMS;
      window.COURSES = dynamicData.COURSES || COURSES;
      window.SCHEDULE = dynamicData.SCHEDULE || SCHEDULE;
      window.DAYS = dynamicData.DAYS || DAYS;
      window.TIMES = dynamicData.TIMES || TIMES;
      window.HOLIDAYS = dynamicData.HOLIDAYS || HOLIDAYS;
      window.NOTIFICATION = dynamicData.notification || "";
      window.ASSIGNMENTS = dynamicData.ASSIGNMENTS || [];
    }
  } catch (error) {
    console.error("Failed to fetch dynamic timetable data, using fallback.", error);
    window.ASSIGNMENTS = [];
  }
  
  initSelectors();
  renderAll();
}

initApp();
fetchResources();

window.scrollToTimetableClass = function(courseId, time, day) {
  const timetable = document.getElementById('timetable');
  if (timetable) {
    timetable.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const slots = timetable.querySelectorAll('.slot');
    slots.forEach(slot => {
      if (slot.dataset.course === courseId && slot.dataset.time === time && slot.dataset.day === day) {
        slot.classList.add('highlight-pulse');
        setTimeout(() => slot.classList.remove('highlight-pulse'), 2500);
      }
    });
  }
};

window.openAssignmentsModal = function(courseId) {
  const modal = document.getElementById('assignmentModal');
  const course = getCourse(courseId);
  if (!modal || !course) return;

  document.getElementById('assignmentModalTitle').textContent = `Assignments: ${course.shortName}`;
  const courseAssignments = (window.ASSIGNMENTS || []).filter(a => a.courseId === courseId);
  
  const listEl = document.getElementById('assignmentModalList');
  if (courseAssignments.length === 0) {
    listEl.innerHTML = `<li class="muted">No assignments available.</li>`;
  } else {
    listEl.innerHTML = courseAssignments.map(a => `
      <li class="assignment-item">
        <a href="${escapeHtml(a.url)}" target="_blank">📝 ${escapeHtml(a.title)}</a>
        <div class="deadline">Due: ${escapeHtml(a.deadline)}</div>
      </li>
    `).join("");
  }
  
  modal.showModal();
};

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>"']/g, function(m) {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#039;';
      default: return m;
    }
  });
}

