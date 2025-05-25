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

        console.log('🌐 API Request:', {
            endpoint: 'https://back-end-eventory.vercel.app/api/Users/register',
            method: 'POST',
            data: requestData
        });

        const response = await fetch('https://back-end-eventory.vercel.app/api/Users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            body: JSON.stringify(requestData)
        });

        const data = await response.json();
        console.log('✅ API Response:', {
            status: response.status,
            statusText: response.statusText,
            data: data
        });

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        alert('Registration successful! Please login.');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('❌ API Error:', {
            context: 'Signup',
            error: error
        });
        alert(error.message || 'Registration failed. Please try again.');
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = submitButton.dataset.originalText;
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
