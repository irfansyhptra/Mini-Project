// Import validation utilities
const Validation = window.ValidationUtils;

// Handle signup form submission
async function handleSignup(event) {
    event.preventDefault();
    
    const formData = Validation.validateSignupForm();
    if (!formData) {
        return;
    }

    const submitButton = event.target.querySelector('button[type="submit"]');
    if (submitButton) {
        Validation.showLoading(submitButton);
    }

    try {
        // Format the request data according to API requirements
        const requestData = {
            fullName: formData.fullName,
            userName: formData.userName,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            role: true // Convert to boolean as required by API
        };

        Validation.logApiRequest('/register', requestData);

        const response = await fetch(`${Validation.API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            body: JSON.stringify(requestData)
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
