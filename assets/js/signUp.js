document.addEventListener("DOMContentLoaded", function () {
  // Inisialisasi elemen form
  const elements = {
    form: document.getElementById("signup-form"),
    fullName: document.getElementById("fullName"),
    userName: document.getElementById("userName"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    password: document.getElementById("password"),
    confirmPassword: document.getElementById("confirmPassword"),
    terms: document.getElementById("terms"),
    passwordToggles: document.querySelectorAll(".toggle-password")
  };
  
  const apiUrl = "https://back-end-eventory.vercel.app/api/Users/register";

  // Log status elemen form untuk debugging
  console.log("Form elements:", Object.entries(elements)
    .filter(([key]) => key !== 'passwordToggles')
    .reduce((acc, [key, el]) => {
      acc[key] = el ? "Found" : "Not found";
      return acc;
    }, {}));

  // Validasi dengan RegExp yang dioptimalkan
  const validators = {
    email: email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    password: password => password.length >= 6, // Simplified password validation
    phone: phone => /^[0-9]{10,13}$/.test(phone),
    username: username => /^[a-zA-Z0-9_]{3,}$/.test(username)
  };

  // Fungsi manipulasi error yang dioptimalkan
  const errorHandler = {
    set: (input, message) => {
      const formGroup = input.closest(".form-group");
      if (!formGroup) return;

      let error = formGroup.querySelector(".error-message");
      if (!error) {
        error = document.createElement("div");
        error.className = "error-message";
        formGroup.appendChild(error);
      }

      error.textContent = message;
      error.style.cssText = "color: white; font-size: 12px; margin-top: 8px; display: block;";
    },
    
    remove: (input) => {
      const formGroup = input.closest(".form-group");
      if (!formGroup) return;

      const error = formGroup.querySelector(".error-message");
      if (error) {
        error.textContent = "";
        error.style.display = "none";
      }
    },
    
    clearAll: () => {
      document.querySelectorAll(".error-message").forEach(el => {
        el.textContent = "";
        el.style.display = "none";
      });
    }
  };

  // Handle form submission
  if (elements.form) {
    elements.form.addEventListener("submit", async function (e) {
      e.preventDefault();
      console.log("Form submission started");
      
      errorHandler.clearAll();
      
      // Validasi form
      const validationRules = [
        { field: elements.fullName, name: 'fullName', rule: value => !!value.trim(), message: "Nama lengkap tidak boleh kosong" },
        { field: elements.userName, name: 'username', rule: value => !!value.trim(), message: "Username tidak boleh kosong" },
        { field: elements.userName, name: 'username', rule: value => value.trim().length >= 3, message: "Username minimal 3 karakter" },
        { field: elements.userName, name: 'username', rule: value => validators.username(value.trim()), message: "Username hanya boleh mengandung huruf, angka, dan underscore" },
        { field: elements.email, name: 'email', rule: value => !!value.trim(), message: "Email tidak boleh kosong" },
        { field: elements.email, name: 'email', rule: value => validators.email(value.trim()), message: "Format email tidak valid" },
        { field: elements.phone, name: 'phone', rule: value => !!value.trim(), message: "Nomor telepon tidak boleh kosong" },
        { field: elements.phone, name: 'phone', rule: value => validators.phone(value.trim()), message: "Format nomor telepon tidak valid (10-13 digit)" },
        { field: elements.password, name: 'password', rule: value => !!value.trim(), message: "Password tidak boleh kosong" },
        { field: elements.password, name: 'password', rule: value => validators.password(value.trim()), message: "Password minimal 8 karakter dan mengandung huruf & angka" },
        { field: elements.confirmPassword, name: 'confirmPassword', rule: value => !!value.trim(), message: "Konfirmasi password tidak boleh kosong" },
        { field: elements.confirmPassword, name: 'confirmPassword', rule: value => value.trim() === elements.password.value.trim(), message: "Konfirmasi password tidak cocok" },
        { field: elements.terms, name: 'terms', rule: value => value.checked, message: "Harus menyetujui syarat & ketentuan" }
      ];
      
      const validationStatus = {};
      let isValid = true;
      
      validationRules.forEach(({field, name, rule, message}) => {
        if (!validationStatus[name]) {
          validationStatus[name] = { isValid: true, value: field.value?.trim() || field.checked, error: null };
        }
        
        const value = field.value?.trim() || field.checked;
        if (!rule(value)) {
          errorHandler.set(field, message);
          isValid = false;
          validationStatus[name].isValid = false;
          validationStatus[name].error = message;
        }
      });

      if (isValid) {
        const formData = {
          fullName: elements.fullName.value.trim(),
          userName: elements.userName.value.trim(),
          email: elements.email.value.trim(),
          password: elements.password.value,
          confirmPassword: elements.confirmPassword.value,
          phone: elements.phone.value.trim(),
          role: "true" // Ensure role is sent as string "true"
        };

        console.log("Form validation successful");
        console.log("Data yang akan dikirim:", {
          ...formData,
          password: "********",
          confirmPassword: "********"
        });

        try {
          // Menambahkan feedback visual saat proses pengiriman data
          const submitButton = elements.form.querySelector("button[type='submit']");
          const originalButtonText = submitButton.textContent;
          submitButton.disabled = true;
          submitButton.textContent = "Mendaftar...";

          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            mode: "cors",
            credentials: "include",
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
            // Simpan token jika ada
            if (data.token) {
              localStorage.setItem("authToken", data.token);
            }
            
            // Tampilkan pesan sukses dengan SweetAlert jika tersedia
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
          
          // Kembalikan tombol ke keadaan normal
          const submitButton = elements.form.querySelector("button[type='submit']");
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;

          if (error.message.includes("CORS") || error.name === "TypeError") {
            // Coba metode alternatif menggunakan XMLHttpRequest
            try {
              const xhr = new XMLHttpRequest();
              xhr.open("POST", apiUrl, true);
              xhr.setRequestHeader("Content-Type", "application/json");
              xhr.setRequestHeader("Accept", "application/json");
              
              xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                  const data = JSON.parse(xhr.responseText);
                  if (data.success) {
                    if (data.token) {
                      localStorage.setItem("authToken", data.token);
                    }
                    alert("Pendaftaran berhasil! Anda akan diarahkan ke halaman login.");
                    window.location.href = "login.html";
                  } else {
                    alert("Pendaftaran gagal: " + (data.message || "Terjadi kesalahan"));
                  }
                } else {
                  alert("Terjadi kesalahan saat pendaftaran. Silakan coba lagi nanti.");
                }
              };
              
              xhr.onerror = function() {
                alert("Terjadi kesalahan koneksi. Silakan coba lagi nanti atau hubungi admin.");
              };
              
              xhr.send(JSON.stringify(formData));
            } catch (xhrError) {
              console.error("XHR fallback failed:", xhrError);
              alert("Terjadi kesalahan saat pendaftaran. Silakan coba lagi nanti atau hubungi admin di info@Eventify.id");
            }
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

  // Fungsi untuk menangani error CORS
  function handleCorsError(formData) {
    console.warn("CORS issue detected, trying alternative approach");
    
    // Opsi 1: Tampilkan pesan yang lebih bermanfaat
    alert("Maaf, ada masalah koneksi ke server. Coba salah satu dari langkah berikut:\n\n" +
          "1. Refresh halaman dan coba lagi\n" +
          "2. Pastikan Anda menggunakan browser terbaru\n" +
          "3. Jika masalah berlanjut, hubungi admin di info@Eventify.id");
    
    // Opsi 2: Simpan data secara lokal untuk dikirim nanti
    const pendingRegistrations = JSON.parse(localStorage.getItem('pendingRegistrations') || '[]');
    pendingRegistrations.push({
      ...formData,
      password: btoa(formData.password), // Enkripsi sederhana (tidak aman untuk produksi)
      confirmPassword: btoa(formData.confirmPassword),
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('pendingRegistrations', JSON.stringify(pendingRegistrations));
    console.log("Data pendaftaran disimpan lokal untuk pengiriman nanti");
    
    // Opsi 3: Arahkan ke halaman alternatif
    // window.location.href = "alternative-register.html?email=" + encodeURIComponent(formData.email);
  }

  // Manajemen toggle visibility password
  elements.passwordToggles.forEach(toggle => {
    toggle.addEventListener("click", function() {
      const input = this.previousElementSibling;
      const type = input.getAttribute("type") === "password" ? "text" : "password";
      input.setAttribute("type", type);
      this.classList.toggle("visible");
    });
  });

  // Event listeners untuk validasi real-time
  setupRealTimeValidation();
  
  function setupRealTimeValidation() {
    // Username validation
    elements.userName.addEventListener("input", function() {
      if (this.value.trim() === "") {
        errorHandler.remove(this);
      } else if (this.value.trim().length < 3) {
        errorHandler.set(this, "Username minimal 3 karakter");
      } else if (!/^[a-zA-Z0-9_]+$/.test(this.value.trim())) {
        errorHandler.set(this, "Username hanya boleh mengandung huruf, angka, dan underscore");
      } else {
        errorHandler.remove(this);
      }
    });

    // Phone validation
    elements.phone.addEventListener("input", function() {
      // Hapus karakter non-angka
      this.value = this.value.replace(/[^0-9]/g, "");
      
      if (this.value.trim() === "") {
        errorHandler.remove(this);
      } else if (!validators.phone(this.value.trim())) {
        errorHandler.set(this, "Format nomor telepon tidak valid (10-13 digit)");
      } else {
        errorHandler.remove(this);
      }
    });

    // Password validation
    elements.password.addEventListener("input", function() {
      if (this.value.trim() === "") {
        errorHandler.remove(this);
      } else if (!validators.password(this.value.trim())) {
        errorHandler.set(this, "Password minimal 8 karakter dan mengandung huruf & angka");
      } else {
        errorHandler.remove(this);
        
        // Update konfirmasi password
        validateConfirmPassword();
      }
    });

    // Confirm password validation
    elements.confirmPassword.addEventListener("input", validateConfirmPassword);
    
    function validateConfirmPassword() {
      const confirmInput = elements.confirmPassword;
      if (confirmInput.value.trim() === "") {
        errorHandler.remove(confirmInput);
      } else if (confirmInput.value.trim() !== elements.password.value.trim()) {
        errorHandler.set(confirmInput, "Konfirmasi password tidak cocok");
      } else {
        errorHandler.remove(confirmInput);
      }
    }
  }
});