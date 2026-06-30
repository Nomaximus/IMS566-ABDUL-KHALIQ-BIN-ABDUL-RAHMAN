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

// Available catalog of courses for enrollment mapping
const courseCatalog = [
  { code: "CS101", name: "Introduction to Computer Science", credits: 4, schedule: "Mon/Wed 09:00 AM - 10:30 AM", location: "Tech Lab 3", lecturer: "Dr. Alan Turing" },
  { code: "ENG105", name: "Composition & Critical Writing", credits: 3, schedule: "Tue/Thu 11:00 AM - 12:30 PM", location: "Humanities 102", lecturer: "Prof. Emily Dickinson" },
  { code: "MAT201", name: "Linear Algebra & Applications", credits: 4, schedule: "Mon/Wed 01:00 PM - 02:30 PM", location: "Math Pavilion 204", lecturer: "Dr. Carl Gauss" },
  { code: "PHY101", name: "General Physics I", credits: 4, schedule: "Tue/Thu 09:00 AM - 10:30 AM", location: "Science Hall B", lecturer: "Dr. Marie Curie" },
  { code: "DES220", name: "User Interface & Experience Design", credits: 3, schedule: "Friday 10:00 AM - 01:00 PM", location: "Design Studio A", lecturer: "Prof. Dieter Rams" }
];

// ==========================================
// CENTRALIZED RUNTIME CONTROLLER ON DOM LOAD
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
  
  // 1. NAVBAR COMPONENT SYNC
  syncNavbarAuth();
  
  // 2. SIGN IN PAGE LOGIN SIMULATOR
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      localStorage.setItem("isLoggedIn", "true");
      window.location.href = "dashboard.html";
    });
  }

  // 3. DASHBOARD PAGE LOGIC
  if (document.getElementById('taskDonutChart')) {
    renderDashboardChart();
    renderDashboardDeadlines();
  }

  // 4. COURSE REGISTRATION SUB-SYSTEM
  if (document.getElementById('selectedCoursesList')) {
    renderCourseCatalog();
    updateSelectedCoursesUI();
  }

  // 5. TIMETABLE RENDER INTERFACE
  if (document.getElementById('timetableBody')) {
    renderTimetable();
  }

  // 6. TASK PIPELINE & MATRIX SYSTEM
  if (document.getElementById('assignmentsTableBody')) {
    renderTaskMatrix();
    setupAssignmentForm();
  }

  // 7. SUBMISSIONS VAULT CONTROLLER
  if (document.getElementById('archiveCounter') || document.getElementById('submissionTaskSelect')) {
    renderSubmissionsDesk();
  }
});

// ==========================================
// COMPONENT CONTROLLER FUNCTIONS
// ==========================================

function syncNavbarAuth() {
  const signInBtn = document.getElementById("signInBtn");
  const dashboardBtn = document.getElementById("dashboardBtn");
  const targetNav = document.querySelector(".navbar .container") || document.querySelector(".navbar .container-fluid");
  
  const loggedIn = localStorage.getItem("isLoggedIn") === "true";
  
  if (loggedIn) {
    if (signInBtn) signInBtn.classList.add("d-none");
    if (dashboardBtn) dashboardBtn.classList.remove("d-none");
    
    // Dynamically inject functional navigation pathways across sub-pages
    if (targetNav && !document.getElementById("dynamicNavLinks")) {
      const linksDiv = document.createElement("div");
      linksDiv.id = "dynamicNavLinks";
      linksDiv.className = "collapse navbar-collapse d-inline-flex align-items-center ms-4";
      linksDiv.innerHTML = `
        <ul class="navbar-nav me-auto gap-2 small fw-bold">
          <li class="nav-item"><a class="nav-link text-dark" href="dashboard.html">Dashboard</a></li>
          <li class="nav-item"><a class="nav-link text-dark" href="courses.html">Registration</a></li>
          <li class="nav-item"><a class="nav-link text-dark" href="timetable.html">Timetable</a></li>
          <li class="nav-item"><a class="nav-link text-dark" href="taskmatrix.html">Task Matrix</a></li>
          <li class="nav-item"><a class="nav-link text-dark" href="submissions.html">Submissions</a></li>
          <li class="nav-item"><a class="nav-link text-dark" href="profile.html">Profile</a></li>
        </ul>
        <button class="btn btn-sm btn-outline-danger ms-auto fw-bold px-3 rounded-3" onclick="handleSignOut()">Sign Out</button>
      `;
      const brand = targetNav.querySelector(".navbar-brand");
      if (brand) brand.after(linksDiv);
    }
  }
}

window.handleSignOut = function() {
  localStorage.setItem("isLoggedIn", "false");
  window.location.href = "signin.html";
};

function renderDashboardDeadlines() {
  const targetUl = document.getElementById('dashboardDeadlinesList');
  if (!targetUl) return;

  targetUl.innerHTML = '';
  const assignments = JSON.parse(localStorage.getItem('myAssignments')) || [];
  const activeTasks = assignments.filter(t => !t.submitted);

  if (activeTasks.length === 0) {
    targetUl.innerHTML = `<li class="list-group-item text-muted text-center py-4 border-0">No upcoming deadlines!</li>`;
    return;
  }

  activeTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = "list-group-item d-flex justify-content-between align-items-center p-4 border-0 border-bottom";
    
    let badgeClass = "bg-warning text-dark";
    if (task.status === "Ongoing") badgeClass = "bg-info text-white";

    const dateStr = new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    li.innerHTML = `
      <div>
        <h6 class="fw-bold mb-1 text-dark">${task.title}</h6>
        <p class="mb-0 text-muted small"><span class="badge bg-light text-secondary border me-1">${task.course}</span> Due: ${dateStr}</p>
      </div>
      <span class="badge rounded-pill px-3 py-1.5 ${badgeClass} fw-normal">${task.status}</span>
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

  if (assignments.length === 0) { pending = 4; ongoing = 2; done = 6; }

  if (document.getElementById('badgePendingCount')) document.getElementById('badgePendingCount').innerText = pending;
  if (document.getElementById('badgeOngoingCount')) document.getElementById('badgeOngoingCount').innerText = ongoing;
  if (document.getElementById('badgeDoneCount')) document.getElementById('badgeDoneCount').innerText = done;

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
      plugins: { legend: { display: false } },
      cutout: '75%'
    }
  });
}

// ==========================================
// COURSE REGISTRATION & TIMETABLE ENGINES
// ==========================================
function renderCourseCatalog() {
  const container = document.getElementById('catalogCoursesRow') || document.querySelector('.row');
  if (!container || document.getElementById('taskDonutChart')) return;

  container.innerHTML = '';
  courseCatalog.forEach(course => {
    const isStaged = selectedCourses.some(c => c.code === course.code);
    const col = document.createElement('div');
    col.className = "col-md-6 col-lg-4 mb-4";
    col.innerHTML = `
      <div class="card border-0 shadow-sm h-100 p-2">
        <div class="card-body d-flex flex-column justify-content-between">
          <div>
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="badge bg-purple-light theme-accent-text px-2.5 py-1.5">${course.code}</span>
              <span class="text-secondary small fw-bold">${course.credits} Credits</span>
            </div>
            <h5 class="fw-bold text-dark mb-3">${course.name}</h5>
            <p class="text-muted small mb-1">⏰ ${course.schedule}</p>
            <p class="text-muted small mb-1">📍 ${course.location}</p>
            <p class="text-muted small mb-0">👤 ${course.lecturer}</p>
          </div>
          <button class="btn ${isStaged ? 'btn-secondary disabled' : 'btn-outline-primary'} w-100 fw-bold rounded-3 mt-4 py-2"
                  onclick="stageCourse('${course.code}')" ${isStaged ? 'disabled' : ''}>
            ${isStaged ? '✓ Selected' : 'Select Course'}
          </button>
        </div>
      </div>
    `;
    container.appendChild(col);
  });
}

window.stageCourse = function(code) {
  const course = courseCatalog.find(c => c.code === code);
  if (course && !selectedCourses.some(c => c.code === code)) {
    selectedCourses.push(course);
    localStorage.setItem('mySavedCourses', JSON.stringify(selectedCourses));
    updateSelectedCoursesUI();
    renderCourseCatalog();
  }
};

window.unstageCourse = function(code) {
  selectedCourses = selectedCourses.filter(c => c.code !== code);
  localStorage.setItem('mySavedCourses', JSON.stringify(selectedCourses));
  updateSelectedCoursesUI();
  renderCourseCatalog();
};

function updateSelectedCoursesUI() {
  const list = document.getElementById('selectedCoursesList');
  const emptyState = document.getElementById('emptyState');
  const totalCredits = document.getElementById('totalCredits');
  
  if (!list) return;
  list.innerHTML = '';
  let creditCounter = 0;

  if (selectedCourses.length === 0) {
    if (emptyState) emptyState.style.display = "block";
    list.appendChild(emptyState || createEmptyStateNode());
    if (totalCredits) totalCredits.innerText = '0';
    return;
  }

  if (emptyState) emptyState.style.display = "none";
  selectedCourses.forEach(course => {
    creditCounter += course.credits;
    const li = document.createElement('li');
    li.className = "list-group-item d-flex justify-content-between align-items-center py-3 border-0 border-bottom bg-transparent";
    li.innerHTML = `
      <div>
        <h6 class="fw-bold text-dark mb-0 small">${course.name}</h6>
        <span class="text-muted small">${course.code} • ${course.credits} Cr</span>
      </div>
      <button class="btn btn-sm btn-link text-danger p-0 border-0" onclick="unstageCourse('${course.code}')">Remove</button>
    `;
    list.appendChild(li);
  });
  if (totalCredits) totalCredits.innerText = creditCounter;
}

window.submitRegistration = function() {
  if (selectedCourses.length === 0) {
    alert("Please select at least one course before checking out.");
    return;
  }
  alert("🎉 Success! Your semester schedule configuration has been locked down.");
  window.location.href = "timetable.html";
};

function renderTimetable() {
  const tbody = document.getElementById('timetableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  if (selectedCourses.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-5 text-muted fw-bold">No active classes enrolled. Head to registration!</td></tr>`;
    return;
  }

  selectedCourses.forEach(course => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="ps-4 py-3.5 fw-semibold text-dark">${course.schedule.split(' ')[0]}</td>
      <td class="text-secondary">${course.schedule.substring(course.schedule.indexOf(' ') + 1)}</td>
      <td>
        <div class="fw-bold text-dark mb-0">${course.name}</div>
        <div class="text-muted small">${course.code}</div>
      </td>
      <td><span class="badge bg-light text-dark border fw-normal">${course.location}</span></td>
      <td class="text-dark fw-medium">${course.lecturer}</td>
      <td class="pe-4 text-end"><span class="badge bg-success text-white rounded-pill px-3 py-1.5">Enrolled</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// ==========================================
// PIPELINE ASSIGNMENT CREATION & DISPATCH
// ==========================================
function renderTaskMatrix() {
  const tbody = document.getElementById('assignmentsTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  const assignments = JSON.parse(localStorage.getItem('myAssignments')) || [];

  assignments.forEach(task => {
    const tr = document.createElement('tr');
    let badgeColor = "bg-warning text-dark";
    if (task.status === "Ongoing") badgeColor = "bg-info text-white";
    if (task.submitted) badgeColor = "bg-success text-white";

    tr.innerHTML = `
      <td class="ps-4 py-3">
        <div class="fw-bold text-dark">${task.title}</div>
        <div class="text-muted small">${task.course}</div>
      </td>
      <td class="text-secondary small fw-medium">${new Date(task.deadline).toLocaleString()}</td>
      <td><span class="badge ${badgeColor} px-2.5 py-1.5">${task.submitted ? 'Done' : task.status}</span></td>
      <td class="pe-4 text-end">
        <button class="btn btn-sm btn-outline-danger px-2 py-1 rounded-3" onclick="deleteAssignment('${task.id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function setupAssignmentForm() {
  const form = document.querySelector('form');
  if (!form || form.id === 'loginForm') return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const fields = form.querySelectorAll('input, select');
    
    const newTask = {
      id: "task-" + Date.now(),
      title: fields[0].value,
      course: fields[1].value,
      deadline: fields[2].value,
      status: fields[3].value,
      submitted: false
    };

    const list = JSON.parse(localStorage.getItem('myAssignments')) || [];
    list.push(newTask);
    localStorage.setItem('myAssignments', JSON.stringify(list));
    
    form.reset();
    renderTaskMatrix();
    alert("🚀 New project task deployed down the execution pipeline.");
  });
}

window.deleteAssignment = function(id) {
  let list = JSON.parse(localStorage.getItem('myAssignments')) || [];
  list = list.filter(t => t.id !== id);
  localStorage.setItem('myAssignments', JSON.stringify(list));
  renderTaskMatrix();
};

// ==========================================
// SUBMISSIONS DESK & ARCHIVE VAULT ACTIONS
// ==========================================
function renderSubmissionsDesk() {
  const select = document.getElementById('submissionTaskSelect');
  const archiveTable = document.getElementById('archiveTableBody') || document.querySelector('.table-responsive tbody');
  const counter = document.getElementById('archiveCounter');
  const dropzone = document.querySelector('.upload-dropzone');

  const assignments = JSON.parse(localStorage.getItem('myAssignments')) || [];

  if (select) {
    select.innerHTML = '<option value="" selected disabled>Choose active task assignment...</option>';
    assignments.filter(t => !t.submitted).forEach(task => {
      const opt = document.createElement('option');
      opt.value = task.id;
      opt.textContent = `[${task.course}] - ${task.title}`;
      select.appendChild(opt);
    });

    select.addEventListener('change', function() {
      currentActiveTaskIdForUpload = this.value;
    });
  }

  if (archiveTable) {
    archiveTable.innerHTML = '';
    const items = assignments.filter(t => t.submitted);
    if (counter) counter.innerText = `${items.length} Filed`;

    if (items.length === 0) {
      archiveTable.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted small">No submitted tasks vault archived yet.</td></tr>`;
    } else {
      items.forEach(task => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="ps-4 py-3">
            <div class="fw-bold text-dark">${task.title}</div>
            <div class="text-muted small">${task.course}</div>
          </td>
          <td class="text-secondary small">${new Date().toLocaleDateString()}</td>
          <td><span class="badge bg-success text-white px-2.5 py-1.5">Vaulted Securely</span></td>
          <td class="pe-4 text-end text-success fw-bold"><i class="bi bi-shield-check"></i> Verified</td>
        `;
        archiveTable.appendChild(tr);
      });
    }
  }

  if (dropzone && !dropzone.dataset.clickBound) {
    dropzone.dataset.clickBound = "true";
    dropzone.addEventListener('click', function() {
      if (!currentActiveTaskIdForUpload) {
        alert("Please pick an active assignment target from the drop-down menu above first!");
        return;
      }
      
      const fileUploader = document.createElement('input');
      fileUploader.type = 'file';
      fileUploader.onchange = function() {
        processSubmission(currentActiveTaskIdForUpload);
      };
      fileUploader.click();
    });
  }
}

function processSubmission(taskId) {
  let list = JSON.parse(localStorage.getItem('myAssignments')) || [];
  const idx = list.findIndex(t => t.id === taskId);
  
  if (idx !== -1) {
    list[idx].submitted = true;
    list[idx].status = "Done";
    localStorage.setItem('myAssignments', JSON.stringify(list));
    currentActiveTaskIdForUpload = null;
    
    renderSubmissionsDesk();
    alert("🔒 File successfully encrypted and locked inside the Archive Vault!");
  }
}