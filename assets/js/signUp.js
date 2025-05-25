// Import validation utilities
const Validation = window.ValidationUtils;

// CORS Proxy URL
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
const API_URL = 'https://back-end-eventory.vercel.app/api/Users/register';

document.addEventListener("DOMContentLoaded", function () {
  const signupForm = document.getElementById("signup-form");
  const nameInput = document.getElementById("signup-name");
  const emailInput = document.getElementById("signup-email");
  const passwordInput = document.getElementById("signup-password");
  const confirmPasswordInput = document.getElementById(
    "signup-confirm-password"
  );
  const agreeTermsCheckbox = document.getElementById("agree-terms");
  const passwordToggles = document.querySelectorAll(".toggle-password");

  if (signupForm) {
    signupForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Clear previous error messages
      document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
      });

      if (!Validation.validateSignupForm()) {
        return;
      }

      const submitButton = this.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Memproses...';
      }

      try {
        const requestData = {
          fullName: document.getElementById('fullName').value.trim(),
          userName: document.getElementById('userName').value.trim(),
          email: document.getElementById('email').value.trim(),
          password: document.getElementById('password').value,
          phone: document.getElementById('phone').value.trim(),
          role: true
        };

        console.log('🌐 API Request:', {
          endpoint: API_URL,
          method: 'POST',
          data: requestData
        });

        // Try direct API call first
        try {
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(requestData)
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          console.log('✅ API Response:', {
            status: response.status,
            statusText: response.statusText,
            data: data
          });

          alert('Registration successful! Please login.');
          window.location.href = 'login.html';
          return;
        } catch (directError) {
          console.log('Direct API call failed, trying CORS proxy...', directError);
          
          // If direct call fails, try with CORS proxy
          const proxyResponse = await fetch(CORS_PROXY + API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(requestData)
          });

          if (!proxyResponse.ok) {
            const errorData = await proxyResponse.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${proxyResponse.status}`);
          }

          const proxyData = await proxyResponse.json();
          console.log('✅ Proxy API Response:', {
            status: proxyResponse.status,
            statusText: proxyResponse.statusText,
            data: proxyData
          });

          alert('Registration successful! Please login.');
          window.location.href = 'login.html';
        }
      } catch (error) {
        console.error('❌ API Error:', {
          context: 'Signup',
          error: error
        });
        
        // Handle specific error messages
        let errorMessage = 'Registration failed. Please try again.';
        if (error.message.includes('semua kolom harus di isii')) {
          errorMessage = 'Mohon lengkapi semua field yang diperlukan.';
        } else if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
          errorMessage = 'Terjadi masalah koneksi. Silakan coba lagi nanti.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        alert(errorMessage);
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'Daftar';
        }
      }
    });
  }

  // Toggle Password
  if (passwordToggles.length > 0) {
    passwordToggles.forEach((toggle) => {
      toggle.addEventListener("click", function () {
        const input = this.previousElementSibling;
        if (input) {
          const type =
            input.getAttribute("type") === "password" ? "text" : "password";
          input.setAttribute("type", type);
          const icon = this.querySelector('i');
          if (icon) {
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
          }
        }
      });
    });
  }

  // Validasi Realtime Password
  passwordInput.addEventListener("input", function () {
    if (this.value.trim() === "") {
      Validation.removeError(this);
    } else if (!Validation.validatePassword(this.value.trim())) {
      Validation.setError(
        this,
        "Password minimal 8 karakter dan mengandung huruf & angka"
      );
    } else {
      Validation.removeError(this);
    }
  });

  confirmPasswordInput.addEventListener("input", function () {
    if (this.value.trim() === "") {
      Validation.removeError(this);
    } else if (this.value.trim() !== passwordInput.value.trim()) {
      Validation.setError(this, "Konfirmasi password tidak cocok");
    } else {
      Validation.removeError(this);
    }
  });

  function setError(input, message) {
    const formGroup = input.closest(".form-group");
    if (!formGroup) return;

    let error = formGroup.querySelector(".error-message");
    if (!error) {
      error = document.createElement("div");
      error.className = "error-message";
      formGroup.appendChild(error);
    }

    error.textContent = message;
    error.style.color = "white";
    error.style.fontSize = "12px";
    error.style.marginTop = "8px";
    error.style.display = "block";
  }

  function removeError(input) {
    const formGroup = input.closest(".form-group");
    if (!formGroup) return;

    const error = formGroup.querySelector(".error-message");
    if (error) {
      error.textContent = "";
      error.style.display = "none";
    }
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePassword(password) {
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
  }

  // Add real-time validation
  const inputs = {
    fullName: Validation.validateName,
    userName: Validation.validateUsername,
    email: Validation.validateEmail,
    phone: Validation.validatePhone,
    password: Validation.validatePassword
  };

  Object.entries(inputs).forEach(([id, validator]) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', function() {
        if (!this.value.trim()) {
          Validation.removeError(this);
        } else if (!validator(this.value.trim())) {
          Validation.setError(this, `Format ${this.name} tidak valid`);
        } else {
          Validation.removeError(this);
        }
      });
    }
  });
});
