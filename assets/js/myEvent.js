// Initialize AOS
AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true
});

// Constants
const API_URL = 'https://back-end-eventory.vercel.app/event';
const TOKEN = localStorage.getItem('token');

// DOM Elements
const eventList = document.getElementById('event-list');
const createEventBtn = document.getElementById('create-event-btn');
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');
const userDropdownToggle = document.getElementById('user-dropdown-toggle');
const userDropdownMenu = document.getElementById('user-dropdown-menu');
const logoutBtn = document.getElementById('logout-btn');

// Check authentication
if (!TOKEN) {
    window.location.href = '../auth/login.html';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadUserEvents();
    setupEventListeners();
});

function setupEventListeners() {
    // Sidebar toggle
    menuToggle?.addEventListener('click', () => {
        sidebar.classList.toggle('show');
    });

    // User dropdown
    userDropdownToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdownMenu.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (userDropdownMenu?.classList.contains('show') && !userDropdownToggle?.contains(e.target)) {
            userDropdownMenu.classList.remove('show');
        }
    });

    // Create event button
    createEventBtn?.addEventListener('click', () => {
        window.location.href = 'createEvent.html';
    });

    // Logout
    logoutBtn?.addEventListener('click', handleLogout);
}

// Load user events
async function loadUserEvents() {
    try {
        const response = await fetch(`${API_URL}/getByCreatorID/${localStorage.getItem('userId')}`, {
            headers: {
                'Authorization': `Bearer ${TOKEN}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch events');

        const data = await response.json();
        renderEvents(data.data);
    } catch (error) {
        console.error('Error loading events:', error);
        showNotification('Gagal memuat event', 'error');
    }
}

// Render events
function renderEvents(events) {
    if (!events || events.length === 0) {
        eventList.innerHTML = `
            <div class="empty-state" data-aos="fade-up">
                <i class="fas fa-calendar-times"></i>
                <p>Anda belum memiliki event. Buat event pertama Anda!</p>
            </div>
        `;
        return;
    }

    eventList.innerHTML = events.map(event => `
        <div class="event-card" data-aos="fade-up" data-id="${event._id}">
            <div class="event-image">
                <img src="${event.images[0] || '../../assets/image/default-event.jpg'}" 
                     alt="${event.title}"
                     onerror="this.src='../../assets/image/default-event.jpg'">
                <span class="event-status ${getStatusClass(event.status)}">${getStatusText(event.status)}</span>
            </div>
            <div class="event-content">
                <h3 class="event-title">${event.title}</h3>
                <div class="event-details">
                    <p><i class="far fa-calendar"></i> ${formatDate(event.date)}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
                    <p><i class="fas fa-tag"></i> ${event.kategori}</p>
                    <p><i class="fas fa-ticket-alt"></i> ${event.ticket}</p>
                    <p><i class="fas fa-users"></i> ${event.currentParticipants || 0}/${event.maxParticipants} Peserta</p>
                </div>
                <div class="event-actions">
                    <button class="btn btn-view" onclick="viewEvent('${event._id}')">
                        <i class="fas fa-eye"></i> Lihat
                    </button>
                    <button class="btn btn-edit" onclick="editEvent('${event._id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-delete" onclick="deleteEvent('${event._id}')">
                        <i class="fas fa-trash"></i> Hapus
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// View event details
function viewEvent(eventId) {
    window.location.href = `eventDetail.html?id=${eventId}`;
}

// Edit event
function editEvent(eventId) {
    window.location.href = `editEvent.html?id=${eventId}`;
}

// Delete event
async function deleteEvent(eventId) {
    if (!confirm('Apakah Anda yakin ingin menghapus event ini?')) return;

    try {
        const response = await fetch(`${API_URL}/deleteEvent/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${TOKEN}`
            }
        });

        if (!response.ok) throw new Error('Failed to delete event');

        showNotification('Event berhasil dihapus!', 'success');
        loadUserEvents();
    } catch (error) {
        console.error('Error deleting event:', error);
        showNotification('Gagal menghapus event', 'error');
    }
}

// Handle logout
function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = '../auth/login.html';
}

// Utility functions
function formatDate(dateString) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

function getStatusClass(status) {
    const statusClasses = {
        'pending': 'status-pending',
        'approved': 'status-approved',
        'rejected': 'status-rejected',
        'cancelled': 'status-cancelled'
    };
    return statusClasses[status] || 'status-pending';
}

function getStatusText(status) {
    const statusTexts = {
        'pending': 'Menunggu Verifikasi',
        'approved': 'Terverifikasi',
        'rejected': 'Ditolak',
        'cancelled': 'Dibatalkan'
    };
    return statusTexts[status] || 'Menunggu Verifikasi';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);

    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    };
    return icons[type] || icons.info;
}
