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
        // Check for hardcoded admin credentials
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (email === "admin@gmail.com" && password === "admin") {
          // Handle hardcoded admin login
          const adminUser = {
            email: "admin@gmail.com",
            role: true, // true means admin
            name: "Administrator"
          };
          
          // Store admin data
          localStorage.setItem("token", "admin-token-placeholder");
          localStorage.setItem("user", JSON.stringify(adminUser));
          
          showSuccess("Login berhasil! Mengalihkan ke halaman admin...");
          
          setTimeout(() => {
            const baseUrl = window.location.origin + "/SILAPOR-FrontEnd";
            window.location.href = baseUrl + "/page/dashboardAdmin.html";
          }, 1500);
          
          return; // Exit early, no need to call the API
        }
        
        // Regular login flow for other users
        const response = await fetch("https://backend-silapor.vercel.app/auth/login", {
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
          // Store token and user data
          localStorage.setItem("token", res.token);
          
          localStorage.setItem("user", JSON.stringify(res.data));
          // Pastikan data user ada sebelum menyimpanny
          
          // Get user data safely for role checking
          const userData = res.data && res.data.data ? res.data.data : {};
          
          // Show role-specific success message and redirect based on role
          // true = admin, false = user biasa
          if (userData.role == true) {
            showSuccess("Login berhasil! Mengalihkan ke halaman admin...");
            setTimeout(() => {
              const baseUrl = window.location.origin + "/SILAPOR-FrontEnd";
              console.log("Redirecting to admin dashboard...");
              window.location.href = baseUrl + "/page/dashboardAdmin.html";
            }, 1500);
          } else {
            showSuccess("Login berhasil! Mengalihkan ke halaman pengguna...");
            setTimeout(() => {
              const baseUrl = window.location.origin + "/SILAPOR-FrontEnd";
              console.log("Redirecting to user dashboard...");
              window.location.href = baseUrl + "/page/berandaUser.html";
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
          loginButton.innerHTML = "Masuk";
        }
      }
    });
  }
};

// Helper function to show error messages
function showError(message) {
  // Hapus pesan error sebelumnya jika ada
  const previousErrors = document.querySelectorAll(".bg-red-100");
  previousErrors.forEach(el => el.remove());
  
  const errorDiv = document.createElement("div");
  errorDiv.className = "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4";
  errorDiv.textContent = message;
  
  const form = document.querySelector("form");
  if (form) {
    form.prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
  }
}

// Helper function to show success messages
function showSuccess(message) {
  // Hapus pesan sukses sebelumnya jika ada
  const previousSuccess = document.querySelectorAll(".bg-green-100");
  previousSuccess.forEach(el => el.remove());
  
  const successDiv = document.createElement("div");
  successDiv.className = "bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4";
  successDiv.textContent = message;
  
  const form = document.querySelector("form");
  if (form) {
    form.prepend(successDiv);
    setTimeout(() => successDiv.remove(), 5000);
  }
}

// Initialize login functionality
document.addEventListener("DOMContentLoaded", onLogin);