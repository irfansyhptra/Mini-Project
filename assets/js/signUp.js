document.addEventListener("DOMContentLoaded", function () {
  // Inisialisasi elemen form
  const signupForm = document.getElementById("signup-form");
  const nameInput = document.getElementById("fullName");
  const userName = document.getElementById("userName");
  const emailInput = document.getElementById("email");
  const phone = document.getElementById("phone");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const agreeTermsCheckbox = document.getElementById("terms");
  const passwordToggles = document.querySelectorAll(".toggle-password");
  const apiUrl = "https://back-end-eventory.vercel.app/api/Users/register";

  // Log status elemen form untuk debugging
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

  // Fungsi utilitas validasi
  const validators = {
    email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    password: (password) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password),
    phone: (phone) => /^[0-9]{10,13}$/.test(phone)
  };

  // Fungsi untuk menampilkan error
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

  // Fungsi untuk menghapus error
  function removeError(input) {
    const formGroup = input.closest(".form-group");
    if (!formGroup) return;

    const error = formGroup.querySelector(".error-message");
    if (error) {
      error.textContent = "";
      error.style.display = "none";
    }
  }

  // Bersihkan semua pesan error
  function clearAllErrors() {
    document.querySelectorAll(".error-message").forEach((el) => {
      el.textContent = "";
      el.style.display = "none";
    });
  }

  // Event handler untuk form submission
  if (signupForm) {
    signupForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      console.log("Form submission started");
      
      clearAllErrors();
      let isValid = true;
      
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

      // Validasi Nama
      if (!nameInput.value.trim()) {
        setError(nameInput, "Nama lengkap tidak boleh kosong");
        isValid = false;
        validationStatus.fullName.isValid = false;
        validationStatus.fullName.error = "Nama lengkap tidak boleh kosong";
      }

      // Validasi Username
      if (!userName.value.trim()) {
        setError(userName, "Username tidak boleh kosong");
        isValid = false;
        validationStatus.username.isValid = false;
        validationStatus.username.error = "Username tidak boleh kosong";
      } else if (userName.value.trim().length < 3) {
        setError(userName, "Username minimal 3 karakter");
        isValid = false;
        validationStatus.username.isValid = false;
        validationStatus.username.error = "Username minimal 3 karakter";
      } else if (!/^[a-zA-Z0-9_]+$/.test(userName.value.trim())) {
        setError(userName, "Username hanya boleh mengandung huruf, angka, dan underscore");
        isValid = false;
        validationStatus.username.isValid = false;
        validationStatus.username.error = "Username hanya boleh mengandung huruf, angka, dan underscore";
      }

      // Validasi Email
      if (!emailInput.value.trim()) {
        setError(emailInput, "Email tidak boleh kosong");
        isValid = false;
        validationStatus.email.isValid = false;
        validationStatus.email.error = "Email tidak boleh kosong";
      } else if (!validators.email(emailInput.value.trim())) {
        setError(emailInput, "Format email tidak valid");
        isValid = false;
        validationStatus.email.isValid = false;
        validationStatus.email.error = "Format email tidak valid";
      }

      // Validasi Nomor Telepon
      if (!phone.value.trim()) {
        setError(phone, "Nomor telepon tidak boleh kosong");
        isValid = false;
        validationStatus.phone.isValid = false;
        validationStatus.phone.error = "Nomor telepon tidak boleh kosong";
      } else if (!validators.phone(phone.value.trim())) {
        setError(phone, "Format nomor telepon tidak valid (10-13 digit)");
        isValid = false;
        validationStatus.phone.isValid = false;
        validationStatus.phone.error = "Format nomor telepon tidak valid (10-13 digit)";
      }

      // Validasi Password
      if (!passwordInput.value.trim()) {
        setError(passwordInput, "Password tidak boleh kosong");
        isValid = false;
        validationStatus.password.isValid = false;
        validationStatus.password.error = "Password tidak boleh kosong";
      } else if (!validators.password(passwordInput.value.trim())) {
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
        setError(confirmPasswordInput, "Konfirmasi password tidak cocok");
        isValid = false;
        validationStatus.confirmPassword.isValid = false;
        validationStatus.confirmPassword.error = "Konfirmasi password tidak cocok";
      }

      // Validasi Persetujuan Syarat
      if (!agreeTermsCheckbox.checked) {
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
            role: "true"  // Change from boolean to string if the API expects a string
          };

        console.log("Form validation successful");
        console.log("Data yang akan dikirim:", {
          ...formData,
          password: "********",
          confirmPassword: "********"
        });

        try {
          // Menambahkan feedback visual saat proses pengiriman data
          const submitButton = signupForm.querySelector("button[type='submit']");
          const originalButtonText = submitButton.textContent;
          submitButton.disabled = true;
          submitButton.textContent = "Mendaftar...";
          
          // Solusi untuk CORS: Gunakan proxy atau tambahkan credential:omit
          // Opsi 1: Gunakan proxy CORS
          const proxyUrl = "https://cors-anywhere.herokuapp.com/"; // Proxy alternatif
          
          // Menggunakan fetch dengan mode 'no-cors' dan credentials: 'omit'
          // untuk mengurangi masalah CORS
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify(formData)
          });
          
          // Kembalikan tombol ke keadaan normal
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
          
          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || "Terjadi kesalahan saat pendaftaran");
          }
          
          const data = await response.json();
          
          if (data.success) {
            // Sukses - simpan token jika ada
            if (data.token) {
              localStorage.setItem("authToken", data.token);
            }
            
            // Tampilkan pesan sukses yang lebih baik dengan SweetAlert jika ada
            if (typeof Swal !== 'undefined') {
              Swal.fire({
                title: "Pendaftaran Berhasil!",
                text: "Anda akan diarahkan ke halaman login.",
                icon: "success",
                timer: 2000,
                showConfirmButton: false
              }).then(() => {
                window.location.href = "login.html";
              });
            } else {
              alert("Pendaftaran berhasil! Anda akan diarahkan ke halaman login.");
              window.location.href = "login.html";
            }
          } else {
            throw new Error(data.message || "Pendaftaran gagal");
          }
        } catch (error) {
          console.error("Error during registration:", error);
          
          // Jika error berkaitan dengan CORS, tampilkan pesan yang lebih informatif
          if (error.message.includes("CORS") || error.name === "TypeError") {
            // Tambahkan alternatif untuk mengirim data melalui backend proxy jika ada
            alert("Maaf, terjadi masalah koneksi ke server. Silakan coba lagi nanti atau hubungi admin.");
            
            // Tambahkan opsi fallback untuk mendaftar melalui alternatif
            console.log("Mencoba metode alternatif pendaftaran...");
            // Implementasi logika fallback jika diperlukan
            
            // Atau arahkan ke halaman alternatif
            // window.location.href = "alternative-register.html";
          } else {
            alert("Terjadi kesalahan saat pendaftaran: " + error.message);
          }
        }
      } else {
        console.log("Form validation failed");
        
        // Filter hanya field yang gagal validasi untuk logging
        const failedValidations = Object.entries(validationStatus)
          .filter(([_, status]) => !status.isValid)
          .reduce((acc, [field, status]) => {
            acc[field] = {
              value: field.includes('password') ? '********' : status.value,
              error: status.error
            };
            return acc;
          }, {});

        if (Object.keys(failedValidations).length > 0) {
          console.log("Validasi yang gagal:", failedValidations);
        }
      }
    });
  }

  // Toggle Password Visibility
  passwordToggles.forEach((toggle) => {
    toggle.addEventListener("click", function () {
      const input = this.previousElementSibling;
      const type = input.getAttribute("type") === "password" ? "text" : "password";
      input.setAttribute("type", type);
      this.classList.toggle("visible");
    });
  });

  // Real-time validation for Username
  userName.addEventListener("input", function() {
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

  // Real-time validation for Phone Number
  phone.addEventListener("input", function() {
    const oldValue = this.value;
    this.value = this.value.replace(/[^0-9]/g, "");
    
    if (this.value.trim() === "") {
      removeError(this);
    } else if (!validators.phone(this.value.trim())) {
      setError(this, "Format nomor telepon tidak valid (10-13 digit)");
    } else {
      removeError(this);
    }
  });

  // Real-time validation for Password
  passwordInput.addEventListener("input", function () {
    if (this.value.trim() === "") {
      removeError(this);
    } else if (!validators.password(this.value.trim())) {
      setError(
        this,
        "Password minimal 8 karakter dan mengandung huruf & angka"
      );
    } else {
      removeError(this);
      
      // Update konfirmasi password jika sudah terisi
      if (confirmPasswordInput.value.trim() !== "") {
        if (confirmPasswordInput.value.trim() !== this.value.trim()) {
          setError(confirmPasswordInput, "Konfirmasi password tidak cocok");
        } else {
          removeError(confirmPasswordInput);
        }
      }
    }
  });

  // Real-time validation for Confirm Password
  confirmPasswordInput.addEventListener("input", function () {
    if (this.value.trim() === "") {
      removeError(this);
    } else if (this.value.trim() !== passwordInput.value.trim()) {
      setError(this, "Konfirmasi password tidak cocok");
    } else {
      removeError(this);
    }
  });
});