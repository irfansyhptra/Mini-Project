// Helper function to show error messages (Pastikan ini ada di file Anda)
function showError(message) {
  const previousErrors = document.querySelectorAll(".bg-red-100");
  previousErrors.forEach((el) => el.remove());

  const errorDiv = document.createElement("div");
  errorDiv.className = "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4";
  errorDiv.textContent = message;

  // Pastikan ini menargetkan form atau container yang sesuai di halaman login Anda
  const form = document.querySelector("form");
  if (form) {
    form.prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
  }
}

// Helper function to show success messages (Pastikan ini ada di file Anda)
function showSuccess(message) {
  const previousSuccess = document.querySelectorAll(".bg-green-100");
  previousSuccess.forEach((el) => el.remove());

  const successDiv = document.createElement("div");
  successDiv.className = "bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4";
  successDiv.textContent = message;

  // Pastikan ini menargetkan form atau container yang sesuai di halaman login Anda
  const form = document.querySelector("form");
  if (form) {
    form.prepend(successDiv);
    setTimeout(() => successDiv.remove(), 5000);
  }
}

const onLogin = () => {
  const loginForm = document.getElementById("login-form");
  const loginButton = document.getElementById("login-button");
  const passwordToggle = document.getElementById("toggle-password");
  const passwordInput = document.getElementById("login-password");
  const emailInput = document.getElementById("login-email");

  // Password visibility toggle
  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener("click", () => {
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);

      // Change icon
      const icon = passwordToggle.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-eye");
        icon.classList.toggle("fa-eye-slash");
      }
    });
  }

  // Handle form submission
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (loginButton) {
        loginButton.disabled = true;
        loginButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Memproses...';
      }

      try {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Lakukan permintaan login ke backend API
        const response = await fetch("https://back-end-eventory.vercel.app/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        });

        const res = await response.json();
        console.log("Login response:", res);

        if (res.status === 200) {
          // Simpan token dan data user yang DITERIMA DARI BACKEND
          localStorage.setItem("token", res.token);
          localStorage.setItem("user", JSON.stringify(res.data)); // res.data harus berisi objek user

          // Dapatkan data user dari respons untuk cek role
          // Asumsi: res.data adalah objek user langsung.
          // Jika res.data adalah { data: { user: {...} } } atau sejenisnya, sesuaikan lagi di sini.
          const userData = res.data;

          // Pastikan properti role ada dan sesuai dengan backend
          // Jika role di backend adalah string "admin" atau "user", gunakan perbandingan string
          // Contoh: if (userData.role === "admin")
          if (userData.role === true) {
            showSuccess("Login berhasil! Mengalihkan ke halaman admin...");
            setTimeout(() => {
              window.location.href = "/page/dashboardAdmin.html";
            }, 1500);
          } else {
            showSuccess("Login berhasil! Mengalihkan ke halaman pengguna...");
            setTimeout(() => {
              window.location.href = "/page/berandaUser.html";
            }, 1500);
          }
        } else {
          // Jika login gagal, tampilkan pesan error dari backend
          showError(res.message || "Login gagal. Silakan coba lagi.");
        }
      } catch (error) {
        console.error("Login error:", error);
        showError("Terjadi kesalahan saat login. Silakan coba lagi.");
      } finally {
        if (loginButton) {
          loginButton.disabled = false;
          loginButton.innerHTML = "Masuk";
        }
      }
    });
  }
};

// Initialize login functionality
document.addEventListener("DOMContentLoaded", onLogin);
