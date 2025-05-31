// Elemen DOM login & register
const loginForm = document.getElementById("login-form");
const loginUsernameEmail = document.getElementById("login-username-email");
const loginPassword = document.getElementById("login-password");
const loginBtn = document.getElementById("login-btn");

const registerForm = document.getElementById("register-form");
const registerUsername = document.getElementById("register-username");
const registerEmail = document.getElementById("register-email");
const registerPassword = document.getElementById("register-password");
const registerBtn = document.getElementById("register-btn");

const showRegisterBtn = document.getElementById("show-register-btn");
const showLoginBtn = document.getElementById("show-login-btn");

// Toggle form login/register
showRegisterBtn.addEventListener("click", () => {
  loginForm.classList.add("hidden");
  registerForm.classList.remove("hidden");
});
showLoginBtn.addEventListener("click", () => {
  registerForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const usernameOrEmail = loginUsernameEmail.value.trim();
  const password = loginPassword.value;

  if (!usernameOrEmail || !password) {
    alert("Semua kolom harus diisi!");
    return;
  }

  try {
    const res = await axios.post(`${BASE_URL}/login`, { usernameOrEmail, password });
    const accessToken = res.data.accessToken;
    const user = res.data.user;  // Data user dari backend (id, username, email)

    if (!accessToken) {
      alert("Login gagal: token tidak ditemukan.");
      return;
    }

    // Simpan token dan data user ke localStorage
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(user));  // <-- Ini penting

    // Redirect ke halaman utama
    window.location.href = "index.html";
  } catch (error) {
    alert(error.response?.data?.message || "Login gagal.");
  }
});


// Register submit
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

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
