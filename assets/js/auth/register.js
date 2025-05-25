document.addEventListener("DOMContentLoaded", function () {
  // Element references
  const signupForm = document.getElementById("signup-form");
  const nameInput = document.getElementById("signup-name");
  const nikInput = document.getElementById("signup-nik");
  const emailInput = document.getElementById("signup-email");
  const phoneInput = document.getElementById("signup-phone");
  const addressInput = document.getElementById("signup-address");
  const kecamatanInput = document.getElementById("signup-kecamatan");
  const kelurahanInput = document.getElementById("signup-kelurahan");
  const passwordInput = document.getElementById("signup-password");
  const confirmPasswordInput = document.getElementById("signup-confirm-password");
  const agreeTermsCheckbox = document.getElementById("agree-terms");
  const submitButton = document.getElementById("signup-button");
  const errorContainer = document.getElementById("signup-error");
  const successContainer = document.getElementById("signup-success");
  const loadingSpinner = document.getElementById("signup-loading");
  const buttonText = document.getElementById("signup-button-text");
  const passwordToggles = document.querySelectorAll(".toggle-password");

  // Set button disabled secara default
  submitButton.disabled = true;

  // Enable/disable button based on agreement checkbox
  agreeTermsCheckbox.addEventListener("change", () => {
    submitButton.disabled = !agreeTermsCheckbox.checked;
  });

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

  // NIK input validation (numbers only and limit to 16 digits)
  if (nikInput) {
    nikInput.addEventListener("input", function() {
      this.value = this.value.replace(/[^0-9]/g, "");
      if (this.value.length > 16) {
        this.value = this.value.slice(0, 16);
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
    });
  }

  // Validasi Realtime Password
  passwordInput.addEventListener("input", function () {
    if (this.value.trim() === "") {
      removeError(this);
    } else if (!validatePassword(this.value.trim())) {
      setError(
        this,
        "Password minimal 8 karakter dan mengandung huruf & angka"
      );
    } else {
      removeError(this);
    }
    
    // Check confirm password if it has content
    if (confirmPasswordInput.value.trim() !== "") {
      if (confirmPasswordInput.value.trim() !== this.value.trim()) {
        setError(confirmPasswordInput, "Konfirmasi password tidak cocok");
      } else {
        removeError(confirmPasswordInput);
      }
    }
  });

  confirmPasswordInput.addEventListener("input", function () {
    if (this.value.trim() === "") {
      removeError(this);
    } else if (this.value.trim() !== passwordInput.value.trim()) {
      setError(this, "Konfirmasi password tidak cocok");
    } else {
      removeError(this);
    }
  });

  // Validation functions
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePassword(password) {
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
  }

  function validateNIK(nik) {
    return /^\d{16}$/.test(nik);
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
      signupForm.querySelectorAll("input, select, textarea").forEach(input => {
        input.classList.remove("border-red-500");
      });
      
      if (errorContainer) errorContainer.classList.add("hidden");
      if (successContainer) successContainer.classList.add("hidden");
      
      // Validasi form
      let isValid = true;
      
      // Nama validation
      if (!nameInput.value.trim()) {
        setError(nameInput, "Nama lengkap tidak boleh kosong");
        isValid = false;
      }

      // NIK validation
      if (!nikInput.value.trim()) {
        setError(nikInput, "NIK tidak boleh kosong");
        isValid = false;
      } else if (!validateNIK(nikInput.value.trim())) {
        setError(nikInput, "NIK harus 16 digit angka");
        isValid = false;
      }
      
      // Email validation
      if (!emailInput.value.trim()) {
        setError(emailInput, "Email tidak boleh kosong");
        isValid = false;
      } else if (!validateEmail(emailInput.value.trim())) {
        setError(emailInput, "Format email tidak valid");
        isValid = false;
      }
      
      // Password validation
      if (!passwordInput.value.trim()) {
        setError(passwordInput, "Password tidak boleh kosong");
        isValid = false;
      } else if (!validatePassword(passwordInput.value.trim())) {
        setError(passwordInput, "Password minimal 8 karakter dan mengandung huruf & angka");
        isValid = false;
      }
      
      // Confirm password validation
      if (!confirmPasswordInput.value.trim()) {
        setError(confirmPasswordInput, "Konfirmasi password tidak boleh kosong");
        isValid = false;
      } else if (confirmPasswordInput.value.trim() !== passwordInput.value.trim()) {
        setError(confirmPasswordInput, "Konfirmasi password tidak cocok");
        isValid = false;
      }

      // Phone validation
      if (!phoneInput.value.trim()) {
        setError(phoneInput, "Nomor telepon tidak boleh kosong");
        isValid = false;
      } else if (!validatePhone(phoneInput.value.trim())) {
        setError(phoneInput, "Nomor telepon tidak valid (10-13 digit)");
        isValid = false;
      }

      // Address validation
      if (!addressInput.value.trim()) {
        setError(addressInput, "Alamat tidak boleh kosong");
        isValid = false;
      }

      // Kecamatan validation
      if (!kecamatanInput.value) {
        setError(kecamatanInput, "Kecamatan harus dipilih");
        isValid = false;
      }

      // Kelurahan validation
      if (!kelurahanInput.value.trim()) {
        setError(kelurahanInput, "Kelurahan/Desa tidak boleh kosong");
        isValid = false;
      }
      
      // Agreement validation
      if (!agreeTermsCheckbox.checked) {
        showError("Anda harus menyetujui syarat & ketentuan");
        isValid = false;
      }
      
      if (!isValid) {
        return;
      }
      
      try {
        // Set loading state
        setLoading(true);
        
        // Prepare data for API
        const userData = {
          fullName: nameInput.value.trim(),
          email: emailInput.value.trim().toLowerCase(),
          password: passwordInput.value,
          confirmPassword: confirmPasswordInput.value,
          nomorInduk: nikInput.value.trim(),
          callNumber: phoneInput.value.trim(),
          address: addressInput.value.trim(),
          kecamatan: kecamatanInput.value,
          kelurahan: kelurahanInput.value.trim(),
          role: false  // Boolean for user role (assuming false = regular user)
        };

        console.log('Sending data:', userData);
        
        // Send registration request
        // Modified to fix the CORS issue - removed 'credentials: "include"'
        const response = await fetch(
          "https://backend-silapor.vercel.app/auth/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify(userData)
            // Removed credentials: "include" which caused the CORS error
          }
        );
        
        // Get response data
        const result = await response.json();
        console.log('Response:', result);
        
        // Handle response
        if (response.ok) {
          showSuccess("Pendaftaran berhasil! Mengalihkan ke halaman login...");
          
          // Reset form
          signupForm.reset();
          
          // Store success information in sessionStorage to show on login page
          sessionStorage.setItem("registrationSuccess", "true");
          sessionStorage.setItem("registeredEmail", userData.email);
          
          // Redirect to login page after a short delay
          setTimeout(() => {
            window.location.href = "login.html";
          }, 1500);
        } else {
          // Check for specific error messages from server
          if (result.message && result.message.toLowerCase().includes("email")) {
            setError(emailInput, result.message || "Email sudah terdaftar");
          } else if (result.message && result.message.toLowerCase().includes("nik")) {
            setError(nikInput, result.message || "NIK sudah terdaftar");
          } else {
            throw new Error(result.message || "Terjadi kesalahan saat pendaftaran");
          }
        }
      } catch (error) {
        console.error("Error during registration:", error);
        showError(error.message || "Terjadi kesalahan pada sistem. Silakan coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    });
  }
});