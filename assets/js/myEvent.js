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
const searchInput = document.getElementById('search-input');
const statusFilter = document.getElementById('status-filter');
const categoryFilter = document.getElementById('category-filter');
const sortSelect = document.getElementById('sort-select');
const paginationContainer = document.getElementById('pagination');
const loadingOverlay = document.getElementById('loading-overlay');
const emptyState = document.getElementById('empty-state');
const createEventModal = document.getElementById('createEventModal');
const createEventForm = document.getElementById('createEventForm');
const deleteEventModal = document.getElementById('deleteEventModal');
const deleteEventForm = document.getElementById('deleteEventForm');
const successOverlay = document.getElementById('success-overlay');
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');
const userDropdownToggle = document.getElementById('user-dropdown-toggle');
const userDropdownMenu = document.getElementById('user-dropdown-menu');
const logoutBtn = document.getElementById('logout-btn');

// State
let currentPage = 1;
let totalPages = 1;
let events = [];
let filters = {
    search: '',
    status: 'all',
    category: 'all',
    sort: 'newest'
};

// Check authentication
if (!TOKEN) {
    window.location.href = '../auth/login.html';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
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

    // Search input
    searchInput.addEventListener('input', debounce((e) => {
        filters.search = e.target.value;
        currentPage = 1;
        loadEvents();
    }, 500));

    // Filters
    statusFilter.addEventListener('change', (e) => {
        filters.status = e.target.value;
        currentPage = 1;
        loadEvents();
    });

    categoryFilter.addEventListener('change', (e) => {
        filters.category = e.target.value;
        currentPage = 1;
        loadEvents();
    });

    sortSelect.addEventListener('change', (e) => {
        filters.sort = e.target.value;
        currentPage = 1;
        loadEvents();
    });

    // Create Event Form
    createEventForm.addEventListener('submit', handleCreateEvent);
    deleteEventForm.addEventListener('submit', handleDeleteEvent);

    // Modal Buttons
    document.querySelectorAll('[data-modal-target]').forEach(button => {
        button.addEventListener('click', () => {
            const modal = document.getElementById(button.dataset.modalTarget);
            showModal(modal);
        });
    });

    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            closeModal(modal);
        });
    });

    // Logout
    logoutBtn?.addEventListener('click', handleLogout);
}

// Load Events
async function loadEvents() {
    try {
        showLoading();
        
        const queryParams = new URLSearchParams({
            page: currentPage,
            search: filters.search,
            status: filters.status,
            category: filters.category,
            sort: filters.sort
        });

        const response = await fetch(`${API_URL}/getMyEvents?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${TOKEN}`
            }
        });
        if (!response.ok) throw new Error('Failed to load events');

        const data = await response.json();
        events = data.events;
        totalPages = data.totalPages;

        renderEvents();
        renderPagination();
    } catch (error) {
        console.error('Error loading events:', error);
        showError('Failed to load events. Please try again.');
    } finally {
        hideLoading();
    }
}

// Render Events
function renderEvents() {
    if (events.length === 0) {
        eventList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <h3>No Events Found</h3>
                <p>Try adjusting your filters or create a new event</p>
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
                    <button class="btn btn-delete" onclick="confirmDelete('${event._id}')">
                        <i class="fas fa-trash"></i> Hapus
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Pagination
function renderPagination() {
    if (totalPages <= 1) {
        paginationContainer.style.display = 'none';
        return;
    }

    paginationContainer.style.display = 'flex';
    let paginationHTML = '';

    // Previous button
    paginationHTML += `
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} 
                onclick="changePage(${currentPage - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 || 
            i === totalPages || 
            (i >= currentPage - 2 && i <= currentPage + 2)
        ) {
            paginationHTML += `
                <button class="pagination-btn ${i === currentPage ? 'active' : ''}"
                        onclick="changePage(${i})">
                    ${i}
                </button>
            `;
        } else if (
            i === currentPage - 3 || 
            i === currentPage + 3
        ) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
    }

    // Next button
    paginationHTML += `
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''}
                onclick="changePage(${currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

    paginationContainer.innerHTML = paginationHTML;
}

// Event Handlers
async function handleCreateEvent(e) {
    e.preventDefault();
    
    try {
        showLoading();
        
        const formData = new FormData(createEventForm);
        const response = await fetch(`${API_URL}/create`, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${TOKEN}`
            }
        });

        if (!response.ok) throw new Error('Failed to create event');

        const data = await response.json();
        showSuccess('Event created successfully!');
        closeModal(createEventModal);
        createEventForm.reset();
        loadEvents();
    } catch (error) {
        console.error('Error creating event:', error);
        showError('Failed to create event. Please try again.');
    } finally {
        hideLoading();
    }
}

async function handleDeleteEvent(e) {
    e.preventDefault();
    
    try {
        showLoading();
        
        const eventId = deleteEventForm.dataset.eventId;
        const response = await fetch(`${API_URL}/deleteEvent/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${TOKEN}`
            }
        });

        if (!response.ok) throw new Error('Failed to delete event');

        showSuccess('Event deleted successfully!');
        closeModal(deleteEventModal);
        loadEvents();
    } catch (error) {
        console.error('Error deleting event:', error);
        showError('Failed to delete event. Please try again.');
    } finally {
        hideLoading();
    }
}

// Helper Functions
function changePage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    loadEvents();
}

function confirmDelete(eventId) {
    deleteEventForm.dataset.eventId = eventId;
    showModal(deleteEventModal);
}

function viewEvent(eventId) {
    window.location.href = `eventDetail.html?id=${eventId}`;
}

function editEvent(eventId) {
    window.location.href = `editEvent.html?id=${eventId}`;
}

function showModal(modal) {
    modal.classList.add('active');
}

function closeModal(modal) {
    modal.classList.remove('active');
}

function showLoading() {
    loadingOverlay.classList.add('active');
}

function hideLoading() {
    loadingOverlay.classList.remove('active');
}

function showSuccess(message) {
    successOverlay.querySelector('p').textContent = message;
    successOverlay.classList.add('active');
    setTimeout(() => {
        successOverlay.classList.remove('active');
    }, 3000);
}

function showError(message) {
    alert(message);
}

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

function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = '../auth/login.html';
}

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
