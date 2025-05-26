document.addEventListener("DOMContentLoaded", function () {
  // --- Pemilihan Elemen DOM ---
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
  const errorContainer = document.getElementById("error-container");
  const successContainer = document.getElementById("success-container");
  
  // Periksa apakah submitButton ada sebelum mengakses propertinya
  const buttonText = submitButton ? submitButton.querySelector(".button-text") : null;
  const loadingSpinner = submitButton ? submitButton.querySelector(".loading-spinner") : null;

  // --- Fungsi Validasi ---
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePassword(password) {
    // Minimal 8 karakter, setidaknya satu huruf dan satu angka
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
  }

  function validatePhone(phone) {
    // 10 hingga 13 digit angka
    return /^[0-9]{10,13}$/.test(phone);
  }

  // --- Fungsi Tampilan Error/Success ---
  function setError(input, message) {
    if (!input) return;

    const formGroup = input.closest(".form-group") || input.parentElement;
    if (!formGroup) return;

    let error = formGroup.querySelector(".error-message");
    if (!error) {
      error = document.createElement("div");
      error.className = "error-message text-red-500 text-sm mt-1";
      // Masukkan setelah input jika memungkinkan, atau di akhir formGroup
      input.nextElementSibling ? 
        formGroup.insertBefore(error, input.nextElementSibling) : 
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
      error.textContent = ""; // Atau hapus elemen: error.remove();
    }
    input.classList.remove("border-red-500");
  }

  function showError(message) {
    if (errorContainer) {
      errorContainer.textContent = message;
      errorContainer.classList.remove("hidden");
      if (successContainer) successContainer.classList.add("hidden");
      errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        console.error("Error Container not found. Message:", message);
        alert(message); // Fallback jika container tidak ada
    }
  }

  function showSuccess(message) {
    if (successContainer) {
      successContainer.textContent = message;
      successContainer.classList.remove("hidden");
      if (errorContainer) errorContainer.classList.add("hidden");
      successContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        console.log("Success Container not found. Message:", message);
        alert(message); // Fallback jika container tidak ada
    }
  }

  function setLoading(isLoading) {
    if (!submitButton || !loadingSpinner || !buttonText || !agreeTermsCheckbox) return;

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

  // --- Inisialisasi Tombol & Event Listeners ---

  // Set button disabled secara default jika ada
  if (submitButton) {
    submitButton.disabled = true;
  }

  // Enable/disable button based on agreement checkbox
  if (agreeTermsCheckbox && submitButton) {
    agreeTermsCheckbox.addEventListener("change", () => {
      submitButton.disabled = !agreeTermsCheckbox.checked;
    });
  }

  // Toggle password visibility
  passwordToggles.forEach((toggle) => {
    toggle.addEventListener("click", function () {
      const input = this.previousElementSibling;
      if (!input) return;
      const type = input.getAttribute("type") === "password" ? "text" : "password";
      input.setAttribute("type", type);
      const icon = this.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-eye");
        icon.classList.toggle("fa-eye-slash");
      }
    });
  });

  // --- Validasi Input Real-time ---
  if (nameInput) {
    nameInput.addEventListener("input", function() {
      const value = this.value.trim();
      if (value === "") setError(this, "Nama lengkap tidak boleh kosong");
      else if (value.length < 3) setError(this, "Nama lengkap minimal 3 karakter");
      else removeError(this);
    });
  }

  if (userNameInput) {
    userNameInput.addEventListener("input", function() {
      const value = this.value.trim();
      if (value === "") setError(this, "Username tidak boleh kosong");
      else if (value.length < 4) setError(this, "Username minimal 4 karakter");
      else if (!/^[a-zA-Z0-9_]+$/.test(value)) setError(this, "Username hanya boleh mengandung huruf, angka, dan underscore");
      else removeError(this);
    });
  }

  if (emailInput) {
    emailInput.addEventListener("input", function() {
      const value = this.value.trim();
      if (value === "") setError(this, "Email tidak boleh kosong");
      else if (!validateEmail(value)) setError(this, "Format email tidak valid");
      else removeError(this);
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener("input", function() {
      this.value = this.value.replace(/[^0-9]/g, "").slice(0, 13);
      const value = this.value.trim();
      if (value === "") setError(this, "Nomor telepon tidak boleh kosong");
      else if (!validatePhone(value)) setError(this, "Format nomor telepon tidak valid (10-13 digit)");
      else removeError(this);
    });
  }

  if (passwordInput) {
    passwordInput.addEventListener("input", function() {
      const value = this.value.trim();
      if (value === "") setError(this, "Password tidak boleh kosong");
      else if (!validatePassword(value)) setError(this, "Password minimal 8 karakter dan mengandung huruf & angka");
      else removeError(this);
      
      if (confirmPasswordInput && confirmPasswordInput.value.trim() !== "") {
        if (confirmPasswordInput.value.trim() !== value) setError(confirmPasswordInput, "Konfirmasi password tidak cocok");
        else removeError(confirmPasswordInput);
      }
    });
  }

  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener("input", function() {
      const value = this.value.trim();
      if (value === "") setError(this, "Konfirmasi password tidak boleh kosong");
      else if (passwordInput && value !== passwordInput.value.trim()) setError(this, "Konfirmasi password tidak cocok");
      else removeError(this);
    });
  }

  // --- Fungsi Validasi Form Keseluruhan ---
  function validateForm() {
    let isValid = true;
    
    // Hapus error lama sebelum validasi ulang
    document.querySelectorAll(".error-message").forEach((el) => el.textContent = "");
    signupForm.querySelectorAll("input").forEach(input => input.classList.remove("border-red-500"));

    if (!nameInput || nameInput.value.trim() === "") { setError(nameInput, "Nama lengkap tidak boleh kosong"); isValid = false; } 
    else if (nameInput.value.trim().length < 3) { setError(nameInput, "Nama lengkap minimal 3 karakter"); isValid = false; }

    if (!userNameInput || userNameInput.value.trim() === "") { setError(userNameInput, "Username tidak boleh kosong"); isValid = false; }
    else if (userNameInput.value.trim().length < 4) { setError(userNameInput, "Username minimal 4 karakter"); isValid = false; }
    else if (!/^[a-zA-Z0-9_]+$/.test(userNameInput.value.trim())) { setError(userNameInput, "Username hanya boleh mengandung huruf, angka, dan underscore"); isValid = false; }

    if (!emailInput || emailInput.value.trim() === "") { setError(emailInput, "Email tidak boleh kosong"); isValid = false; }
    else if (!validateEmail(emailInput.value.trim())) { setError(emailInput, "Format email tidak valid"); isValid = false; }

    if (!phoneInput || phoneInput.value.trim() === "") { setError(phoneInput, "Nomor telepon tidak boleh kosong"); isValid = false; }
    else if (!validatePhone(phoneInput.value.trim())) { setError(phoneInput, "Format nomor telepon tidak valid (10-13 digit)"); isValid = false; }

    if (!passwordInput || passwordInput.value.trim() === "") { setError(passwordInput, "Password tidak boleh kosong"); isValid = false; }
    else if (!validatePassword(passwordInput.value.trim())) { setError(passwordInput, "Password minimal 8 karakter dan mengandung huruf & angka"); isValid = false; }

    if (!confirmPasswordInput || confirmPasswordInput.value.trim() === "") { setError(confirmPasswordInput, "Konfirmasi password tidak boleh kosong"); isValid = false; }
    else if (passwordInput && confirmPasswordInput.value.trim() !== passwordInput.value.trim()) { setError(confirmPasswordInput, "Konfirmasi password tidak cocok"); isValid = false; }

    if (!agreeTermsCheckbox || !agreeTermsCheckbox.checked) { setError(agreeTermsCheckbox, "Harus menyetujui syarat & ketentuan"); isValid = false; }

    return isValid;
  }

  // --- Penanganan Form Submission ---
  if (signupForm) {
    signupForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Sembunyikan pesan lama
      if (errorContainer) errorContainer.classList.add("hidden");
      if (successContainer) successContainer.classList.add("hidden");

      if (validateForm()) {
        setLoading(true);

        try {
          const userData = {
            fullName: nameInput.value.trim(),
            userName: userNameInput.value.trim(),
            email: emailInput.value.trim().toLowerCase(),
            password: passwordInput.value,
            confirmPassword: confirmPasswordInput.value,
            phone: phoneInput.value.trim(),
            role: "true" // Pastikan API mengharapkan string "true"
          };

          console.log('Mengirim data:', userData);

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

          const result = await response.json();
          console.log('Respons:', result);

          if (response.ok) {
            showSuccess("Pendaftaran berhasil! Mengalihkan ke halaman login...");
            setTimeout(() => {
              window.location.href = "login.html";
            }, 1500);
          } else {
            // Tangani error spesifik dari server
            if (result.message) {
                if (result.message.toLowerCase().includes("email")) {
                    setError(emailInput, result.message);
                } else if (result.message.toLowerCase().includes("username")) {
                    setError(userNameInput, result.message);
                } else {
                    showError(result.message); // Tampilkan error umum
                }
            } else {
                showError("Terjadi kesalahan saat pendaftaran. Kode: " + response.status);
            }
          }
        } catch (error) {
          console.error("Error selama pendaftaran:", error);
          // **INI PERBAIKANNYA**: Menggunakan fungsi showError yang sudah aman
          showError(error.message || "Terjadi kesalahan pada sistem. Silakan coba lagi nanti.");
        } finally {
          // Hanya set loading ke false jika *tidak* sukses (karena akan redirect)
          // Atau selalu set false jika tidak ada redirect
          // Dalam kasus ini, kita set false agar tombol kembali normal jika error
          // Jika sukses, halaman akan redirect jadi tidak masalah.
          setLoading(false); 
        }
      } else {
        // Jika validasi form gagal, tampilkan pesan error umum
        showError("Harap periksa kembali isian Anda, masih ada yang belum sesuai.");
      }
    });
  }
});