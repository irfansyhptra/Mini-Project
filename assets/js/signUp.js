// Import validation utilities
const {
    API_BASE_URL,
    logApiRequest,
    logApiResponse,
    logApiError,
    showLoading,
    hideLoading,
    showError,
    showSuccess,
    handleApiError,
    validateSignupForm
} = window.ValidationUtils;

// Handle signup form submission
async function handleSignup(event) {
    event.preventDefault();
    
    if (!validateSignupForm()) {
        return;
    }

    const submitButton = event.target.querySelector('button[type="submit"]');
    if (submitButton) {
        showLoading(submitButton);
    }

    try {
        const formData = {
            fullName: document.getElementById('fullName').value.trim(),
            userName: document.getElementById('userName').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
            phone: document.getElementById('phone').value.trim(),
            role: "true"
        };

        logApiRequest('/register', formData);

        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        logApiResponse(response, data);

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        showSuccess('Registration successful! Please login.');
        window.location.href = 'login.html';
    } catch (error) {
        logApiError(error, 'Signup');
        showError(handleApiError(error));
    } finally {
        if (submitButton) {
            hideLoading(submitButton);
        }
    }
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    // Add password toggle functionality
    const passwordToggles = document.querySelectorAll('.toggle-password');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    });
});
