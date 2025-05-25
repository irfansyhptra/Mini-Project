document.addEventListener("DOMContentLoaded", function () {
  const signupForm = document.getElementById("signup-form");
  const nameInput = document.getElementById("fullName");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const agreeTermsCheckbox = document.getElementById("terms");
  const passwordToggles = document.querySelectorAll(".toggle-password");

  // Helper function to display an error message for a given input field
  function setError(inputElement, message) {
    if (!inputElement) return;

    const formGroup = inputElement.closest(".form-group");
    if (!formGroup) return;

    // Remove existing error message first to avoid duplicates if called multiple times
    removeError(inputElement);

    let errorElement = formGroup.querySelector(".error-message");
    if (!errorElement) {
      errorElement = document.createElement("div");
      errorElement.className = "error-message";
      // Insert after the input or its wrapper if it's a checkbox/radio
      if (inputElement.type === "checkbox" || inputElement.type === "radio") {
        // Try to append to parent of input if it's more logical for layout
        (inputElement.parentElement || formGroup).appendChild(errorElement);
      } else {
        formGroup.appendChild(errorElement);
      }
    }

    errorElement.textContent = message;
    errorElement.style.color = "white"; // Consider moving to CSS
    errorElement.style.fontSize = "12px"; // Consider moving to CSS
    errorElement.style.marginTop = "8px"; // Consider moving to CSS
    errorElement.style.display = "block";
    // Optional: Add a class to the input for styling (e.g., red border)
    // inputElement.classList.add('input-error');
  }

  // Helper function to remove an error message for a given input field
  function removeError(inputElement) {
    if (!inputElement) return;

    const formGroup = inputElement.closest(".form-group");
    if (!formGroup) return;

    const errorElement = formGroup.querySelector(".error-message");
    if (errorElement) {
      errorElement.textContent = "";
      errorElement.style.display = "none";
    }
    // Optional: Remove error class from input
    // inputElement.classList.remove('input-error');
  }

  // Email validation function
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
  }

  // Password validation function (minimal 8 chars, letter and number)
  function validatePassword(password) {
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
  }

  // Function to validate a single field and update its error status
  function validateField(inputElement, validationFn, errorMessage, emptyMessage) {
    removeError(inputElement); // Clear previous error first
    if (!inputElement) return true; // Should not happen if IDs are correct

    const value = inputElement.value.trim();
    if (emptyMessage && !value) {
      setError(inputElement, emptyMessage);
      return false;
    }
    if (validationFn && value && !validationFn(value)) {
      setError(inputElement, errorMessage);
      return false;
    }
    return true;
  }


  if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();
      let isFormValid = true;

      // Validate Full Name
      if (!validateField(nameInput, null, "", "Nama lengkap tidak boleh kosong")) {
        isFormValid = false;
      }

      // Validate Email
      if (!emailInput || !emailInput.value.trim()) {
        setError(emailInput, "Email tidak boleh kosong");
        isFormValid = false;
      } else if (!validateEmail(emailInput.value.trim())) {
        setError(emailInput, "Format email tidak valid");
        isFormValid = false;
      } else {
        removeError(emailInput);
      }

      // Validate Password
      if (!passwordInput || !passwordInput.value.trim()) {
        setError(passwordInput, "Password tidak boleh kosong");
        isFormValid = false;
      } else if (!validatePassword(passwordInput.value.trim())) {
        setError(
          passwordInput,
          "Password minimal 8 karakter dan mengandung huruf & angka"
        );
        isFormValid = false;
      } else {
        removeError(passwordInput);
      }

      // Validate Confirm Password
      if (!confirmPasswordInput || !confirmPasswordInput.value.trim()) {
        setError(
          confirmPasswordInput,
          "Konfirmasi password tidak boleh kosong"
        );
        isFormValid = false;
      } else if (
        passwordInput && // ensure passwordInput exists
        confirmPasswordInput.value.trim() !== passwordInput.value.trim()
      ) {
        setError(confirmPasswordInput, "Konfirmasi password tidak cocok");
        isFormValid = false;
      } else {
        removeError(confirmPasswordInput);
      }

      // Validate Terms Checkbox
      removeError(agreeTermsCheckbox); // Clear previous error
      if (agreeTermsCheckbox && !agreeTermsCheckbox.checked) {
        setError(agreeTermsCheckbox, "Harus menyetujui syarat & ketentuan");
        isFormValid = false;
      }

      if (isFormValid) {
        // IMPORTANT: alert() is not recommended for user feedback in modern web apps.
        // Use a more integrated UI element (e.g., a modal or a message bar).
        // For now, logging to console and redirecting as per original logic.
        console.log("Pendaftaran berhasil! Data:", {
            fullName: nameInput ? nameInput.value : '',
            email: emailInput ? emailInput.value : '',
            // Jangan log password di production
        });
        // Simulate successful submission then redirect
        // Replace this with your actual backend submission (e.g., using fetch API)
        // For example:
        // submitDataToServer({
        //   fullName: nameInput.value,
        //   email: emailInput.value,
        //   password: passwordInput.value
        // }).then(() => {
        //   window.location.href = "login.html";
        // }).catch(error => {
        //   setError(signupForm, "Pendaftaran gagal: " + error.message); // Display error near form
        // });

        // As per original logic, redirecting.
        // In a real app, you'd submit to backend first.
        window.location.href = "login.html";
      }
    });
  }

  // Toggle Password Visibility
  passwordToggles.forEach((toggle) => {
    toggle.addEventListener("click", function () {
      // Assumes the input is the direct previous sibling.
      // For more robustness, consider using data-attributes to link toggle to input.
      const input = this.previousElementSibling;
      if (input && (input.tagName === 'INPUT')) {
        const type = input.getAttribute("type") === "password" ? "text" : "password";
        input.setAttribute("type", type);
        this.classList.toggle("visible"); // Toggles an icon or text like "Show/Hide"
      }
    });
  });

  // Real-time validation for Password
  if (passwordInput) {
    passwordInput.addEventListener("input", function () {
      const value = this.value.trim();
      removeError(passwordInput); // Clear previous error

      if (value && !validatePassword(value)) {
        setError(
          this,
          "Password minimal 8 karakter dan mengandung huruf & angka"
        );
      }
      // Also re-validate confirm password if it has a value
      if (confirmPasswordInput && confirmPasswordInput.value.trim()) {
        removeError(confirmPasswordInput);
        if (confirmPasswordInput.value.trim() !== value) {
          setError(confirmPasswordInput, "Konfirmasi password tidak cocok");
        }
      }
    });
  }

  // Real-time validation for Confirm Password
  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener("input", function () {
      const value = this.value.trim();
      removeError(confirmPasswordInput); // Clear previous error

      if (value && passwordInput && value !== passwordInput.value.trim()) {
        setError(this, "Konfirmasi password tidak cocok");
      }
    });
  }

  // Real-time validation for Email (optional, but good UX)
  if (emailInput) {
    emailInput.addEventListener('input', function() {
        const value = this.value.trim();
        removeError(emailInput); // Clear previous error
        if (value && !validateEmail(value)) {
            setError(this, "Format email tidak valid");
        }
    });
  }

  // Real-time validation for Name (optional, just checks if empty after typing then clearing)
  if (nameInput) {
    nameInput.addEventListener('input', function() {
        const value = this.value.trim();
        removeError(nameInput); // Clear previous error
        if (!value) { // Only show error if user types then clears it, not on initial empty
            // setError(this, "Nama lengkap tidak boleh kosong"); // Or simply clear, let submit handle empty
        }
    });
  }

});
