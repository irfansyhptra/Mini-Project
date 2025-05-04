// Toggle Sidebar
document.getElementById('menu-toggle').addEventListener('click', function() {
    console.log('Sidebar toggled');
    document.querySelector('.sidebar').classList.toggle('active');
});

// Edit Profile Button
document.getElementById('edit-profile').addEventListener('click', function() {
    alert('Edit Profil: Formulir pengeditan profil akan muncul di sini.');
});

// Change Photo Button
document.getElementById('change-photo').addEventListener('click', function() {
    console.log('Change photo button clicked');
    document.getElementById('upload-photo').click();
});

// Upload Photo
document.getElementById('upload-photo').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            console.log('Photo uploaded');
            document.getElementById('profile-image').src = event.target.result;
            document.getElementById('profile-image-main').src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Edit Username Form
document.getElementById('edit-username-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const newUsername = document.getElementById('new-username').value;
    console.log('Username changed to:', newUsername);
    document.getElementById('username').textContent = newUsername;
    document.getElementById('username-main').textContent = newUsername;
    alert(`Username berhasil diubah menjadi: ${newUsername}`);
});

// Change Email Form
document.getElementById('change-email-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const newEmail = document.getElementById('new-email').value;
    console.log('Email changed to:', newEmail);
    alert(`Email berhasil diubah menjadi: ${newEmail}`);
});

// Change Password Form
document.getElementById('change-password-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const newPassword = document.getElementById('new-password').value;
    console.log('Password changed');
    alert(`Sandi berhasil diubah.`);
});

// Dashboard Button (Redirect to dashboardAdmin.html)
const dashboardLink = document.querySelector('.sidebar-menu a[href="#"]');
if (dashboardLink) {
    dashboardLink.addEventListener('click', function(e) {
        e.preventDefault(); // Mencegah perilaku default link
        console.log('Redirecting to dashboardAdmin.html');
        window.location.href = '../../index.html';
    });
} else {
    console.error('Dashboard link not found'); }