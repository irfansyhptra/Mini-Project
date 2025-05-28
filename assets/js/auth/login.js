// assets/js/auth/login.js

// Helper function to show error messages
function showError(message) {
  const container = document.getElementById("message-container");
  if (container) {
    container.textContent = message;
    container.className = "message error"; // Pastikan ada style untuk .message.error
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
    container.className = "message success"; // Pastikan ada style untuk .message.success
    container.classList.remove("hidden");
    setTimeout(() => container.classList.add("hidden"), 3000);
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
      console.error("Elemen form login tidak ditemukan di login.js!");
      return;
  }

  passwordToggle?.addEventListener("click", () => {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    const icon = passwordToggle.querySelector("i");
    icon?.classList.toggle("fa-eye");
    icon?.classList.toggle("fa-eye-slash");
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

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
          localStorage.setItem("user", JSON.stringify(res.user)); // Menyimpan seluruh objek user
          localStorage.setItem("userId", res.user._id); // Menyimpan _id secara terpisah untuk kemudahan akses

          // Menentukan role. Sesuaikan dengan struktur data 'role' dari API Anda.
          // Contoh: jika API mengembalikan `user.role: "admin"` atau `user.role: "user"`
          // Atau jika boolean `user.isAdmin: true`
          const isAdmin = res.user.role === "admin"; // Ganti "admin" dengan nilai peran admin dari API Anda

          showSuccess("Login berhasil! Mengalihkan...");
          setTimeout(() => {
              if (isAdmin) {
                  console.log("Redirecting to admin dashboard...");
                  window.location.href = "dashboardAdmin.html"; // Sesuaikan path jika perlu
              } else {
                  console.log("Redirecting to user dashboard...");
                  window.location.href = "dashboardUser.html"; // Sesuaikan path jika perlu
              }
          }, 1500);

      } else {
          showError(res.message || "Login gagal. Periksa email dan kata sandi Anda.");
      }
    } catch (error) {
      console.error("Login error:", error);
      showError("Terjadi kesalahan teknis saat login. Silakan coba lagi.");
    } finally {
      loginButton.disabled = false;
      loginButton.innerHTML = "Masuk";
    }
  });
};

document.addEventListener("DOMContentLoaded", onLogin);