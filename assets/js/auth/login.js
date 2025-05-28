// assets/js/auth/login.js

function showErrorLogin(message) {
  const container = document.getElementById("message-container");
  if (container) {
    container.textContent = message;
    // Pastikan Anda memiliki style CSS untuk kelas .message dan .error
    // Contoh: .message.error { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
    container.className = "message error";
    container.classList.remove("hidden");
    setTimeout(() => container.classList.add("hidden"), 5000);
  } else {
    console.error("Login Error (message-container not found):", message);
    alert(`Error: ${message}`); // Fallback
  }
}

function showSuccessLogin(message) {
  const container = document.getElementById("message-container");
  if (container) {
    container.textContent = message;
    // Pastikan Anda memiliki style CSS untuk kelas .message dan .success
    // Contoh: .message.success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
    container.className = "message success";
    container.classList.remove("hidden");
    setTimeout(() => container.classList.add("hidden"), 3000);
  } else {
    console.log("Login Success (message-container not found):", message);
    alert(`Success: ${message}`); // Fallback
  }
}

const onLogin = () => {
  const loginForm = document.getElementById("login-form");
  const loginButton = document.getElementById("login-button");
  const passwordToggle = document.getElementById("toggle-password");
  const passwordInput = document.getElementById("login-password");
  const emailInput = document.getElementById("login-email");

  if (!loginForm || !loginButton || !passwordInput || !emailInput) {
      console.error("Satu atau lebih elemen form login tidak ditemukan di login.js!");
      // Nonaktifkan fungsionalitas jika elemen penting tidak ada
      if(loginForm) loginForm.onsubmit = () => {
          showErrorLogin("Formulir login tidak dapat diproses saat ini.");
          return false;
      };
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

      const backendResponse = await response.json();
      console.log("Login backend response:", backendResponse);

      // Pengecekan respons dari backend
      if (response.ok && backendResponse.status === 200 && backendResponse.token && backendResponse.data && backendResponse.data._id) {
          // Simpan token
          localStorage.setItem("token", backendResponse.token);
          // Simpan seluruh objek user (dari backendResponse.data)
          localStorage.setItem("user", JSON.stringify(backendResponse.data));
          // Simpan _id user secara terpisah sebagai userId (untuk CreatorID/ID Pelapor)
          localStorage.setItem("userId", backendResponse.data._id);

          // Logika penentuan peran (role)
          // Sesuaikan ini dengan bagaimana 'role' direpresentasikan di objek 'user' (backendResponse.data.role)
          // Contoh: jika role adalah string "admin" atau "user"
          // Atau jika 'role' adalah boolean true/false seperti di register.js Anda
          const userRole = backendResponse.data.role; // Ambil nilai role
          const isAdmin = String(userRole).toLowerCase() === "false"; // Asumsi "false" (string atau boolean) adalah admin

          showSuccessLogin("Login berhasil! Mengalihkan...");
          setTimeout(() => {
              if (isAdmin) {
                  console.log("Redirecting to admin dashboard...");
                  // Pastikan path ini benar relatif terhadap halaman login.html
                  window.location.href = "dashboardAdmin.html";
              } else {
                  console.log("Redirecting to user dashboard...");
                  // Pastikan path ini benar relatif terhadap halaman login.html
                  window.location.href = "dashboardUser.html";
              }
          }, 1500);

      } else {
          showErrorLogin(backendResponse.message || "Login gagal. Periksa kembali email dan kata sandi Anda.");
      }
    } catch (error) {
      console.error("Login error:", error);
      showErrorLogin("Terjadi kesalahan teknis saat proses login. Silakan coba lagi nanti.");
    } finally {
      loginButton.disabled = false;
      loginButton.innerHTML = "Masuk";
    }
  });
};

document.addEventListener("DOMContentLoaded", onLogin);