document.addEventListener('DOMContentLoaded', function () {
    // Constants
    const API_BASE_URL = 'https://back-end-eventory.vercel.app/api/Users';
    const TOKEN_KEY = 'auth_token';
    const USER_KEY = 'currentUser';

    // Toggle password visibility
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function () {
            const passwordField = this.previousElementSibling;
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);
            
            // Toggle eye icon
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    });

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
        alert(message);
    };

    const showSuccess = (message) => {
        alert(message);
    };

    const handleApiError = (error) => {
        console.error('API Error:', error);
        if (error.response) {
            return error.response.data?.message || 'Terjadi kesalahan pada server';
        }
        return 'Terjadi kesalahan koneksi ke server';
    };

    // Register API
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Get form data with the new format
            const formData = {
                fullName: document.getElementById('fullName')?.value,
                userName: document.getElementById('userName')?.value,
                email: document.getElementById('email')?.value,
                password: document.getElementById('password')?.value,
                confirmPassword: document.getElementById('confirmPassword')?.value,
                phone: document.getElementById('phone')?.value,
                role: document.getElementById('userRole')?.value || 'true' // Default to true for regular users
            };

            // Validate required fields
            const requiredFields = ['fullName', 'userName', 'email', 'password', 'confirmPassword', 'phone'];
            const missingFields = requiredFields.filter(field => !formData[field]);
            
            if (missingFields.length > 0) {
                showError('Mohon lengkapi semua field yang diperlukan.');
                return;
            }

            // Validate password match
            if (formData.password !== formData.confirmPassword) {
                showError('Kata sandi tidak cocok.');
                return;
            }

            const submitButton = registerForm.querySelector('button[type="submit"]');
            try {
                showLoading(submitButton);

                const response = await fetch(`${API_BASE_URL}/register`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok) {
                    showSuccess('Registrasi berhasil! Silahkan login.');
                    window.location.href = '/event-management-system/pages/login.html';
                } else {
                    showError(result.message || 'Registrasi gagal. Silahkan coba lagi.');
                }
            } catch (error) {
                showError(handleApiError(error));
            } finally {
                hideLoading(submitButton);
            }
        });
    }

    // Login API
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Get login credentials (username/email and password)
            const usernameOrEmail = document.getElementById('username')?.value;
            const password = document.getElementById('password')?.value;

            // Validate fields
            if (!usernameOrEmail || !password) {
                showError('Mohon masukkan username/email dan password.');
                return;
            }

            // Determine if input is email or username
            const isEmail = usernameOrEmail.includes('@');
            const formData = {
                [isEmail ? 'email' : 'userName']: usernameOrEmail,
                password: password
            };

            const submitButton = loginForm.querySelector('button[type="submit"]');
            try {
                showLoading(submitButton);

                const response = await fetch(`${API_BASE_URL}/login`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok && result.data) {
                    // Store auth token
                    if (result.token) {
                        localStorage.setItem(TOKEN_KEY, result.token);
                    }

                    // Store user data
                    const userData = {
                        id: result.data.id,
                        userName: result.data.userName,
                        fullName: result.data.fullName || '',
                        email: result.data.email,
                        phone: result.data.phone,
                        role: result.data.role
                    };
                    localStorage.setItem(USER_KEY, JSON.stringify(userData));

                    showSuccess('Login berhasil!');

                    // Redirect based on role
                    const redirectPath = result.data.role === 'admin' 
                        ? '/pages/admin/dashboardAdmin.html'
                        : '/pages/user/dashboardUser.html';
                    
                    window.location.href = redirectPath;
                } else {
                    showError(result.message || 'Login gagal. Cek kembali username/email dan password.');
                }
            } catch (error) {
                showError(handleApiError(error));
            } finally {
                hideLoading(submitButton);
            }
        });
    }

    // Logout function
    window.logout = function() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        window.location.href = '/pages/login.html';
    };

    // Check authentication status
    window.checkAuth = function() {
        const token = localStorage.getItem(TOKEN_KEY);
        const user = localStorage.getItem(USER_KEY);
        return !!(token && user);
    };

    // Get current user
    window.getCurrentUser = function() {
        const userStr = localStorage.getItem(USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    };
});