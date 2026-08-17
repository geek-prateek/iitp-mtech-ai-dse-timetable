let currentFilter = "all";
let selectedElective = localStorage.getItem("iitp-ai-dse-elective") || "Computational Data Analysis";

const timetableEl = document.getElementById("timetable");
const courseGridEl = document.getElementById("courseGrid");
const todayTitleEl = document.getElementById("todayTitle");
const todayClassesEl = document.getElementById("todayClasses");
const electiveSelectEl = document.getElementById("electiveSelect");

electiveSelectEl.value = selectedElective;

function getCourse(id) {
  return COURSES.find(course => course.id === id);
}

function getToday() {
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
}

function effectiveCourse(scheduleItem) {
  if (scheduleItem.course !== "elective-slot") return getCourse(scheduleItem.course);

  if (selectedElective === "Computational Data Analysis") return getCourse("cda");
  if (selectedElective === "Pattern Recognition") return getCourse("pr");
  return getCourse("aml");
}

// Attendance is only recorded when classes/recordings are accessed via Moodle,
// so every "join" action routes to the course's Moodle page.
function getMeetingUrl(course) {
  return course.moodleUrl;
}

function renderCourseLinks(course) {
  if (!course.moodleUrl) return "";

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

function renderTimetable() {
  timetableEl.innerHTML = "";

  const timeHeader = document.createElement("div");
  timeHeader.className = "time-head";
  timeHeader.textContent = "TIME";
  timetableEl.appendChild(timeHeader);

  const today = getToday();

  DAYS.forEach(day => {
    const header = document.createElement("div");
    header.className = `grid-head ${day === today ? "today" : ""}`;
    header.textContent = day;
    timetableEl.appendChild(header);
  });

  TIMES.forEach(time => {
    const timeEl = document.createElement("div");
    timeEl.className = "time-head";
    timeEl.textContent = time;
    timetableEl.appendChild(timeEl);

    DAYS.forEach(day => {
      const slot = document.createElement("div");
    
      // Friday is a full-day leave.
      if (day === "Friday") {
        slot.className = "slot leave";
        slot.textContent = "FULL DAY LEAVE";
        timetableEl.appendChild(slot);
        return;
      }
    
      const item = SCHEDULE.find(s => s.day === day && s.time === time);
    
      if (!item) {
        slot.className = "slot empty";
        slot.textContent = "—";
        timetableEl.appendChild(slot);
        return;
      }

      const course = effectiveCourse(item);
      slot.className = `slot ${course.type} ${item.showLabTag ? "lab" : ""}`;

      if (course.type === "elective" && course.name !== selectedElective) {
        slot.classList.add("dimmed");
      }

      if (currentFilter !== "all" && course.type !== currentFilter) {
        slot.classList.add("dimmed");
      }

      if (course.type === "elective" && course.name === selectedElective) {
        slot.classList.add("selected-elective");
      }

      slot.innerHTML = `
        <div class="slot-title">${course.shortName}</div>
        <div class="slot-code">${course.code}</div>
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

  COURSES.forEach(course => {
    const card = document.createElement("article");
    card.className = `course-card ${course.type}`;

    card.innerHTML = `
      <div class="course-type">${course.type === "regular" ? "Regular Course" : "Elective Course"}</div>
      <h3>${course.name}</h3>
      <div class="course-code">${course.code}</div>
      <div class="link-row">
        ${renderCourseLinks(course)}
      </div>
    `;

    courseGridEl.appendChild(card);
  });
}

function renderToday() {
  const today = getToday();
  todayTitleEl.textContent = today;

  // Friday is a full-day leave.
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
    .filter(item => item.day === today)
    .map(item => ({ item, course: effectiveCourse(item) }));

  if (!todaySchedule.length) {
    todayClassesEl.innerHTML = `<div class="muted">No classes scheduled today.</div>`;
    return;
  }

  todayClassesEl.innerHTML = todaySchedule.map(({ item, course }) => `
    <div class="today-item">
      <strong>${item.time}</strong>
      <span>${course.shortName}${item.showLabTag ? " · Lab" : ""}</span>
    </div>
  `).join("");
}

function renderAll() {
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

electiveSelectEl.addEventListener("change", event => {
  selectedElective = event.target.value;
  localStorage.setItem("iitp-ai-dse-elective", selectedElective);
  renderAll();
});

document.getElementById("todayBtn").addEventListener("click", () => {
  const today = getToday();
  const header = [...document.querySelectorAll(".grid-head")].find(el => el.textContent === today);
  if (header) header.scrollIntoView({ behavior: "smooth", inline: "center", block: "start" });
});

document.querySelector('[data-filter="all"]').classList.add("active");

renderAll();