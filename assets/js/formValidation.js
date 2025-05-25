// Utility functions for form validation
const ValidationUtils = {
  // Email validation
  isValidEmail: (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  // Password validation
  isValidPassword: (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
  },

  // Username validation
  isValidUsername: (username) => {
    return /^[a-zA-Z0-9_]{4,}$/.test(username);
  },

  // Phone number validation
  isValidPhone: (phone) => {
    return /^[0-9]{10,13}$/.test(phone);
  },

  // Name validation
  isValidName: (name) => {
    return /^[a-zA-Z\s]{3,}$/.test(name);
  },

  // Set error message
  setError: (input, message) => {
    const formGroup = input.closest('.form-group');
    if (!formGroup) return;

    let errorElement = formGroup.querySelector('.error-message');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      formGroup.appendChild(errorElement);
    }

    errorElement.textContent = message;
    errorElement.style.color = '#ff4444';
    errorElement.style.fontSize = '12px';
    errorElement.style.marginTop = '8px';
    errorElement.style.display = 'block';
  },

  // Remove error message
  removeError: (input) => {
    const formGroup = input.closest('.form-group');
    if (!formGroup) return;

    const errorElement = formGroup.querySelector('.error-message');
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }
};

// Login form validation
function validateLoginForm() {
  const email = document.getElementById("login-email");
  const password = document.getElementById("login-password");
  let isValid = true;

  // Email validation
  if (!email.value.trim()) {
    ValidationUtils.setError(email, "Email tidak boleh kosong");
    isValid = false;
  } else if (!ValidationUtils.isValidEmail(email.value.trim())) {
    ValidationUtils.setError(email, "Format email tidak valid");
    isValid = false;
  } else {
    ValidationUtils.removeError(email);
  }

  // Password validation
  if (!password.value.trim()) {
    ValidationUtils.setError(password, "Password tidak boleh kosong");
    isValid = false;
  } else if (password.value.length < 8) {
    ValidationUtils.setError(password, "Password minimal 8 karakter");
    isValid = false;
  } else {
    ValidationUtils.removeError(password);
  }

  return isValid;
}

// Signup form validation
function validateSignupForm() {
  const name = document.getElementById("fullName");
  const username = document.getElementById("userName");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");
  const terms = document.getElementById("terms");
  let isValid = true;

  // Name validation
  if (!name.value.trim()) {
    ValidationUtils.setError(name, "Nama tidak boleh kosong");
    isValid = false;
  } else if (!ValidationUtils.isValidName(name.value.trim())) {
    ValidationUtils.setError(name, "Nama harus minimal 3 karakter dan hanya mengandung huruf");
    isValid = false;
  } else {
    ValidationUtils.removeError(name);
  }

  // Username validation
  if (!username.value.trim()) {
    ValidationUtils.setError(username, "Username tidak boleh kosong");
    isValid = false;
  } else if (!ValidationUtils.isValidUsername(username.value.trim())) {
    ValidationUtils.setError(username, "Username harus minimal 4 karakter dan hanya mengandung huruf, angka, dan underscore");
    isValid = false;
  } else {
    ValidationUtils.removeError(username);
  }

  // Email validation
  if (!email.value.trim()) {
    ValidationUtils.setError(email, "Email tidak boleh kosong");
    isValid = false;
  } else if (!ValidationUtils.isValidEmail(email.value.trim())) {
    ValidationUtils.setError(email, "Format email tidak valid");
    isValid = false;
  } else {
    ValidationUtils.removeError(email);
  }

  // Phone validation
  if (!phone.value.trim()) {
    ValidationUtils.setError(phone, "Nomor telepon tidak boleh kosong");
    isValid = false;
  } else if (!ValidationUtils.isValidPhone(phone.value.trim())) {
    ValidationUtils.setError(phone, "Nomor telepon harus 10-13 digit angka");
    isValid = false;
  } else {
    ValidationUtils.removeError(phone);
  }

  // Password validation
  if (!password.value.trim()) {
    ValidationUtils.setError(password, "Password tidak boleh kosong");
    isValid = false;
  } else if (!ValidationUtils.isValidPassword(password.value.trim())) {
    ValidationUtils.setError(
      password,
      "Password harus minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan karakter khusus"
    );
    isValid = false;
  } else {
    ValidationUtils.removeError(password);
  }

  // Confirm password validation
  if (!confirmPassword.value.trim()) {
    ValidationUtils.setError(confirmPassword, "Konfirmasi password tidak boleh kosong");
    isValid = false;
  } else if (confirmPassword.value.trim() !== password.value.trim()) {
    ValidationUtils.setError(confirmPassword, "Konfirmasi password tidak cocok");
    isValid = false;
  } else {
    ValidationUtils.removeError(confirmPassword);
  }

  // Terms validation
  if (!terms.checked) {
    ValidationUtils.setError(terms, "Harus menyetujui syarat & ketentuan");
    isValid = false;
  } else {
    ValidationUtils.removeError(terms);
  }

  return isValid;
}

// Add real-time validation listeners
document.addEventListener('DOMContentLoaded', function() {
  // Login form real-time validation
  const loginEmail = document.getElementById("login-email");
  const loginPassword = document.getElementById("login-password");

  if (loginEmail) {
    loginEmail.addEventListener('input', function() {
      if (!this.value.trim()) {
        ValidationUtils.setError(this, "Email tidak boleh kosong");
      } else if (!ValidationUtils.isValidEmail(this.value.trim())) {
        ValidationUtils.setError(this, "Format email tidak valid");
      } else {
        ValidationUtils.removeError(this);
      }
    });
  }

  if (loginPassword) {
    loginPassword.addEventListener('input', function() {
      if (!this.value.trim()) {
        ValidationUtils.setError(this, "Password tidak boleh kosong");
      } else if (this.value.length < 8) {
        ValidationUtils.setError(this, "Password minimal 8 karakter");
      } else {
        ValidationUtils.removeError(this);
      }
    });
  }

  // Signup form real-time validation
  const signupInputs = {
    fullName: ValidationUtils.isValidName,
    userName: ValidationUtils.isValidUsername,
    email: ValidationUtils.isValidEmail,
    phone: ValidationUtils.isValidPhone,
    password: ValidationUtils.isValidPassword
  };

  Object.entries(signupInputs).forEach(([id, validator]) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', function() {
        if (!this.value.trim()) {
          ValidationUtils.setError(this, `${this.name} tidak boleh kosong`);
        } else if (!validator(this.value.trim())) {
          ValidationUtils.setError(this, `Format ${this.name} tidak valid`);
        } else {
          ValidationUtils.removeError(this);
        }
      });
    }
  });

  // Confirm password real-time validation
  const confirmPassword = document.getElementById("confirmPassword");
  const password = document.getElementById("password");
  
  if (confirmPassword && password) {
    confirmPassword.addEventListener('input', function() {
      if (!this.value.trim()) {
        ValidationUtils.setError(this, "Konfirmasi password tidak boleh kosong");
      } else if (this.value.trim() !== password.value.trim()) {
        ValidationUtils.setError(this, "Konfirmasi password tidak cocok");
      } else {
        ValidationUtils.removeError(this);
      }
    });
  }
});
