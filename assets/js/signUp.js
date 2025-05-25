// Import validation utilities
const Validation = window.ValidationUtils;

// API Configuration
const API_URL = 'https://back-end-eventory.vercel.app/api/Users/register';

// Validation functions
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password) {
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
}

function isValidPhone(phone) {
    return /^[0-9]{10,13}$/.test(phone);
}

function isValidUsername(username) {
    return /^[a-zA-Z0-9_]{4,}$/.test(username);
}

function isValidName(name) {
    return /^[a-zA-Z\s]{3,}$/.test(name);
}

// Form validation function
function validateSignupForm() {
    const fullName = document.getElementById('fullName');
    const userName = document.getElementById('userName');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    let isValid = true;

    // Validate full name
    if (!fullName.value.trim()) {
        fullName.nextElementSibling.textContent = 'Nama tidak boleh kosong';
        isValid = false;
    } else if (!isValidName(fullName.value.trim())) {
        fullName.nextElementSibling.textContent = 'Nama harus minimal 3 karakter dan hanya mengandung huruf';
        isValid = false;
    } else {
        fullName.nextElementSibling.textContent = '';
    }

    // Validate username
    if (!userName.value.trim()) {
        userName.nextElementSibling.textContent = 'Username tidak boleh kosong';
        isValid = false;
    } else if (!isValidUsername(userName.value.trim())) {
        userName.nextElementSibling.textContent = 'Username harus minimal 4 karakter dan hanya mengandung huruf, angka, dan underscore';
        isValid = false;
    } else {
        userName.nextElementSibling.textContent = '';
    }

    // Validate email
    if (!email.value.trim()) {
        email.nextElementSibling.textContent = 'Email tidak boleh kosong';
        isValid = false;
    } else if (!isValidEmail(email.value.trim())) {
        email.nextElementSibling.textContent = 'Email tidak valid';
        isValid = false;
    } else {
        email.nextElementSibling.textContent = '';
    }

    // Validate phone
    if (!phone.value.trim()) {
        phone.nextElementSibling.textContent = 'Nomor telepon tidak boleh kosong';
        isValid = false;
    } else if (!isValidPhone(phone.value.trim())) {
        phone.nextElementSibling.textContent = 'Nomor telepon harus 10-13 digit angka';
        isValid = false;
    } else {
        phone.nextElementSibling.textContent = '';
    }

    // Validate password
    if (!password.value.trim()) {
        password.nextElementSibling.textContent = 'Password tidak boleh kosong';
        isValid = false;
    } else if (!isValidPassword(password.value.trim())) {
        password.nextElementSibling.textContent = 'Password minimal 8 karakter dan mengandung huruf & angka';
        isValid = false;
    } else {
        password.nextElementSibling.textContent = '';
    }

    // Validate confirm password
    if (!confirmPassword.value.trim()) {
        confirmPassword.nextElementSibling.textContent = 'Konfirmasi password tidak boleh kosong';
        isValid = false;
    } else if (confirmPassword.value.trim() !== password.value.trim()) {
        confirmPassword.nextElementSibling.textContent = 'Konfirmasi password tidak cocok';
        isValid = false;
    } else {
        confirmPassword.nextElementSibling.textContent = '';
    }

    return isValid;
}

document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signup-form');
    const passwordToggles = document.querySelectorAll('.toggle-password');

    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            if (!validateSignupForm()) {
                return;
            }

            const submitButton = this.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Memproses...';
            }

            try {
                const requestData = {
                    fullName: document.getElementById('fullName').value.trim(),
                    userName: document.getElementById('userName').value.trim(),
                    email: document.getElementById('email').value.trim().toLowerCase(),
                    password: document.getElementById('password').value,
                    phone: document.getElementById('phone').value.trim(),
                    role: true
                };

                console.log('🌐 API Request:', {
                    endpoint: API_URL,
                    method: 'POST',
                    data: requestData
                });

                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                });

                const responseData = await response.json();

                if (!response.ok) {
                    throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
                }

                console.log('✅ API Response:', {
                    status: response.status,
                    statusText: response.statusText,
                    data: responseData
                });

                alert('Registration successful! Please login.');
                window.location.href = 'login.html';
            } catch (error) {
                console.error('❌ API Error:', {
                    context: 'Signup',
                    error: error
                });
                
                let errorMessage = 'Registration failed. Please try again.';
                if (error.message.includes('semua kolom harus di isii')) {
                    errorMessage = 'Mohon lengkapi semua field yang diperlukan.';
                } else if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
                    errorMessage = 'Terjadi masalah koneksi. Silakan coba lagi nanti.';
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                alert(errorMessage);
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Daftar';
                }
            }
        });
    }

    // Add password toggle functionality
    if (passwordToggles.length > 0) {
        passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', function() {
                const input = this.previousElementSibling;
                if (input) {
                    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                    input.setAttribute('type', type);
                    const icon = this.querySelector('i');
                    if (icon) {
                        icon.classList.toggle('fa-eye');
                        icon.classList.toggle('fa-eye-slash');
                    }
                }
            });
        });
    }

    // Add real-time validation
    const inputs = {
        fullName: isValidName,
        userName: isValidUsername,
        email: isValidEmail,
        phone: isValidPhone,
        password: isValidPassword
    };

    Object.entries(inputs).forEach(([id, validator]) => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', function() {
                if (!this.value.trim()) {
                    this.nextElementSibling.textContent = '';
                } else if (!validator(this.value.trim())) {
                    this.nextElementSibling.textContent = `Format ${this.name || id} tidak valid`;
                } else {
                    this.nextElementSibling.textContent = '';
                }
            });
        }
    });

    // Add real-time confirm password validation
    const confirmPassword = document.getElementById('confirmPassword');
    const password = document.getElementById('password');
    
    if (confirmPassword && password) {
        confirmPassword.addEventListener('input', function() {
            if (!this.value.trim()) {
                this.nextElementSibling.textContent = '';
            } else if (this.value.trim() !== password.value.trim()) {
                this.nextElementSibling.textContent = 'Konfirmasi password tidak cocok';
            } else {
                this.nextElementSibling.textContent = '';
            }
        });
    }
});
