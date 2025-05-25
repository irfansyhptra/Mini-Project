// Import validation utilities
const {
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
    validateLoginForm
} = window.ValidationUtils;

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    if (!validateLoginForm()) {
        return;
    }

    const submitButton = event.target.querySelector('button[type="submit"]');
    showLoading(submitButton);

    try {
        const formData = {
            usernameOrEmail: document.getElementById('username').value.trim(),
            password: document.getElementById('password').value
        };

        logApiRequest('/login', formData);

        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        logApiResponse(response, data);

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Store token and user data
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));

        showSuccess('Login successful!');
        window.location.href = '/dashboard.html';
    } catch (error) {
        logApiError(error, 'Login');
        showError(handleApiError(error));
    } finally {
        hideLoading(submitButton);
    }
}

// Add event listener when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}); 