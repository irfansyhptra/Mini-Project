// DOM Elements
document.addEventListener('DOMContentLoaded', function () {
    // Menu Navigation
    const menuItems = document.querySelectorAll('.sidebar-menu ul li a');
    const pageTitle = document.getElementById('page-title');
    const contentPages = document.querySelectorAll('.content-page');

    // Admin Profile Dropdown
    const profileInfo = document.querySelector('.profile-info');
    const profileDropdown = document.querySelector('.profile-dropdown');

    // Password Strength
    const passwordInput = document.getElementById('password');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');

    // Form Submission
    const userForm = document.getElementById('user-form');

    // Initialize
    initNavigation();
    initPasswordStrength();
    initFormSubmission();
    initProfileDropdown();

    // Initialize navigation
    function initNavigation() {
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
                }
            });
        });
    }

    // Password strength checker
    function initPasswordStrength() {
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
        if (userForm) {
            userForm.addEventListener('submit', function (e) {
                e.preventDefault();

                // Basic form validation
                const nameInput = document.getElementById('nama');
                const emailInput = document.getElementById('email');

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
                strengthBar.style.width = '0%';
                strengthText.textContent = 'Password strength';
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
});

// Event Details Modal
function showEventDetails(eventId) {
    // Update modal content based on eventId
    document.getElementById('modal-event-title').textContent = getEventTitle(eventId);
    document.getElementById('modal-event-status').innerHTML = getEventStatus(eventId);
    document.getElementById('modal-event-datetime').textContent = getEventDateTime(eventId);
    document.getElementById('modal-event-location').textContent = getEventLocation(eventId);
    document.getElementById('modal-event-category').textContent = getEventCategory(eventId);
    document.getElementById('modal-event-creator').textContent = getEventCreator(eventId);
    document.getElementById('modal-event-description').textContent = getEventDescription(eventId);

    // Display event actions based on status
    const eventStatus = getEventStatus(eventId);
    const modalActions = document.getElementById('modal-event-actions');

    if (eventStatus.includes('Menunggu')) {
        modalActions.innerHTML = `
            <button class="btn btn-reject" onclick="rejectEvent(${eventId})">Reject</button>
            <button class="btn btn-approve" onclick="approveEvent(${eventId})">Approve</button>
        `;
    } else {
        modalActions.innerHTML = '';
    }

    // Show the modal
    document.getElementById('event-details-modal').style.display = 'block';
}

// Mock data functions
function getEventTitle(eventId) {
    const titles = {
        1: 'Workshop UX Design',
        2: 'Seminar Digital Marketing',
        3: 'Tech Conference 2025'
    };
    return titles[eventId] || 'Event Title';
}

function getEventStatus(eventId) {
    const statuses = {
        1: 'Status: <span class="verified">Terverifikasi</span>',
        2: 'Status: <span class="pending">Menunggu Verifikasi</span>',
        3: 'Status: <span class="verified">Terverifikasi</span>'
    };
    return statuses[eventId] || 'Status: <span class="pending">Menunggu Verifikasi</span>';
}

function getEventDateTime(eventId) {
    const dateTimes = {
        1: '25 Mar 2025, 09:00',
        2: '28 Mar 2025, 13:00',
        3: '2 Apr 2025, 10:00'
    };
    return dateTimes[eventId] || '1 Jan 2025, 00:00';
}

function getEventLocation(eventId) {
    const locations = {
        1: 'Jakarta Convention Center',
        2: 'Grand Hyatt Hotel',
        3: 'ICE BSD City'
    };
    return locations[eventId] || 'Location';
}

function getEventCategory(eventId) {
    const categories = {
        1: 'Design',
        2: 'Marketing',
        3: 'Technology'
    };
    return categories[eventId] || 'Category';
}

function getEventCreator(eventId) {
    const creators = {
        1: 'John Doe',
        2: 'Jane Smith',
        3: 'Miranda Kerr'
    };
    return creators[eventId] || 'User Name';
}

function getEventDescription(eventId) {
    return 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisi vel tincidunt interdum, sem nisi aliquam nisi, eget consectetur nisi dolor ut nisi. Sed euismod, nisi vel tincidunt interdum, sem nisi aliquam nisi, eget consectetur nisi dolor ut nisi.';
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// User functions
function showAddUserForm() {
    // Navigate to manage user page
    document.getElementById('page-title').textContent = 'Kelola User';
    document.querySelectorAll('.content-page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById('manage-user-page').classList.add('active');

    // Reset form
    document.getElementById('user-form').reset();

    // Update sidebar active state
    document.querySelectorAll('.sidebar-menu ul li').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector('.sidebar-menu ul li a[href="#manage-users"]').parentElement.classList.add('active');
}

function editUser(userId) {
    // Normally would fetch user data from server
    // For demo, populate form with mock data
    const mockUsers = {
        1: { name: 'John Doe', email: 'john.doe@example.com', role: 'user' },
        2: { name: 'Jane Smith', email: 'jane.smith@example.com', role: 'user' },
        3: { name: 'Miranda Kerr', email: 'miranda.k@example.com', role: 'admin' }
    };

    const user = mockUsers[userId];

    // Navigate to manage user page
    document.getElementById('page-title').textContent = 'Edit User';
    document.querySelectorAll('.content-page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById('manage-user-page').classList.add('active');

    // Populate form
    document.getElementById('nama').value = user.name;
    document.getElementById('email').value = user.email;
    document.getElementById('role').value = user.role;

    // Update sidebar active state
    document.querySelectorAll('.sidebar-menu ul li').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector('.sidebar-menu ul li a[href="#manage-users"]').parentElement.classList.add('active');
}

function deleteUser(userId) {
    // Show confirmation modal
    document.getElementById('confirmation-title').textContent = 'Konfirmasi Hapus User';
    document.getElementById('confirmation-message').textContent = `Apakah Anda yakin ingin menghapus user ini?`;

    const confirmBtn = document.getElementById('confirm-action-btn');
    confirmBtn.textContent = 'Ya, Hapus';
    confirmBtn.className = 'btn btn-danger';
    confirmBtn.onclick = function () {
        // Remove the user row from the table
        const userRow = document.querySelector(`#users-page tbody tr[data-user-id="${userId}"]`);
        if (userRow) {
            userRow.remove();
        }

        // Show notification
        showNotification('User berhasil dihapus!', 'success');
        closeModal('confirmation-modal');
    };

    document.getElementById('confirmation-modal').style.display = 'block';
}

// Event verification functions
function viewEventDetails(eventId) {
    showEventDetails(eventId);
}

function approveEvent(eventId) {
    // Show confirmation modal
    document.getElementById('confirmation-title').textContent = 'Konfirmasi Verifikasi';
    document.getElementById('confirmation-message').textContent = `Apakah Anda yakin ingin menyetujui event ini?`;

    const confirmBtn = document.getElementById('confirm-action-btn');
    confirmBtn.textContent = 'Ya, Setujui';
    confirmBtn.className = 'btn btn-approve';
    confirmBtn.onclick = function () {
        // In a real app, would send approve request to server
        showNotification('Event berhasil disetujui!', 'success');
        closeModal('confirmation-modal');
        closeModal('event-details-modal');

        // Update the event status in the UI (demo only)
        if (document.querySelector(`#verify-page tbody tr:nth-child(${eventId})`)) {
            document.querySelector(`#verify-page tbody tr:nth-child(${eventId})`).remove();
        }
    };

    document.getElementById('confirmation-modal').style.display = 'block';
}

function rejectEvent(eventId) {
    // Show confirmation modal
    document.getElementById('confirmation-title').textContent = 'Konfirmasi Penolakan';
    document.getElementById('confirmation-message').textContent = `Apakah Anda yakin ingin menolak event ini?`;

    const confirmBtn = document.getElementById('confirm-action-btn');
    confirmBtn.textContent = 'Ya, Tolak';
    confirmBtn.className = 'btn btn-reject';
    confirmBtn.onclick = function () {
        // In a real app, would send reject request to server
        showNotification('Event ditolak!', 'success');
        closeModal('confirmation-modal');
        closeModal('event-details-modal');

        // Update the event status in the UI (demo only)
        if (document.querySelector(`#verify-page tbody tr:nth-child(${eventId})`)) {
            document.querySelector(`#verify-page tbody tr:nth-child(${eventId})`).remove();
        }
    };

    document.getElementById('confirmation-modal').style.display = 'block';
}

// Form utility functions
function resetForm() {
    document.getElementById('user-form').reset();

    // Reset password strength indicator
    document.querySelector('.strength-bar').style.width = '0%';
    document.querySelector('.strength-text').textContent = 'Password strength';
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

// When clicking outside the modal, close it
window.addEventListener('click', function (event) {
    const eventModal = document.getElementById('event-details-modal');
    const confirmModal = document.getElementById('confirmation-modal');

    if (event.target === eventModal) {
        closeModal('event-details-modal');
    }

    if (event.target === confirmModal) {
        closeModal('confirmation-modal');
    }
});