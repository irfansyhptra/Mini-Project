// Import validation utilities
const {
    API_BASE_URL,
    logApiRequest,
    logApiResponse,
    logApiError,
    showLoading,
    hideLoading,
    showError,
    showSuccess,
    handleApiError,
    validateSignupForm
} = window.ValidationUtils;

document.addEventListener("DOMContentLoaded", function () {
  const signupForm = document.getElementById("signup-form");
  const nameInput = document.getElementById("fullName");
  const userName = document.getElementById("userName");
  const emailInput = document.getElementById("email");
  const NumberPhone = document.getElementById("phone");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const agreeTermsCheckbox = document.getElementById("terms");
  const passwordToggles = document.querySelectorAll(".toggle-password");

  // Real-time validation for all fields
  nameInput.addEventListener("input", function() {
    validateName(this);
  });

  userName.addEventListener("input", function() {
    validateUsername(this);
  });

  emailInput.addEventListener("input", function() {
    validateEmailField(this);
  });

  NumberPhone.addEventListener("input", function() {
    validatePhone(this);
  });

  if (signupForm) {
    signupForm.addEventListener("submit", handleSignup);
  }

  // Toggle Password
  passwordToggles.forEach((toggle) => {
    toggle.addEventListener("click", function () {
      const input = this.previousElementSibling;
      const type = input.getAttribute("type") === "password" ? "text" : "password";
      input.setAttribute("type", type);
      this.classList.toggle("visible");
    });
  });

  // Validation Functions
  function validateName(input) {
    if (!input.value.trim()) {
      setError(input, "Nama lengkap tidak boleh kosong");
      return false;
    } else if (input.value.trim().length < 3) {
      setError(input, "Nama harus minimal 3 karakter");
      return false;
    } else if (!/^[a-zA-Z\s]*$/.test(input.value.trim())) {
      setError(input, "Nama hanya boleh mengandung huruf dan spasi");
      return false;
    }
    removeError(input);
    return true;
  }

  function validateUsername(input) {
    if (!input.value.trim()) {
      setError(input, "Username tidak boleh kosong");
      return false;
    } else if (input.value.trim().length < 4) {
      setError(input, "Username harus minimal 4 karakter");
      return false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(input.value.trim())) {
      setError(input, "Username hanya boleh mengandung huruf, angka, dan underscore");
      return false;
    }
    removeError(input);
    return true;
  }

  function validateEmailField(input) {
    if (!input.value.trim()) {
      setError(input, "Email tidak boleh kosong");
      return false;
    } else if (!validateEmail(input.value.trim())) {
      setError(input, "Format email tidak valid");
      return false;
    }
    removeError(input);
    return true;
  }

  function validatePhone(input) {
    if (!input.value.trim()) {
      setError(input, "Nomor telepon tidak boleh kosong");
      return false;
    } else if (!/^[0-9]{10,13}$/.test(input.value.trim())) {
      setError(input, "Nomor telepon harus 10-13 digit angka");
      return false;
    }
    removeError(input);
    return true;
  }

  function validatePasswordField(input) {
    if (!input.value.trim()) {
      setError(input, "Password tidak boleh kosong");
      return false;
    } else if (!validatePassword(input.value.trim())) {
      setError(
        input,
        "Password harus minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan karakter khusus"
      );
      return false;
    }
    removeError(input);
    return true;
  }

  function validateConfirmPassword(input, passwordInput) {
    if (!input.value.trim()) {
      setError(input, "Konfirmasi password tidak boleh kosong");
      return false;
    } else if (input.value.trim() !== passwordInput.value.trim()) {
      setError(input, "Konfirmasi password tidak cocok");
      return false;
    }
    removeError(input);
    return true;
  }

  function validateTerms(input) {
    if (!input.checked) {
      setError(input, "Harus menyetujui syarat & ketentuan");
      return false;
    }
    removeError(input);
    return true;
  }

  function setError(input, message) {
    const formGroup = input.closest(".form-group, .form-group-checkbox");
    if (!formGroup) return;

    let error = formGroup.querySelector(".error-message");
    if (!error) {
      error = document.createElement("div");
      error.className = "error-message";
      formGroup.appendChild(error);
    }

    error.textContent = message;
    error.style.color = "#ff4444";
    error.style.fontSize = "12px";
    error.style.marginTop = "8px";
    error.style.display = "block";
  }

  function removeError(input) {
    const formGroup = input.closest(".form-group, .form-group-checkbox");
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
    // Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
  }

  // Handle signup form submission
  async function handleSignup(event) {
    event.preventDefault();
    
    if (!validateSignupForm()) {
        return;
    }

    const submitButton = event.target.querySelector('button[type="submit"]');
    showLoading(submitButton);

    try {
        const formData = {
            fullName: document.getElementById('fullName').value.trim(),
            userName: document.getElementById('userName').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
            phone: document.getElementById('phone').value.trim(),
            role: "true"
        };

        logApiRequest('/register', formData);

        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        logApiResponse(response, data);

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        showSuccess('Registration successful! Please login.');
        window.location.href = '/login.html';
    } catch (error) {
        logApiError(error, 'Signup');
        showError(handleApiError(error));
    } finally {
        hideLoading(submitButton);
    }
  }
});
