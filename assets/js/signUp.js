document.addEventListener("DOMContentLoaded", function () {
  const signupForm = document.getElementById("signup-form");
  const fullNameInput = document.getElementById("fullName");
  const usernameInput = document.getElementById("userName");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const termsCheckbox = document.getElementById("terms");
  const passwordToggles = document.querySelectorAll(".toggle-password");

  if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();

      let isValid = true;

      // Bersihkan pesan error
      document.querySelectorAll(".error-message").forEach((el) => {
        el.textContent = "";
        el.style.display = "none";
      });

      // Validasi Nama
      if (!fullNameInput.value.trim()) {
        setError(fullNameInput, "Nama lengkap tidak boleh kosong");
        isValid = false;
      }

      // Validasi Username
      if (!usernameInput.value.trim()) {
        setError(usernameInput, "Username tidak boleh kosong");
        isValid = false;
      }

      // Validasi Email
      if (!emailInput.value.trim()) {
        setError(emailInput, "Email tidak boleh kosong");
        isValid = false;
      } else if (!validateEmail(emailInput.value.trim())) {
        setError(emailInput, "Format email tidak valid");
        isValid = false;
      }

      // Validasi Nomor Telepon
      if (!phoneInput.value.trim()) {
        setError(phoneInput, "Nomor telepon tidak boleh kosong");
        isValid = false;
      } else if (!validatePhone(phoneInput.value.trim())) {
        setError(phoneInput, "Format nomor telepon tidak valid");
        isValid = false;
      }

      // Validasi Password
      if (!passwordInput.value.trim()) {
        setError(passwordInput, "Password tidak boleh kosong");
        isValid = false;
      } else if (!validatePassword(passwordInput.value.trim())) {
        setError(
          passwordInput,
          "Password minimal 8 karakter dan mengandung huruf & angka"
        );
        isValid = false;
      }

      // Validasi Konfirmasi Password
      if (!confirmPasswordInput.value.trim()) {
        setError(
          confirmPasswordInput,
          "Konfirmasi password tidak boleh kosong"
        );
        isValid = false;
      } else if (
        confirmPasswordInput.value.trim() !== passwordInput.value.trim()
      ) {
        setError(confirmPasswordInput, "Konfirmasi password tidak cocok");
        isValid = false;
      }

      // Validasi Persetujuan Syarat
      if (!termsCheckbox.checked) {
        setError(termsCheckbox, "Harus menyetujui syarat & ketentuan");
        isValid = false;
      }

      if (isValid) {
        alert("Pendaftaran berhasil!");
        window.location.href = "login.html";
      }
    });
  }

  // Toggle Password
  passwordToggles.forEach((toggle) => {
    toggle.addEventListener("click", function () {
      const input = this.previousElementSibling;
      const type =
        input.getAttribute("type") === "password" ? "text" : "password";
      input.setAttribute("type", type);
      this.classList.toggle("visible");
    });
  });

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

  function validatePhone(phone) {
    return /^[0-9]{10,13}$/.test(phone);
  }
});
