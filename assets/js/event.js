AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true
});

// --- Configuration & Constants ---
const API_BASE_URL = 'https://back-end-eventory.vercel.app'; // API Base URL
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
        loadAndRenderAllEvents();
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

    DOMElements.searchInput?.addEventListener('input', debounce(loadAndRenderAllEvents, 300));
    DOMElements.categoryFilter?.addEventListener('change', loadAndRenderAllEvents);
    DOMElements.sortSelect?.addEventListener('change', loadAndRenderAllEvents);
    DOMElements.logoutBtn?.addEventListener('click', handleLogout);
}

// --- Core Event Handling Functions ---

/**
 * Fetches all events, applies filters and sorting, then renders them.
 */
async function loadAndRenderAllEvents() {
    if (!DOMElements.eventList) {
        console.warn('Kontainer daftar event tidak ditemukan. Melewati pemuatan event.');
        return;
    }
    DOMElements.eventList.innerHTML = '<div class="loading-state text-center py-10"><p class="text-lg text-gray-500">Memuat semua event...</p></div>';

    try {
        const searchQuery = DOMElements.searchInput?.value.trim().toLowerCase() || '';
        const category = DOMElements.categoryFilter?.value || '';
        const sort = DOMElements.sortSelect?.value || 'newest';

        const response = await fetch(`${API_BASE_URL}/event/getAllEvents`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Gagal mengambil data semua event. Status: ${response.status}`);
        }

        const result = await response.json();
        if (!result.data || !Array.isArray(result.data)) {
            throw new Error('Format data event tidak valid dari server.');
        }

        let events = result.data;

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

        sortEvents(events, sort);
        renderEvents(events);

    } catch (error) {
        console.error('Error memuat semua event:', error);
        if (DOMElements.eventList) {
            DOMElements.eventList.innerHTML = `<div class="error-state text-center py-10"><p class="text-lg text-red-500">Gagal memuat event: ${error.message}</p></div>`;
        }
        showNotification(error.message || 'Gagal memuat semua event.', 'error');
    }
}

/**
 * Sorts an array of events in place.
 */
function sortEvents(events, sortBy) {
    events.sort((a, b) => {
        switch (sortBy) {
            case 'newest': return new Date(b.createdAt) - new Date(a.createdAt);
            case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt);
            case 'upcoming': return new Date(a.date) - new Date(b.date);
            case 'title':
                const titleA = a.title || '';
                const titleB = b.title || '';
                return titleA.localeCompare(titleB);
            default: return 0;
        }
    });
}

/**
 * Renders the list of events into the DOM.
 */
function renderEvents(events) {
    if (!DOMElements.eventList) return;

    if (!events || events.length === 0) {
        DOMElements.eventList.innerHTML = `
            <div class="empty-state text-center py-10" data-aos="fade-up">
                <i class="fas fa-calendar-times fa-3x text-gray-400 mb-4"></i>
                <p class="text-xl text-gray-600">Tidak ada event yang tersedia saat ini.</p>
                <p class="text-gray-500">Silakan cek kembali nanti atau coba ubah filter Anda.</p>
            </div>`;
        return;
    }

    // Ambil ID pengguna yang login untuk menentukan apakah tombol delete/edit harus ditampilkan
    const userDataString = localStorage.getItem('user');
    const loggedInUserId = userDataString ? JSON.parse(userDataString)?._id : null;

    DOMElements.eventList.innerHTML = events.map(event => {
        const isUserEvent = loggedInUserId && event.creatorID === loggedInUserId; // Asumsi field creatorID ada di objek event

        return `
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
                <div class="event-actions flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button class="btn btn-view flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg text-sm" 
                            data-event-id="${event._id}" name="viewEventButton">
                        <i class="fas fa-eye mr-1"></i> Lihat Detail
                    </button>
                    <button class="btn btn-join flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg text-sm" 
                            data-event-id="${event._id}" name="joinEventButton"
                            ${(event.currentParticipants || 0) >= (event.maxParticipants || Infinity) || isUserEvent ? 'disabled' : ''}
                            title="${isUserEvent ? 'Anda adalah pembuat event ini' : ((event.currentParticipants || 0) >= (event.maxParticipants || Infinity) ? 'Event sudah penuh' : 'Bergabung dengan event')}">
                        <i class="fas fa-user-plus mr-1"></i> Bergabung
                    </button>
                    ${isUserEvent ? `
                    <button class="btn btn-edit flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg text-sm"
                            data-event-id="${event._id}" name="editEventButton">
                        <i class="fas fa-edit mr-1"></i> Edit
                    </button>
                    <button class="btn btn-delete flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg text-sm"
                            data-event-id="${event._id}" name="deleteEventButton">
                        <i class="fas fa-trash-alt mr-1"></i> Hapus
                    </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `}).join('');

    addEventListenersToEventCards();
}

/**
 * Adds event listeners to buttons on event cards using event delegation.
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
        } else if (targetButton.name === 'deleteEventButton') {
            handleDeleteEvent(eventId);
        } else if (targetButton.name === 'editEventButton') {
            // Nanti tambahkan fungsi untuk edit event
            console.log('Edit event:', eventId);
            showNotification('Fungsi edit belum diimplementasikan.', 'info');
            // window.location.href = `editEvent.html?id=${eventId}`; // Contoh navigasi ke halaman edit
        }
    });
}

/**
 * Handles the logic for joining an event.
 */
async function handleJoinEvent(eventId) {
    if (!eventId) return;
    console.log(`Mencoba bergabung dengan event: ${eventId}`);

    try {
        const response = await fetch(`${API_BASE_URL}/event/joinEvent/${eventId}`, { 
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            },
        });
        const responseData = await response.json();
        if (!response.ok) throw new Error(responseData.message || `Gagal bergabung. Status: ${response.status}`);
        showNotification(responseData.message || 'Berhasil bergabung!', 'success');
        loadAndRenderAllEvents();
    } catch (error) {
        console.error('Error bergabung dengan event:', error);
        showNotification(error.message || 'Gagal bergabung.', 'error');
    }
}

/**
 * Handles the logic for deleting an event.
 */
async function handleDeleteEvent(eventId) {
    if (!eventId) return;
    
    // Pertimbangkan menggunakan modal kustom daripada confirm() untuk UX yang lebih baik
    if (!confirm('Apakah Anda yakin ingin menghapus event ini? Tindakan ini tidak dapat dibatalkan.')) {
        return;
    }
    console.log(`Mencoba menghapus event: ${eventId}`);

    try {
        const response = await fetch(`${API_BASE_URL}/event/deleteEvent/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${TOKEN}`
            }
        });

        const responseData = await response.json(); // Coba parse JSON untuk mendapatkan pesan dari backend

        if (!response.ok) {
            throw new Error(responseData.message || `Gagal menghapus event. Status: ${response.status}`);
        }
        
        // Backend seharusnya mengembalikan status 200 dan pesan sukses
        showNotification(responseData.message || 'Event berhasil dihapus!', 'success');
        
        // Hapus kartu event dari DOM secara langsung untuk responsifitas
        const eventCard = DOMElements.eventList.querySelector(`[data-id="${eventId}"]`);
        if (eventCard) {
            eventCard.remove(); // Hapus elemen
        }

        // Jika tidak ada event tersisa, tampilkan empty state
        if (DOMElements.eventList.children.length === 0) {
            DOMElements.eventList.innerHTML = `
                <div class="empty-state text-center py-10" data-aos="fade-up">
                    <i class="fas fa-calendar-times fa-3x text-gray-400 mb-4"></i>
                    <p class="text-xl text-gray-600">Tidak ada event yang tersisa.</p>
                </div>`;
        }
        // Atau muat ulang semua event jika Anda ingin server yang menentukan daftar terbaru
        // loadAndRenderAllEvents(); 

    } catch (error) {
        console.error('Error menghapus event:', error);
        showNotification(error.message || 'Gagal menghapus event.', 'error');
    }
}


/**
 * Navigates to the event detail page.
 */
function viewEventDetails(eventId) {
    if (eventId) window.location.href = `eventDetail.html?id=${eventId}`;
}

/**
 * Handles user logout.
 */
function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showNotification('Anda telah berhasil logout.', 'success');
    setTimeout(() => { window.location.href = '../auth/login.html'; }, 1500);
}

// --- Utility Functions ---
function formatDate(dateString) {
    if (!dateString) return 'Tanggal tidak tersedia';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    try {
        return new Date(dateString).toLocaleDateString('id-ID', options);
    } catch (e) {
        console.error("Error memformat tanggal:", dateString, e);
        return dateString;
    }
}

function getStatusClass(status) {
    const classes = { 'pending': 'bg-yellow-500', 'approved': 'bg-green-500', 'rejected': 'bg-red-500', 'cancelled': 'bg-gray-500' };
    return classes[status] || 'bg-gray-400';
}

function getStatusText(status) {
    const texts = { 'pending': 'Menunggu Verifikasi', 'approved': 'Terverifikasi', 'rejected': 'Ditolak', 'cancelled': 'Dibatalkan' };
    return texts[status] || 'Status Tidak Diketahui';
}

function showNotification(message, type = 'info') {
    const area = document.getElementById('notification-area') || createNotificationArea();
    const notif = document.createElement('div');
    notif.className = `notification p-4 mb-2 rounded-md shadow-lg text-white ${getNotificationBackground(type)} transition-all duration-300 ease-in-out transform opacity-0 translate-y-2`;
    notif.innerHTML = `<div class="flex items-center justify-between"><div class="flex items-center"><i class="fas ${getNotificationIcon(type)} mr-3"></i><span>${message}</span></div><button class="notification-close text-xl leading-none hover:text-gray-200 focus:outline-none">&times;</button></div>`;
    area.appendChild(notif);
    requestAnimationFrame(() => { notif.classList.remove('opacity-0', 'translate-y-2'); notif.classList.add('opacity-100', 'translate-y-0'); });
    const removeNotif = () => { notif.classList.remove('opacity-100', 'translate-y-0'); notif.classList.add('opacity-0', 'translate-y-2'); notif.addEventListener('transitionend', () => notif.remove(), { once: true }); };
    notif.querySelector('.notification-close').addEventListener('click', removeNotif);
    setTimeout(removeNotif, 5000);
}

function getNotificationBackground(type) {
    const backgrounds = { 'success': 'bg-green-600', 'error': 'bg-red-600', 'warning': 'bg-yellow-500', 'info': 'bg-blue-600' };
    return backgrounds[type] || backgrounds.info;
}

function createNotificationArea() {
    let area = document.getElementById('notification-area');
    if (!area) {
        area = document.createElement('div');
        area.id = 'notification-area';
        Object.assign(area.style, { position: 'fixed', top: '20px', right: '20px', zIndex: '1050', width: 'auto', maxWidth: '400px' });
        document.body.appendChild(area);
    }
    return area;
}

function getNotificationIcon(type) {
    const icons = { 'success': 'fa-check-circle', 'error': 'fa-exclamation-circle', 'warning': 'fa-exclamation-triangle', 'info': 'fa-info-circle' };
    return icons[type] || icons.info;
}

function debounce(func, wait) {
    let timeout;
    return (...args) => {
        const later = () => { clearTimeout(timeout); func(...args); };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
