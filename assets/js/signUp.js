document.addEventListener("DOMContentLoaded", function () {
  // --- Element References ---
  const signupForm = document.getElementById("signup-form");
  const nameInput = document.getElementById("fullName");
  const userNameInput = document.getElementById("userName"); // Input baru
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone"); // Input baru
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const agreeTermsCheckbox = document.getElementById("terms");
  const passwordToggles = document.querySelectorAll(".toggle-password");

  // Elemen untuk feedback dan state tombol
  const submitButton = document.getElementById("signup-button"); // Asumsi ID tombol submit
  const buttonText = document.getElementById("signup-button-text"); // Teks pada tombol
  const loadingSpinner = document.getElementById("signup-loading"); // Indikator loading
  const formMessageArea = document.getElementById("form-message-area"); // Area pesan umum form

  // --- Helper Functions for Error/Success Display ---

  function setError(inputElement, message) {
    if (!inputElement) return;
    const formGroup = inputElement.closest(".form-group") || inputElement.parentElement; // Menangani checkbox juga
    if (!formGroup) return;

    removeError(inputElement); // Hapus error lama dulu

    let errorElement = formGroup.querySelector(".error-message");
    if (!errorElement) {
      errorElement = document.createElement("div");
      errorElement.className = "error-message";
      // Sisipkan setelah input atau wrapper-nya jika checkbox/radio
      if (inputElement.type === "checkbox" || inputElement.type === "radio") {
        (inputElement.parentElement.parentElement || formGroup).appendChild(errorElement); // Lebih baik jika ada div khusus untuk error checkbox
      } else {
        formGroup.appendChild(errorElement);
      }
    }
    errorElement.textContent = message;
    // Pertimbangkan memindahkan style ini ke CSS
    errorElement.style.color = "white";
    errorElement.style.fontSize = "12px";
    errorElement.style.marginTop = "5px"; // Mengurangi margin sedikit
    errorElement.style.display = "block";
    inputElement.classList.add("input-error"); // Tambahkan class untuk styling border merah (opsional)
  }

  function removeError(inputElement) {
    if (!inputElement) return;
    const formGroup = inputElement.closest(".form-group") || inputElement.parentElement;
    if (!formGroup) return;

    const errorElement = formGroup.querySelector(".error-message");
    if (errorElement) {
      errorElement.textContent = "";
      errorElement.style.display = "none";
    }
    inputElement.classList.remove("input-error"); // Hapus class error (opsional)
  }

  function showFormMessage(message, type = "error") {
    if (formMessageArea) {
      formMessageArea.textContent = message;
      formMessageArea.className = `form-message ${type}`; // type bisa 'error' atau 'success'
      formMessageArea.style.display = "block";
      formMessageArea.style.color = type === "success" ? "green" : "red"; // Basic styling
    }
  }

  function clearFormMessage() {
    if (formMessageArea) {
      formMessageArea.textContent = "";
      formMessageArea.style.display = "none";
    }
  }

  // --- Validation Functions ---
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
  }

  function validatePassword(password) {
    // Minimal 8 karakter, mengandung huruf dan angka
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
  }

  function validatePhone(phone) {
    // 10-13 digit angka
    return /^[0-9]{10,13}$/.test(phone);
  }

  // --- Loading State ---
  function setLoadingState(isLoading) {
    if (!submitButton || !buttonText || !loadingSpinner) return;
    if (isLoading) {
      submitButton.disabled = true;
      buttonText.style.display = "none";
      loadingSpinner.style.display = "inline"; // Atau 'block', sesuaikan dengan CSS Anda
    } else {
      submitButton.disabled = false;
      buttonText.style.display = "inline";
      loadingSpinner.style.display = "none";
    }
  }


  // --- Event Listener for Form Submission ---
  if (signupForm) {
    signupForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      clearFormMessage(); // Bersihkan pesan form umum sebelumnya
      let isFormValid = true;

      // Validasi Nama Lengkap
      if (!nameInput || !nameInput.value.trim()) {
        setError(nameInput, "Nama lengkap tidak boleh kosong");
        isFormValid = false;
      } else {
        removeError(nameInput);
      }

      // Validasi Username
      if (!userNameInput || !userNameInput.value.trim()) {
        setError(userNameInput, "Username tidak boleh kosong");
        isFormValid = false;
      } else {
        removeError(userNameInput);
      }

      // Validasi Email
      if (!emailInput || !emailInput.value.trim()) {
        setError(emailInput, "Email tidak boleh kosong");
        isFormValid = false;
      } else if (!validateEmail(emailInput.value.trim())) {
        setError(emailInput, "Format email tidak valid");
        isFormValid = false;
      } else {
        removeError(emailInput);
      }

      // Validasi Nomor Telepon
      if (!phoneInput || !phoneInput.value.trim()) {
        setError(phoneInput, "Nomor telepon tidak boleh kosong");
        isFormValid = false;
      } else if (!validatePhone(phoneInput.value.trim())) {
        setError(phoneInput, "Format nomor telepon tidak valid (10-13 digit)");
        isFormValid = false;
      } else {
        removeError(phoneInput);
      }

      // Validasi Password
      if (!passwordInput || !passwordInput.value.trim()) {
        setError(passwordInput, "Password tidak boleh kosong");
        isFormValid = false;
      } else if (!validatePassword(passwordInput.value.trim())) {
        setError(
          passwordInput,
          "Password minimal 8 karakter, mengandung huruf & angka"
        );
        isFormValid = false;
      } else {
        removeError(passwordInput);
      }

      // Validasi Konfirmasi Password
      if (!confirmPasswordInput || !confirmPasswordInput.value.trim()) {
        setError(confirmPasswordInput, "Konfirmasi password tidak boleh kosong");
        isFormValid = false;
      } else if (
        passwordInput && // pastikan passwordInput ada
        confirmPasswordInput.value.trim() !== passwordInput.value.trim()
      ) {
        setError(confirmPasswordInput, "Konfirmasi password tidak cocok");
        isFormValid = false;
      } else {
        removeError(confirmPasswordInput);
      }

      // Validasi Persetujuan Syarat
      if (agreeTermsCheckbox && !agreeTermsCheckbox.checked) {
        // Untuk checkbox, error message lebih baik diletakkan dekat labelnya atau di form groupnya
        setError(agreeTermsCheckbox, "Anda harus menyetujui syarat & ketentuan");
        isFormValid = false;
      } else if (agreeTermsCheckbox) {
        removeError(agreeTermsCheckbox);
      }

      if (isFormValid) {
        setLoadingState(true);

        const formData = {
          fullName: nameInput.value.trim(),
          userName: userNameInput.value.trim(),
          email: emailInput.value.trim().toLowerCase(),
          password: passwordInput.value, // Password sebaiknya tidak di-trim
          confirmPassword: confirmPasswordInput.value, // Dikirim sesuai permintaan, meski tidak umum
          phone: phoneInput.value.trim(),
          role: "user", // Default role "user". Ganti jika perlu. Contoh dari request: "true" (string)
        };

        try {
          // Ganti URL ini dengan URL API backend Anda
          const response = await fetch('https://back-end-eventory.vercel.app/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json', // Seringkali berguna
            },
            body: JSON.stringify(formData),
          });

          const result = await response.json(); // Coba parse JSON apapun responsenya

          if (response.ok) {
            console.log("Pendaftaran berhasil:", result);
            showFormMessage("Pendaftaran berhasil! Mengalihkan ke halaman login...", "success");
            signupForm.reset(); // Kosongkan form setelah berhasil
            // Matikan tombol submit setelah berhasil dan sebelum redirect
            if(submitButton) submitButton.disabled = true;

            setTimeout(() => {
              window.location.href = "login.html"; // Arahkan ke halaman login
            }, 2000); // Tunggu 2 detik sebelum redirect

          } else {
            console.error("Pendaftaran gagal:", result);
            // Tampilkan pesan error dari backend
            // Backend mungkin mengirim pesan error spesifik untuk field tertentu atau pesan umum
            if (result && result.message) {
                // Cek apakah error terkait field tertentu (contoh sederhana)
                if (result.message.toLowerCase().includes("email already exists")) {
                    setError(emailInput, "Email sudah terdaftar.");
                } else if (result.message.toLowerCase().includes("username already exists")) {
                    setError(userNameInput, "Username sudah digunakan.");
                } else {
                    showFormMessage(result.message || "Pendaftaran gagal. Silakan coba lagi.", "error");
                }
            } else {
                showFormMessage("Terjadi kesalahan yang tidak diketahui dari server.", "error");
            }
          }
        } catch (error) {
          console.error("Error selama pendaftaran (network/client-side):", error);
          showFormMessage("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.", "error");
        } finally {
          setLoadingState(false);
        }
      }
    });
  }

  // --- Toggle Password Visibility ---
  passwordToggles.forEach((toggle) => {
    toggle.addEventListener("click", function () {
      const input = this.previousElementSibling;
      if (input && input.tagName === 'INPUT') {
        const type = input.getAttribute("type") === "password" ? "text" : "password";
        input.setAttribute("type", type);
        this.classList.toggle("visible"); // Untuk mengganti ikon show/hide
        // Contoh ikon: this.querySelector('i').classList.toggle('fa-eye-slash');
      }
    });
  });

  // --- Real-time Validations (Opsional, tapi meningkatkan UX) ---
  function setupRealtimeValidation(inputElement, validationFn, errorMessage, emptyAllowed = false) {
    if (inputElement) {
      inputElement.addEventListener('input', function() {
        const value = this.value.trim();
        removeError(inputElement); // Hapus error sebelumnya
        if (!emptyAllowed && !value) {
          // setError(this, `${inputElement.name || 'Field'} tidak boleh kosong`); // Bisa ditambahkan jika mau
        } else if (value && validationFn && !validationFn(value)) {
          setError(this, errorMessage);
        }
      });
    }
  }

  setupRealtimeValidation(emailInput, validateEmail, "Format email tidak valid");
  setupRealtimeValidation(phoneInput, validatePhone, "Format nomor telepon tidak valid (10-13 digit)");

  if (passwordInput) {
    passwordInput.addEventListener("input", function () {
      const value = this.value; // Jangan trim password saat validasi real-time
      removeError(passwordInput);
      if (value && !validatePassword(value)) {
        setError(this, "Password minimal 8 karakter, mengandung huruf & angka");
      }
      // Validasi ulang confirm password jika sudah diisi
      if (confirmPasswordInput && confirmPasswordInput.value) {
        removeError(confirmPasswordInput);
        if (confirmPasswordInput.value !== value) {
          setError(confirmPasswordInput, "Konfirmasi password tidak cocok");
        }
      }
    });
  }

  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener("input", function () {
      const value = this.value;
      removeError(confirmPasswordInput);
      if (passwordInput && value !== passwordInput.value) {
        setError(this, "Konfirmasi password tidak cocok");
      }
    });
  }
  
  // Set initial state for submit button if terms checkbox exists
  if (agreeTermsCheckbox && submitButton) {
    submitButton.disabled = !agreeTermsCheckbox.checked;
    agreeTermsCheckbox.addEventListener('change', function() {
        submitButton.disabled = !this.checked;
        if (this.checked) {
            removeError(this); // Hapus error terms jika dicentang
        } else {
            // setError(this, "Anda harus menyetujui syarat & ketentuan"); // Bisa ditambahkan jika mau langsung error
        }
    });
  }

});
