// ==========================================
// GLOBAL VARIABLES & STORAGE MANAGEMENT
// ==========================================
let selectedCourses = JSON.parse(localStorage.getItem('mySavedCourses')) || [];

// Initialize data pools for assignments if completely fresh
let globalAssignments = JSON.parse(localStorage.getItem('myAssignments'));
if (!globalAssignments) {
  globalAssignments = [
    { id: "task-1", title: "CS101 Project 3", course: "CS101", deadline: "2026-10-23T23:59", status: "Pending", submitted: false },
    { id: "task-2", title: "ENG105 First Draft", course: "ENG105", deadline: "2026-10-24T17:00", status: "Ongoing", submitted: false },
    { id: "task-3", title: "MAT201 Midterm Exam", course: "MAT201", deadline: "2026-10-28T09:00", status: "Pending", submitted: false }
  ];
  localStorage.setItem('myAssignments', JSON.stringify(globalAssignments));
}

let currentActiveTaskIdForUpload = null;

// ==========================================
// CENTRALIZED RUNTIME CONTROLLER ON DOM LOAD
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
  
  // 1. NAVBAR COMPONENT SYNC
  const signInBtn = document.getElementById("signInBtn");
  const dashboardBtn = document.getElementById("dashboardBtn");
  const signOutBtn = document.getElementById("signOutBtn");
  const navHomeBtn = document.getElementById("navHomeBtn");

  if (localStorage.getItem("isLoggedIn") === "true") {
    if (signInBtn) signInBtn.classList.add("d-none");
    if (navHomeBtn) navHomeBtn.classList.add("d-none");
    if (dashboardBtn) dashboardBtn.classList.remove("d-none");
    if (signOutBtn) signOutBtn.classList.remove("d-none");
  } else {
    if (navHomeBtn) navHomeBtn.classList.remove("d-none");
  }

  // 2. COURSE INTERACTION LISTENER
  if (document.getElementById('selectedCoursesList')) {
    updateScheduleUI();
    selectedCourses.forEach(course => {
      const btn = document.getElementById(`btn-${course.id}`);
      if (btn) {
        btn.disabled = true;
        btn.classList.remove('btn-outline-secondary');
        btn.classList.add('btn-success', 'text-white');
        btn.innerText = 'Added to Schedule';
      }
    });
  }

  // 3. DASHBOARD LOGIC AGGREGATOR Injections
  const dashboardCount = document.getElementById('registeredCourseCount');
  if (dashboardCount) {
    dashboardCount.innerText = selectedCourses.length;
    renderAttendance(); 
    renderDashboardDeadlines();
    renderDashboardChart();
  }

  // 4. TIMETABLE PIPELINE RUNNER
  if (document.getElementById('timetableBody')) {
    renderTimetable();
  }

  // 5. ASSIGNMENTS SYSTEM HANDLERS Hook (Task Matrix Page)
  if (document.getElementById('assignmentsTableBody')) {
    populateCourseDropdown();
    renderAssignmentManagerTable();
    
    const formElement = document.getElementById('assignmentForm');
    if (formElement) {
      formElement.addEventListener('submit', createNewAssignment);
    }
  }

  // 6. SUBMISSION HUB DESK HOOK (Submissions Page)
  if (document.getElementById('pendingSubmissionGateway') || document.getElementById('finalizedSubmissionsTableBody')) {
    renderSubmissionHubEngine();
    attachSubmissionUploadListeners();
  }
});

// ==========================================
// TIMETABLE COMPONENT ENGINES
// ==========================================
function renderTimetable() {
  const timetableBody = document.getElementById('timetableBody');
  if (!timetableBody) return;

  if (selectedCourses.length === 0) {
    timetableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted py-5">
          <span class="d-block fw-bold mb-1">No classes scheduled.</span>
          <small>Please register for courses to build your timetable.</small>
        </td>
      </tr>
    `;
    return;
  }

  const scheduleDatabase = {
    "CS101": { day: "Monday", date: "Oct 19, 2026", time: "01:00 PM - 06:30 PM", room: "Tech Lab Building 3, Room 402", lecturer: "Prof. Alan Turing", status: '<span class="badge bg-success rounded-pill px-2">Confirmed</span>' },
    "MAT201": { day: "Tuesday", date: "Oct 20, 2026", time: "01:00 PM - 03:00 PM", room: "Newton Science Hall, Amphitheater B", lecturer: "Dr. Ada Lovelace", status: '<span class="badge bg-success rounded-pill px-2">Confirmed</span>' },
    "ENG105": { day: "Wednesday", date: "Oct 21, 2026", time: "10:00 AM - 12:00 PM", room: "Humanities Annex, Room 12", lecturer: "Prof. George Orwell", status: '<span class="badge bg-success rounded-pill px-2">Confirmed</span>' },
    "HIS102": { day: "Thursday", date: "Oct 22, 2026", time: "02:00 PM - 04:30 PM", room: "Main Arts Building, Hall 4A", lecturer: "Dr. Howard Zinn", status: '<span class="badge bg-warning text-dark rounded-pill px-2">Rescheduled</span>' }
  };

  timetableBody.innerHTML = ''; 

  selectedCourses.forEach(course => {
    const details = scheduleDatabase[course.id];
    if (details) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="ps-4 py-3"><span class="fw-bold text-dark d-block">${details.day}</span><small class="text-muted">${details.date}</small></td>
        <td><span class="badge bg-light text-dark border p-2 fw-normal">${details.time}</span></td>
        <td><div class="d-flex align-items-center"><span class="badge bg-primary me-2" style="background-color: #8b5cf6 !important;">${course.id}</span><span class="fw-bold text-dark">${course.name}</span></div></td>
        <td><span class="text-secondary fw-medium">${details.room}</span></td>
        <td><span class="text-dark">${details.lecturer}</span></td>
        <td class="pe-4 text-end">${details.status}</td>
      `;
      timetableBody.appendChild(row);
    }
  });

  const fridayRow = document.createElement('tr');
  fridayRow.className = "table-light";
  fridayRow.innerHTML = `
    <td class="ps-4 py-3 text-muted"><span class="fw-bold d-block text-secondary">Friday</span><small>Oct 23, 2026</small></td>
    <td colspan="5" class="text-center text-muted fst-italic small py-3">— No academic classes scheduled for today (Independent Study Day) —</td>
  `;
  timetableBody.appendChild(fridayRow);
}

// ==========================================
// PORTAL AUTHENTICATION
// ==========================================
function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById("emailInput").value;
  const password = document.getElementById("passwordInput").value;

  if (email === "istudent@hub.com" && password === "password123") {
    localStorage.setItem("isLoggedIn", "true");
    alert("Credentials correct! Redirecting to dashboard...");
    window.location.href = "dashboard.html";
  } else {
    alert("Incorrect credentials!\n\nPlease use:\nEmail: istudent@hub.com\nPassword: password123");
  }
}

function logout() {
  localStorage.removeItem("isLoggedIn");
  window.location.href = "signin.html";
}

// ==========================================
// COURSE SELECTION MOTORS
// ==========================================
// ==========================================
// COURSE SELECTION MOTORS (CREDIT HRLY CAP)
// ==========================================
function addCourse(courseId, courseName, credits, buttonElement) {
  // Calculate total credit hours currently selected
  let currentTotalCredits = selectedCourses.reduce((sum, course) => sum + course.credits, 0);

  // Check if adding this course exceeds the 23 credit hour limit
  if (currentTotalCredits + credits > 23) {
    alert(`Registration blocked! Adding this course (${credits} Credits) would exceed the maximum limit of 23 credit hours allowed for this semester.\n\nCurrent total: ${currentTotalCredits} Credits.`);
    return;
  }

  const courseExists = selectedCourses.some(course => course.id === courseId);
  if (courseExists) return;

  selectedCourses.push({ id: courseId, name: courseName, credits: credits });
  localStorage.setItem('mySavedCourses', JSON.stringify(selectedCourses));

  buttonElement.disabled = true;
  buttonElement.classList.remove('btn-outline-secondary');
  buttonElement.classList.add('btn-success', 'text-white');
  buttonElement.innerText = 'Added to Schedule';

  updateScheduleUI();
}

function removeCourse(courseId) {
  selectedCourses = selectedCourses.filter(course => course.id !== courseId);
  localStorage.setItem('mySavedCourses', JSON.stringify(selectedCourses));

  const nativeButton = document.getElementById(`btn-${courseId}`);
  if (nativeButton) {
    nativeButton.disabled = false;
    nativeButton.classList.remove('btn-success', 'text-white');
    nativeButton.classList.add('btn-outline-secondary');
    nativeButton.innerText = 'Add to Schedule';
  }
  updateScheduleUI();
}

// ==========================================
// ATTENDANCE CALCULATION ENGINES
// ==========================================
function updateScheduleUI() {
  const listContainer = document.getElementById('selectedCoursesList');
  const totalCreditsContainer = document.getElementById('totalCredits');
  if (!listContainer) return;

  listContainer.innerHTML = '';

  if (selectedCourses.length === 0) {
    listContainer.innerHTML = `<li class="list-group-item text-muted text-center" id="emptyState">No courses selected yet.</li>`;
    if (totalCreditsContainer) totalCreditsContainer.innerText = '0';
    return;
  }

  let creditSum = 0;
  selectedCourses.forEach(course => {
    creditSum += course.credits;
    const listItem = document.createElement('li');
    listItem.className = 'list-group-item d-flex justify-content-between align-items-center px-0 py-3';
    listItem.innerHTML = `
      <div>
        <h6 class="mb-0 small fw-bold text-dark">${course.name}</h6>
        <small class="text-muted">${course.id} • ${course.credits} Credits</small>
      </div>
      <button class="btn btn-sm btn-link text-danger p-0 text-decoration-none fw-bold" onclick="removeCourse('${course.id}')">Remove</button>
    `;
    listContainer.appendChild(listItem);
  });

  if (totalCreditsContainer) totalCreditsContainer.innerText = creditSum;
}

function submitRegistration() {
  if (selectedCourses.length === 0) {
    alert("Your schedule is empty! Please add at least one course before confirming.");
    return;
  }
  
  let totalCreditCount = 0;
  selectedCourses.forEach(course => { totalCreditCount += course.credits; });

  const modalCreditSpan = document.getElementById("modalCreditCount");
  if (modalCreditSpan) modalCreditSpan.innerText = totalCreditCount;
  
  const modalElement = document.getElementById('confirmationModal');
  if (modalElement) {
    var myModal = new bootstrap.Modal(modalElement);
    myModal.show();
  } else {
    alert(`Successfully registered for ${totalCreditCount} credits!`);
  }
}

function renderAttendance() {
  const container = document.getElementById('attendanceContainer');
  if (!container) return;

  if (selectedCourses.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center text-muted py-4">
        <span class="d-block fw-bold mb-1">No courses registered.</span>
        <small>Please register for courses to view your attendance status.</small>
      </div>
    `;
    return;
  }

  const attendanceData = { "CS101": 13, "IMS564": 12, "MAT201": 11, "ENG105": 14, "HIS102": 10, "DEFAULT": 14 };
  const totalWeeks = 14; 
  container.innerHTML = '';

  selectedCourses.forEach(course => {
    const attended = attendanceData[course.id] !== undefined ? attendanceData[course.id] : attendanceData["DEFAULT"];
    const missed = totalWeeks - attended;
    const percentage = Math.round((attended / totalWeeks) * 100);
    
    let barColor = "bg-success", textColor = "text-success", statusText = "";

    if (missed === 0) {
      statusText = "Perfect Attendance";
    } else if (percentage >= 90) {
      statusText = `Missed ${missed} class`;
    } else if (percentage >= 80) {
      barColor = "bg-info"; textColor = "text-info"; statusText = `Missed ${missed} classes`;
    } else {
      barColor = "bg-danger"; textColor = "text-danger"; statusText = `⚠️ Missed ${missed} classes`;
    }
    
    const cardHtml = `
      <div class="col-md-6 mb-3">
        <div class="p-3 border rounded bg-white h-100">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div>
              <span class="badge bg-primary me-2" style="background-color: #8b5cf6 !important;">${course.id}</span>
              <span class="fw-bold text-dark small">${course.name}</span>
            </div>
            <span class="fw-bold ${textColor}">${percentage}%</span>
          </div>
          <div class="progress" style="height: 8px;">
            <div class="progress-bar ${barColor}" role="progressbar" style="width: ${percentage}%"></div>
          </div>
          <div class="d-flex justify-content-between mt-1">
            <small class="text-muted" style="font-size: 0.75rem;">Attended: ${attended}/${totalWeeks} classes</small>
            <small class="${textColor} fw-bold" style="font-size: 0.75rem;">${statusText}</small>
          </div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', cardHtml);
  });
}

// ==========================================
// ASSIGNMENT MANAGEMENT MOTORS (TASK MATRIX)
// ==========================================
function populateCourseDropdown() {
  const select = document.getElementById('taskCourse');
  if (!select) return;
  select.innerHTML = '';
  
  const activeSelectionPool = selectedCourses.length > 0 ? selectedCourses : [
    { id: "CS101", name: "Intro to Computer Science" },
    { id: "IMS564", name: "Intro to UI/UX Design" },
    { id: "MAT201", name: "Calculus I" }
  ];

  activeSelectionPool.forEach(course => {
    const opt = document.createElement('option');
    opt.value = course.id;
    opt.innerText = `${course.id} - ${course.name}`;
    select.appendChild(opt);
  });
}

function createNewAssignment(event) {
  event.preventDefault();
  
  const title = document.getElementById('taskTitle').value;
  const course = document.getElementById('taskCourse').value;
  const deadline = document.getElementById('taskDeadline').value;
  const status = document.getElementById('taskStatus').value;

  const newTask = { id: "task-" + Date.now(), title, course, deadline, status, submitted: false };

  const dynamicAssignments = JSON.parse(localStorage.getItem('myAssignments')) || [];
  dynamicAssignments.push(newTask);
  localStorage.setItem('myAssignments', JSON.stringify(dynamicAssignments));

  document.getElementById('assignmentForm').reset();
  populateCourseDropdown();
  renderAssignmentManagerTable();
  alert("Assignment deployed! Check your synchronized Dashboard.");
}

function renderAssignmentManagerTable() {
  const tbody = document.getElementById('assignmentsTableBody');
  if (!tbody) return;
  
  const currentStack = JSON.parse(localStorage.getItem('myAssignments')) || [];
  tbody.innerHTML = '';

  const visibleTasks = currentStack.filter(task => !task.submitted);

  if(visibleTasks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">No active assignments in pipeline.</td></tr>`;
    return;
  }

  visibleTasks.sort((a,b) => new Date(a.deadline) - new Date(b.deadline));
  const now = new Date();

  visibleTasks.forEach(task => {
    const deadlineDate = new Date(task.deadline);
    const dateFormatted = deadlineDate.toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const timeDifference = deadlineDate - now;
    const hoursRemaining = timeDifference / (1000 * 60 * 60);
    const isUrgent = hoursRemaining > 0 && hoursRemaining <= 48 && task.status !== "Done";

    let statusBadge = `<span class="badge bg-warning text-dark">${task.status}</span>`;
    if(task.status === "Ongoing") statusBadge = `<span class="badge bg-info text-white">${task.status}</span>`;
    if(task.status === "Done") statusBadge = `<span class="badge bg-success text-white">Done (Ready)</span>`;

    let dynamicActionColumnHTML = '';
    if (task.status !== "Done") {
      dynamicActionColumnHTML = `
        <button class="btn btn-sm btn-success fw-bold me-1 text-white" onclick="quickMarkAsDone('${task.id}')" style="background-color: #198754; border-color: #198754;">✓ Done</button>
        <select class="form-select form-select-sm d-inline-block w-auto me-1" onchange="updateTaskStateStatus('${task.id}', this.value)">
          <option value="Pending" ${task.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Ongoing" ${task.status === 'Ongoing' ? 'selected' : ''}>Ongoing</option>
          <option value="Done" ${task.status === 'Done' ? 'selected' : ''}>Done</option>
        </select>
      `;
    } else {
      dynamicActionColumnHTML = `
        <a href="submissions.html" class="btn btn-sm btn-primary fw-bold text-white me-1" style="background-color: #8b5cf6; border-color: #8b5cf6;">🚀 Submit Task</a>
      `;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="ps-4">
        <div class="fw-bold text-dark">${task.title}</div>
        <small class="badge bg-light text-secondary border">${task.course}</small>
        ${isUrgent ? '<span class="badge bg-danger rounded-pill">Urgent</span>' : ''}
      </td>
      <td class="text-secondary small fw-medium">${dateFormatted}</td>
      <td>${statusBadge}</td>
      <td class="pe-4 text-end">
        ${dynamicActionColumnHTML}
        <button class="btn btn-sm btn-outline-danger" onclick="eraseTaskProfileEntry('${task.id}')">✕</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function quickMarkAsDone(id) {
  let list = JSON.parse(localStorage.getItem('myAssignments')) || [];
  list = list.map(item => item.id === id ? { ...item, status: 'Done' } : item);
  localStorage.setItem('myAssignments', JSON.stringify(list));
  renderAssignmentManagerTable();
}

function updateTaskStateStatus(id, nextState) {
  let list = JSON.parse(localStorage.getItem('myAssignments')) || [];
  list = list.map(item => item.id === id ? { ...item, status: nextState } : item);
  localStorage.setItem('myAssignments', JSON.stringify(list));
  renderAssignmentManagerTable();
}

function eraseTaskProfileEntry(id) {
  if(!confirm("Erase assignment record tracking?")) return;
  let list = JSON.parse(localStorage.getItem('myAssignments')) || [];
  list = list.filter(item => item.id !== id);
  localStorage.setItem('myAssignments', JSON.stringify(list));
  renderAssignmentManagerTable();
}

// ==========================================
// SEPARATE SUBMISSION DESK LOGIC CORE
// ==========================================
function renderSubmissionHubEngine() {
  const pendingGateway = document.getElementById('pendingSubmissionGateway');
  const finalizedTbody = document.getElementById('finalizedSubmissionsTableBody');
  const archiveCounter = document.getElementById('archiveCounter');
  
  const assignments = JSON.parse(localStorage.getItem('myAssignments')) || [];

  if (pendingGateway) {
    pendingGateway.innerHTML = '';
    const readyToSubmit = assignments.filter(t => t.status === "Done" && !t.submitted);

    if (readyToSubmit.length === 0) {
      pendingGateway.innerHTML = `<li class="list-group-item text-center text-muted py-4">No tasks are waiting to be submitted. Complete a task in the Matrix first!</li>`;
    } else {
      readyToSubmit.forEach(task => {
        const li = document.createElement('li');
        li.className = "list-group-item d-flex justify-content-between align-items-center p-3";
        li.innerHTML = `
          <div>
            <span class="fw-bold d-block text-dark">${task.title}</span>
            <small class="badge bg-light text-muted border">${task.course}</small>
          </div>
          <div>
            <button class="btn btn-sm btn-outline-secondary fw-bold me-2" onclick="bindUploadDraftTarget('${task.id}')">📂 Stage Folder</button>
            <button class="btn btn-sm btn-success fw-bold text-white px-3" onclick="executeFinalTurnIn('${task.id}')">Turn In</button>
          </div>
        `;
        pendingGateway.appendChild(li);
      });
    }
  }

  if (finalizedTbody) {
    finalizedTbody.innerHTML = '';
    const turnedInStack = assignments.filter(t => t.submitted);

    if (archiveCounter) archiveCounter.innerText = `${turnedInStack.length} Filed`;

    if (turnedInStack.length === 0) {
      finalizedTbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-4">No submissions archived in this session.</td></tr>`;
    } else {
      turnedInStack.forEach(task => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="ps-4">
            <div class="fw-bold text-muted text-decoration-line-through">${task.title}</div>
            <small class="text-muted">${task.course}</small>
          </td>
          <td><span class="badge bg-success text-white">✓ Done & Submitted</span></td>
          <td class="pe-4 text-end">
            <button class="btn btn-sm btn-link text-danger text-decoration-none p-0 small fw-bold" onclick="retractSubmission('${task.id}')">Retract</button>
          </td>
        `;
        finalizedTbody.appendChild(tr);
      });
    }
  }
}

function bindUploadDraftTarget(taskId) {
  currentActiveTaskIdForUpload = taskId;
  
  const draftContainer = document.getElementById('draftUploadSection');
  if (draftContainer) {
    draftContainer.classList.remove('d-none');
    
    const manifestContainer = document.getElementById('draftFilesContainer');
    if (manifestContainer) manifestContainer.classList.add('d-none');
    
    const manifestList = document.getElementById('draftFilesManifestList');
    if (manifestList) manifestList.innerHTML = '';
    
    const fileInput = document.getElementById('folderDraftInput');
    if (fileInput) fileInput.value = '';
  }
}

function attachSubmissionUploadListeners() {
  const folderInput = document.getElementById('folderDraftInput');
  if (!folderInput) return;

  folderInput.addEventListener('change', function(e) {
    const files = e.target.files;
    const manifestList = document.getElementById('draftFilesManifestList');
    const container = document.getElementById('draftFilesContainer');

    if (!files || files.length === 0) return;

    if (manifestList) manifestList.innerHTML = '';
    if (container) container.classList.remove('d-none');

    Array.from(files).slice(0, 15).forEach(file => {
      const path = file.webkitRelativePath || file.name;
      const sizeKb = (file.size / 1024).toFixed(1);
      
      const li = document.createElement('li');
      li.className = "d-flex justify-content-between align-items-center mb-1 text-secondary text-truncate";
      li.innerHTML = `
        <span>📄 ${path}</span>
        <span class="badge bg-light text-dark text-end ms-2 font-monospace" style="font-size: 0.7rem;">${sizeKb} KB</span>
      `;
      if (manifestList) manifestList.appendChild(li);
    });

    if (files.length > 15 && manifestList) {
      const capLi = document.createElement('li');
      capLi.className = "text-muted small text-center pt-1 border-top mt-2 fst-italic";
      capLi.innerText = `...and ${files.length - 15} more draft files detected in folder layout...`;
      manifestList.appendChild(capLi);
    }

    alert(`Draft folder structure loaded! ${files.length} mock files tracked. You can now click "Turn In".`);
  });
}

function executeFinalTurnIn(id) {
  let list = JSON.parse(localStorage.getItem('myAssignments')) || [];
  list = list.map(item => item.id === id ? { ...item, submitted: true } : item);
  localStorage.setItem('myAssignments', JSON.stringify(list));
  
  renderSubmissionHubEngine();
  
  const draftUIBox = document.getElementById('draftUploadSection');
  if (draftUIBox) draftUIBox.classList.add('d-none');
  
  alert("Assignment turned in successfully!");
}

function retractSubmission(id) {
  if(!confirm("Retract submission back to active status?")) return;
  let list = JSON.parse(localStorage.getItem('myAssignments')) || [];
  list = list.map(item => item.id === id ? { ...item, submitted: false, status: 'Ongoing' } : item);
  localStorage.setItem('myAssignments', JSON.stringify(list));
  renderSubmissionHubEngine();
}

// ==========================================
// DYNAMIC DASHBOARD BINDING PORTALS
// ==========================================
function renderDashboardDeadlines() {
  const targetUl = document.getElementById('dashboardDeadlinesList');
  if (!targetUl) return;

  const currentStack = JSON.parse(localStorage.getItem('myAssignments')) || [];
  targetUl.innerHTML = '';

  const activeIncompleteTasks = currentStack.filter(item => item.status !== "Done" && !item.submitted);

  if (activeIncompleteTasks.length === 0) {
    targetUl.innerHTML = `<li class="list-group-item text-muted text-center py-4">🎉 All clear! No upcoming tasks.</li>`;
    return;
  }

  activeIncompleteTasks.sort((a,b) => new Date(a.deadline) - new Date(b.deadline));
  const now = new Date();

  activeIncompleteTasks.forEach(task => {
    const dateObj = new Date(task.deadline);
    const dateText = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timeText = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const timeDifference = dateObj - now;
    const hoursRemaining = timeDifference / (1000 * 60 * 60);
    const isUrgent = hoursRemaining > 0 && hoursRemaining <= 48;

    const li = document.createElement('li');
    li.className = "list-group-item d-flex justify-content-between align-items-center p-3";
    li.innerHTML = `
      <div>
        <h6 class="mb-0 small fw-bold text-dark">${task.title} <span class="text-muted fw-normal">(${task.course})</span></h6>
        <small class="text-muted">Due: ${dateText}, ${timeText}</small>
      </div>
      ${isUrgent ? '<span class="badge bg-danger rounded-pill">Urgent</span>' : `<span class="badge bg-light text-muted border fw-normal">${task.status}</span>`}
    `;
    targetUl.appendChild(li);
  });
}

function renderDashboardChart() {
  const chartCanvas = document.getElementById('taskDonutChart');
  if (!chartCanvas) return;

  const assignments = JSON.parse(localStorage.getItem('myAssignments')) || [];
  
  let pending = assignments.filter(t => t.status === 'Pending' && !t.submitted).length;
  let ongoing = assignments.filter(t => t.status === 'Ongoing' && !t.submitted).length;
  let done = assignments.filter(t => t.submitted).length;

  if(assignments.length === 0) { pending = 4; ongoing = 2; done = 6; }

  if(document.getElementById('badgePendingCount')) document.getElementById('badgePendingCount').innerText = pending;
  if(document.getElementById('badgeOngoingCount')) document.getElementById('badgeOngoingCount').innerText = ongoing;
  if(document.getElementById('badgeDoneCount')) document.getElementById('badgeDoneCount').innerText = done;

  const ctx = chartCanvas.getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Pending', 'Ongoing', 'Done'],
      datasets: [{
        data: [pending, ongoing, done],
        backgroundColor: ['#ffc107', '#0dcaf0', '#198754'],
        borderWidth: 0,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      cutout: '70%'
    }
  });
}