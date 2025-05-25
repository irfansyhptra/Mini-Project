// Constants
const API_BASE_URL = 'https://back-end-eventory.vercel.app/api/Users';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'currentUser';

// Console logging utility
const logApiRequest = (endpoint, data) => {
    console.group('🌐 API Request');
    console.log('Endpoint:', `${API_BASE_URL}${endpoint}`);
    console.log('Method:', 'POST');
    console.log('Request Data:', data);
    console.groupEnd();
};

const logApiResponse = (response, data) => {
    console.group('✅ API Response');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Response Data:', data);
    console.groupEnd();
};

const logApiError = (error, context) => {
    console.group('❌ API Error');
    console.log('Context:', context);
    console.log('Error:', error);
    if (error.response) {
        console.log('Response Status:', error.response.status);
        console.log('Response Data:', error.response.data);
    }
    console.groupEnd();
};

// Utility functions
const showLoading = (button) => {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.textContent = 'Memproses...';
};

const hideLoading = (button) => {
    button.disabled = false;
    button.textContent = button.dataset.originalText;
};

const showError = (message) => {
    console.error('❌ Error:', message);
    alert(message);
};

const showSuccess = (message) => {
    console.log('✅ Success:', message);
    alert(message);
};

const handleApiError = (error) => {
    console.error('API Error:', error);
    if (error.response) {
        return error.response.data?.message || 'Terjadi kesalahan pada server';
    }
    return 'Terjadi kesalahan koneksi ke server';
};

// Validation functions
const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePhone = (phone) => {
    return /^[0-9]{10,13}$/.test(phone);
};

const validatePassword = (password) => {
    return password.length >= 6;
};

const validateUsername = (username) => {
    return username.length >= 4;
};

const validateName = (name) => {
    return name.length >= 3;
};

// Form validation functions
function validateLoginForm() {
    const usernameOrEmail = document.getElementById('username')?.value?.trim();
    const password = document.getElementById('password')?.value;

    if (!usernameOrEmail || !password) {
        showError('Mohon masukkan username/email dan password.');
        return false;
    }

    return true;
}

function validateSignupForm() {
    const formData = {
        fullName: document.getElementById('fullName')?.value?.trim(),
        userName: document.getElementById('userName')?.value?.trim(),
        email: document.getElementById('email')?.value?.trim(),
        password: document.getElementById('password')?.value,
        confirmPassword: document.getElementById('confirmPassword')?.value,
        phone: document.getElementById('phone')?.value?.trim(),
        role: "true"
    };

    // Validate required fields
    const requiredFields = ['fullName', 'userName', 'email', 'password', 'confirmPassword', 'phone'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
        showError('Mohon lengkapi semua field yang diperlukan.');
        return false;
    }

    // Validate name
    if (!validateName(formData.fullName)) {
        showError('Nama harus minimal 3 karakter.');
        return false;
    }

    // Validate username
    if (!validateUsername(formData.userName)) {
        showError('Username harus minimal 4 karakter.');
        return false;
    }

    // Validate email
    if (!validateEmail(formData.email)) {
        showError('Format email tidak valid.');
        return false;
    }

    // Validate phone
    if (!validatePhone(formData.phone)) {
        showError('Nomor telepon harus 10-13 digit angka.');
        return false;
    }

    // Validate password
    if (!validatePassword(formData.password)) {
        showError('Password harus minimal 6 karakter.');
        return false;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
        showError('Kata sandi tidak cocok.');
        return false;
    }

    return true;
}

// Export functions and constants
window.ValidationUtils = {
    API_BASE_URL,
    TOKEN_KEY,
    USER_KEY,
    logApiRequest,
    logApiResponse,
    logApiError,
    showLoading,
    hideLoading,
    showError,
    showSuccess,
    handleApiError,
    validateEmail,
    validatePhone,
    validatePassword,
    validateUsername,
    validateName,
    validateLoginForm,
    validateSignupForm
};
