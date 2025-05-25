// Import validation utilities
const Validation = window.ValidationUtils;

// Handle signup form submission
async function handleSignup(event) {
    event.preventDefault();
    
    if (!Validation.validateSignupForm()) {
        return;
    }

    const submitButton = event.target.querySelector('button[type="submit"]');
    if (submitButton) {
        Validation.showLoading(submitButton);
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

        Validation.logApiRequest('/register', formData);

        const response = await fetch(`${Validation.API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        Validation.logApiResponse(response, data);

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        Validation.showSuccess('Registration successful! Please login.');
        window.location.href = 'login.html';
    } catch (error) {
        Validation.logApiError(error, 'Signup');
        Validation.showError(Validation.handleApiError(error));
    } finally {
        if (submitButton) {
            Validation.hideLoading(submitButton);
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
