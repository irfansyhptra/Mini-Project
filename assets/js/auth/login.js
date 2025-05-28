// Helper function to show error messages
function showError(message) {
  const container = document.getElementById("message-container");
  if (container) {
    container.textContent = message;
    container.className = "error"; // Pastikan ada style untuk .error
    container.classList.remove("hidden");
    setTimeout(() => container.classList.add("hidden"), 5000);
  } else {
    alert(`Error: ${message}`);
  }
}

// Helper function to show success messages
function showSuccess(message) {
  const container = document.getElementById("message-container");
  if (container) {
    container.textContent = message;
    container.className = "success"; // Pastikan ada style untuk .success
    container.classList.remove("hidden");
    setTimeout(() => container.classList.add("hidden"), 3000); // Waktu lebih singkat untuk sukses
  } else {
    alert(`Success: ${message}`);
  }
}

const onLogin = () => {
  const loginForm = document.getElementById("login-form");
  const loginButton = document.getElementById("login-button");
  const passwordToggle = document.getElementById("toggle-password");
  const passwordInput = document.getElementById("login-password");
  const emailInput = document.getElementById("login-email");

  if (!loginForm || !loginButton || !passwordInput || !emailInput) {
      console.error("Elemen form login tidak ditemukan!");
      return;
  }

  // Password visibility toggle
  passwordToggle?.addEventListener("click", () => {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    const icon = passwordToggle.querySelector("i");
    icon?.classList.toggle("fa-eye");
    icon?.classList.toggle("fa-eye-slash");
  });

  // Handle form submission
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validasi Sederhana
    if (!emailInput.value.trim() || !passwordInput.value.trim()) {
        showError("Email dan Kata Sandi wajib diisi.");
        return;
    }

    loginButton.disabled = true;
    loginButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Memproses...';

    try {
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      const response = await fetch("https://back-end-eventory.vercel.app/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const res = await response.json();
      console.log("Login response:", res);

      if (response.ok && res.token && res.user && res.user._id) {
          localStorage.setItem("token", res.token);
          localStorage.setItem("user", JSON.stringify(res.user));
          localStorage.setItem("userId", res.user._id); // Pastikan ini tersimpan

          // Cek role pengguna (sesuaikan 'role' dengan respons API)
          // Asumsi: 'role' adalah boolean atau string 'admin'/'user'
          // Jika 'role' di backend adalah string 'true'/'false', sesuaikan.
          // Jika 'role' adalah boolean, gunakan `res.user.role === true` (user) atau `res.user.role === false` (admin).
          // **PENTING**: Verifikasi struktur `res.user.role` dari API Anda.
          // Berdasarkan `register.js`, role diset "true", jadi kita asumsikan "true" adalah user.
          const isAdmin = res.user.role === "false" || res.user.role === false; // Contoh asumsi

          showSuccess("Login berhasil! Mengalihkan...");
          setTimeout(() => {
              if (isAdmin) {
                  console.log("Redirecting to admin dashboard...");
                  window.location.href = window.location.origin + "/pages/dashboardAdmin.html";
              } else {
                  console.log("Redirecting to user dashboard...");
                  window.location.href = window.location.origin + "/pages/dashboardUser.html";
              }
          }, 1500);

      } else {
          showError(res.message || "Login gagal. Periksa email dan kata sandi Anda.");
      }
    } catch (error) {
      console.error("Login error:", error);
      showError("Terjadi kesalahan teknis. Silakan coba lagi.");
    } finally {
      loginButton.disabled = false;
      loginButton.innerHTML = "Masuk";
    }
  });
};

document.addEventListener("DOMContentLoaded", onLogin);