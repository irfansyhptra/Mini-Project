// Constants
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'currentUser';

// Utility functions
function setError(input, message) {
    const formGroup = input.closest('.form-group');
    if (!formGroup) return;

    let error = formGroup.querySelector('.error-message');
    if (!error) {
        error = document.createElement('div');
        error.className = 'error-message';
        formGroup.appendChild(error);
    }

    error.textContent = message;
    error.style.color = '#ff4444';
    error.style.fontSize = '12px';
    error.style.marginTop = '8px';
    error.style.display = 'block';
}

function removeError(input) {
    const formGroup = input.closest('.form-group');
    if (!formGroup) return;

    const error = formGroup.querySelector('.error-message');
    if (error) {
        error.textContent = '';
        error.style.display = 'none';
    }
}

// Validation functions
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^[0-9]{10,13}$/.test(phone);
}

function validatePassword(password) {
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
}

function validateUsername(username) {
    return /^[a-zA-Z0-9_]{4,}$/.test(username);
}

function validateName(name) {
    return /^[a-zA-Z\s]{3,}$/.test(name);
}

// Form validation functions
function validateLoginForm() {
    const usernameOrEmail = document.getElementById('username');
    const password = document.getElementById('password');
    let isValid = true;

    if (!usernameOrEmail.value.trim()) {
        setError(usernameOrEmail, 'Username/Email tidak boleh kosong');
        isValid = false;
    } else {
        removeError(usernameOrEmail);
    }

    if (!password.value.trim()) {
        setError(password, 'Password tidak boleh kosong');
        isValid = false;
    } else if (password.value.length < 6) {
        setError(password, 'Password minimal 6 karakter');
        isValid = false;
    } else {
        removeError(password);
    }

    return isValid;
}

function validateSignupForm() {
    const fullName = document.getElementById('fullName');
    const userName = document.getElementById('userName');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const terms = document.getElementById('terms');
    let isValid = true;

    // Validate full name
    if (!fullName.value.trim()) {
        setError(fullName, 'Nama tidak boleh kosong');
        isValid = false;
    } else if (!validateName(fullName.value.trim())) {
        setError(fullName, 'Nama harus minimal 3 karakter dan hanya mengandung huruf');
        isValid = false;
    } else {
        removeError(fullName);
    }

    // Validate username
    if (!userName.value.trim()) {
        setError(userName, 'Username tidak boleh kosong');
        isValid = false;
    } else if (!validateUsername(userName.value.trim())) {
        setError(userName, 'Username harus minimal 4 karakter dan hanya mengandung huruf, angka, dan underscore');
        isValid = false;
    } else {
        removeError(userName);
    }

    // Validate email
    if (!email.value.trim()) {
        setError(email, 'Email tidak boleh kosong');
        isValid = false;
    } else if (!validateEmail(email.value.trim())) {
        setError(email, 'Format email tidak valid');
        isValid = false;
    } else {
        removeError(email);
    }

    // Validate phone
    if (!phone.value.trim()) {
        setError(phone, 'Nomor telepon tidak boleh kosong');
        isValid = false;
    } else if (!validatePhone(phone.value.trim())) {
        setError(phone, 'Nomor telepon harus 10-13 digit angka');
        isValid = false;
    } else {
        removeError(phone);
    }

    // Validate password
    if (!password.value.trim()) {
        setError(password, 'Password tidak boleh kosong');
        isValid = false;
    } else if (!validatePassword(password.value.trim())) {
        setError(password, 'Password harus minimal 8 karakter dan mengandung huruf & angka');
        isValid = false;
    } else {
        removeError(password);
    }

    // Validate confirm password
    if (!confirmPassword.value.trim()) {
        setError(confirmPassword, 'Konfirmasi password tidak boleh kosong');
        isValid = false;
    } else if (confirmPassword.value.trim() !== password.value.trim()) {
        setError(confirmPassword, 'Konfirmasi password tidak cocok');
        isValid = false;
    } else {
        removeError(confirmPassword);
    }

    // Validate terms
    if (!terms.checked) {
        setError(terms, 'Harus menyetujui syarat & ketentuan');
        isValid = false;
    } else {
        removeError(terms);
    }

    return isValid;
}

// Export functions
window.ValidationUtils = {
    TOKEN_KEY,
    USER_KEY,
    setError,
    removeError,
    validateEmail,
    validatePhone,
    validatePassword,
    validateUsername,
    validateName,
    validateLoginForm,
    validateSignupForm
};
