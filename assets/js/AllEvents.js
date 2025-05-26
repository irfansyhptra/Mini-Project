// Initialize AOS
AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true
});

// Constants
const API_URL = 'http://localhost:3000';
const TOKEN = localStorage.getItem('token');

// DOM Elements
const eventList = document.getElementById('event-list');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const sortSelect = document.getElementById('sort-select');
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
    loadAllEvents();
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

    // Search and filter
    searchInput?.addEventListener('input', debounce(loadAllEvents, 300));
    categoryFilter?.addEventListener('change', loadAllEvents);
    sortSelect?.addEventListener('change', loadAllEvents);

    // Logout
    logoutBtn?.addEventListener('click', handleLogout);
}

// Load all events
async function loadAllEvents() {
    try {
        const searchQuery = searchInput?.value || '';
        const category = categoryFilter?.value || '';
        const sort = sortSelect?.value || 'newest';

        const response = await fetch(`${API_URL}/event/getAllEvents`, {
            headers: {
                'Authorization': `Bearer ${TOKEN}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch events');

        const data = await response.json();
        let events = data.data;

        // Apply filters
        if (searchQuery) {
            events = events.filter(event => 
                event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.location.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (category) {
            events = events.filter(event => event.kategori === category);
        }

        // Apply sorting
        events.sort((a, b) => {
            switch (sort) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'upcoming':
                    return new Date(a.date) - new Date(b.date);
                case 'title':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });

        renderEvents(events);
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
                <p>Tidak ada event yang ditemukan</p>
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
                    <p><i class="fas fa-users"></i> ${event.currentParticipants}/${event.maxParticipants} Peserta</p>
                </div>
                <div class="event-actions">
                    <button class="btn btn-view" onclick="viewEvent('${event._id}')">
                        <i class="fas fa-eye"></i> Lihat Detail
                    </button>
                    <button class="btn btn-join" onclick="joinEvent('${event._id}')" 
                            ${event.currentParticipants >= event.maxParticipants ? 'disabled' : ''}>
                        <i class="fas fa-user-plus"></i> Bergabung
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Join event
async function joinEvent(eventId) {
    try {
        const response = await fetch(`${API_URL}/event/joinEvent/${eventId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOKEN}`
            }
        });

        if (!response.ok) throw new Error('Failed to join event');

        const data = await response.json();
        showNotification('Berhasil bergabung dengan event!', 'success');
        loadAllEvents();
    } catch (error) {
        console.error('Error joining event:', error);
        showNotification('Gagal bergabung dengan event', 'error');
    }
}

// View event details
function viewEvent(eventId) {
    window.location.href = `eventDetail.html?id=${eventId}`;
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

// Debounce function for search input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
