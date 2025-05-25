document.addEventListener("DOMContentLoaded", function () {
  const signupForm = document.getElementById("signup-form");
  const nameInput = document.getElementById("fullName");
  const userName = document.getElementById("userName");
  const emailInput = document.getElementById("email");
  const phone = document.getElementById("phone");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const agreeTermsCheckbox = document.getElementById("terms");
  const passwordToggles = document.querySelectorAll(".toggle-password");

  console.log("Form elements initialized:", {
    form: signupForm ? "Found" : "Not found",
    nameInput: nameInput ? "Found" : "Not found",
    userName: userName ? "Found" : "Not found",
    emailInput: emailInput ? "Found" : "Not found",
    phone: phone ? "Found" : "Not found",
    passwordInput: passwordInput ? "Found" : "Not found",
    confirmPasswordInput: confirmPasswordInput ? "Found" : "Not found",
    agreeTermsCheckbox: agreeTermsCheckbox ? "Found" : "Not found"
  });

  if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();

      let isValid = true;
      console.log("Form submission started");
      
      // Object untuk menyimpan status validasi
      const validationStatus = {
        fullName: { isValid: true, value: nameInput.value.trim(), error: null },
        username: { isValid: true, value: userName.value.trim(), error: null },
        email: { isValid: true, value: emailInput.value.trim(), error: null },
        phone: { isValid: true, value: phone.value.trim(), error: null },
        password: { isValid: true, value: "********", error: null },
        confirmPassword: { isValid: true, value: "********", error: null },
        terms: { isValid: true, value: agreeTermsCheckbox.checked, error: null }
      };

      // Bersihkan pesan error
      document.querySelectorAll(".error-message").forEach((el) => {
        el.textContent = "";
        el.style.display = "none";
      });

      // Validasi Nama
      if (!nameInput.value.trim()) {
        console.log("Validation failed: Nama kosong");
        setError(nameInput, "Nama lengkap tidak boleh kosong");
        isValid = false;
        validationStatus.fullName.isValid = false;
        validationStatus.fullName.error = "Nama lengkap tidak boleh kosong";
      }

      // Validasi Username
      if (!userName.value.trim()) {
        console.log("Validation failed: Username kosong");
        setError(userName, "Username tidak boleh kosong");
        isValid = false;
        validationStatus.username.isValid = false;
        validationStatus.username.error = "Username tidak boleh kosong";
      } else if (userName.value.trim().length < 3) {
        console.log("Validation failed: Username terlalu pendek");
        setError(userName, "Username minimal 3 karakter");
        isValid = false;
        validationStatus.username.isValid = false;
        validationStatus.username.error = "Username minimal 3 karakter";
      } else if (!/^[a-zA-Z0-9_]+$/.test(userName.value.trim())) {
        console.log("Validation failed: Username mengandung karakter tidak valid");
        setError(userName, "Username hanya boleh mengandung huruf, angka, dan underscore");
        isValid = false;
        validationStatus.username.isValid = false;
        validationStatus.username.error = "Username hanya boleh mengandung huruf, angka, dan underscore";
      }

      // Validasi Email
      if (!emailInput.value.trim()) {
        console.log("Validation failed: Email kosong");
        setError(emailInput, "Email tidak boleh kosong");
        isValid = false;
        validationStatus.email.isValid = false;
        validationStatus.email.error = "Email tidak boleh kosong";
      } else if (!validateEmail(emailInput.value.trim())) {
        console.log("Validation failed: Format email tidak valid");
        setError(emailInput, "Format email tidak valid");
        isValid = false;
        validationStatus.email.isValid = false;
        validationStatus.email.error = "Format email tidak valid";
      }

      // Validasi Nomor Telepon
      if (!phone.value.trim()) {
        console.log("Validation failed: Nomor telepon kosong");
        setError(phone, "Nomor telepon tidak boleh kosong");
        isValid = false;
        validationStatus.phone.isValid = false;
        validationStatus.phone.error = "Nomor telepon tidak boleh kosong";
      } else if (!validatePhone(phone.value.trim())) {
        console.log("Validation failed: Format nomor telepon tidak valid");
        setError(phone, "Format nomor telepon tidak valid (10-13 digit)");
        isValid = false;
        validationStatus.phone.isValid = false;
        validationStatus.phone.error = "Format nomor telepon tidak valid (10-13 digit)";
      }

      // Validasi Password
      if (!passwordInput.value.trim()) {
        console.log("Validation failed: Password kosong");
        setError(passwordInput, "Password tidak boleh kosong");
        isValid = false;
        validationStatus.password.isValid = false;
        validationStatus.password.error = "Password tidak boleh kosong";
      } else if (!validatePassword(passwordInput.value.trim())) {
        console.log("Validation failed: Format password tidak valid");
        setError(
          passwordInput,
          "Password minimal 8 karakter dan mengandung huruf & angka"
        );
        isValid = false;
        validationStatus.password.isValid = false;
        validationStatus.password.error = "Password minimal 8 karakter dan mengandung huruf & angka";
      }

      // Validasi Konfirmasi Password
      if (!confirmPasswordInput.value.trim()) {
        console.log("Validation failed: Konfirmasi password kosong");
        setError(
          confirmPasswordInput,
          "Konfirmasi password tidak boleh kosong"
        );
        isValid = false;
        validationStatus.confirmPassword.isValid = false;
        validationStatus.confirmPassword.error = "Konfirmasi password tidak boleh kosong";
      } else if (
        confirmPasswordInput.value.trim() !== passwordInput.value.trim()
      ) {
        console.log("Validation failed: Password tidak cocok");
        setError(confirmPasswordInput, "Konfirmasi password tidak cocok");
        isValid = false;
        validationStatus.confirmPassword.isValid = false;
        validationStatus.confirmPassword.error = "Konfirmasi password tidak cocok";
      }

      // Validasi Persetujuan Syarat
      if (!agreeTermsCheckbox.checked) {
        console.log("Validation failed: Syarat dan ketentuan belum disetujui");
        setError(agreeTermsCheckbox, "Harus menyetujui syarat & ketentuan");
        isValid = false;
        validationStatus.terms.isValid = false;
        validationStatus.terms.error = "Harus menyetujui syarat & ketentuan";
      }

      if (isValid) {
        const formData = {
          fullName: nameInput.value.trim(),
          username: userName.value.trim(),
          email: emailInput.value.trim(),
          phoneNumber: phone.value.trim(),
          password: passwordInput.value,
          confirmPassword: confirmPasswordInput.value,
          role: true
        };

        console.log("Form validation successful");
        console.log("Data yang akan dikirim:", {
          ...formData,
          password: "********", // Menyembunyikan password di console
          confirmPassword: "********"
        });

        // Kirim data ke server
        fetch("https://back-end-eventory.vercel.app/api/Users/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(formData)
        })
        .then(response => {
          console.log("Response status:", response.status);
          return response.json();
        })
        .then(data => {
          console.log("Response data:", data);
          if (data.success) {
            alert("Pendaftaran berhasil!");
            window.location.href = "login.html";
          } else {
            throw new Error(data.message || "Pendaftaran gagal");
          }
        })
        .catch(error => {
          console.error("Error during registration:", error);
          alert("Terjadi kesalahan saat pendaftaran: " + error.message);
        });
      } else {
        console.log("Form validation failed");
        console.log("Detail validasi yang gagal:", validationStatus);
        
        // Menampilkan field yang gagal validasi
        const failedFields = Object.entries(validationStatus)
          .filter(([_, status]) => !status.isValid)
          .map(([field, status]) => ({
            field,
            value: status.value,
            error: status.error
          }));
        
        console.log("Field yang gagal validasi:", failedFields);
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
      console.log("Password visibility toggled");
    });
  });

  // Validasi Realtime Username
  userName.addEventListener("input", function() {
    console.log("Username input changed:", this.value);
    if (this.value.trim() === "") {
      removeError(this);
    } else if (this.value.trim().length < 3) {
      setError(this, "Username minimal 3 karakter");
    } else if (!/^[a-zA-Z0-9_]+$/.test(this.value.trim())) {
      setError(this, "Username hanya boleh mengandung huruf, angka, dan underscore");
    } else {
      removeError(this);
    }
  });

  // Validasi Realtime Nomor Telepon
  phone.addEventListener("input", function() {
    const oldValue = this.value;
    this.value = this.value.replace(/[^0-9]/g, "");
    if (oldValue !== this.value) {
      console.log("Phone number filtered:", this.value);
    }
    
    if (this.value.trim() === "") {
      removeError(this);
    } else if (!validatePhone(this.value.trim())) {
      setError(this, "Format nomor telepon tidak valid (10-13 digit)");
    } else {
      removeError(this);
    }
  });

  // Validasi Realtime Password
  passwordInput.addEventListener("input", function () {
    console.log("Password input changed");
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
    console.log("Confirm password input changed");
    if (this.value.trim() === "") {
      removeError(this);
    } else if (this.value.trim() !== passwordInput.value.trim()) {
      setError(this, "Konfirmasi password tidak cocok");
    } else {
      removeError(this);
    }
  });

  function setError(input, message) {
    console.log("Setting error:", message);
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
