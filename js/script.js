/* WINDOWS ACCENT COLOR */
if (window.wallpaperPropertyListener) {
  window.wallpaperPropertyListener.applyUserProperties = function (props) {
    if (props.accentcolor) {
      document.documentElement.style.setProperty(
        "--accent",
        `rgb(${props.accentcolor.value.join(",")})`
      );
    }
  };
}

const dateEl = document.getElementById("date");
const monthEl = document.getElementById("month");
const calendarGrid = document.getElementById("calendarGrid");
const taskList = document.getElementById("taskList");
const agendaList = document.getElementById("agendaList");
const alarm = document.getElementById("alarm");

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const bgInput = document.getElementById("bgInput");

let tasks = [];
try {
  const stored = localStorage.getItem("tasks");
  tasks = stored ? JSON.parse(stored) : [];
} catch (e) {
  console.error("Failed to load tasks:", e);
  tasks = []; // Fallback to empty
}
// Helper for Local YYYY-MM-DD
function getLocalYMD(d) {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

let selectedDate = getLocalYMD(new Date()); // Default to today (Local)

/* DATE & TIME */
/* DATE & TIME */
function updateDate() {
  if (!dateEl) return;
  const d = new Date();
  dateEl.textContent = d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric"
  });
}
updateDate();

/* CALENDAR (INTERACTIVE) */
/* CALENDAR (INTERACTIVE) */
function renderCalendar() {
  if (!monthEl || !calendarGrid) return;
  const d = new Date();
  monthEl.textContent = d.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric"
  });

  calendarGrid.innerHTML = "";
  const year = d.getFullYear();
  const month = d.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  const today = d.getDate();

  for (let i = 1; i <= days; i++) {
    const el = document.createElement("div");
    const dayDate = getLocalYMD(new Date(year, month, i));

    let className = "day";
    if (i === today) className += " active";
    if (dayDate === selectedDate) className += " selected";

    el.className = className;
    el.textContent = i;
    el.onclick = () => selectDate(dayDate);
    calendarGrid.appendChild(el);
  }
}

// Deadline Selection Mode
let isSelectingDeadline = false;

function selectDate(date) {
  if (isSelectingDeadline) {
    if (taskDeadlineInput) taskDeadlineInput.value = date;
    isSelectingDeadline = false;

    // Reset UI
    const cal = document.querySelector('.calendar');
    if (cal) cal.classList.remove('deadline-mode');

    // Reset title
    const d = new Date();
    if (monthEl) monthEl.textContent = d.toLocaleDateString(undefined, { month: "long", year: "numeric" });

    renderCalendar();
    return;
  }

  selectedDate = date;
  renderCalendar();
  renderTasks();
}

renderCalendar();

/* BACKGROUND IMAGE */
/* BACKGROUND IMAGE */
// BACKGROUND IMG Handled by Lively Property Listener in system.js
// Old localStorage logic removed to prevent conflicts.

// Init background
// Init handled by system.js


/* TASKS + AGENDA */
/* TASKS + AGENDA */
// SVG Icons Helper
function getIcon(name) {
  const icons = {
    trash: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
    chevronDown: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
    chevronUp: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>`,
    plus: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`
  };
  return icons[name] || '';
}

function renderTasks() {
  if (!taskList || !agendaList) return;
  taskList.innerHTML = "";
  agendaList.innerHTML = "";

  const selectedDateTasks = tasks.filter(t => {
    if (!t.date) return false;
    if (t.deadline) {
      return selectedDate >= t.date && selectedDate <= t.deadline;
    } else {
      return t.date === selectedDate;
    }
  });

  const sortedTasks = [...selectedDateTasks].map((t, originalIndex) => {
    const fullIndex = tasks.indexOf(t);
    return { ...t, originalIndex: fullIndex };
  }).sort((a, b) => {
    const timeA = new Date(`${a.date}T${a.time}`);
    const timeB = new Date(`${b.date}T${b.time}`);
    return timeA - timeB;
  });

  sortedTasks.forEach((t) => {
    const index = t.originalIndex; // ID
    const taskDate = new Date(`${t.date}T${t.time}`);
    const timeStr = taskDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Deadline badge
    let deadlineBadge = "";
    if (t.deadline) {
      const deadlineDate = new Date(t.deadline);
      const today = new Date(selectedDate);
      const daysUntil = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
      let badgeClass = "deadline-badge";
      if (daysUntil < 0) badgeClass += " overdue";
      else if (daysUntil === 0) badgeClass += " today";
      else if (daysUntil <= 2) badgeClass += " urgent";
      else badgeClass += " normal";
      const deadlineStr = deadlineDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      deadlineBadge = `<span class="${badgeClass}">Due ${deadlineStr}</span>`;
    }

    // Progress badge
    let progressBadge = "";
    if (t.subtasks && t.subtasks.length > 0) {
      const completed = t.subtasks.filter(st => st.done).length;
      const total = t.subtasks.length;
      const allDone = completed === total;
      progressBadge = `<span class="progress-badge ${allDone ? 'complete' : ''}">${completed}/${total} ✓</span>`;
    }

    // CREATE TASK ROW
    const div = document.createElement("div");
    div.className = "task-row" + (t.done ? " done" : "");
    div.setAttribute("data-id", index); // Helper for focus

    // Subtasks HTML
    let subtasksHtml = "";
    if (t.subtasks && t.subtasks.length > 0) {
      subtasksHtml = t.subtasks.map((st, sIdx) => `
        <div class="subtask-row ${st.done ? "done" : ""}">
          <div class="subtask-check" onclick="toggleSubtask(${index}, ${sIdx}, event)"></div>
          <span class="subtask-text">${st.text}</span>
          <button class="remove-btn" onclick="removeSubtask(${index}, ${sIdx}, event)">${getIcon('trash')}</button>
        </div>
      `).join("");
    }

    // Inline Input HTML
    const inlineInputHtml = `
      <div class="subtask-input-row" onclick="event.stopPropagation()">
          <input type="text" class="subtask-add-input" placeholder="Type subtask & enter..." 
           onkeydown="handleSubtaskInput(event, ${index})">
      </div>
    `;

    // Render Full Card
    div.innerHTML = `
      <div class="task-summary">
        <div class="task-content">
          <div class="task-check" onclick="toggleTask(${index}, event)"></div>
          <span class="task-text">${t.text}</span>
          ${deadlineBadge}
          ${progressBadge}
          <span style="opacity:0.6; font-size:0.9em; margin-left:8px;">${timeStr}</span>
        </div>
        <div class="task-actions">
         <button class="remove-btn simple" title="Expand" onclick="toggleTaskExpand(${index})">
           ${t.expanded ? getIcon('chevronUp') : getIcon('chevronDown')}
         </button>
         <button class="remove-btn" title="Delete" onclick="removeTask(${index}, event)">${getIcon('trash')}</button>
        </div>
      </div>
      <div class="task-details" style="display: ${t.expanded ? "block" : "none"}">
         ${subtasksHtml}
         ${inlineInputHtml}
      </div>
    `;
    taskList.appendChild(div);
  });

  // AGENDA GENERATION
  const allUpcoming = [...tasks]
    .filter(t => !t.done && t.date)
    .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

  allUpcoming.forEach(t => {
    if (isNaN(new Date(`${t.date}T${t.time}`).getTime())) return;
    const taskDate = new Date(`${t.date}T${t.time}`);
    const dateStr = taskDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const timeStr = taskDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const agenda = document.createElement("div");
    agenda.className = "task";
    agenda.textContent = `${dateStr} ${timeStr} • ${t.text}`;
    agendaList.appendChild(agenda);
  });
}

// Handler for Inline Input
window.handleSubtaskInput = function (e, index) {
  if (e.key === 'Enter') {
    const text = e.target.value.trim();
    if (text) {
      if (!tasks[index].subtasks) tasks[index].subtasks = [];
      tasks[index].subtasks.push({ text, done: false });
      tasks[index].expanded = true; // Ensure open
      saveTasks();

      // Restore focus after render
      setTimeout(() => {
        const input = document.querySelector(`.task-row[data-id="${index}"] .subtask-add-input`);
        if (input) input.focus();
      }, 50);
    }
  }
}

// Deprecated functions (remove or leave empty)
window.showSubtaskInput = function () { };

const taskTimeInput = document.getElementById("taskTime");
const taskDeadlineInput = document.getElementById("taskDeadline");

// Deadline Input Click
if (taskDeadlineInput) {
  taskDeadlineInput.addEventListener('click', () => {
    isSelectingDeadline = true;

    // UI Cues
    const cal = document.querySelector('.calendar');
    if (cal) cal.classList.add('deadline-mode');
    if (monthEl) monthEl.textContent = "Select Deadline Date";

    renderCalendar();
  });
}

// Set default time to current time
function setDefaultTime() {
  if (!taskTimeInput) return;
  const now = new Date();
  const timeString = now.toTimeString().slice(0, 5); // HH:MM
  taskTimeInput.value = timeString;
}
setDefaultTime();

// Add via UI
// Add via UI
if (addTaskBtn) {
  addTaskBtn.addEventListener("click", () => {
    const text = taskInput.value.trim();
    if (!text) return;

    // Use selectedDate from calendar
    const date = selectedDate;

    // Get time from input, or use current time as default
    let time = taskTimeInput.value;
    if (!time) {
      const now = new Date();
      time = now.toTimeString().slice(0, 5); // HH:MM
    }

    // Get deadline (optional)
    const deadline = taskDeadlineInput.value || null;

    addTask(text, date, time, deadline);
    taskInput.value = "";
    taskDeadlineInput.value = "";
    setDefaultTime(); // Reset to current time
  });
}

if (taskInput) {
  taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTaskBtn.click();
  });
}

function addTask(text, date, time, deadline) {
  tasks.push({ text, date, time, deadline, done: false });
  saveTasks();
}

window.toggleTask = function (index) {
  tasks[index].done = !tasks[index].done;
  saveTasks();
}

window.removeTask = function (index) {
  tasks.splice(index, 1);
  saveTasks();
}

function saveTasks() {
  try {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      // Storage full! Likely due to image.
      alert("⚠️ Storage full! Tasks cannot be saved.\n\nTry resetting the custom background image to free up space.");
      console.error("Storage full, save failed:", e);

      // Attempt to clear background to save tasks (optional safety net)
      // localStorage.removeItem("custom-bg");
      // localStorage.setItem("tasks", JSON.stringify(tasks));
    } else {
      console.error("Save failed:", e);
    }
  }
  renderTasks();
}

function clearTasks() {
  tasks = [];
  saveTasks();
}

// Sub-task management
window.toggleSubtask = function (taskIndex, subtaskIndex) {
  if (!tasks[taskIndex].subtasks) tasks[taskIndex].subtasks = [];
  tasks[taskIndex].subtasks[subtaskIndex].done = !tasks[taskIndex].subtasks[subtaskIndex].done;

  // Auto-complete main task if all subtasks are done
  const allDone = tasks[taskIndex].subtasks.every(st => st.done);
  if (allDone && tasks[taskIndex].subtasks.length > 0) {
    tasks[taskIndex].done = true;
  }

  saveTasks();
}

window.removeSubtask = function (taskIndex, subtaskIndex) {
  tasks[taskIndex].subtasks.splice(subtaskIndex, 1);
  saveTasks();
}

window.showSubtaskInput = function (taskIndex) {
  const subtaskText = prompt("Enter sub-task:");
  if (subtaskText && subtaskText.trim()) {
    if (!tasks[taskIndex].subtasks) tasks[taskIndex].subtasks = [];
    tasks[taskIndex].subtasks.push({ text: subtaskText.trim(), done: false });
    saveTasks();
  }
}

window.toggleTaskExpand = function (taskIndex) {
  // Toggle state in data model
  if (tasks[taskIndex].expanded === undefined) tasks[taskIndex].expanded = false;
  tasks[taskIndex].expanded = !tasks[taskIndex].expanded;
  saveTasks(); // Re-render happens here
}

renderTasks();

/* REMINDERS */
setInterval(() => {
  const now = new Date();
  const currentDate = getLocalYMD(now); // YYYY-MM-DD (Local)
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM

  tasks.forEach(t => {
    // Check if task is due now (match both date and time)
    if (!t.done && t.date === currentDate && t.time === currentTime) {
      if (alarm) {
        alarm.volume = 0.4;
        alarm.play().catch(e => console.log("Audio play failed (user interaction needed first?)", e));
      }
    }
  });
}, 60000);
