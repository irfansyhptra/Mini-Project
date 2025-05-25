document.addEventListener("DOMContentLoaded", function () {
  // Element references
  const elements = {
    form: document.getElementById("signup-form"),
    name: document.getElementById("fullName"),
    username: document.getElementById("userName"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    password: document.getElementById("password"),
    confirmPassword: document.getElementById("confirmPassword"),
    terms: document.getElementById("terms"),
    submitButton: document.getElementById("signup-button"),
    errorContainer: document.getElementById("signup-error"),
    successContainer: document.getElementById("signup-success"),
    loadingSpinner: document.getElementById("signup-loading"),
    buttonText: document.getElementById("signup-button-text"),
    passwordToggles: document.querySelectorAll(".toggle-password")
  };

  // Validation patterns
  const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
    phone: /^[0-9]{10,13}$/
  };

  // Initialize form
  function initializeForm() {
    if (elements.submitButton) {
      elements.submitButton.disabled = true;
    }

    // Add event listeners
    addEventListeners();
  }

  // Add all event listeners
  function addEventListeners() {
    // Terms checkbox listener
    if (elements.terms && elements.submitButton) {
      elements.terms.addEventListener("change", () => {
        elements.submitButton.disabled = !elements.terms.checked;
      });
    }

    // Password toggle listeners
    elements.passwordToggles.forEach(toggle => {
      toggle.addEventListener("click", handlePasswordToggle);
    });

    // Password validation listeners
    if (elements.password) {
      elements.password.addEventListener("input", handlePasswordInput);
    }

    if (elements.confirmPassword) {
      elements.confirmPassword.addEventListener("input", handleConfirmPasswordInput);
    }

    // Form submission
    if (elements.form) {
      elements.form.addEventListener("submit", handleFormSubmit);
    }
  }

  // Password toggle handler
  function handlePasswordToggle() {
    const input = this.previousElementSibling;
    const type = input.getAttribute("type") === "password" ? "text" : "password";
    input.setAttribute("type", type);
    
    const icon = this.querySelector("i");
    if (icon) {
      icon.classList.toggle("fa-eye");
      icon.classList.toggle("fa-eye-slash");
    }
  }

  // Password input handler
  function handlePasswordInput() {
    const value = this.value.trim();
    if (!value) {
      removeError(this);
    } else if (!patterns.password.test(value)) {
      setError(this, "Password minimal 8 karakter dan mengandung huruf & angka");
    } else {
      removeError(this);
    }
    
    // Check confirm password if it has content
    if (elements.confirmPassword.value.trim()) {
      validateConfirmPassword();
    }
  }

  // Confirm password input handler
  function handleConfirmPasswordInput() {
    validateConfirmPassword();
  }

  // Validate confirm password
  function validateConfirmPassword() {
    const value = elements.confirmPassword.value.trim();
    if (!value) {
      removeError(elements.confirmPassword);
    } else if (value !== elements.password.value.trim()) {
      setError(elements.confirmPassword, "Konfirmasi password tidak cocok");
    } else {
      removeError(elements.confirmPassword);
    }
  }

  // Form submission handler
  async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Reset form state
    resetFormState();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      const userData = prepareUserData();
      const response = await sendRegistrationRequest(userData);
      
      if (response.ok) {
        handleSuccessfulRegistration(userData);
      } else {
        handleRegistrationError(await response.json());
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }

  // Reset form state
  function resetFormState() {
    document.querySelectorAll(".error-message").forEach(el => {
      el.textContent = "";
    });
    
    elements.form.querySelectorAll("input, select, textarea").forEach(input => {
      input.classList.remove("border-red-500");
    });
    
    if (elements.errorContainer) elements.errorContainer.classList.add("hidden");
    if (elements.successContainer) elements.successContainer.classList.add("hidden");
  }

  // Validate form
  function validateForm() {
    let isValid = true;

    // Name validation
    if (!elements.name.value.trim()) {
      setError(elements.name, "Nama lengkap tidak boleh kosong");
      isValid = false;
    }

    // Username validation
    if (!elements.username.value.trim()) {
      setError(elements.username, "Username tidak boleh kosong");
      isValid = false;
    }

    // Email validation
    if (!elements.email.value.trim()) {
      setError(elements.email, "Email tidak boleh kosong");
      isValid = false;
    } else if (!patterns.email.test(elements.email.value.trim())) {
      setError(elements.email, "Format email tidak valid");
      isValid = false;
    }

    // Phone validation
    if (!elements.phone.value.trim()) {
      setError(elements.phone, "Nomor telepon tidak boleh kosong");
      isValid = false;
    } else if (!patterns.phone.test(elements.phone.value.trim())) {
      setError(elements.phone, "Nomor telepon tidak valid (10-13 digit)");
      isValid = false;
    }

    // Password validation
    if (!elements.password.value.trim()) {
      setError(elements.password, "Password tidak boleh kosong");
      isValid = false;
    } else if (!patterns.password.test(elements.password.value.trim())) {
      setError(elements.password, "Password minimal 8 karakter dan mengandung huruf & angka");
      isValid = false;
    }

    // Confirm password validation
    if (!elements.confirmPassword.value.trim()) {
      setError(elements.confirmPassword, "Konfirmasi password tidak boleh kosong");
      isValid = false;
    } else if (elements.confirmPassword.value.trim() !== elements.password.value.trim()) {
      setError(elements.confirmPassword, "Konfirmasi password tidak cocok");
      isValid = false;
    }

    // Terms validation
    if (!elements.terms.checked) {
      showError("Anda harus menyetujui syarat & ketentuan");
      isValid = false;
    }

    return isValid;
  }

  // Prepare user data
  function prepareUserData() {
    return {
      fullName: elements.name.value.trim(),
      username: elements.username.value.trim(),
      email: elements.email.value.trim().toLowerCase(),
      password: elements.password.value,
      confirmPassword: elements.confirmPassword.value,
      phoneNumber: elements.phone.value.trim(),
      role: "user"
    };
  }

  // Send registration request
  async function sendRegistrationRequest(userData) {
    try {
      const response = await fetch("https://back-end-eventory.vercel.app/api/Users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      return response;
    } catch (error) {
      console.error("Registration request failed:", error);
      throw error;
    }
  }

  // Handle successful registration
  function handleSuccessfulRegistration(userData) {
    showSuccess("Pendaftaran berhasil! Mengalihkan ke halaman login...");
    elements.form.reset();
    
    // Store success information
    sessionStorage.setItem("registrationSuccess", "true");
    sessionStorage.setItem("registeredEmail", userData.email);
    
    // Redirect to login page
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  }

  // Handle registration error
  function handleRegistrationError(result) {
    if (result.message) {
      if (result.message.toLowerCase().includes("email")) {
        setError(elements.email, "Email sudah terdaftar");
      } else if (result.message.toLowerCase().includes("username")) {
        setError(elements.username, "Username sudah digunakan");
      } else {
        showError(result.message);
      }
    } else {
      showError("Terjadi kesalahan saat pendaftaran");
    }
  }

  // Handle general error
  function handleError(error) {
    console.error("Error during registration:", error);
    showError(error.message || "Terjadi kesalahan pada sistem. Silakan coba lagi nanti.");
  }

  // Set loading state
  function setLoading(isLoading) {
    if (elements.loadingSpinner && elements.buttonText) {
      if (isLoading) {
        elements.loadingSpinner.classList.remove("hidden");
        elements.buttonText.classList.add("hidden");
        elements.submitButton.disabled = true;
      } else {
        elements.loadingSpinner.classList.add("hidden");
        elements.buttonText.classList.remove("hidden");
        elements.submitButton.disabled = !elements.terms.checked;
      }
    }
  }

  // Show error message
  function showError(message) {
    if (elements.errorContainer) {
      elements.errorContainer.textContent = message;
      elements.errorContainer.classList.remove("hidden");
      if (elements.successContainer) elements.successContainer.classList.add("hidden");
      elements.errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // Show success message
  function showSuccess(message) {
    if (elements.successContainer) {
      elements.successContainer.textContent = message;
      elements.successContainer.classList.remove("hidden");
      if (elements.errorContainer) elements.errorContainer.classList.add("hidden");
      elements.successContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // Set error for input
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

  // Remove error from input
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

  // Initialize the form
  initializeForm();
});