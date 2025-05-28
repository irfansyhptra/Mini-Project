// assets/js/auth/login.js

function showErrorLogin(message) {
  const container = document.getElementById("message-container");
  if (container) {
    container.textContent = message;
    container.className = "message error"; // Pastikan ada style CSS untuk .message.error
    container.classList.remove("hidden");
    setTimeout(() => container.classList.add("hidden"), 5000);
  } else {
    console.error("Login Error (no container):", message);
    alert(`Error: ${message}`);
  }
}

function showSuccessLogin(message) {
  const container = document.getElementById("message-container");
  if (container) {
    container.textContent = message;
    container.className = "message success"; // Pastikan ada style CSS untuk .message.success
    container.classList.remove("hidden");
    setTimeout(() => container.classList.add("hidden"), 3000);
  } else {
    console.log("Login Success (no container):", message);
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
      console.error("Satu atau lebih elemen form login tidak ditemukan!");
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
        showErrorLogin("Email dan Kata Sandi wajib diisi.");
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

      const backendResponse = await response.json(); // Simpan hasil parsing json
      console.log("Login backend response:", backendResponse);

      // Menggunakan backendResponse untuk pengecekan
      if (response.ok && backendResponse.token && backendResponse.data && backendResponse.data._id) {
          localStorage.setItem("token", backendResponse.token);
          // Menyimpan objek user dari backendResponse.data
          localStorage.setItem("user", JSON.stringify(backendResponse.data));
          localStorage.setItem("userId", backendResponse.data._id); // Ini adalah CreatorID

          // Penentuan role (sesuaikan dengan field 'role' di objek user dari backend Anda)
          // Contoh: jika backendResponse.data.role adalah string "admin" atau "user"
          // Atau backendResponse.data.role adalah boolean dimana true = user (sesuai register.js)
          const isAdmin = backendResponse.data.role === false || String(backendResponse.data.role).toLowerCase() === "false";
          // Jika di register.js role diset "true" untuk user, maka "false" atau tidak "true" adalah admin.
          // Anda mungkin perlu menyesuaikan logika ini berdasarkan implementasi role di backend Anda.

          showSuccessLogin("Login berhasil! Mengalihkan...");
          setTimeout(() => {
              if (isAdmin) {
                  console.log("Redirecting to admin dashboard...");
                  window.location.href = "dashboardAdmin.html"; // Sesuaikan path
              } else {
                  console.log("Redirecting to user dashboard...");
                  window.location.href = "dashboardUser.html"; // Sesuaikan path
              }
          }, 1500);

      } else {
          showErrorLogin(backendResponse.message || "Login gagal. Periksa email dan kata sandi Anda.");
      }
    } catch (error) {
      console.error("Login error:", error);
      showErrorLogin("Terjadi kesalahan teknis saat login. Silakan coba lagi.");
    } finally {
      loginButton.disabled = false;
      loginButton.innerHTML = "Masuk";
    }
  });
};

document.addEventListener("DOMContentLoaded", onLogin);