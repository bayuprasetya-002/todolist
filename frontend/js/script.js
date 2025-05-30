// Variabel global
let accessToken = null;
let tasks = [];
let categories = [];

// Elemen DOM
const authContainer = document.getElementById("auth-container");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const appContainer = document.getElementById("app-container");

const loginUsernameEmail = document.getElementById("login-username-email");
const loginPassword = document.getElementById("login-password");
const loginBtn = document.getElementById("login-btn");

const registerUsername = document.getElementById("register-username");
const registerEmail = document.getElementById("register-email");
const registerPassword = document.getElementById("register-password");
const registerBtn = document.getElementById("register-btn");

const showRegisterBtn = document.getElementById("show-register-btn");
const showLoginBtn = document.getElementById("show-login-btn");

const navTasks = document.getElementById("nav-tasks");
const navComplete = document.getElementById("nav-complete");
const navPending = document.getElementById("nav-pending");
const logoutBtn = document.getElementById("logout-btn");
const mainTitle = document.getElementById("main-title");

const contentSections = {
  add: document.getElementById("content-add"),
  pending: document.getElementById("content-pending"),
  completed: document.getElementById("content-completed"),
};

const taskForm = document.getElementById("task-form");
const taskTitleInput = document.getElementById("task-title");
const taskDescriptionInput = document.getElementById("task-description");
const taskDeadlineInput = document.getElementById("task-deadline");
const taskCategorySelect = document.getElementById("task-category");

const categoryFilterPending = document.getElementById("categoryFilterPending");
const categoryFilterCompleted = document.getElementById("categoryFilterCompleted");

let isEditing = false;
let editingTaskId = null;

// Toggle antara form login dan register
showRegisterBtn.addEventListener("click", () => {
  loginForm.classList.add("hidden");
  registerForm.classList.remove("hidden");
});
showLoginBtn.addEventListener("click", () => {
  registerForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
});

// Login
loginBtn.addEventListener("click", async () => {
  const usernameOrEmail = loginUsernameEmail.value.trim();
  const password = loginPassword.value;

  if (!usernameOrEmail || !password) {
    alert("Semua kolom harus diisi!");
    return;
  }

  try {
    const res = await axios.post(`${BASE_URL}/login`, { usernameOrEmail, password });
    accessToken = res.data.accessToken;

    authContainer.style.display = "none";
    appContainer.style.display = "flex";

    await initializeApp();
  } catch (error) {
    alert(error.response?.data?.message || "Login gagal.");
  }
});

// Register
registerBtn.addEventListener("click", async () => {
  const username = registerUsername.value.trim();
  const email = registerEmail.value.trim();
  const password = registerPassword.value;

  if (!username || !email || !password) {
    alert("Semua kolom harus diisi!");
    return;
  }

  try {
    await axios.post(`${BASE_URL}/register`, { username, email, password });
    alert("Registrasi berhasil! Silakan login.");
    registerForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
  } catch (error) {
    alert(error.response?.data?.message || "Registrasi gagal.");
  }
});

// Logout
logoutBtn.addEventListener("click", () => {
  if (confirm("Yakin ingin logout?")) {
    accessToken = null;
    tasks = [];
    categories = [];

    authContainer.style.display = "block";
    appContainer.style.display = "none";

    loginUsernameEmail.value = "";
    loginPassword.value = "";
  }
});

// Inisialisasi aplikasi setelah login
async function initializeApp() {
  await loadCategories();
  clearActiveNav();
  navTasks.classList.add("active");
  mainTitle.textContent = "Create Task";
  showSection("add");
}

// Fungsi UI helper
function clearActiveNav() {
  [navTasks, navComplete, navPending].forEach((btn) => btn.classList.remove("active"));
}

function showSection(key) {
  Object.keys(contentSections).forEach((k) => {
    if (k === key) contentSections[k].classList.remove("hidden");
    else contentSections[k].classList.add("hidden");
  });
}

// Load kategori dan isi dropdown
async function loadCategories() {
  try {
    const res = await axios.get(`${BASE_URL}/categories`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    categories = res.data;

    taskCategorySelect.innerHTML = `<option value="">-- Pilih Kategori --</option>`;
    categories.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.id;
      option.textContent = cat.name;
      taskCategorySelect.appendChild(option);
    });

    categoryFilterPending.innerHTML = `<option value="">Semua</option>`;
    categories.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.id;
      option.textContent = cat.name;
      categoryFilterPending.appendChild(option);
    });

    categoryFilterCompleted.innerHTML = `<option value="">Semua</option>`;
    categories.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.id;
      option.textContent = cat.name;
      categoryFilterCompleted.appendChild(option);
    });
  } catch {
    alert("Gagal memuat kategori");
  }
}

// Load dan render task sesuai status dan filter kategori
async function loadTasks(categoryId = "") {
  try {
    let status;
    if (navPending.classList.contains("active")) status = "pending";
    else if (navComplete.classList.contains("active")) status = "completed";
    else status = null;

    if (!status) return;

    const queryParams = new URLSearchParams({ status });
    if (categoryId) queryParams.append("categoryId", categoryId);

    const res = await axios.get(`${BASE_URL}/tasks?${queryParams.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    tasks = res.data;
    renderTasks(status);
  } catch {
    alert("Gagal mengambil data task, silakan login ulang.");
    logoutBtn.click();
  }
}

function renderTasks(status) {
  let ul;
  if (status === "pending") ul = document.getElementById("pending-list");
  else if (status === "completed") ul = document.getElementById("completed-list");
  else return;

  ul.innerHTML = "";

  if (!tasks.length) {
    ul.innerHTML = `<li>Tidak ada task ${status === "pending" ? "pending" : "selesai"}</li>`;
    return;
  }

  tasks.forEach((task) => {
    const category = categories.find((c) => c.id === task.categoryId);

    const li = document.createElement("li");
    li.className = "task-item";

    li.innerHTML = `
      <div class="task-title">${escapeHtml(task.title)}</div>
      <div class="task-category">${category ? escapeHtml(category.name) : "-"}</div>
      <div class="task-description">${escapeHtml(task.description || "")}</div>
      <div class="task-deadline">${task.deadline ? formatDate(task.deadline) : ""}</div>
      <div class="task-actions">
        ${status === "pending" ? `<button class="btn-edit" data-id="${task.id}" title="Edit">✎</button>` : ""}
        ${status === "pending" ? `<button class="btn-complete" data-id="${task.id}" title="Tandai selesai">✓</button>` : ""}
        <button class="btn-delete" data-id="${task.id}" title="Hapus">✕</button>
      </div>
    `;

    ul.appendChild(li);
  });

  addTaskListeners();
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m] || m
  );
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID");
}

function addTaskListeners() {
  document.querySelectorAll(".btn-complete").forEach((btn) =>
    btn.addEventListener("click", () => completeTask(btn.dataset.id))
  );
  document.querySelectorAll(".btn-delete").forEach((btn) =>
    btn.addEventListener("click", () => deleteTask(btn.dataset.id))
  );
  document.querySelectorAll(".btn-edit").forEach((btn) =>
    btn.addEventListener("click", () => editTask(btn.dataset.id))
  );
}

async function completeTask(id) {
  try {
    await axios.put(
      `${BASE_URL}/tasks/${id}`,
      { status: "completed" },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    loadTasks(categoryFilterPending.value);
  } catch {
    alert("Gagal update status task");
  }
}

async function deleteTask(id) {
  if (!confirm("Yakin ingin menghapus task ini?")) return;

  try {
    await axios.delete(`${BASE_URL}/tasks/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (navPending.classList.contains("active")) loadTasks(categoryFilterPending.value);
    else if (navComplete.classList.contains("active")) loadTasks(categoryFilterCompleted.value);
  } catch {
    alert("Gagal menghapus task");
  }
}

async function editTask(id) {
  try {
    const res = await axios.get(`${BASE_URL}/tasks/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const task = res.data;

    taskTitleInput.value = task.title;
    taskDescriptionInput.value = task.description || "";
    taskDeadlineInput.value = task.deadline ? task.deadline.split("T")[0] : "";
    taskCategorySelect.value = task.categoryId || "";

    isEditing = true;
    editingTaskId = id;

    clearActiveNav();
    navTasks.classList.add("active");
    mainTitle.textContent = "Create Task";
    showSection("add");
  } catch {
    alert("Gagal mengambil data task");
  }
}

taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = taskTitleInput.value.trim();
  const description = taskDescriptionInput.value.trim();
  const deadline = taskDeadlineInput.value;
  const categoryId = taskCategorySelect.value || null;

  if (!title) {
    alert("Judul task wajib diisi!");
    return;
  }

  try {
    if (isEditing && editingTaskId) {
      await axios.put(
        `${BASE_URL}/tasks/${editingTaskId}`,
        { title, description, deadline, categoryId },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      alert("Task berhasil diperbarui");
    } else {
      await axios.post(
        `${BASE_URL}/tasks`,
        { title, description, deadline, categoryId },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      alert("Task berhasil ditambahkan");
    }
    clearTaskForm();
    clearActiveNav();
    navPending.classList.add("active");
    mainTitle.textContent = "Task Pending";
    showSection("pending");
    loadTasks(categoryFilterPending.value);
  } catch {
    alert("Gagal menyimpan task");
  }
});

function clearTaskForm() {
  taskTitleInput.value = "";
  taskDescriptionInput.value = "";
  taskDeadlineInput.value = "";
  taskCategorySelect.value = "";
  isEditing = false;
  editingTaskId = null;
}

categoryFilterPending.addEventListener("change", () => {
  if (navPending.classList.contains("active")) {
    loadTasks(categoryFilterPending.value);
  }
});
categoryFilterCompleted.addEventListener("change", () => {
  if (navComplete.classList.contains("active")) {
    loadTasks(categoryFilterCompleted.value);
  }
});

// SIDEBAR NAVIGATION EVENTS
navTasks.addEventListener("click", () => {
  clearActiveNav();
  navTasks.classList.add("active");
  mainTitle.textContent = "Create Task";
  showSection("add");
});

navComplete.addEventListener("click", () => {
  clearActiveNav();
  navComplete.classList.add("active");
  mainTitle.textContent = "Task Complete";
  showSection("completed");
  loadTasks(categoryFilterCompleted.value);
});

navPending.addEventListener("click", () => {
  clearActiveNav();
  navPending.classList.add("active");
  mainTitle.textContent = "Task Pending";
  showSection("pending");
  loadTasks(categoryFilterPending.value);
});
