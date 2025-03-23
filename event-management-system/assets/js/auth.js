document.addEventListener('DOMContentLoaded', function () {
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

    // Login form validation and submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const userRole = document.getElementById('userRole').value; // Get selected user role

            // Simple validation
            if (!email || !password) {
                alert('Please fill in all fields');
                return;
            }

            let redirectUrl;
            if (userRole === 'admin') {
                redirectUrl = '../pages/admin/dashboardAdmin.html'; // Redirect to admin dashboard
            } else if (userRole === 'pengguna') {
                redirectUrl = '../pages/user/dashboardUser.html'; // Redirect to user dashboard

                // Simpan user ke daftar di localStorage (hanya jika user baru)
                let users = JSON.parse(localStorage.getItem("users")) || [];
                if (!users.some(user => user.email === email)) {
                    users.push({ email, role: "User" });
                    localStorage.setItem("users", JSON.stringify(users));
                }
            }

            console.log('Login attempt with:', { email, password });

            // Simulate successful login and redirect
            alert('Login successful! Redirecting to dashboard...');
            window.location.href = redirectUrl; // Redirect based on user role
        });
    }
});
