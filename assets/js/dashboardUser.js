// dashboardUser.js

// Initialize AOS (jika belum diinisialisasi di HTML)
if (typeof AOS !== 'undefined') {
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });
} else {
    console.warn('AOS library not found. Animations will not work.');
}


// --- KONFIGURASI & KONSTANTA ---
const API_BASE_URL_USER = 'https://back-end-eventory.vercel.app'; // Base URL API
const TOKEN_USER = localStorage.getItem('token');
const USER_ID_DASHBOARD = localStorage.getItem('userId');

// --- ELEMEN DOM ---
const eventListContainerUser = document.getElementById('event-list'); // Kontainer untuk "My Events"
const menuToggleUser = document.getElementById('menu-toggle');
const sidebarUser = document.getElementById('sidebar');
const userDropdownToggleUser = document.getElementById('user-dropdown-toggle');
const userDropdownMenuUser = document.getElementById('user-dropdown-menu');
const logoutBtnUser = document.getElementById('logout-btn');

// Elemen DOM untuk bagian dashboard lainnya
const statsTotalEventsElUser = document.getElementById('total-events');
const statsCreatedEventsElUser = document.getElementById('created-events'); // Sesuaikan ID jika berbeda
const statsUpcomingEventsElUser = document.getElementById('upcoming-events-stat'); // ID untuk statistik upcoming
const statsCompletedEventsElUser = document.getElementById('completed-events-stat'); // ID untuk statistik completed

const discoverEventsContainerUser = document.getElementById('discover-events-list');
const upcomingEventsContainerUser = document.getElementById('upcoming-events-list'); // Kontainer untuk daftar Upcoming Events (widget)
const notificationsContainerUser = document.getElementById('notifications-list');

// --- STATE APLIKASI ---
let myEventsDataCache = []; // Cache untuk data "My Events"

// --- CEK AUTENTIKASI ---
if (!TOKEN_USER || !USER_ID_DASHBOARD) {
    alert('Sesi Anda tidak valid atau telah berakhir. Silakan login kembali.');
    window.location.href = '../auth/login.html'; // Sesuaikan path ke halaman login Anda
}

// --- FUNGSI UTILITAS GLOBAL ---
// (Fungsi-fungsi ini bisa dipindahkan ke file utils.js jika proyek membesar)
window.formatDashboardDate = (dateString, options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('id-ID', options);
    } catch (e) {
        console.warn("Invalid date for formatDashboardDate:", dateString);
        return dateString;
    }
};

window.formatDashboardTime = (dateString, options = { hour: '2-digit', minute: '2-digit' }) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleTimeString('id-ID', options);
    } catch (e) {
        console.warn("Invalid date for formatDashboardTime:", dateString);
        return dateString;
    }
};

window.formatDashboardTimeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 5) return 'Baru saja';
        if (diffInSeconds < 60) return `${diffInSeconds} detik lalu`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
        return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
    } catch (e) {
        console.warn("Invalid date for formatDashboardTimeAgo:", dateString);
        return dateString;
    }
};

window.getDashboardStatusClass = (status) => {
    const statusClasses = {
        'pending': 'status-pending',
        'approved': 'status-approved',
        'rejected': 'status-rejected',
        'cancelled': 'status-cancelled',
        'completed': 'status-completed',
        'active': 'status-active'
    };
    return statusClasses[String(status).toLowerCase()] || 'status-default';
};

window.getDashboardStatusText = (status) => {
    const statusTexts = {
        'pending': 'Menunggu Verifikasi',
        'approved': 'Terverifikasi',
        'rejected': 'Ditolak',
        'cancelled': 'Dibatalkan',
        'completed': 'Selesai',
        'active': 'Sedang Berlangsung'
    };
    return statusTexts[String(status).toLowerCase()] || status || 'Status Tidak Diketahui';
};

window.getDashboardNotificationIcon = (type) => {
    const icons = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle',
        'event_created': 'fa-calendar-plus',
        'event_updated': 'fa-calendar-check',
        'event_deleted': 'fa-calendar-times',
        'event_reminder': 'fa-bell',
        'participant_joined': 'fa-user-plus',
        'participant_left': 'fa-user-minus',
        'default': 'fa-info-circle' // Default icon
    };
    return icons[type] || icons.default;
};

function createGlobalNotificationArea() {
    let area = document.getElementById('global-notification-area');
    if (!area) {
        area = document.createElement('div');
        area.id = 'global-notification-area';
        // Style area ini via CSS agar fixed di pojok, misalnya:
        // area.style.position = 'fixed';
        // area.style.top = '20px';
        // area.style.right = '20px';
        // area.style.zIndex = '10000';
        // area.style.display = 'flex';
        // area.style.flexDirection = 'column';
        // area.style.gap = '10px';
        document.body.appendChild(area);
    }
    return area;
}

window.showGlobalNotification = (message, type = 'info', duration = 5000) => {
    const notificationArea = createGlobalNotificationArea();
    
    const notification = document.createElement('div');
    // Tambahkan class dasar dan class spesifik tipe untuk styling
    notification.className = `custom-notification custom-notification-${type}`; 
    notification.innerHTML = `
        <div class="custom-notification-icon">
            <i class="fas ${window.getDashboardNotificationIcon(type)}"></i>
        </div>
        <div class="custom-notification-message">${message}</div>
        <button class="custom-notification-close">&times;</button>
    `;

    notificationArea.appendChild(notification);
    
    // Efek muncul (fade-in atau slide-in) bisa ditambahkan via CSS transition
    setTimeout(() => notification.classList.add('show'), 10); // 'show' class untuk transisi

    const closeBtn = notification.querySelector('.custom-notification-close');
    
    const dismiss = () => {
        notification.classList.remove('show');
        // Hapus elemen setelah transisi selesai
        setTimeout(() => notification.remove(), 300); // Sesuaikan dengan durasi transisi CSS
    };

    closeBtn.addEventListener('click', dismiss);

    if (duration !== null && duration > 0) {
        setTimeout(dismiss, duration);
    }
};


// --- PEMANGGILAN API ---
async function fetchApiDashboard(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL_USER}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${TOKEN_USER}`,
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Server Error: ${response.status}` }));
            throw new Error(errorData.message || `Gagal memproses permintaan. Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`API call to ${endpoint} failed:`, error);
        window.showGlobalNotification(error.message || 'Terjadi kesalahan jaringan.', 'error');
        throw error; // Lemparkan error agar pemanggil bisa menangani lebih lanjut jika perlu
    }
}

// --- RENDER EVENT (UNTUK "MY EVENTS") ---
function renderMyEventsList(events) {
    if (!eventListContainerUser) {
        console.warn('Element #event-list tidak ditemukan.');
        return;
    }

    if (!events || events.length === 0) {
        eventListContainerUser.innerHTML = `
            <div class="empty-state col-span-full text-center py-10" data-aos="fade-up">
                <i class="fas fa-calendar-times fa-3x text-gray-400 mb-4"></i>
                <p class="text-xl text-gray-600">Anda belum membuat event apapun.</p>
                <a href="createEvent.html" class="btn btn-primary mt-6 inline-block"> <i class="fas fa-plus mr-2"></i>Buat Event Pertama Anda
                </a>
            </div>
        `;
        return;
    }

    eventListContainerUser.innerHTML = events.map(event => `
        <div class="event-card bg-white shadow-lg rounded-lg overflow-hidden" data-aos="fade-up" data-id="${event._id}">
            <div class="event-image relative">
                <img src="${(event.images && event.images.length > 0 && event.images[0]) ? event.images[0] : '../../assets/image/default-event.jpg'}"
                     alt="${event.title || 'Gambar Event'}"
                     class="w-full h-48 object-cover"
                     onerror="this.onerror=null; this.src='../../assets/image/default-event.jpg';">
                <span class="event-status absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded ${window.getDashboardStatusClass(event.status)}">
                    ${window.getDashboardStatusText(event.status)}
                </span>
            </div>
            <div class="event-content p-4">
                <h3 class="event-title text-xl font-bold mb-2 truncate" title="${event.title || 'Tanpa Judul'}">${event.title || 'Tanpa Judul'}</h3>
                <div class="event-details text-sm text-gray-600 space-y-1">
                    <p><i class="far fa-calendar w-4 mr-2 text-center"></i> ${window.formatDashboardDate(event.date)}</p>
                    <p><i class="far fa-clock w-4 mr-2 text-center"></i> ${window.formatDashboardTime(event.date)}</p>
                    <p><i class="fas fa-map-marker-alt w-4 mr-2 text-center"></i> ${event.location || 'N/A'}</p>
                    <p><i class="fas fa-tag w-4 mr-2 text-center"></i> ${event.kategori || 'N/A'}</p>
                    <p><i class="fas fa-ticket-alt w-4 mr-2 text-center"></i> ${event.ticket === 'Berbayar' ? `Rp ${Number(event.ticketPrice || 0).toLocaleString('id-ID')}` : (event.ticket || 'N/A')}</p>
                    <p><i class="fas fa-users w-4 mr-2 text-center"></i> ${event.currentParticipants || 0} / ${event.maxParticipants || '∞'} Peserta</p>
                </div>
                <div class="event-actions mt-4 flex space-x-2">
                    <button class="btn btn-outline btn-view flex-1" data-action="view" data-event-id="${event._id}">
                        <i class="fas fa-eye mr-1"></i> Lihat
                    </button>
                    <button class="btn btn-outline btn-edit flex-1" data-action="edit" data-event-id="${event._id}">
                        <i class="fas fa-edit mr-1"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-delete flex-1" data-action="delete" data-event-id="${event._id}">
                        <i class="fas fa-trash mr-1"></i> Hapus
                    </button>
                </div>
            </div>
        </div>
    `).join('');
     if (typeof AOS !== 'undefined') AOS.refresh(); // Refresh AOS for new elements
}

// --- MEMUAT DATA UNTUK DASHBOARD ---
async function loadMyEventsData() {
    if (!eventListContainerUser && !USER_ID_DASHBOARD) return; // Jangan lanjutkan jika elemen atau ID tidak ada
    try {
        const response = await fetchApiDashboard(`/event/getByCreatorID/${USER_ID_DASHBOARD}`);
        myEventsDataCache = response.data || [];
        renderMyEventsList(myEventsDataCache);
    } catch (error) {
        if (eventListContainerUser) {
            eventListContainerUser.innerHTML = `<p class="col-span-full text-red-500 text-center py-10">Gagal memuat event Anda. Silakan coba muat ulang halaman.</p>`;
        }
        // Notifikasi error sudah ditampilkan oleh fetchApiDashboard
    }
}

async function loadDashboardStatsData() {
    if (!statsTotalEventsElUser) return; // Hanya muat jika elemen statistik ada
    try {
        const response = await fetchApiDashboard('/event/getUserStats'); // Endpoint backend tahu user dari token
        const stats = response.data;
        if (stats) {
            // Sesuaikan field berdasarkan respons API Anda
            if (statsTotalEventsElUser) statsTotalEventsElUser.textContent = stats.totalEvents || 0;
            if (statsCreatedEventsElUser) statsCreatedEventsElUser.textContent = stats.createdEvents || stats.pendingEvents || 0; // Ganti dengan field yang benar
            if (statsUpcomingEventsElUser) statsUpcomingEventsElUser.textContent = stats.upcomingEvents || stats.approvedEvents || 0;
            if (statsCompletedEventsElUser) statsCompletedEventsElUser.textContent = stats.completedEvents || 0;
        }
    } catch (error) {
        console.error('Gagal memuat statistik dashboard:', error);
        // Opsional: Tampilkan 'N/A' atau '-' pada elemen statistik jika gagal
        if (statsTotalEventsElUser) statsTotalEventsElUser.textContent = '-';
        // ...dan seterusnya untuk elemen lain
    }
}

async function loadDiscoverEventsData() {
    if (!discoverEventsContainerUser) return;
    discoverEventsContainerUser.innerHTML = `<p class="text-gray-500 p-4">Memuat event untuk dijelajahi...</p>`;
    try {
        const response = await fetchApiDashboard('/event/getDiscoverEvents?limit=6'); // Ambil 6 event
        const events = response.data || [];
        if (events.length === 0) {
            discoverEventsContainerUser.innerHTML = `<p class="text-gray-500 p-4">Belum ada event menarik untuk dijelajahi saat ini.</p>`;
            return;
        }
        discoverEventsContainerUser.innerHTML = events.map(event => `
             <div class="discover-event-card cursor-pointer" data-id="${event._id}" data-action="view-discover-event">
                 <div class="discover-event-img">
                     <img src="${(event.images && event.images.length > 0 && event.images[0]) ? event.images[0] : '../../assets/image/default-event.jpg'}" alt="${event.title}" onerror="this.onerror=null; this.src='../../assets/image/default-event.jpg';">
                 </div>
                 <div class="discover-event-content p-3">
                     <span class="discover-event-date text-xs text-gray-500">${window.formatDashboardDate(event.date, {day: 'numeric', month: 'short', year: 'numeric'})}</span>
                     <h3 class="discover-event-title font-semibold truncate" title="${event.title}">${event.title}</h3>
                     <div class="discover-event-footer text-xs mt-1 flex justify-between items-center">
                         <div class="discover-event-location truncate"><i class="fas fa-map-marker-alt mr-1"></i>${event.location}</div>
                         <div class="discover-event-category badge badge-info badge-sm">${event.kategori}</div>
                     </div>
                 </div>
             </div>
        `).join('');
        if (typeof AOS !== 'undefined') AOS.refresh();
    } catch (error) {
        discoverEventsContainerUser.innerHTML = `<p class="text-red-500 p-4">Gagal memuat event.</p>`;
    }
}

async function loadUpcomingEventsWidgetData() {
    if (!upcomingEventsContainerUser) return;
    upcomingEventsContainerUser.innerHTML = `<p class="text-gray-500 text-xs p-2">Memuat...</p>`;
    try {
        const response = await fetchApiDashboard('/event/getUpcomingEvents?limit=3'); // Ambil 3 event
        const events = response.data || [];
        if (events.length === 0) {
            upcomingEventsContainerUser.innerHTML = `<p class="text-gray-500 text-xs p-2">Tidak ada event mendatang.</p>`;
            return;
        }
        upcomingEventsContainerUser.innerHTML = events.map(event => {
            const date = new Date(event.date);
            return `
            <div class="upcoming-event flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer" data-id="${event._id}" data-action="view-upcoming-widget-event">
                <div class="upcoming-event-date text-center mr-3">
                    <span class="upcoming-event-day block text-lg font-bold">${date.getDate()}</span>
                    <span class="upcoming-event-month block text-xs uppercase">${date.toLocaleString('id-ID', { month: 'short' })}</span>
                </div>
                <div class="upcoming-event-info">
                    <h3 class="upcoming-event-title font-semibold text-sm truncate" title="${event.title}">${event.title}</h3>
                    <div class="upcoming-event-time text-xs text-gray-500"><i class="far fa-clock mr-1"></i> ${window.formatDashboardTime(event.date)}</div>
                </div>
            </div>
            `;
        }).join('');
        if (typeof AOS !== 'undefined') AOS.refresh();
    } catch (error) {
        upcomingEventsContainerUser.innerHTML = `<p class="text-red-500 text-xs p-2">Gagal memuat.</p>`;
    }
}

async function loadNotificationsData() {
    if (!notificationsContainerUser) return;
    notificationsContainerUser.innerHTML = `<p class="text-gray-500 text-xs p-2">Memuat notifikasi...</p>`;
    try {
        const response = await fetchApiDashboard('/notifications/getUserNotifications?limit=4'); // Ambil 4 notifikasi
        const notifications = response.data || [];
         if (notifications.length === 0) {
            notificationsContainerUser.innerHTML = `<p class="text-gray-500 text-xs p-2">Tidak ada notifikasi baru.</p>`;
            return;
        }
        notificationsContainerUser.innerHTML = notifications.map(notification => `
            <div class="notification flex items-start p-2 hover:bg-gray-100 rounded" data-id="${notification._id}">
                <div class="notification-icon text-lg mr-3 w-5 text-center">
                    <i class="fas ${window.getDashboardNotificationIcon(notification.type || 'default')}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-text text-sm">
                        ${notification.title ? `<strong>${notification.title}</strong> ` : ''}${notification.message}
                    </div>
                    <div class="notification-time text-xs text-gray-500 mt-1">${window.formatDashboardTimeAgo(notification.createdAt)}</div>
                </div>
            </div>
        `).join('');
        if (typeof AOS !== 'undefined') AOS.refresh();
    } catch (error) {
        notificationsContainerUser.innerHTML = `<p class="text-red-500 text-xs p-2">Gagal memuat notifikasi.</p>`;
    }
}

// --- EVENT HANDLERS ---
function handleSidebarToggleDashboard() {
    sidebarUser?.classList.toggle('show');
}

function handleUserDropdownToggleDashboard(e) {
    e.stopPropagation();
    userDropdownMenuUser?.classList.toggle('show');
}

function handleClickOutsideDropdownDashboard(e) {
    if (userDropdownMenuUser?.classList.contains('show') && !userDropdownToggleUser?.contains(e.target) && !userDropdownMenuUser.contains(e.target)) {
        userDropdownMenuUser.classList.remove('show');
    }
}

async function handleLogoutUser(e) {
    e.preventDefault();
    window.showGlobalNotification('Anda sedang logout...', 'info', null); // Notifikasi tanpa auto-dismiss
    // Opsional: Panggil API logout di backend jika ada
    // try {
    //     await fetchApiDashboard('/auth/logout', { method: 'POST' }); // Ganti dengan endpoint logout Anda
    // } catch (error) {
    //     console.warn('Panggilan API logout gagal, melanjutkan logout sisi klien:', error);
    // }
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('user'); // Hapus juga item 'user' jika ada
    
    setTimeout(() => {
        window.location.href = '../auth/login.html'; // Sesuaikan path
    }, 1500);
}

function handleMyEventsListActions(e) {
    const button = e.target.closest('button.btn-view, button.btn-edit, button.btn-delete');
    if (!button) return;

    const action = button.dataset.action;
    const eventId = button.dataset.eventId;

    if (!action || !eventId) return;

    if (action === 'view') {
        window.location.href = `eventDetail.html?id=${eventId}`; // Sesuaikan path
    } else if (action === 'edit') {
        window.location.href = `editEvent.html?id=${eventId}`; // Sesuaikan path
    } else if (action === 'delete') {
        confirmDeleteUserEvent(eventId);
    }
}

function handleGeneralDashboardClicks(e) {
    // Untuk Discover Events
    const discoverCard = e.target.closest('.discover-event-card[data-action="view-discover-event"]');
    if (discoverCard) {
        const eventId = discoverCard.dataset.id;
        window.location.href = `eventDetail.html?id=${eventId}`; // Sesuaikan path
        return;
    }

    // Untuk Upcoming Events Widget
    const upcomingWidgetEvent = e.target.closest('.upcoming-event[data-action="view-upcoming-widget-event"]');
    if (upcomingWidgetEvent) {
        const eventId = upcomingWidgetEvent.dataset.id;
        window.location.href = `eventDetail.html?id=${eventId}`; // Sesuaikan path
        return;
    }
    // Tambahkan handler lain jika ada item klikabel di notifikasi atau bagian lain
}


async function confirmDeleteUserEvent(eventId) {
    if (!confirm('Apakah Anda yakin ingin menghapus event ini? Tindakan ini tidak dapat dibatalkan.')) return;

    window.showGlobalNotification('Menghapus event...', 'info', null);
    try {
        await fetchApiDashboard(`/event/deleteEvent/${eventId}`, { method: 'DELETE' });
        window.showGlobalNotification('Event berhasil dihapus!', 'success');
        
        // Update UI secara optimis atau muat ulang data
        const cardToRemove = eventListContainerUser.querySelector(`.event-card[data-id="${eventId}"]`);
        if (cardToRemove) {
            cardToRemove.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
            cardToRemove.style.opacity = '0';
            cardToRemove.style.transform = 'scale(0.95)';
            setTimeout(() => {
                cardToRemove.remove();
                myEventsDataCache = myEventsDataCache.filter(event => event._id !== eventId);
                if (myEventsDataCache.length === 0 && eventListContainerUser) {
                     renderMyEventsList([]); // Tampilkan status kosong
                }
                 if (typeof AOS !== 'undefined') AOS.refresh();
            }, 300);
        } else {
            loadMyEventsData(); // Fallback jika card tidak ditemukan
        }
        loadDashboardStatsData(); // Muat ulang statistik karena jumlah event berubah

    } catch (error) {
        // Notifikasi error sudah ditangani oleh fetchApiDashboard
        console.error('Gagal menghapus event:', error);
    }
}

function setupDashboardEventListeners() {
    menuToggleUser?.addEventListener('click', handleSidebarToggleDashboard);
    userDropdownToggleUser?.addEventListener('click', handleUserDropdownToggleDashboard);
    document.addEventListener('click', handleClickOutsideDropdownDashboard);
    logoutBtnUser?.addEventListener('click', handleLogoutUser);

    // Event delegation untuk aksi pada kartu "My Events"
    eventListContainerUser?.addEventListener('click', handleMyEventsListActions);

    // Event delegation untuk klik pada item di Discover dan Upcoming (widget)
    discoverEventsContainerUser?.addEventListener('click', handleGeneralDashboardClicks);
    upcomingEventsContainerUser?.addEventListener('click', handleGeneralDashboardClicks);
    // notificationsContainerUser?.addEventListener('click', handleGeneralDashboardClicks); // Jika notifikasi bisa diklik

    // Listener untuk custom event jika createEvent.js ada di halaman berbeda
    // dan perlu memberi tahu dashboard untuk refresh (jika tidak menggunakan window.refreshDashboardData)
    // document.addEventListener('eventSuccessfullyCreated', loadMyEventsData);
}

// --- INISIALISASI DASHBOARD ---
function initializeUserDashboard() {
    if (!TOKEN_USER || !USER_ID_DASHBOARD) return; // Autentikasi sudah dicek di atas

    setupDashboardEventListeners();

    // Muat semua data yang diperlukan untuk dashboard
    // Promise.allSettled agar semua bisa berjalan meskipun ada yang gagal
    Promise.allSettled([
        loadMyEventsData(),
        loadDashboardStatsData(),
        loadDiscoverEventsData(),
        loadUpcomingEventsWidgetData(),
        loadNotificationsData()
    ]).then(results => {
        results.forEach(result => {
            if (result.status === 'rejected') {
                console.warn('Satu atau lebih pemuatan data dashboard gagal:', result.reason);
            }
        });
        console.log('Dashboard pengguna berhasil diinisialisasi.');
         if (typeof AOS !== 'undefined') AOS.refresh(); // Final AOS refresh
    });
}

// Eksekusi setelah DOM siap
document.addEventListener('DOMContentLoaded', initializeUserDashboard);

// Ekspos fungsi untuk di panggil oleh createEvent.js
window.refreshDashboardData = () => {
    console.log('refreshDashboardData dipanggil...');
    loadMyEventsData();
    loadDashboardStatsData(); // Muat ulang statistik juga
    // Opsional: muat ulang upcoming events jika event baru mungkin masuk kategori itu
    // loadUpcomingEventsWidgetData(); 
};