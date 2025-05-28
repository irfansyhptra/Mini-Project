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
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

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
          // Simpan data sesi dengan validasi
          if (!res.token || !res.user || !res.user.userId) {
            throw new Error('Data respons tidak lengkap');
          }

          // Hapus data sesi lama jika ada
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('userId');

          // Simpan data sesi baru
          localStorage.setItem("token", res.token);
          localStorage.setItem("user", JSON.stringify(res.user));
          localStorage.setItem("userId", res.user.userId);

          // Redirect berdasarkan role
          if (res.user.role === true) {
            showSuccess("Login berhasil! Mengalihkan ke halaman admin...");
            setTimeout(() => {
              window.location.href = "/pages/admin/dashboardAdmin.html";
            }, 1500);
          } else {
            showSuccess("Login berhasil! Mengalihkan ke halaman pengguna...");
            setTimeout(() => {
              window.location.href = "/pages/user/dashboardUser.html";
            }, 1500);
          }
        } else {
          showError(res.message || "Login gagal. Silakan coba lagi.");
        }
      } catch (error) {
        console.error("Login error:", error);
        showError("Terjadi kesalahan saat login. Silakan coba lagi.");
      } finally {
        if (loginButton) {
          loginButton.disabled = false;
          loginButton.innerHTML = 'Login';
        }
      }
    });
  }
};

// Initialize login functionality
document.addEventListener("DOMContentLoaded", onLogin);
