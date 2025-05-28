// dashboardUser.js (Optimized with new token handling)

// --- KONFIGURASI & KONSTANTA GLOBAL (jika ada yang tidak bergantung pada DOM) ---
const API_BASE_URL_DASH = 'https://back-end-eventory.vercel.app';
let currentToken; // Akan diinisialisasi di DOMContentLoaded
let currentUserId; // Akan diinisialisasi di DOMContentLoaded

document.addEventListener('DOMContentLoaded', function () {
    // --- PENGAMBILAN TOKEN DAN CEK AUTENTIKASI (sesuai permintaan Anda) ---
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Sesi Anda tidak valid atau telah berakhir. Silakan login kembali.');
        window.location.href = 'login.html'; // Sesuaikan path ke halaman login Anda
        return; // Hentikan eksekusi skrip lebih lanjut
    }
    currentToken = token; // Simpan token yang valid untuk digunakan di seluruh skrip

    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert('ID Pengguna tidak ditemukan. Sesi mungkin tidak lengkap atau rusak. Silakan login kembali.');
        localStorage.removeItem('token'); // Hapus token yang mungkin tidak valid/lengkap
        window.location.href = 'login.html'; // Sesuaikan path
        return; // Hentikan eksekusi
    }
    currentUserId = userId; // Simpan userId yang valid

    // Initialize AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true
        });
    } else {
        console.warn('AOS library not found. Animations will not work.');
    }

    // --- ELEMEN DOM (sekarang aman untuk diambil karena DOM sudah ready) ---
    const eventListContainerDash = document.getElementById('event-list');
    const menuToggleDash = document.getElementById('menu-toggle');
    const sidebarDash = document.getElementById('sidebar');
    const userDropdownToggleDash = document.getElementById('user-dropdown-toggle');
    const userDropdownMenuDash = document.getElementById('user-dropdown-menu');
    const logoutBtnDash = userDropdownMenuDash?.querySelector('a[href*="login.html"]');

    const statsTotalEventsElDash = document.getElementById('total-events');
    const statsCreatedEventsElDash = document.getElementById('created-events');
    const statsUpcomingEventsElDash = document.getElementById('upcoming-events-stat');
    const statsCompletedEventsElDash = document.getElementById('completed-events-stat');
    const discoverEventsContainerDash = document.getElementById('discover-events-list');
    const upcomingEventsContainerDash = document.getElementById('upcoming-events-list');
    const notificationsContainerDash = document.getElementById('notifications-list');

    // --- STATE APLIKASI ---
    let myEventsCacheDash = [];

    // --- FUNGSI UTILITAS GLOBAL (Dapat diakses oleh createEvent.js via window) ---
    window.formatDashboardDate = (dateString, options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) => {
        if (!dateString) return 'N/A'; try { return new Date(dateString).toLocaleDateString('id-ID', options); }
        catch (e) { console.warn("Invalid date for formatDashboardDate:", dateString, e); return "Format Tanggal Salah"; }
    };
    window.formatDashboardTime = (dateString, options = { hour: '2-digit', minute: '2-digit' }) => {
        if (!dateString) return 'N/A'; try { return new Date(dateString).toLocaleTimeString('id-ID', options); }
        catch (e) { console.warn("Invalid date for formatDashboardTime:", dateString, e); return "Format Waktu Salah"; }
    };
    window.formatDashboardTimeAgo = (dateString) => {
        if (!dateString) return 'N/A'; try {
            const date = new Date(dateString); const now = new Date();
            const diffInSeconds = Math.floor((now - date) / 1000);
            if (diffInSeconds < 5) return 'Baru saja'; if (diffInSeconds < 60) return `${diffInSeconds} detik lalu`;
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
            return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
        } catch (e) { console.warn("Invalid date for formatDashboardTimeAgo:", dateString, e); return "Format Waktu Salah"; }
    };
    window.getDashboardStatusClass = (status) => { /* ... implementasi dari versi sebelumnya ... */ 
        const s = { p: 'pending', a: 'approved', r: 'rejected', c: 'cancelled', co: 'completed', ac: 'active' };
        const sc = { [s.p]: 'status-pending', [s.a]: 'status-approved', [s.r]: 'status-rejected', [s.c]: 'status-cancelled', [s.co]: 'status-completed', [s.ac]: 'status-active' };
        return sc[String(status).toLowerCase()] || 'status-default';
    };
    window.getDashboardStatusText = (status) => { /* ... implementasi dari versi sebelumnya ... */ 
        const s = { p: 'pending', a: 'approved', r: 'rejected', c: 'cancelled', co: 'completed', ac: 'active' };
        const st = { [s.p]: 'Menunggu Verifikasi', [s.a]: 'Terverifikasi', [s.r]: 'Ditolak', [s.c]: 'Dibatalkan', [s.co]: 'Selesai', [s.ac]: 'Sedang Berlangsung' };
        return st[String(status).toLowerCase()] || status || 'Tidak Diketahui';
    };
    window.getDashboardNotificationIcon = (type) => { /* ... implementasi dari versi sebelumnya ... */ 
        const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle', event_created: 'fa-calendar-plus', default: 'fa-info-circle' };
        return icons[type] || icons.default;
    };
    function createGlobalNotificationAreaInternalDash() { /* ... implementasi dari versi sebelumnya ... */ 
        let area = document.getElementById('global-notification-area');
        if (!area) { area = document.createElement('div'); area.id = 'global-notification-area'; document.body.appendChild(area); }
        return area;
    }
    window.showGlobalNotification = (message, type = 'info', duration = 5000) => { /* ... implementasi dari versi sebelumnya ... */ 
        const notificationArea = createGlobalNotificationAreaInternalDash();
        const n = document.createElement('div'); n.className = `custom-notification custom-notification-${type}`;
        n.innerHTML = `<div class="custom-notification-icon"><i class="fas ${window.getDashboardNotificationIcon(type)}"></i></div><div class="custom-notification-message">${message}</div><button class="custom-notification-close">&times;</button>`;
        notificationArea.appendChild(n); setTimeout(() => n.classList.add('show'), 10);
        const dismiss = () => { n.classList.remove('show'); setTimeout(() => n.remove(), 300); };
        n.querySelector('.custom-notification-close').addEventListener('click', dismiss);
        if (duration !== null && duration > 0) setTimeout(dismiss, duration);
    };

    // --- PEMANGGILAN API ---
    async function fetchApiDashboardInternal(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE_URL_DASH}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${currentToken}`, // Menggunakan currentToken yang sudah divalidasi
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Server Error: ${response.status}` }));
                throw new Error(errorData.message || `Gagal memproses. Status: ${response.status}`);
            }
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) return response.json();
            return response.text(); // Handle respons non-JSON jika ada
        } catch (error) {
            console.error(`API call to ${API_BASE_URL_DASH}${endpoint} failed:`, error);
            window.showGlobalNotification(error.message || 'Kesalahan jaringan saat mengambil data.', 'error');
            throw error;
        }
    }

    // --- RENDER "MY EVENTS" ---
    function renderMyEventsListInternal(events) { /* ... implementasi dari versi sebelumnya, pastikan menggunakan window.utilityFunctions ... */ 
        if (!eventListContainerDash) return;
        if (!events || events.length === 0) {
            eventListContainerDash.innerHTML = `<div class="empty-state col-span-full text-center py-10" data-aos="fade-up"><i class="fas fa-calendar-times fa-3x text-gray-400 mb-4"></i><p class="text-xl text-gray-600">Anda belum memiliki event.</p><a href="createEvent.html" class="btn btn-primary mt-6 inline-block"> <i class="fas fa-plus mr-2"></i>Buat Event</a></div>`;
            return;
        }
        eventListContainerDash.innerHTML = events.map(event => `
            <div class="event-card bg-white shadow-lg rounded-lg overflow-hidden" data-aos="fade-up" data-id="${event._id}">
                <div class="event-image relative"><img src="${(event.images && event.images[0]) ? event.images[0] : '../../assets/image/default-event.jpg'}" alt="${event.title || 'Event'}" class="w-full h-48 object-cover" onerror="this.onerror=null; this.src='../../assets/image/default-event.jpg';"><span class="event-status absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded ${window.getDashboardStatusClass(event.status)}">${window.getDashboardStatusText(event.status)}</span></div>
                <div class="event-content p-4"><h3 class="event-title text-xl font-bold mb-2 truncate" title="${event.title || 'N/A'}">${event.title || 'N/A'}</h3><div class="event-details text-sm text-gray-600 space-y-1"><p><i class="far fa-calendar w-4 mr-2 text-center"></i>${window.formatDashboardDate(event.date)}</p><p><i class="far fa-clock w-4 mr-2 text-center"></i>${window.formatDashboardTime(event.date)}</p><p><i class="fas fa-map-marker-alt w-4 mr-2 text-center"></i>${event.location || 'N/A'}</p><p><i class="fas fa-tag w-4 mr-2 text-center"></i>${event.kategori || 'N/A'}</p><p><i class="fas fa-ticket-alt w-4 mr-2 text-center"></i>${event.ticket === 'Berbayar' ? `Rp ${Number(event.ticketPrice || 0).toLocaleString('id-ID')}` : (event.ticket || 'N/A')}</p><p><i class="fas fa-users w-4 mr-2 text-center"></i>${event.currentParticipants || 0}/${event.maxParticipants || '∞'} Peserta</p></div>
                <div class="event-actions mt-4 flex space-x-2"><button class="btn btn-outline btn-view flex-1" data-action="view" data-event-id="${event._id}"><i class="fas fa-eye mr-1"></i>Lihat</button><button class="btn btn-outline btn-edit flex-1" data-action="edit" data-event-id="${event._id}"><i class="fas fa-edit mr-1"></i>Edit</button><button class="btn btn-danger btn-delete flex-1" data-action="delete" data-event-id="${event._id}"><i class="fas fa-trash mr-1"></i>Hapus</button></div></div>
            </div>`).join('');
        if (typeof AOS !== 'undefined') AOS.refresh();
    }

    // --- MEMUAT DATA DASHBOARD ---
    async function loadMyEventsDataInternal() {
        if (!eventListContainerDash && !currentUserId) return;
        try {
            // Tampilkan placeholder loading jika perlu
            if(eventListContainerDash) eventListContainerDash.innerHTML = `<p class="col-span-full text-center py-10">Memuat event Anda...</p>`;
            const response = await fetchApiDashboardInternal(`/event/getByCreatorID/${currentUserId}`); // Menggunakan currentUserId
            myEventsCacheDash = response.data || [];
            renderMyEventsListInternal(myEventsCacheDash);
        } catch (error) {
            if (eventListContainerDash) renderMyEventsListInternal([]);
            // Notifikasi error sudah ditangani oleh fetchApiDashboardInternal
        }
    }
    async function loadDashboardStatsDataInternal() { /* ... implementasi seperti sebelumnya ... */ 
        if (!statsTotalEventsElDash) return;
        try {
            const response = await fetchApiDashboardInternal('/event/getUserStats');
            const stats = response.data;
            if (stats) {
                if (statsTotalEventsElDash) statsTotalEventsElDash.textContent = stats.totalEvents || 0;
                if (statsCreatedEventsElDash) statsCreatedEventsElDash.textContent = stats.createdEvents || stats.pendingEvents || 0;
                if (statsUpcomingEventsElDash) statsUpcomingEventsElDash.textContent = stats.upcomingEvents || stats.approvedEvents || 0;
                if (statsCompletedEventsElDash) statsCompletedEventsElDash.textContent = stats.completedEvents || 0;
            }
        } catch (error) { console.error('Gagal load stats:', error); }
    }
    async function loadDiscoverEventsDataInternal() { /* ... implementasi seperti sebelumnya ... */
        if (!discoverEventsContainerDash) return;
        discoverEventsContainerDash.innerHTML = `<p class="text-gray-500 p-4">Memuat event...</p>`;
        try {
            const response = await fetchApiDashboardInternal('/event/getDiscoverEvents?limit=6');
            const events = response.data || [];
            if (events.length === 0) { discoverEventsContainerDash.innerHTML = `<p class="text-gray-500 p-4">Belum ada event.</p>`; return; }
            discoverEventsContainerDash.innerHTML = events.map(event => `
             <div class="discover-event-card cursor-pointer" data-id="${event._id}" data-action="view-discover-event">
                 <div class="discover-event-img"><img src="${(event.images && event.images[0]) ? event.images[0] : '../../assets/image/default-event.jpg'}" alt="${event.title}" onerror="this.onerror=null; this.src='../../assets/image/default-event.jpg';"></div>
                 <div class="discover-event-content p-3"><span class="discover-event-date text-xs text-gray-500">${window.formatDashboardDate(event.date, {day: 'numeric', month: 'short', year: 'numeric'})}</span><h3 class="discover-event-title font-semibold truncate" title="${event.title}">${event.title}</h3><div class="discover-event-footer text-xs mt-1 flex justify-between items-center"><div class="discover-event-location truncate"><i class="fas fa-map-marker-alt mr-1"></i>${event.location}</div><div class="discover-event-category badge badge-info badge-sm">${event.kategori}</div></div></div>
             </div>`).join('');
            if (typeof AOS !== 'undefined') AOS.refresh();
        } catch (error) { discoverEventsContainerDash.innerHTML = `<p class="text-red-500 p-4">Gagal memuat.</p>`; }
    }
    async function loadUpcomingEventsWidgetDataInternal() { /* ... implementasi seperti sebelumnya ... */
        if (!upcomingEventsContainerDash) return;
        upcomingEventsContainerDash.innerHTML = `<p class="text-gray-500 text-xs p-2">Memuat...</p>`;
        try {
            const response = await fetchApiDashboardInternal('/event/getUpcomingEvents?limit=3');
            const events = response.data || [];
            if (events.length === 0) { upcomingEventsContainerDash.innerHTML = `<p class="text-gray-500 text-xs p-2">Tidak ada event.</p>`; return; }
            upcomingEventsContainerDash.innerHTML = events.map(event => { const d=new Date(event.date); return `
            <div class="upcoming-event flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer" data-id="${event._id}" data-action="view-upcoming-widget-event">
                <div class="upcoming-event-date text-center mr-3"><span class="upcoming-event-day block text-lg font-bold">${d.getDate()}</span><span class="upcoming-event-month block text-xs uppercase">${d.toLocaleString('id-ID', { month: 'short' })}</span></div>
                <div class="upcoming-event-info"><h3 class="upcoming-event-title font-semibold text-sm truncate" title="${event.title}">${event.title}</h3><div class="upcoming-event-time text-xs text-gray-500"><i class="far fa-clock mr-1"></i>${window.formatDashboardTime(event.date)}</div></div>
            </div>`}).join('');
            if (typeof AOS !== 'undefined') AOS.refresh();
        } catch (error) { upcomingEventsContainerDash.innerHTML = `<p class="text-red-500 text-xs p-2">Gagal.</p>`;}
    }
    async function loadNotificationsDataInternal() { /* ... implementasi seperti sebelumnya ... */
        if (!notificationsContainerDash) return;
        notificationsContainerDash.innerHTML = `<p class="text-gray-500 text-xs p-2">Memuat...</p>`;
        try {
            const response = await fetchApiDashboardInternal('/notifications/getUserNotifications?limit=4');
            const notifications = response.data || [];
            if (notifications.length === 0) { notificationsContainerDash.innerHTML = `<p class="text-gray-500 text-xs p-2">Tidak ada notifikasi.</p>`; return; }
            notificationsContainerDash.innerHTML = notifications.map(n => `
            <div class="notification flex items-start p-2 hover:bg-gray-100 rounded" data-id="${n._id}">
                <div class="notification-icon text-lg mr-3 w-5 text-center"><i class="fas ${window.getDashboardNotificationIcon(n.type || 'default')}"></i></div>
                <div class="notification-content"><div class="notification-text text-sm">${n.title ? `<strong>${n.title}</strong> ` : ''}${n.message}</div><div class="notification-time text-xs text-gray-500 mt-1">${window.formatDashboardTimeAgo(n.createdAt)}</div></div>
            </div>`).join('');
            if (typeof AOS !== 'undefined') AOS.refresh();
        } catch (error) { notificationsContainerDash.innerHTML = `<p class="text-red-500 text-xs p-2">Gagal.</p>`;}
    }

    // --- EVENT HANDLERS ---
    function handleSidebarToggleDashInternal() { sidebarDash?.classList.toggle('show'); }
    function handleUserDropdownToggleDashInternal(e) { e.stopPropagation(); userDropdownMenuDash?.classList.toggle('show'); }
    function handleClickOutsideDropdownDashInternal(e) { /* ... implementasi seperti sebelumnya ... */ 
        if (userDropdownMenuDash?.classList.contains('show') && !userDropdownToggleDash?.contains(e.target) && !userDropdownMenuDash.contains(e.target)) {
            userDropdownMenuDash.classList.remove('show');
        }
    }
    async function handleLogoutUserInternal(e) { /* ... implementasi seperti sebelumnya ... */ 
        e.preventDefault(); window.showGlobalNotification('Logout...', 'info', null);
        localStorage.removeItem('token'); localStorage.removeItem('userId'); localStorage.removeItem('user');
        currentToken = null; currentUserId = null; // Bersihkan variabel global juga
        setTimeout(() => { window.location.href = '../auth/login.html'; }, 1500);
    }
    function handleMyEventsActionsInternal(e) { /* ... implementasi seperti sebelumnya, gunakan currentUserId jika perlu ... */ 
        const button = e.target.closest('button.btn-view, button.btn-edit, button.btn-delete');
        if (!button) return;
        const action = button.dataset.action; const eventId = button.dataset.eventId;
        if (!action || !eventId) return;
        if (action === 'view') window.location.href = `eventDetail.html?id=${eventId}`;
        else if (action === 'edit') window.location.href = `editEvent.html?id=${eventId}`;
        else if (action === 'delete') confirmDeleteMyEventInternal(eventId, button.closest('.event-card'));
    }
    async function confirmDeleteMyEventInternal(eventId, eventElement) { /* ... implementasi seperti sebelumnya, gunakan currentToken ... */ 
        if (!confirm('Yakin hapus event ini?')) return;
        window.showGlobalNotification('Menghapus...', 'info', null);
        try {
            await fetchApiDashboardInternal(`/event/deleteEvent/${eventId}`, { method: 'DELETE' });
            window.showGlobalNotification('Event dihapus!', 'success');
            if (eventElement) {
                eventElement.style.transition = 'opacity 0.3s, transform 0.3s'; eventElement.style.opacity='0'; eventElement.style.transform='scale(0.95)';
                setTimeout(() => { eventElement.remove(); myEventsCacheDash=myEventsCacheDash.filter(ev=>ev._id!==eventId); if(myEventsCacheDash.length===0 && eventListContainerDash)renderMyEventsListInternal([]); if(typeof AOS!=='undefined')AOS.refresh();},300);
            } else { loadMyEventsDataInternal(); }
            loadDashboardStatsDataInternal();
        } catch (error) { /* error sudah ditangani fetchApi */ }
    }
    function handleGeneralDashboardClicksInternal(e) { /* ... implementasi seperti sebelumnya ... */ 
        const discoverCard = e.target.closest('.discover-event-card[data-action="view-discover-event"]');
        if (discoverCard) { window.location.href = `eventDetail.html?id=${discoverCard.dataset.id}`; return; }
        const upcomingWidgetEvent = e.target.closest('.upcoming-event[data-action="view-upcoming-widget-event"]');
        if (upcomingWidgetEvent) { window.location.href = `eventDetail.html?id=${upcomingWidgetEvent.dataset.id}`; return;}
    }

    // --- SETUP EVENT LISTENERS ---
    function setupDashboardEventListenersInternal() {
        menuToggleDash?.addEventListener('click', handleSidebarToggleDashInternal);
        userDropdownToggleDash?.addEventListener('click', handleUserDropdownToggleDashInternal);
        document.addEventListener('click', handleClickOutsideDropdownDashInternal);
        logoutBtnDash?.addEventListener('click', handleLogoutUserInternal);
        eventListContainerDash?.addEventListener('click', handleMyEventsActionsInternal);
        discoverEventsContainerDash?.addEventListener('click', handleGeneralDashboardClicksInternal);
        upcomingEventsContainerDash?.addEventListener('click', handleGeneralDashboardClicksInternal);
    }

    // --- INISIALISASI DASHBOARD ---
    function initializeUserDashboardInternal() {
        // Cek autentikasi sudah dilakukan di awal DOMContentLoaded
        setupDashboardEventListenersInternal();
        Promise.allSettled([
            loadMyEventsDataInternal(),
            loadDashboardStatsDataInternal(),
            loadDiscoverEventsDataInternal(),
            loadUpcomingEventsWidgetDataInternal(),
            loadNotificationsDataInternal()
        ]).then(results => {
            results.forEach(result => {
                if (result.status === 'rejected') {
                    console.warn('Satu atau lebih pemuatan data dashboard gagal:', result.reason);
                }
            });
            console.log('Dashboard pengguna selesai diinisialisasi.');
            if (typeof AOS !== 'undefined') AOS.refresh();
        });
    }

    // Jalankan inisialisasi dashboard utama
    initializeUserDashboardInternal();

    // Ekspos fungsi untuk di panggil oleh createEvent.js (jika createEvent.js masih terpisah)
    window.refreshDashboardData = () => {
        console.log('Memperbarui data dashboard dari panggilan eksternal...');
        loadMyEventsDataInternal();
        loadDashboardStatsDataInternal();
        // Opsional: refresh bagian lain jika perlu
    };
});