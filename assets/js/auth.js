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

    // Register API
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get data from form
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const userName = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const no_hp = document.getElementById('phone').value;
        const role = document.getElementById('userRole').value; // Keep this if role selection is still needed for registration
        const passw = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validate required fields
        if (!firstName || !userName || !email || !passw || !confirmPassword) {
            alert('Mohon lengkapi semua field yang diperlukan.');
            return;
        }

        // Validate password match
        if (passw !== confirmPassword) {
            alert('Kata sandi tidak cocok.');
            return;
        }

        // Create request body
        const requestBody = {
            firstName,
            lastName,
            userName,
            email,
            no_hp,
            role,
            passw,
            count_event: 0
        };

        try {
            // Show loading indicator
            const submitButton = registerForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Memproses...';

            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();

            if (response.ok) {
                alert('Registrasi berhasil! Silahkan login.');
                window.location.href = '/event-management-system/pages/login.html';
            } else {
                alert(result.message || 'Registrasi gagal.');
            }
        } catch (err) {
            console.error('Error saat register:', err);
            alert('Terjadi kesalahan koneksi ke server.');
        } finally {
            // Restore button state
            const submitButton = registerForm.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.textContent = 'Register';
        }
    });
}

    // Login API
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Login form submitted'); // Debug log

        const userName = document.getElementById('username').value;
        const passw = document.getElementById('password').value;

        // Validate fields
        if (!userName || !passw) {
            alert('Mohon masukkan username dan password.');
            return;
        }

        try {
            // Show loading indicator
            const submitButton = loginForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Memproses...';

            console.log('Sending login request with:', { userName, passw }); // Debug log
            
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // ini WAJIB untuk cookie
                body: JSON.stringify({ userName, passw })
            });

            console.log('Response status:', response.status); // Debug log
            
            const result = await response.json();
            console.log('Response data:', result); // Debug log

            if (response.ok && result.data) {
                // Store user data in localStorage for session management
                // Changed from 'user' to 'currentUser' to match dashboardUser.js
                localStorage.setItem('currentUser', JSON.stringify({
                    id: result.data.id,
                    userName: result.data.userName,
                    firstName: result.data.firstName || '',
                    lastName: result.data.lastName || '',
                    role: result.data.role
                }));

                alert('Login berhasil!');

                // Redirect based on role to the correct URL
                if (result.data.role === 'admin') {
                    window.location.href = '/pages/admin/dashboardAdmin.html';
                } else {
                    // For regular users or any other role
                    window.location.href = '/pages/user/dashboardUser.html';
                }
            } else {
                alert(result.message || 'Login gagal. Cek kembali username dan password.');
            }
        } catch (err) {
            console.error('Error saat login:', err);
            alert('Terjadi kesalahan koneksi ke server. Pastikan server berjalan di port 3000.');
        } finally {
            // Restore button state
            const submitButton = loginForm.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.textContent = 'Login';
        }
    });
}
});