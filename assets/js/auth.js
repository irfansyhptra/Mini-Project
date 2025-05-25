document.addEventListener('DOMContentLoaded', function () {
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
                role: document.getElementById('userRole')?.value || 'true'
            };

            console.log('📝 Registration Form Data:', formData);

            // Validate required fields
            const requiredFields = ['fullName', 'userName', 'email', 'password', 'confirmPassword', 'phone'];
            const missingFields = requiredFields.filter(field => !formData[field]);
            
            if (missingFields.length > 0) {
                console.warn('⚠️ Missing Required Fields:', missingFields);
                showError('Mohon lengkapi semua field yang diperlukan.');
                return;
            }

            // Validate password match
            if (formData.password !== formData.confirmPassword) {
                console.warn('⚠️ Password Mismatch');
                showError('Kata sandi tidak cocok.');
                return;
            }

            const submitButton = registerForm.querySelector('button[type="submit"]');
            try {
                showLoading(submitButton);
                logApiRequest('/register', formData);

                const response = await fetch(`${API_BASE_URL}/register`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                logApiResponse(response, result);

                if (response.ok) {
                    showSuccess('Registrasi berhasil! Silahkan login.');
                    window.location.href = '/event-management-system/pages/login.html';
                } else {
                    showError(result.message || 'Registrasi gagal. Silahkan coba lagi.');
                }
            } catch (error) {
                logApiError(error, 'Registration');
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

            console.log('🔑 Login Attempt:', { usernameOrEmail });

            // Validate fields
            if (!usernameOrEmail || !password) {
                console.warn('⚠️ Missing Login Credentials');
                showError('Mohon masukkan username/email dan password.');
                return;
            }

            // Determine if input is email or username
            const isEmail = usernameOrEmail.includes('@');
            const formData = {
                [isEmail ? 'email' : 'userName']: usernameOrEmail,
                password: password
            };

            console.log('📝 Login Form Data:', formData);

            const submitButton = loginForm.querySelector('button[type="submit"]');
            try {
                showLoading(submitButton);
                logApiRequest('/login', formData);

                const response = await fetch(`${API_BASE_URL}/login`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Origin': window.location.origin
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                logApiResponse(response, result);

                if (response.ok && result.data) {
                    // Store auth token
                    if (result.token) {
                        localStorage.setItem(TOKEN_KEY, result.token);
                        console.log('🔐 Token Stored');
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
                    console.log('👤 User Data Stored:', userData);

                    showSuccess('Login berhasil!');

                    // Redirect based on role
                    const redirectPath = result.data.role === 'admin' 
                        ? '/pages/admin/dashboardAdmin.html'
                        : '/pages/user/dashboardUser.html';
                    
                    console.log('🔄 Redirecting to:', redirectPath);
                    window.location.href = redirectPath;
                } else {
                    showError(result.message || 'Login gagal. Cek kembali username/email dan password.');
                }
            } catch (error) {
                logApiError(error, 'Login');
                showError(handleApiError(error));
            } finally {
                hideLoading(submitButton);
            }
        });
    }

    // Logout function
    window.logout = function() {
        console.log('🚪 Logging out user');
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        console.log('🧹 Cleared user data and token');
        window.location.href = '/pages/login.html';
    };

    // Check authentication status
    window.checkAuth = function() {
        const token = localStorage.getItem(TOKEN_KEY);
        const user = localStorage.getItem(USER_KEY);
        const isAuthenticated = !!(token && user);
        console.log('🔒 Auth Status:', isAuthenticated);
        return isAuthenticated;
    };

    // Get current user
    window.getCurrentUser = function() {
        const userStr = localStorage.getItem(USER_KEY);
        const user = userStr ? JSON.parse(userStr) : null;
        console.log('👤 Current User:', user);
        return user;
    };
});