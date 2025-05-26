AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true
});

// --- Configuration & Constants ---
const API_BASE_URL = 'https://back-end-eventory.vercel.app'; // Updated API Base URL
const TOKEN = localStorage.getItem('token');
const DEFAULT_EVENT_IMAGE = '../../assets/image/default-event.jpg'; // Pastikan path ini benar

// --- DOM Element References ---
const DOMElements = {
    eventList: document.getElementById('event-list'),
    searchInput: document.getElementById('search-input'),
    categoryFilter: document.getElementById('category-filter'),
    sortSelect: document.getElementById('sort-select'),
    menuToggle: document.getElementById('menu-toggle'),
    sidebar: document.getElementById('sidebar'),
    userDropdownToggle: document.getElementById('user-dropdown-toggle'),
    userDropdownMenu: document.getElementById('user-dropdown-menu'),
    logoutBtn: document.getElementById('logout-btn'),
};

// --- Authentication Check ---
if (!TOKEN) {
    console.warn('Token tidak ditemukan. Mengarahkan ke halaman login.');
    window.location.href = '../auth/login.html'; // Pastikan path ini benar
}

// --- Main Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    if (TOKEN) { // Lanjutkan hanya jika terautentikasi
        loadAndRenderUserEvents(); // Mengganti nama fungsi agar lebih deskriptif
        setupGlobalEventListeners();
    }
});

// --- Event Listener Setup ---
function setupGlobalEventListeners() {
    DOMElements.menuToggle?.addEventListener('click', () => {
        DOMElements.sidebar?.classList.toggle('show');
    });

    DOMElements.userDropdownToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        DOMElements.userDropdownMenu?.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (DOMElements.userDropdownMenu?.classList.contains('show') &&
            !DOMElements.userDropdownToggle?.contains(e.target) &&
            !DOMElements.userDropdownMenu?.contains(e.target)) {
            DOMElements.userDropdownMenu.classList.remove('show');
        }
    });

    // Listener untuk search, filter, dan sort sekarang akan memanggil loadAndRenderUserEvents
    DOMElements.searchInput?.addEventListener('input', debounce(loadAndRenderUserEvents, 300));
    DOMElements.categoryFilter?.addEventListener('change', loadAndRenderUserEvents);
    DOMElements.sortSelect?.addEventListener('change', loadAndRenderUserEvents);

    DOMElements.logoutBtn?.addEventListener('click', handleLogout);
}

// --- Core Event Handling Functions ---

/**
 * Fetches events for the logged-in user, applies filters and sorting, then renders them.
 */
async function loadAndRenderUserEvents() {
    if (!DOMElements.eventList) {
        console.warn('Kontainer daftar event tidak ditemukan. Melewati pemuatan event.');
        return;
    }
    DOMElements.eventList.innerHTML = '<div class="loading-state"><p>Memuat event Anda...</p></div>';

    try {
        // Ambil User Data dan User ID
        const userDataString = localStorage.getItem('user');
        if (!userDataString) {
            throw new Error('Data pengguna tidak ditemukan di localStorage. Silakan login kembali.');
        }
        const userData = JSON.parse(userDataString);
        if (!userData || !userData._id) {
            throw new Error('ID pengguna tidak valid dalam data pengguna. Silakan login kembali.');
        }
        const userId = userData._id;

        const searchQuery = DOMElements.searchInput?.value.trim().toLowerCase() || '';
        const category = DOMElements.categoryFilter?.value || '';
        const sort = DOMElements.sortSelect?.value || 'newest';

        // Fetch event berdasarkan User ID
        const response = await fetch(`${API_BASE_URL}/event/getEventsByUserId/${userId}`, {
            headers: {
                'Authorization': `Bearer ${TOKEN}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Gagal mengambil data event pengguna. Status: ${response.status}`);
        }

        const result = await response.json();
        if (!result.data || !Array.isArray(result.data)) {
            throw new Error('Format data event tidak valid dari server.');
        }

        let events = result.data;

        // Terapkan filter client-side (untuk event milik pengguna)
        if (searchQuery) {
            events = events.filter(event =>
                (event.title && event.title.toLowerCase().includes(searchQuery)) ||
                (event.description && event.description.toLowerCase().includes(searchQuery)) ||
                (event.location && event.location.toLowerCase().includes(searchQuery))
            );
        }
        if (category) {
            events = events.filter(event => event.kategori === category);
        }

        // Terapkan sorting client-side
        sortEvents(events, sort);
        renderEvents(events);

    } catch (error) {
        console.error('Error memuat event pengguna:', error);
        if (DOMElements.eventList) {
            DOMElements.eventList.innerHTML = `<div class="error-state"><p>Gagal memuat event: ${error.message}</p></div>`;
        }
        showNotification(error.message || 'Gagal memuat event pengguna.', 'error');
    }
}

/**
 * Sorts an array of events in place.
 * @param {Array} events - The array of events to sort.
 * @param {String} sortBy - The sorting criteria ('newest', 'oldest', 'upcoming', 'title').
 */
function sortEvents(events, sortBy) {
    events.sort((a, b) => {
        switch (sortBy) {
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
}

/**
 * Renders the list of events into the DOM.
 * @param {Array} events - The array of events to render.
 */
function renderEvents(events) {
    if (!DOMElements.eventList) return;

    if (!events || events.length === 0) {
        DOMElements.eventList.innerHTML = `
            <div class="empty-state text-center py-10" data-aos="fade-up">
                <i class="fas fa-calendar-times fa-3x text-gray-400 mb-4"></i>
                <p class="text-xl text-gray-600">Tidak ada event yang Anda buat atau ikuti.</p>
                <p class="text-gray-500">Coba buat event baru atau jelajahi event lain!</p>
            </div>
        `;
        return;
    }

    DOMElements.eventList.innerHTML = events.map(event => `
        <div class="event-card bg-white rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-xl" data-aos="fade-up" data-id="${event._id}">
            <div class="event-image relative">
                <img src="${event.images && event.images.length > 0 ? event.images[0] : DEFAULT_EVENT_IMAGE}" 
                     alt="${event.title || 'Gambar Event'}"
                     class="w-full h-48 object-cover"
                     onerror="this.onerror=null; this.src='${DEFAULT_EVENT_IMAGE}';">
                <span class="event-status absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full text-white ${getStatusClass(event.status)}">
                    ${getStatusText(event.status)}
                </span>
            </div>
            <div class="event-content p-4">
                <h3 class="event-title text-xl font-bold text-gray-800 mb-2 truncate" title="${event.title}">${event.title || 'Tanpa Judul'}</h3>
                <div class="event-details text-sm text-gray-600 space-y-1 mb-3">
                    <p><i class="far fa-calendar mr-2 text-blue-500"></i> ${formatDate(event.date)}</p>
                    <p><i class="fas fa-map-marker-alt mr-2 text-red-500"></i> ${event.location || 'Lokasi tidak ditentukan'}</p>
                    <p><i class="fas fa-tag mr-2 text-green-500"></i> ${event.kategori || 'Umum'}</p>
                    <p><i class="fas fa-ticket-alt mr-2 text-purple-500"></i> ${event.ticket || 'Gratis'}</p>
                    <p><i class="fas fa-users mr-2 text-yellow-500"></i> ${event.currentParticipants || 0}/${event.maxParticipants || '∞'} Peserta</p>
                </div>
                <div class="event-actions flex space-x-2">
                    <button class="btn btn-view flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg text-sm" 
                            data-event-id="${event._id}" name="viewEventButton">
                        <i class="fas fa-eye mr-1"></i> Lihat Detail
                    </button>
                    <button class="btn btn-join flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg text-sm" 
                            data-event-id="${event._id}" name="joinEventButton"
                            ${(event.currentParticipants || 0) >= (event.maxParticipants || Infinity) ? 'disabled' : ''}
                            title="${(event.currentParticipants || 0) >= (event.maxParticipants || Infinity) ? 'Event sudah penuh' : 'Bergabung dengan event'}">
                        <i class="fas fa-user-plus mr-1"></i> Bergabung
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    addEventListenersToEventCards();
}

/**
 * Adds event listeners to "View Detail" and "Join" buttons on event cards using event delegation.
 */
function addEventListenersToEventCards() {
    DOMElements.eventList?.addEventListener('click', (e) => {
        const targetButton = e.target.closest('button');
        if (!targetButton) return;

        const eventId = targetButton.dataset.eventId;
        if (!eventId) return;

        if (targetButton.name === 'viewEventButton') {
            viewEventDetails(eventId);
        } else if (targetButton.name === 'joinEventButton') {
            handleJoinEvent(eventId);
        }
    });
}

/**
 * Handles the logic for joining an event.
 * @param {String} eventId - The ID of the event to join.
 */
async function handleJoinEvent(eventId) {
    if (!eventId) return;
    console.log(`Mencoba bergabung dengan event: ${eventId}`);

    // Opsional: Tambahkan dialog konfirmasi
    // if (!confirm('Apakah Anda yakin ingin bergabung dengan event ini?')) {
    //     return;
    // }

    try {
        // Pastikan endpoint ini benar sesuai router backend Anda untuk join event
        // Jika backend mengharapkan eventId di body, sesuaikan fetch
        const response = await fetch(`${API_BASE_URL}/event/joinEvent/${eventId}`, { 
            method: 'POST', // Router Anda untuk joinEvent adalah POST
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json' 
            },
            // body: JSON.stringify({}) // Jika backend memerlukan body JSON, bahkan kosong
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.message || `Gagal bergabung dengan event. Status: ${response.status}`);
        }

        showNotification(responseData.message || 'Berhasil bergabung dengan event!', 'success');
        loadAndRenderUserEvents(); // Muat ulang event untuk update jumlah peserta
    } catch (error) {
        console.error('Error bergabung dengan event:', error);
        showNotification(error.message || 'Gagal bergabung dengan event.', 'error');
    }
}

/**
 * Navigates to the event detail page.
 * @param {String} eventId - The ID of the event.
 */
function viewEventDetails(eventId) {
    if (eventId) {
        window.location.href = `eventDetail.html?id=${eventId}`; // Pastikan path ini benar
    }
}

/**
 * Handles user logout.
 */
function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showNotification('Anda telah berhasil logout.', 'success');
    setTimeout(() => {
        window.location.href = '../auth/login.html'; // Pastikan path ini benar
    }, 1500);
}

// --- Utility Functions ---
function formatDate(dateString) {
    if (!dateString) return 'Tanggal tidak tersedia';
    const options = {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    };
    try {
        return new Date(dateString).toLocaleDateString('id-ID', options);
    } catch (e) {
        console.error("Error memformat tanggal:", dateString, e);
        return dateString;
    }
}

function getStatusClass(status) {
    const statusClasses = {
        'pending': 'bg-yellow-500', 'approved': 'bg-green-500',
        'rejected': 'bg-red-500', 'cancelled': 'bg-gray-500'
    };
    return statusClasses[status] || 'bg-gray-400';
}

function getStatusText(status) {
    const statusTexts = {
        'pending': 'Menunggu Verifikasi', 'approved': 'Terverifikasi',
        'rejected': 'Ditolak', 'cancelled': 'Dibatalkan'
    };
    return statusTexts[status] || 'Status Tidak Diketahui';
}

function showNotification(message, type = 'info') {
    const notificationArea = document.getElementById('notification-area') || createNotificationArea();
    const notification = document.createElement('div');
    notification.className = `notification p-4 mb-2 rounded-md shadow-md text-white ${getNotificationBackground(type)}`;
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="flex items-center">
                <i class="fas ${getNotificationIcon(type)} mr-2"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close text-xl leading-none hover:text-gray-200">&times;</button>
        </div>`;
    notificationArea.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);

    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        notification.classList.remove('show');
        notification.addEventListener('transitionend', () => notification.remove(), { once: true });
    });
    setTimeout(() => {
        notification.classList.remove('show');
        notification.addEventListener('transitionend', () => notification.remove(), { once: true });
    }, 5000);
}

function getNotificationBackground(type) {
    const backgrounds = {
        'success': 'bg-green-500', 'error': 'bg-red-500',
        'warning': 'bg-yellow-500', 'info': 'bg-blue-500'
    };
    return backgrounds[type] || backgrounds.info;
}

function createNotificationArea() {
    let area = document.getElementById('notification-area');
    if (!area) {
        area = document.createElement('div');
        area.id = 'notification-area';
        area.style.position = 'fixed'; area.style.top = '20px'; area.style.right = '20px';
        area.style.zIndex = '1000'; area.style.width = '300px'; // Sesuaikan styling jika perlu
        document.body.appendChild(area);
    }
    return area;
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'fa-check-circle', 'error': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle', 'info': 'fa-info-circle'
    };
    return icons[type] || icons.info;
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
