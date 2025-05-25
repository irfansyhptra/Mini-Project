// Import validation utilities
const Validation = window.ValidationUtils;

// API Configuration
const API_CONFIG = {
    BASE_URL: 'https://back-end-eventory.vercel.app/api',
    ENDPOINTS: {
        REGISTER: '/Users/register'
    },
    PROXY_URL: 'https://corsproxy.io/?'
};

document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signup-form');
    const passwordToggles = document.querySelectorAll('.toggle-password');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Clear previous error messages
            document.querySelectorAll('.error-message').forEach(el => {
                el.textContent = '';
                el.style.display = 'none';
            });

            if (!Validation.validateSignupForm()) {
                return;
            }

            const submitButton = this.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Memproses...';
            }

            try {
                // Format request data according to API requirements
                const requestData = {
                    fullName: document.getElementById('fullName')?.value?.trim() || '',
                    userName: document.getElementById('userName')?.value?.trim() || '',
                    email: document.getElementById('email')?.value?.trim()?.toLowerCase() || '',
                    password: document.getElementById('password')?.value || '',
                    phone: document.getElementById('phone')?.value?.trim() || '',
                    role: true
                };

                // Validate required fields
                const requiredFields = ['fullName', 'userName', 'email', 'password', 'phone'];
                const missingFields = requiredFields.filter(field => !requestData[field]);
                
                if (missingFields.length > 0) {
                    throw new Error(`Mohon lengkapi field: ${missingFields.join(', ')}`);
                }

                const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`;
                console.log('🌐 API Request:', {
                    endpoint: apiUrl,
                    method: 'POST',
                    data: requestData
                });

                // Try with CORS proxy
                const proxyUrl = `${API_CONFIG.PROXY_URL}${encodeURIComponent(apiUrl)}`;
                const proxyResponse = await fetch(proxyUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                });

                let responseData;
                try {
                    responseData = await proxyResponse.json();
                } catch (jsonError) {
                    console.error('Failed to parse JSON response:', jsonError);
                    throw new Error('Invalid response from server');
                }

                if (!proxyResponse.ok) {
                    // Handle specific error messages
                    if (proxyResponse.status === 400) {
                        if (responseData.message) {
                            throw new Error(responseData.message);
                        } else if (responseData.errors) {
                            const errorMessages = Object.values(responseData.errors).flat();
                            throw new Error(errorMessages.join(', '));
                        }
                    }
                    throw new Error(`HTTP error! status: ${proxyResponse.status}`);
                }

                console.log('✅ API Response:', {
                    status: proxyResponse.status,
                    statusText: proxyResponse.statusText,
                    data: responseData
                });

                alert('Registration successful! Please login.');
                window.location.href = 'login.html';
            } catch (error) {
                console.error('❌ API Error:', {
                    context: 'Signup',
                    error: error
                });
                
                // Handle specific error messages
                let errorMessage = 'Registration failed. Please try again.';
                if (error.message.includes('semua kolom harus di isii')) {
                    errorMessage = 'Mohon lengkapi semua field yang diperlukan.';
                } else if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
                    errorMessage = 'Terjadi masalah koneksi. Silakan coba lagi nanti.';
                } else if (error.message.includes('Invalid response')) {
                    errorMessage = 'Terjadi kesalahan pada server. Silakan coba lagi nanti.';
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

    // Add real-time validation for password
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            if (!this.value.trim()) {
                Validation.removeError(this);
            } else if (!Validation.validatePassword(this.value.trim())) {
                Validation.setError(this, 'Password minimal 8 karakter dan mengandung huruf & angka');
            } else {
                Validation.removeError(this);
            }

            // Check confirm password if it exists and has content
            if (confirmPasswordInput && confirmPasswordInput.value.trim()) {
                if (confirmPasswordInput.value.trim() !== this.value.trim()) {
                    Validation.setError(confirmPasswordInput, 'Konfirmasi password tidak cocok');
                } else {
                    Validation.removeError(confirmPasswordInput);
                }
            }
        });
    }

    // Add real-time validation for confirm password
    if (confirmPasswordInput && passwordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            if (!this.value.trim()) {
                Validation.removeError(this);
            } else if (this.value.trim() !== passwordInput.value.trim()) {
                Validation.setError(this, 'Konfirmasi password tidak cocok');
            } else {
                Validation.removeError(this);
            }
        });
    }

    // Add real-time validation for other fields
    const inputs = {
        fullName: Validation.validateName,
        userName: Validation.validateUsername,
        email: Validation.validateEmail,
        phone: Validation.validatePhone
    };

    Object.entries(inputs).forEach(([id, validator]) => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', function() {
                if (!this.value.trim()) {
                    Validation.removeError(this);
                } else if (!validator(this.value.trim())) {
                    Validation.setError(this, `Format ${this.name || id} tidak valid`);
                } else {
                    Validation.removeError(this);
                }
            });
        }
    });
});
