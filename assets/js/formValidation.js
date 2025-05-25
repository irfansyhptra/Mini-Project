// Fungsi validasi email
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Fungsi validasi password
function isValidPassword(password) {
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
}

// Fungsi validasi NIK
function isValidNIK(nik) {
  return /^\d{16}$/.test(nik);
}

// Fungsi validasi nomor telepon
function isValidPhone(phone) {
  return /^[0-9]{10,13}$/.test(phone);
}

// Fungsi untuk validasi form login
function validateLoginForm() {
  const email = document.getElementById("login-email");
  const password = document.getElementById("login-password");
  let isValid = true;

  if (!email.value.trim()) {
    setError(email, "Email tidak boleh kosong");
    isValid = false;
  } else if (!isValidEmail(email.value.trim())) {
    setError(email, "Email tidak valid");
    isValid = false;
  } else {
    removeError(email);
  }

  if (!password.value.trim()) {
    setError(password, "Password tidak boleh kosong");
    isValid = false;
  } else if (password.value.length < 8) {
    setError(password, "Password minimal 8 karakter");
    isValid = false;
  } else {
    removeError(password);
  }

  return isValid;
}

// Fungsi validasi form signup
function validateSignupForm() {
  const name = document.getElementById("fullName");
  const username = document.getElementById("userName");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");
  const terms = document.getElementById("terms");
  let isValid = true;

  // Validasi Nama
  if (!name.value.trim()) {
    setError(name, "Nama tidak boleh kosong");
    isValid = false;
  } else {
    removeError(name);
  }

  // Validasi Username
  if (!username.value.trim()) {
    setError(username, "Username tidak boleh kosong");
    isValid = false;
  } else {
    removeError(username);
  }

  // Validasi Email
  if (!email.value.trim()) {
    setError(email, "Email tidak boleh kosong");
    isValid = false;
  } else if (!isValidEmail(email.value.trim())) {
    setError(email, "Email tidak valid");
    isValid = false;
  } else {
    removeError(email);
  }

  // Validasi Nomor Telepon
  if (!phone.value.trim()) {
    setError(phone, "Nomor telepon tidak boleh kosong");
    isValid = false;
  } else if (!isValidPhone(phone.value.trim())) {
    setError(phone, "Nomor telepon tidak valid (10-13 digit)");
    isValid = false;
  } else {
    removeError(phone);
  }

  // Validasi Password
  if (!password.value.trim()) {
    setError(password, "Password tidak boleh kosong");
    isValid = false;
  } else if (!isValidPassword(password.value.trim())) {
    setError(password, "Password minimal 8 karakter dan mengandung huruf & angka");
    isValid = false;
  } else {
    removeError(password);
  }

  // Validasi Konfirmasi Password
  if (!confirmPassword.value.trim()) {
    setError(confirmPassword, "Konfirmasi password tidak boleh kosong");
    isValid = false;
  } else if (confirmPassword.value.trim() !== password.value.trim()) {
    setError(confirmPassword, "Konfirmasi password tidak cocok");
    isValid = false;
  } else {
    removeError(confirmPassword);
  }

  // Validasi Terms & Conditions
  if (!terms.checked) {
    setError(terms, "Anda harus menyetujui syarat & ketentuan");
    isValid = false;
  } else {
    removeError(terms);
  }

  return isValid;
}

// Fungsi untuk menampilkan error
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

// Fungsi untuk menghapus error
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
