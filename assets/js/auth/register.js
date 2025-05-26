document.addEventListener("DOMContentLoaded", function () {
  const signupForm = document.getElementById("signup-form");
  const nameInput = document.getElementById("fullName");
  const userNameInput = document.getElementById("userName");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const agreeTermsCheckbox = document.getElementById("terms");
  const submitButton = document.getElementById("submit-button");
  const passwordToggles = document.querySelectorAll(".toggle-password");

  // Set button disabled secara default
  if (submitButton) {
    submitButton.disabled = true;
  }

  // Enable/disable button based on agreement checkbox
  if (agreeTermsCheckbox) {
    agreeTermsCheckbox.addEventListener("change", () => {
      if (submitButton) {
        submitButton.disabled = !agreeTermsCheckbox.checked;
      }
    });
  }

  // Toggle password visibility
  passwordToggles.forEach((toggle) => {
    toggle.addEventListener("click", function () {
      const input = this.previousElementSibling;
      const type = input.getAttribute("type") === "password" ? "text" : "password";
      input.setAttribute("type", type);
      
      // Toggle icon
      const icon = this.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-eye");
        icon.classList.toggle("fa-eye-slash");
      }
    });
  });

  // Real-time input validations
  if (nameInput) {
    nameInput.addEventListener("input", function() {
      if (this.value.trim() === "") {
        setError(this, "Nama lengkap tidak boleh kosong");
      } else if (this.value.trim().length < 3) {
        setError(this, "Nama lengkap minimal 3 karakter");
      } else {
        removeError(this);
      }
    });
  }

  if (userNameInput) {
    userNameInput.addEventListener("input", function() {
      if (this.value.trim() === "") {
        setError(this, "Username tidak boleh kosong");
      } else if (this.value.trim().length < 4) {
        setError(this, "Username minimal 4 karakter");
      } else if (!/^[a-zA-Z0-9_]+$/.test(this.value.trim())) {
        setError(this, "Username hanya boleh mengandung huruf, angka, dan underscore");
      } else {
        removeError(this);
      }
    });
  }

  if (emailInput) {
    emailInput.addEventListener("input", function() {
      if (this.value.trim() === "") {
        setError(this, "Email tidak boleh kosong");
      } else if (!validateEmail(this.value.trim())) {
        setError(this, "Format email tidak valid");
      } else {
        removeError(this);
      }
    });
  }

  // Phone number input validation (numbers only)
  if (phoneInput) {
    phoneInput.addEventListener("input", function() {
      this.value = this.value.replace(/[^0-9]/g, "");
      // Limit to 13 digits
      if (this.value.length > 13) {
        this.value = this.value.slice(0, 13);
      }
      
      if (this.value.trim() === "") {
        setError(this, "Nomor telepon tidak boleh kosong");
      } else if (!validatePhone(this.value.trim())) {
        setError(this, "Format nomor telepon tidak valid (10-13 digit)");
      } else {
        removeError(this);
      }
    });
  }

  // Password validation
  if (passwordInput) {
    passwordInput.addEventListener("input", function() {
      if (this.value.trim() === "") {
        setError(this, "Password tidak boleh kosong");
      } else if (!validatePassword(this.value.trim())) {
        setError(this, "Password minimal 8 karakter dan mengandung huruf & angka");
      } else {
        removeError(this);
      }
      
      // Check confirm password if it has content
      if (confirmPasswordInput && confirmPasswordInput.value.trim() !== "") {
        if (confirmPasswordInput.value.trim() !== this.value.trim()) {
          setError(confirmPasswordInput, "Konfirmasi password tidak cocok");
        } else {
          removeError(confirmPasswordInput);
        }
      }
    });
  }

  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener("input", function() {
      if (this.value.trim() === "") {
        setError(this, "Konfirmasi password tidak boleh kosong");
      } else if (this.value.trim() !== passwordInput.value.trim()) {
        setError(this, "Konfirmasi password tidak cocok");
      } else {
        removeError(this);
      }
    });
  }

  // Validation functions
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePassword(password) {
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
  }

  function validatePhone(phone) {
    return /^[0-9]{10,13}$/.test(phone);
  }

  function setError(input, message) {
    if (!input) return;
    
    const formGroup = input.closest(".form-group") || input.parentElement;
    if (!formGroup) return;

    let error = formGroup.querySelector(".error-message");
    if (!error) {
      error = document.createElement("div");
      error.className = "error-message text-red-500 text-sm mt-1";
      formGroup.appendChild(error);
    }

    error.textContent = message;
    input.classList.add("border-red-500");
  }

  function removeError(input) {
    if (!input) return;
    
    const formGroup = input.closest(".form-group") || input.parentElement;
    if (!formGroup) return;

    const error = formGroup.querySelector(".error-message");
    if (error) {
      error.textContent = "";
    }
    input.classList.remove("border-red-500");
  }

  function showError(message) {
    if (errorContainer) {
      errorContainer.textContent = message;
      errorContainer.classList.remove("hidden");
      if (successContainer) successContainer.classList.add("hidden");
      
      // Scroll to error container
      errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function showSuccess(message) {
    if (successContainer) {
      successContainer.textContent = message;
      successContainer.classList.remove("hidden");
      if (errorContainer) errorContainer.classList.add("hidden");
      
      // Scroll to success container
      successContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function setLoading(isLoading) {
    if (loadingSpinner && buttonText) {
      if (isLoading) {
        loadingSpinner.classList.remove("hidden");
        buttonText.classList.add("hidden");
        submitButton.disabled = true;
      } else {
        loadingSpinner.classList.add("hidden");
        buttonText.classList.remove("hidden");
        submitButton.disabled = !agreeTermsCheckbox.checked;
      }
    }
  }

  // Form submission
  if (signupForm) {
    signupForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      
      // Reset error messages
      document.querySelectorAll(".error-message").forEach((el) => {
        el.textContent = "";
      });
      
      // Reset input border colors
      signupForm.querySelectorAll("input").forEach(input => {
        input.classList.remove("border-red-500");
      });
      
      if (errorContainer) errorContainer.classList.add("hidden");
      if (successContainer) successContainer.classList.add("hidden");
      
      // Validasi form
      let isValid = true;
      
      // Nama validation
      if (!nameInput || !nameInput.value.trim()) {
        setError(nameInput, "Nama lengkap tidak boleh kosong");
        isValid = false;
      } else if (nameInput.value.trim().length < 3) {
        setError(nameInput, "Nama lengkap minimal 3 karakter");
        isValid = false;
      }

      // Username validation
      if (!userNameInput || !userNameInput.value.trim()) {
        setError(userNameInput, "Username tidak boleh kosong");
        isValid = false;
      } else if (userNameInput.value.trim().length < 4) {
        setError(userNameInput, "Username minimal 4 karakter");
        isValid = false;
      } else if (!/^[a-zA-Z0-9_]+$/.test(userNameInput.value.trim())) {
        setError(userNameInput, "Username hanya boleh mengandung huruf, angka, dan underscore");
        isValid = false;
      }
      
      // Email validation
      if (!emailInput || !emailInput.value.trim()) {
        setError(emailInput, "Email tidak boleh kosong");
        isValid = false;
      } else if (!validateEmail(emailInput.value.trim())) {
        setError(emailInput, "Format email tidak valid");
        isValid = false;
      }
      
      // Password validation
      if (!passwordInput || !passwordInput.value.trim()) {
        setError(passwordInput, "Password tidak boleh kosong");
        isValid = false;
      } else if (!validatePassword(passwordInput.value.trim())) {
        setError(passwordInput, "Password minimal 8 karakter dan mengandung huruf & angka");
        isValid = false;
      }
      
      // Confirm password validation
      if (!confirmPasswordInput || !confirmPasswordInput.value.trim()) {
        setError(confirmPasswordInput, "Konfirmasi password tidak boleh kosong");
        isValid = false;
      } else if (confirmPasswordInput.value.trim() !== passwordInput.value.trim()) {
        setError(confirmPasswordInput, "Konfirmasi password tidak cocok");
        isValid = false;
      }

      // Phone validation
      if (!phoneInput || !phoneInput.value.trim()) {
        setError(phoneInput, "Nomor telepon tidak boleh kosong");
        isValid = false;
      } else if (!validatePhone(phoneInput.value.trim())) {
        setError(phoneInput, "Format nomor telepon tidak valid (10-13 digit)");
        isValid = false;
      }

      // Agreement validation
      if (!agreeTermsCheckbox || !agreeTermsCheckbox.checked) {
        setError(agreeTermsCheckbox, "Harus menyetujui syarat & ketentuan");
        isValid = false;
      }
      
      if (isValid) {
        // Disable submit button
        if (submitButton) {
          submitButton.disabled = true;
        }

        // Show loading state
        const buttonText = submitButton.querySelector(".button-text");
        const loadingSpinner = submitButton.querySelector(".loading-spinner");
        if (buttonText) buttonText.classList.add("hidden");
        if (loadingSpinner) loadingSpinner.classList.remove("hidden");

        try {
          // Prepare data for API
          const userData = {
            fullName: nameInput.value.trim(),
            userName: userNameInput.value.trim(),
            email: emailInput.value.trim().toLowerCase(),
            password: passwordInput.value,
            confirmPassword: confirmPasswordInput.value,
            phone: phoneInput.value.trim(),
            role: "true"  // Set default role as true
          };

          console.log('Sending data:', userData);
          
          // Send registration request
          const response = await fetch(
            "https://back-end-eventory.vercel.app/auth/register",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
              },
              body: JSON.stringify(userData)
            }
          );
          
          // Get response data
          const result = await response.json();
          console.log('Response:', result);
          
          // Handle response
          if (response.ok) {
            alert("Pendaftaran berhasil!");
            window.location.href = "login.html";
          } else {
            // Check for specific error messages from server
            if (result.message && result.message.toLowerCase().includes("email")) {
              setError(emailInput, result.message || "Email sudah terdaftar");
            } else if (result.message && result.message.toLowerCase().includes("username")) {
              setError(userNameInput, result.message || "Username sudah terdaftar");
            } else {
              throw new Error(result.message || "Terjadi kesalahan saat pendaftaran");
            }
          }
        } catch (error) {
          console.error("Error during registration:", error);
          alert(error.message || "Terjadi kesalahan pada sistem. Silakan coba lagi nanti.");
        } finally {
          // Reset loading state
          if (buttonText) buttonText.classList.remove("hidden");
          if (loadingSpinner) loadingSpinner.classList.add("hidden");
          if (submitButton) submitButton.disabled = false;
        }
      }
    });
  }
});