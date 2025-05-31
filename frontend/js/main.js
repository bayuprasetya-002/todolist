// Ambil token dari localStorage
const accessToken = localStorage.getItem("accessToken");
if (!accessToken) {
  window.location.href = "login.html";
}

let tasks = [];
let categories = [];

const sidebar = document.getElementById("sidebar");
const sidebarToggleBtn = document.getElementById("sidebar-toggle");

const logoutBtn = document.getElementById("logout-btn");

const navDashboard = document.getElementById("nav-dashboard");
const navAddTask = document.getElementById("nav-add-task");
const navPending = document.getElementById("nav-pending");
const navComplete = document.getElementById("nav-complete");
const navCategory = document.getElementById("nav-category");
const navHelp = document.getElementById("nav-help");

const contentSections = {
  dashboard: document.getElementById("dashboard-content"),
  add: document.getElementById("content-add"),
  pending: document.getElementById("content-pending"),
  completed: document.getElementById("content-completed"),
  category: document.getElementById("content-category"),
  help: document.getElementById("help-section"),
};

const mainTitle = document.getElementById("welcome-text"); // menggunakan elemen ini sebagai "header welcome"

const userNameElem = document.getElementById("user-name");
const userEmailElem = document.getElementById("user-email");

const taskForm = document.getElementById("task-form");
const taskTitleInput = document.getElementById("task-title");
const taskDescriptionInput = document.getElementById("task-description");
const taskDeadlineInput = document.getElementById("task-deadline");
const taskCategorySelect = document.getElementById("task-category");

const categoryForm = document.getElementById("category-form");
const categoryNameInput = document.getElementById("category-name");
const categoryList = document.getElementById("category-list");

const categoryFilterPending = document.getElementById("categoryFilterPending");
const categoryFilterCompleted = document.getElementById("categoryFilterCompleted");

let isEditing = false;
let editingTaskId = null;

// Sidebar toggle handler
sidebarToggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
});

// Logout handler
logoutBtn.addEventListener("click", () => {
  if (confirm("Yakin ingin logout?")) {
    localStorage.removeItem("accessToken");
    window.location.href = "login.html";
  }
});

// Navigation handlers
navDashboard.addEventListener("click", () => {
  clearActiveNav();
  navDashboard.classList.add("active");
  showSection("dashboard");
  mainTitle.textContent = `Welcome back, ${getUserName()} 👋`;
});

navAddTask.addEventListener("click", () => {
  clearActiveNav();
  navAddTask.classList.add("active");
  showSection("add");
  mainTitle.textContent = `Create Task`;
});

navPending.addEventListener("click", () => {
  clearActiveNav();
  navPending.classList.add("active");
  showSection("pending");
  mainTitle.textContent = `Task Pending`;
  loadTasks(categoryFilterPending.value);
});

navComplete.addEventListener("click", () => {
  clearActiveNav();
  navComplete.classList.add("active");
  showSection("completed");
  mainTitle.textContent = `Task Complete`;
  loadTasks(categoryFilterCompleted.value);
});

navCategory.addEventListener("click", () => {
  clearActiveNav();
  navCategory.classList.add("active");
  showSection("category");
  mainTitle.textContent = `Task Categories`;
  loadCategoriesForList();
});

navHelp.addEventListener("click", () => {
  clearActiveNav();
  navHelp.classList.add("active");
  showSection("help");
  mainTitle.textContent = `Help`;
});

// Fungsi setUserInfo: Ambil user dari localStorage, parsing, dan tampilkan
function setUserInfo() {
  const userStr = localStorage.getItem("user");
  if (!userStr) {
    userNameElem.textContent = "User";
    userEmailElem.textContent = "user@example.com";
    return;
  }
  try {
    const user = JSON.parse(userStr);
    userNameElem.textContent = user.username || "User";
    userEmailElem.textContent = user.email || "user@example.com";
  } catch {
    userNameElem.textContent = "User";
    userEmailElem.textContent = "user@example.com";
  }
}

// Fungsi getUserName, untuk ambil nama user di sidebar supaya konsisten
function getUserName() {
  return userNameElem.textContent || "User";
}

// Panggil setUserInfo di awal initializeApp agar langsung tampil saat load
async function initializeApp() {
  setUserInfo();

  await loadCategories();

  clearActiveNav();
  navDashboard.classList.add("active");
  showSection("dashboard");
  mainTitle.textContent = `Welcome back, ${getUserName()} 👋`;

  updateDate();

  await updateTaskStatusPercent();
}


// Clear active class on nav buttons
function clearActiveNav() {
  [navDashboard, navAddTask, navPending, navComplete, navCategory, navHelp].forEach(btn => btn.classList.remove("active"));
}

// Show section by key, hide others
function showSection(key) {
  Object.keys(contentSections).forEach(k => {
    if (k === key) contentSections[k].classList.remove("hidden");
    else contentSections[k].classList.add("hidden");
  });
}

// Load categories and populate dropdowns and filters
async function loadCategories() {
  try {
    const res = await axios.get(`${BASE_URL}/categories`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    categories = res.data;

    // Dropdown task category
    taskCategorySelect.innerHTML = `<option value="">-- Pilih Kategori --</option>`;
    categories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat.id;
      option.textContent = cat.name;
      taskCategorySelect.appendChild(option);
    });

    // Category filters for Pending and Completed
    [categoryFilterPending, categoryFilterCompleted].forEach(select => {
      select.innerHTML = `<option value="">Semua</option>`;
      categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.name;
        select.appendChild(option);
      });
    });
  } catch {
    alert("Gagal memuat kategori");
  }
}

// Load categories for list with edit/delete buttons
async function loadCategoriesForList() {
  try {
    const res = await axios.get(`${BASE_URL}/categories`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const kategori = res.data;

    categoryList.innerHTML = "";
    kategori.forEach(cat => {
      const li = document.createElement("li");
      li.className = "category-item";
      li.dataset.id = cat.id;

      li.innerHTML = `
        <span class="category-name">${escapeHtml(cat.name)}</span>
        <button class="btn-edit" title="Edit Kategori">✎</button>
        <button class="btn-delete" title="Hapus Kategori">✕</button>
      `;
      categoryList.appendChild(li);
    });

    addCategoryEventListeners();
  } catch {
    alert("Gagal memuat kategori");
  }
}

// Add new category form submit
categoryForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = categoryNameInput.value.trim();
  if (!name) return alert("Nama kategori wajib diisi");

  try {
    await axios.post(
      `${BASE_URL}/categories`,
      { name },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    alert("Kategori berhasil ditambahkan");
    categoryNameInput.value = "";
    loadCategoriesForList();
    await loadCategories();
  } catch (error) {
    alert(error.response?.data?.message || "Gagal menambahkan kategori");
  }
});

// Add event listeners to edit and delete category buttons
function addCategoryEventListeners() {
  document.querySelectorAll(".btn-edit").forEach(btn =>
    btn.addEventListener("click", (e) => {
      const li = e.target.closest("li");
      enableCategoryEdit(li);
    })
  );

  document.querySelectorAll(".btn-delete").forEach(btn =>
    btn.addEventListener("click", async (e) => {
      const li = e.target.closest("li");
      const id = li.dataset.id;
      if (confirm("Yakin ingin menghapus kategori ini?")) {
        try {
          await axios.delete(`${BASE_URL}/categories/${id}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          alert("Kategori berhasil dihapus");
          loadCategoriesForList();
          await loadCategories();
        } catch {
          alert("Gagal menghapus kategori");
        }
      }
    })
  );
}

// Enable inline category editing
function enableCategoryEdit(li) {
  const span = li.querySelector(".category-name");
  const oldName = span.textContent;

  const input = document.createElement("input");
  input.type = "text";
  input.value = oldName;
  input.className = "edit-category-input";

  li.insertBefore(input, span);
  li.removeChild(span);

  input.focus();

  input.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      await saveCategoryEdit(li, input.value);
    } else if (e.key === "Escape") {
      cancelCategoryEdit(li, oldName);
    }
  });

  input.addEventListener("blur", () => {
    cancelCategoryEdit(li, oldName);
  });
}

// Save category edit
async function saveCategoryEdit(li, newName) {
  const id = li.dataset.id;
  if (!newName.trim()) {
    return alert("Nama kategori tidak boleh kosong");
  }

  try {
    await axios.put(
      `${BASE_URL}/categories/${id}`,
      { name: newName.trim() },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    alert("Kategori berhasil diperbarui");
    loadCategoriesForList();
    await loadCategories();
  } catch (error) {
    alert(error.response?.data?.message || "Gagal memperbarui kategori");
  }
}

// Cancel inline category editing
function cancelCategoryEdit(li, oldName) {
  const input = li.querySelector(".edit-category-input");
  if (!input) return;

  const span = document.createElement("span");
  span.className = "category-name";
  span.textContent = oldName;

  li.insertBefore(span, input);
  li.removeChild(input);
}

taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Disable tombol submit untuk mencegah klik ganda
  const submitBtn = taskForm.querySelector("button[type='submit']");
  submitBtn.disabled = true;

  const title = taskTitleInput.value.trim();
  const description = taskDescriptionInput.value.trim();
  const deadline = taskDeadlineInput.value;
  const categoryId = taskCategorySelect.value || null;

  if (!title) {
    alert("Judul task wajib diisi!");
    submitBtn.disabled = false;
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
    showSection("pending");
    mainTitle.textContent = "Task Pending";
    await loadTasks(categoryFilterPending.value);
  } catch (error) {
    alert("Gagal menyimpan task");
  } finally {
    submitBtn.disabled = false;
  }
});


// Clear task form and reset edit mode
function clearTaskForm() {
  taskTitleInput.value = "";
  taskDescriptionInput.value = "";
  taskDeadlineInput.value = "";
  taskCategorySelect.value = "";
  isEditing = false;
  editingTaskId = null;
}

// Category filters change handlers
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

// Load tasks filtered by category and status
async function loadTasks(categoryId = "") {
  try {
    let status = null;
    if (navPending.classList.contains("active")) status = "pending";
    else if (navComplete.classList.contains("active")) status = "completed";
    else return;

    const queryParams = new URLSearchParams({ status });
    if (categoryId) queryParams.append("categoryId", categoryId);

    const res = await axios.get(`${BASE_URL}/tasks?${queryParams.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    tasks = res.data;
    renderTasks(status);

    // Update dashboard percentages too
    await updateTaskStatusPercent();
  } catch {
    alert("Gagal mengambil data task, silakan login ulang.");
    logoutBtn.click();
  }
}

function renderTasks(status) {
  let ul = null;
  if (status === "pending") ul = document.getElementById("pending-list");
  else if (status === "completed") ul = document.getElementById("completed-list");
  else return;

  ul.innerHTML = "";

  if (!tasks.length) {
    ul.innerHTML = `<li>Tidak ada task ${status === "pending" ? "pending" : "selesai"}</li>`;
    return;
  }

  tasks.forEach(task => {
    const category = categories.find(c => c.id === task.categoryId);

    const li = document.createElement("li");
    li.className = "task-item";

    // Update innerHTML untuk tombol dengan warna sesuai dan layout rapi
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


// Add event listeners to task action buttons
function addTaskListeners() {
  document.querySelectorAll(".btn-complete").forEach(btn =>
    btn.addEventListener("click", () => completeTask(btn.dataset.id))
  );
  document.querySelectorAll(".btn-delete").forEach(btn =>
    btn.addEventListener("click", () => deleteTask(btn.dataset.id))
  );
  document.querySelectorAll(".btn-edit").forEach(btn =>
    btn.addEventListener("click", () => editTask(btn.dataset.id))
  );
}

// Complete task (update status)
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

// Delete task
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

// Edit task (fill form with existing data)
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
    navAddTask.classList.add("active");
    showSection("add");
    mainTitle.textContent = "Edit Task";
  } catch {
    alert("Gagal mengambil data task");
  }
}

// Helper: Escape HTML to prevent injection
function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m] || m
  );
}

// Helper: Format date in Indonesian locale
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID");
}

// Update dashboard status percentages
async function updateTaskStatusPercent() {
  try {
    const res = await axios.get(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const allTasks = res.data;

    if (allTasks.length === 0) {
      setStatusPercent(0, 0, 0);
      return;
    }

    const completedCount = allTasks.filter(t => t.status === "completed").length;
    const inProgressCount = allTasks.filter(t => t.status === "pending").length;

    setStatusPercent(
      Math.round((completedCount / allTasks.length) * 100),
      Math.round((inProgressCount / allTasks.length) * 100)
    );

  } catch {
    // fail silently or notify user
  }
}

function setStatusPercent(completed, inProgress) {
  document.getElementById("percent-completed").textContent = completed + "%";
  document.getElementById("percent-inprogress").textContent = inProgress + "%";

  document.querySelector(".status-circle.completed").style.background = `conic-gradient(#2bc42b 0% ${completed}%, #ddd ${completed}% 100%)`;
  document.querySelector(".status-circle.in-progress").style.background = `conic-gradient(#2b48c4 0% ${inProgress}%, #ddd ${inProgress}% 100%)`;
}


// Update current date display
function updateDate() {
  const dateElem = document.getElementById("current-date");
  const now = new Date();
  dateElem.textContent = now.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

// Initialize app on script load
initializeApp();
