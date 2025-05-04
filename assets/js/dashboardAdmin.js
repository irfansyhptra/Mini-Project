// Add this to dashboardUser.js and dashboardAdmin.js
// document.addEventListener('DOMContentLoaded', function() {
//     // Check if user is logged in
//     const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
//     if (!currentUser) {
//         // If not logged in, redirect to login page
//         window.location.href = '/event-management-system/pages/login.html';
//         return;
//     }
    
//     // Update user info in the sidebar and header
//     const userNameElements = document.querySelectorAll('.user-name');
//     const userRoleElements = document.querySelectorAll('.user-role');
//     const userFullNameElements = document.querySelectorAll('.user-dropdown-toggle span');
    
//     userNameElements.forEach(element => {
//         element.textContent = currentUser.firstName || currentUser.userName;
//     });
    
//     userRoleElements.forEach(element => {
//         element.textContent = currentUser.role === 'admin' ? 'Administrator' : 'Pengguna';
//     });
    
//     userFullNameElements.forEach(element => {
//         element.textContent = `${currentUser.firstName} ${currentUser.lastName}`.trim() || currentUser.userName;
//     });
    
//     // Handle logout
//     const logoutButtons = document.querySelectorAll('.sidebar-footer a');
//     logoutButtons.forEach(button => {
//         button.addEventListener('click', function(e) {
//             e.preventDefault();
//             localStorage.removeItem('currentUser');
//             window.location.href = '/event-management-system/index.html';
//         });
//     });
// });


// Data Event
const events = [
    {
        id: 1,
        title: "Aceh Ramadhan Festival 2025",
        date: "12 Mar 2025, 15:00",
        location: "Jl. Moh. Jam No.1, Kp. Baru, Kec. Baiturrahman, Kota Banda Aceh, Aceh",
        category: "Festival",
        creator: "Dinas Kebudayaan dan Pariwisata Aceh",
        description: "2019, Pemerintah Aceh melalui Dinas Kebudayaan dan Pariwisata Aceh telah menyelenggarakan festival ini sebagai landmark event untuk menarik wisatawan, terutama para Muslim traveler. Pada 2025, festival ini hadir dengan konsep baru untuk memperkenalkan Aceh sebagai World's Best Halal Cultural Destination.",
        image: "/event-management-system/assets/image/event1.jpg",
        status: "verified"
    },
    {
        id: 2,
        title: "Aceh Culinary Festival",
        date: "10 Apr 2025, 10:00",
        location: "Taman Sulthanah Safiatuddin",
        category: "Kuliner",
        creator: "Dinas Pariwisata Aceh",
        description: "Festival kuliner yang menampilkan berbagai makanan khas Aceh.",
        image: "/event-management-system/assets/image/event2.jpg",
        status: "pending"
    },
    {
        id: 3,
        title: "Informatic Festival 2025",
        date: "15 May 2025, 09:00",
        location: "Universitas Syiah Kuala, Banda Aceh",
        category: "Teknologi",
        creator: "Fakultas Ilmu Komputer USK",
        description: "Festival tahunan yang menampilkan inovasi teknologi terbaru dari mahasiswa.",
        image: "/event-management-system/assets/image/event3.jpg",
        status: "verified"
    },
    {
        id: 4,
        title: "PILMIPA USK",
        date: "20 Jun 2025, 08:00",
        location: "Fakultas MIPA, Universitas Syiah Kuala",
        category: "Olimpiade",
        creator: "Fakultas MIPA USK",
        description: "Olimpiade sains tingkat nasional yang diadakan oleh Fakultas MIPA USK.",
        image: "/event-management-system/assets/image/event4.jpg",
        status: "verified"
    },
    {
        id: 5,
        title: "POM FMIPA USK",
        date: "25 Jul 2025, 14:00",
        location: "Fakultas MIPA, Universitas Syiah Kuala",
        category: "Olahraga",
        creator: "Fakultas MIPA USK",
        description: "Pekan Olahraga Mahasiswa FMIPA USK.",
        image: "/event-management-system/assets/image/event5.jpg",
        status: "pending"
    },
    {
        id: 6,
        title: "Festival Kupi",
        date: "30 Aug 2025, 10:00",
        location: "Banda Aceh, Aceh",
        category: "Festival",
        creator: "Komunitas Kopi Aceh",
        description: "Festival kopi yang menampilkan berbagai varian kopi khas Aceh.",
        image: "/event-management-system/assets/image/event6.jpg",
        status: "verified"
    },
    {
        id: 7,
        title: "Peringatan Tsunami Aceh",
        date: "26 Dec 2025, 08:00",
        location: "Museum Tsunami Aceh, Banda Aceh",
        category: "Peringatan",
        creator: "Pemerintah Aceh",
        description: "Acara peringatan tsunami Aceh untuk mengenang korban dan meningkatkan kesadaran bencana.",
        image: "/event-management-system/assets/image/event7.jpg",
        status: "verified"
    }
];

// DOM Elements
document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initProfileDropdown();
    initPasswordStrength();
    initFormSubmission();

    // Load events if on verify page
    if (window.location.hash === '#verify') {
        loadEvents();
    }
});

// Initialize navigation
function initNavigation() {
    const menuItems = document.querySelectorAll('.sidebar-menu ul li a');
    const contentPages = document.querySelectorAll('.content-page');
    const pageTitle = document.getElementById('page-title');

    menuItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();

            // Remove active class from all menu items
            menuItems.forEach(menuItem => {
                menuItem.parentElement.classList.remove('active');
            });

            // Add active class to clicked menu item
            this.parentElement.classList.add('active');

            // Get the target page id from href attribute
            const targetId = this.getAttribute('href').substring(1);

            // Update page title
            pageTitle.textContent = this.textContent.trim();

            // Hide all pages
            contentPages.forEach(page => {
                page.classList.remove('active');
            });

            // Show target page
            const targetPage = document.getElementById(targetId + '-page');
            if (targetPage) {
                targetPage.classList.add('active');

                // Load events if the target page is verify-page
                if (targetId === 'verify') {
                    loadEvents();
                }
            }
        });
    });
}

// Load events into the verify page
function loadEvents() {
    const tableBody = document.querySelector('#verify-page .data-table tbody');
    tableBody.innerHTML = '';

    events.forEach(event => {
        if (event.status === 'pending') {
            const newRow = document.createElement('tr');
            newRow.setAttribute('data-event-id', event.id);
            newRow.innerHTML = `
                <td>${event.title}</td>
                <td>${event.date}</td>
                <td>${event.location}</td>
                <td>${event.category}</td>
                <td>${event.creator}</td>
                <td>
                    <button class="btn btn-small btn-view" onclick="viewEventDetails(${event.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(newRow);
        }
    });
}

// Show event details in modal
function showEventDetails(eventId) {
    viewEventDetails(eventId);
}

function viewEventDetails(eventId) {
    const event = events.find(e => e.id === eventId);

    if (!event) {
        showNotification('Event tidak ditemukan!', 'error');
        return;
    }

    // Update modal content based on event
    document.getElementById('modal-event-title').textContent = event.title;
    document.getElementById('modal-event-status').innerHTML = `Status: <span class="${event.status === 'verified' ? 'verified' : 'pending'}">${event.status === 'verified' ? 'Terverifikasi' : 'Menunggu Verifikasi'}</span>`;
    document.getElementById('modal-event-datetime').textContent = event.date;
    document.getElementById('modal-event-location').textContent = event.location;
    document.getElementById('modal-event-category').textContent = event.category;
    document.getElementById('modal-event-creator').textContent = event.creator;
    document.getElementById('modal-event-description').textContent = event.description;

    // Display event actions based on status
    const modalActions = document.getElementById('modal-event-actions');

    if (event.status === 'pending') {
        modalActions.innerHTML = `
            <button class="btn btn-reject" onclick="rejectEvent(${event.id})">Reject</button>
            <button class="btn btn-approve" onclick="approveEvent(${event.id})">Approve</button>
        `;
    } else {
        modalActions.innerHTML = '';
    }

    // Show the modal
    document.getElementById('event-details-modal').style.display = 'block';
}

// Approve event
function approveEvent(eventId) {
    const event = events.find(e => e.id === eventId);

    if (!event) {
        showNotification('Event tidak ditemukan!', 'error');
        return;
    }

    // Show confirmation modal
    document.getElementById('confirmation-title').textContent = 'Konfirmasi Verifikasi';
    document.getElementById('confirmation-message').textContent = `Apakah Anda yakin ingin menyetujui event ini?`;

    const confirmBtn = document.getElementById('confirm-action-btn');
    confirmBtn.textContent = 'Ya, Setujui';
    confirmBtn.className = 'btn btn-approve';
    confirmBtn.onclick = function () {
        // Update event status
        event.status = 'verified';

        // Show notification
        showNotification('Event berhasil disetujui!', 'success');
        closeModal('confirmation-modal');
        closeModal('event-details-modal');

        // Update the event status in the UI (demo only)
        if (document.querySelector(`#verify-page tbody tr[data-event-id="${eventId}"]`)) {
            document.querySelector(`#verify-page tbody tr[data-event-id="${eventId}"]`).remove();
        }
    };

    document.getElementById('confirmation-modal').style.display = 'block';
}

// Reject event
function rejectEvent(eventId) {
    const event = events.find(e => e.id === eventId);

    if (!event) {
        showNotification('Event tidak ditemukan!', 'error');
        return;
    }

    // Show confirmation modal
    document.getElementById('confirmation-title').textContent = 'Konfirmasi Penolakan';
    document.getElementById('confirmation-message').textContent = `Apakah Anda yakin ingin menolak event ini?`;

    const confirmBtn = document.getElementById('confirm-action-btn');
    confirmBtn.textContent = 'Ya, Tolak';
    confirmBtn.className = 'btn btn-reject';
    confirmBtn.onclick = function () {
        // Update event status
        event.status = 'rejected';

        // Show notification
        showNotification('Event ditolak!', 'success');
        closeModal('confirmation-modal');
        closeModal('event-details-modal');

        // Update the event status in the UI (demo only)
        if (document.querySelector(`#verify-page tbody tr[data-event-id="${eventId}"]`)) {
            document.querySelector(`#verify-page tbody tr[data-event-id="${eventId}"]`).remove();
        }
    };

    document.getElementById('confirmation-modal').style.display = 'block';
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Notification system
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification-toast');
    const notificationIcon = document.getElementById('notification-icon');
    const notificationMessage = document.getElementById('notification-message');

    // Set icon based on type
    if (type === 'success') {
        notificationIcon.className = 'fas fa-check-circle';
    } else {
        notificationIcon.className = 'fas fa-exclamation-circle';
    }

    // Set message
    notificationMessage.textContent = message;

    // Show notification
    notification.classList.add('show');

    // Hide after 3 seconds
    setTimeout(() => {
        closeNotification();
    }, 3000);
}

function closeNotification() {
    const notification = document.getElementById('notification-toast');
    notification.classList.remove('show');
}

// Password strength checker
function initPasswordStrength() {
    const passwordInput = document.getElementById('password');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');

    if (passwordInput) {
        passwordInput.addEventListener('input', function () {
            const password = this.value;
            let strength = 0;

            if (password.length >= 8) strength += 25;
            if (password.match(/[a-z]+/)) strength += 25;
            if (password.match(/[A-Z]+/)) strength += 25;
            if (password.match(/[0-9]+/)) strength += 25;

            // Update the strength bar
            strengthBar.style.width = strength + '%';

            // Update color based on strength
            if (strength <= 25) {
                strengthBar.style.backgroundColor = '#e74a3b';
                strengthText.textContent = 'Weak';
            } else if (strength <= 50) {
                strengthBar.style.backgroundColor = '#f6c23e';
                strengthText.textContent = 'Medium';
            } else if (strength <= 75) {
                strengthBar.style.backgroundColor = '#36b9cc';
                strengthText.textContent = 'Good';
            } else {
                strengthBar.style.backgroundColor = '#1cc88a';
                strengthText.textContent = 'Strong';
            }
        });
    }
}

// Form submission
function initFormSubmission() {
    const userForm = document.getElementById('user-form');

    if (userForm) {
        userForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Basic form validation
            const nameInput = document.getElementById('nama');
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');

            if (!nameInput.value.trim()) {
                showNotification('Nama tidak boleh kosong!', 'error');
                return;
            }

            const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
            if (!emailPattern.test(emailInput.value)) {
                showNotification('Format email tidak valid!', 'error');
                return;
            }

            if (passwordInput && passwordInput.value.length < 8) {
                showNotification('Password minimal 8 karakter!', 'error');
                return;
            }

            // Create new user object
            const newUser = {
                id: Date.now(), // Generate unique ID
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                registrationDate: new Date().toLocaleDateString(),
                eventsCreated: 0,
                role: document.getElementById('role').value
            };

            // Add user to the table
            addUserToTable(newUser);

            // Show success notification
            showNotification('User berhasil disimpan!', 'success');

            // Reset form
            this.reset();
            document.querySelector('.strength-bar').style.width = '0%';
            document.querySelector('.strength-text').textContent = 'Password strength';
        });
    }
}

// Add user to the table
function addUserToTable(user) {
    const tableBody = document.querySelector('#users-page .data-table tbody');

    // Create new row
    const newRow = document.createElement('tr');
    newRow.setAttribute('data-user-id', user.id); // Set unique ID for the row
    newRow.innerHTML = `
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.registrationDate}</td>
        <td>${user.eventsCreated}</td>
        <td>
            <button class="btn btn-small btn-edit" onclick="editUser(${user.id})">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-small btn-delete" onclick="deleteUser(${user.id})">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;

    // Append row to the table
    tableBody.appendChild(newRow);
}

// Initialize profile dropdown
function initProfileDropdown() {
    const profileInfo = document.querySelector('.profile-info');
    const profileDropdown = document.querySelector('.profile-dropdown');

    if (profileInfo) {
        profileInfo.addEventListener('click', function () {
            profileDropdown.classList.toggle('show');
        });
    }

    // Close dropdown when clicking outside
    window.addEventListener('click', function (e) {
        if (!e.target.matches('.profile-info')) {
            if (profileDropdown.classList.contains('show')) {
                profileDropdown.classList.remove('show');
            }
        }
    });
}

// Show add user form
function showAddUserForm() {
    // Hide all pages
    const contentPages = document.querySelectorAll('.content-page');
    contentPages.forEach(page => {
        page.classList.remove('active');
    });

    // Show manage user page
    const manageUserPage = document.getElementById('manage-user-page');
    if (manageUserPage) {
        manageUserPage.classList.add('active');
    }

    // Reset form
    resetForm();
}

// Reset form
function resetForm() {
    const userForm = document.getElementById('user-form');
    if (userForm) {
        userForm.reset();
        document.querySelector('.strength-bar').style.width = '0%';
        document.querySelector('.strength-text').textContent = 'Password strength';
    }
}