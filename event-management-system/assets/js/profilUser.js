document.addEventListener('DOMContentLoaded', () => {
    // Toggle content sections
    const menuItems = document.querySelectorAll('.menu li');
    const contentSections = document.querySelectorAll('.content-section');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all menu items
            menuItems.forEach(i => i.classList.remove('active'));
            // Hide all content sections
            contentSections.forEach(section => section.classList.remove('active'));

            // Add active class to the clicked menu item
            item.classList.add('active');
            // Show the corresponding content section
            const target = item.getAttribute('data-target');
            document.getElementById(target).classList.add('active');
        });
    });

    // Toggle password visibility
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', () => {
            const input = button.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            button.querySelector('i').classList.toggle('fa-eye');
            button.querySelector('i').classList.toggle('fa-eye-slash');
        });
    });

    // Save profile changes
    document.getElementById('save-profile-btn').addEventListener('click', () => {
        alert('Perubahan profil telah disimpan!');
    });

    // Change password
    document.getElementById('change-password-btn').addEventListener('click', () => {
        alert('Kata sandi telah diubah!');
    });

    // Save notification settings
    document.getElementById('save-notification-btn').addEventListener('click', () => {
        alert('Pengaturan notifikasi telah disimpan!');
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const menuItems = document.querySelectorAll('.menu li');
    const contentSections = document.querySelectorAll('.content-section');
    const profileImage = document.getElementById('profile-image');
    const avatarUpload = document.getElementById('avatar-upload');
    const displayNameElement = document.getElementById('display-name');
    const usernameElement = document.getElementById('username');
    const firstNameInput = document.getElementById('nama-depan');
    const lastNameInput = document.getElementById('nama-belakang');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('telepon');
    const bioInput = document.getElementById('bio');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const languageSelect = document.getElementById('language-select');

    // User data
    let userData = {
        firstName: 'Irfan',
        lastName: 'Syahputra',
        email: 'irfansyahputra@gmail.com',
        phone: '081234567890',
        bio: 'Mengubah momen biasa menjadi pengalaman luar biasa! Spesialis dalam menciptakan event yang tak terlupakan, dari konsep hingga eksekusi. Karena setiap acara bukan sekadar pertemuan, tetapi sebuah cerita yang harus dikenang.',
        username: 'IrfanOnTop',
        profileImage: '../../assets/image/dev1.jpg'
    };

    // Initialize the page
    function initPage() {
        // Set initial values
        displayNameElement.textContent = `${userData.firstName} ${userData.lastName}`;
        usernameElement.textContent = `@${userData.username}`;
        firstNameInput.value = userData.firstName;
        lastNameInput.value = userData.lastName;
        emailInput.value = userData.email;
        phoneInput.value = userData.phone;
        bioInput.value = userData.bio;
        profileImage.src = userData.profileImage;
    }

    // Toggle content sections
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            menuItems.forEach(i => i.classList.remove('active'));
            contentSections.forEach(section => section.classList.remove('active'));

            item.classList.add('active');
            const target = item.getAttribute('data-target');
            document.getElementById(target).classList.add('active');
        });
    });

    // Profile image upload
    avatarUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type.match('image.*')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    profileImage.src = event.target.result;
                    userData.profileImage = event.target.result;
                    showToast('Foto profil berhasil diubah!');
                };
                reader.readAsDataURL(file);
            } else {
                showToast('Hanya file gambar yang diizinkan', 'error');
            }
        }
    });

    // Save profile changes
    saveProfileBtn.addEventListener('click', () => {
        userData = {
            ...userData,
            firstName: firstNameInput.value,
            lastName: lastNameInput.value,
            email: emailInput.value,
            phone: phoneInput.value,
            bio: bioInput.value
        };

        displayNameElement.textContent = `${userData.firstName} ${userData.lastName}`;
        showToast('Perubahan profil berhasil disimpan!');
    });

    // Toggle password visibility
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', () => {
            const input = button.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            button.querySelector('i').classList.toggle('fa-eye');
            button.querySelector('i').classList.toggle('fa-eye-slash');
        });
    });

    // Change password
    document.getElementById('change-password-btn').addEventListener('click', () => {
        const oldPassword = document.getElementById('password-lama').value;
        const newPassword = document.getElementById('password-baru').value;
        const confirmPassword = document.getElementById('konfirmasi-password').value;

        if (!oldPassword || !newPassword || !confirmPassword) {
            showToast('Harap isi semua kolom password', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast('Password baru tidak cocok', 'error');
            return;
        }

        // In a real app, you would send this to the server
        showToast('Password berhasil diubah!');
        
        // Clear password fields
        document.getElementById('password-lama').value = '';
        document.getElementById('password-baru').value = '';
        document.getElementById('konfirmasi-password').value = '';
    });

    // Save notification settings
    document.getElementById('save-notification-btn').addEventListener('click', () => {
        showToast('Pengaturan notifikasi berhasil disimpan!');
    });

    // Dark mode toggle
    darkModeToggle.addEventListener('change', (e) => {
        document.body.classList.toggle('dark-mode', e.target.checked);
        localStorage.setItem('darkMode', e.target.checked);
        showToast(`Mode ${e.target.checked ? 'gelap' : 'terang'} diaktifkan`);
    });

    // Language select
    languageSelect.addEventListener('change', (e) => {
        showToast(`Bahasa diubah ke ${e.target.value === 'id' ? 'Indonesia' : 'English'}`);
    });

    // Logout button
    logoutBtn.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin keluar?')) {
            setTimeout(() => {
                window.location.href = 'index.html'; // Redirect to login page
            }, 1500);
        }
    });

    // Show toast notification
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }

    // Initialize the page
    initPage();
});