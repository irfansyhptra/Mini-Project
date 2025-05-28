// dashboardUser.js (Optimized and Refactored)

// --- KONFIGURASI & KONSTANTA GLOBAL ---
const API_BASE_URL_DASH = 'https://back-end-eventory.vercel.app';
let currentToken;
let currentUserId;
let currentUserData; // Untuk menyimpan data user setelah login

document.addEventListener('DOMContentLoaded', async function () {
    // --- PENGAMBILAN TOKEN DAN USER DATA, CEK AUTENTIKASI ---
    currentToken = localStorage.getItem('token');
    const userDataString = localStorage.getItem('user'); // Dari skrip login Anda

    if (!currentToken || !userDataString) {
        alert('Sesi Anda tidak valid atau telah berakhir. Silakan login kembali.');
        window.location.href = '../../pages/auth/login.html'; // Sesuaikan path ke halaman login Anda
        return;
    }

    try {
        currentUserData = JSON.parse(userDataString);
        if (!currentUserData || !currentUserData._id) {
            throw new Error("Data pengguna tidak lengkap.");
        }
        currentUserId = currentUserData._id;
    } catch (e) {
        console.error("Error parsing user data:", e);
        alert('Data pengguna rusak. Silakan login kembali.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId'); // Pastikan userId juga dihapus jika ada
        window.location.href = '../../pages/auth/login.html';
        return;
    }

    // Initialize AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, easing: 'ease-in-out', once: true });
    } else {
        console.warn('AOS library not found.');
    }

    // --- ELEMEN DOM ---
    const eventListContainerDash = document.getElementById('event-list');
    const menuToggleDash = document.getElementById('menu-toggle');
    const sidebarDash = document.getElementById('sidebar');
    const userDropdownToggleDash = document.getElementById('user-dropdown-toggle');
    const userDropdownMenuDash = document.getElementById('user-dropdown-menu');
    const logoutBtnDash = userDropdownMenuDash?.querySelector('a[href*="login.html"]') || document.getElementById('logout-btn-sidebar'); // Menyesuaikan dengan HTML myEvent.html dan dashboardUser.html

    // Elemen statistik
    const statsTotalEventsElDash = document.getElementById('total-events'); // ID dari HTML dashboardUser.html
    const statsCreatedEventsElDash = document.getElementById('created-events');
    const statsUpcomingEventsElDash = document.getElementById('upcoming-events-stat'); // Menggunakan id dari dashboardUser.html
    const statsCompletedEventsElDash = document.getElementById('completed-events-stat'); // Menggunakan id dari dashboardUser.html

    // Kontainer untuk bagian lain
    const discoverEventsContainerDash = document.getElementById('discover-events-list') || document.getElementById('discover-events'); // ID dari dashboardUser.html ATAU myEvent.html
    const upcomingEventsContainerDash = document.getElementById('upcoming-events-list') || document.getElementById('upcoming-events'); // ID dari dashboardUser.html ATAU myEvent.html
    const notificationsContainerDash = document.getElementById('notifications-list') || document.getElementById('notifications'); // ID dari dashboardUser.html ATAU myEvent.html

    // Elemen Modal Create Event (dari dashboardUser.html)
    const createEventModalEl = document.getElementById('create-event-modal');
    const createEventFormEl = document.getElementById('create-event-form');
    const openModalButtonEl = document.getElementById('create-event-btn');
    const quickOpenModalButtonEl = document.getElementById('quick-create-event');
    const closeModalButtonEl = document.getElementById('close-event-modal-btn');
    const cancelEventButtonEl = document.getElementById('cancel-event-btn');
    const saveEventButtonEl = document.getElementById('save-event'); // Tombol submit form create

    const eventNameInputEl = document.getElementById('event-name');
    const eventDescriptionInputEl = document.getElementById('event-description');
    const eventDateInputEl = document.getElementById('event-date');
    const eventTimeInputEl = document.getElementById('event-time'); // Pastikan ID ini ada jika Anda memisahkannya
    const eventLocationInputEl = document.getElementById('event-location');
    const eventCategoryInputEl = document.getElementById('event-category');
    const eventCapacityInputEl = document.getElementById('event-capacity');
    const eventImageInputEl = document.getElementById('event-image');
    const eventTicketsSelectEl = document.getElementById('event-tickets');
    const ticketPriceGroupEl = document.getElementById('ticket-price-group');
    const ticketPriceInputEl = document.getElementById('ticket-price');

    // --- STATE APLIKASI ---
    let myEventsCacheDash = [];

    // --- FUNGSI UTILITAS GLOBAL (Didefinisikan di scope ini atau via window jika perlu diakses file lain) ---
    // Salin semua fungsi window.formatDashboardDate, window.showGlobalNotification, dll. dari versi sebelumnya ke sini.
    // Pastikan tidak ada duplikasi jika Anda punya file utils.js terpisah.
    // Contoh:
    window.formatDashboardDate = (dateString, options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) => { /* ... implementasi ... */ if (!dateString) return 'N/A'; try { return new Date(dateString).toLocaleDateString('id-ID', options); } catch (e) { console.warn("Invalid date:", dateString, e); return "Format Salah"; }};
    window.formatDashboardTime = (dateString, options = { hour: '2-digit', minute: '2-digit' }) => { /* ... implementasi ... */ if (!dateString) return 'N/A'; try { return new Date(dateString).toLocaleTimeString('id-ID', options); } catch (e) { console.warn("Invalid time:", dateString, e); return "Format Salah"; }};
    window.formatDashboardTimeAgo = (dateString) => { /* ... implementasi ... */ if (!dateString) return 'N/A'; try { const date = new Date(dateString); const now = new Date(); const diffInSeconds = Math.floor((now - date) / 1000); if (diffInSeconds < 5) return 'Baru saja'; if (diffInSeconds < 60) return `${diffInSeconds} dtk lalu`; if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mnt lalu`; if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`; return `${Math.floor(diffInSeconds / 86400)} hr lalu`; } catch (e) { return "Format Salah"; }};
    window.getDashboardStatusClass = (status) => { /* ... implementasi ... */ const s = { p: 'pending', a: 'approved', r: 'rejected', c: 'cancelled', co: 'completed', ac: 'active' }; const sc = { [s.p]: 'status-pending', [s.a]: 'status-approved', [s.r]: 'status-rejected', [s.c]: 'status-cancelled', [s.co]: 'status-completed', [s.ac]: 'status-active' }; return sc[String(status).toLowerCase()] || 'status-default'; };
    window.getDashboardStatusText = (status) => { /* ... implementasi ... */ const s = { p: 'pending', a: 'approved', r: 'rejected', c: 'cancelled', co: 'completed', ac: 'active' }; const st = { [s.p]: 'Menunggu Verifikasi', [s.a]: 'Terverifikasi', [s.r]: 'Ditolak', [s.c]: 'Dibatalkan', [s.co]: 'Selesai', [s.ac]: 'Sedang Berlangsung' }; return st[String(status).toLowerCase()] || status || 'Tidak Diketahui'; };
    window.getDashboardNotificationIcon = (type) => { /* ... implementasi ... */ const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle', event_created: 'fa-calendar-plus', default: 'fa-info-circle' }; return icons[type] || icons.default; };
    function createGlobalNotificationAreaInternalDash() { /* ... implementasi ... */ let area = document.getElementById('global-notification-area'); if (!area) { area = document.createElement('div'); area.id = 'global-notification-area'; document.body.appendChild(area); } return area; }
    window.showGlobalNotification = (message, type = 'info', duration = 5000) => { /* ... implementasi ... */ const area = createGlobalNotificationAreaInternalDash(); const n = document.createElement('div'); n.className = `custom-notification custom-notification-${type}`; n.innerHTML = `<div class="custom-notification-icon"><i class="fas ${window.getDashboardNotificationIcon(type)}"></i></div><div class="custom-notification-message">${message}</div><button class="custom-notification-close">&times;</button>`; area.appendChild(n); setTimeout(() => n.classList.add('show'), 10); const dismiss = () => { n.classList.remove('show'); setTimeout(() => n.remove(), 300); }; n.querySelector('.custom-notification-close').addEventListener('click', dismiss); if (duration) setTimeout(dismiss, duration); };


    // --- PEMANGGILAN API ---
    async function fetchApiDashboardInternal(endpoint, options = {}) {
        const headers = {
            'Authorization': `Bearer ${currentToken}`, // Menggunakan currentToken
            ...options.headers,
        };
        // Jangan set Content-Type jika body adalah FormData, browser akan menanganinya
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        try {
            const response = await fetch(`${API_BASE_URL_DASH}${endpoint}`, { ...options, headers });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Server Error: ${response.status}` }));
                throw new Error(errorData.message || `Gagal memproses. Status: ${response.status}`);
            }
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                return response.json();
            }
            return response.text(); // Untuk respons non-JSON (misalnya DELETE sukses tanpa body)
        } catch (error) {
            console.error(`API call to ${API_BASE_URL_DASH}${endpoint} failed:`, error);
            window.showGlobalNotification(error.message || 'Kesalahan jaringan saat mengambil data.', 'error');
            throw error;
        }
    }

    // --- FUNGSI MODAL CREATE EVENT ---
    function openCreateEventModalInternal() {
        if (createEventModalEl) {
            createEventFormEl?.reset();
            if(ticketPriceGroupEl) ticketPriceGroupEl.style.display = 'none';
            if(ticketPriceInputEl) { ticketPriceInputEl.value = ''; ticketPriceInputEl.required = false; }
            if(eventTicketsSelectEl) eventTicketsSelectEl.value = 'Gratis';
            createEventModalEl.classList.add('show'); // Menggunakan class 'show' dari CSS dashboardUser.html
        }
    }
    function closeCreateEventModalInternal() {
        if (createEventModalEl) {
            createEventModalEl.classList.remove('show');
        }
    }
    function toggleTicketPriceVisibilityInternal() {
        if (eventTicketsSelectEl && ticketPriceGroupEl && ticketPriceInputEl) {
            const isPaid = eventTicketsSelectEl.value === 'Berbayar';
            ticketPriceGroupEl.style.display = isPaid ? 'block' : 'none';
            ticketPriceInputEl.required = isPaid;
            if (!isPaid) ticketPriceInputEl.value = '';
        }
    }
     function formatDateToISO_UTC_Internal(dateString, timeString) {
        if (!dateString || !timeString) return null;
        try {
            const localDateTime = new Date(`${dateString}T${timeString}`);
            if (isNaN(localDateTime.getTime())) return null;
            return localDateTime.toISOString();
        } catch (e) { console.error("Error formatting date to ISO:", e); return null; }
    }

    async function handleSubmitNewEventInternal(event) {
        event.preventDefault();
        if(saveEventButtonEl) saveEventButtonEl.disabled = true;
        window.showGlobalNotification("Memproses pembuatan event...", "info", null); // null duration for manual close

        try {
            // Validasi (ambil dari createEvent.js sebelumnya, sesuaikan selector)
            if (!eventNameInputEl.value.trim() /* ... validasi field lain ... */ || !eventImageInputEl.files[0] ) {
                 throw new Error("Harap lengkapi semua field wajib dan unggah gambar.");
            }
            const dateForAPI = formatDateToISO_UTC_Internal(eventDateInputEl.value, eventTimeInputEl.value);
            if (!dateForAPI) throw new Error("Format tanggal atau waktu event tidak valid.");

            const formData = new FormData();
            formData.append('CreatorID', currentUserId); // Gunakan currentUserId
            formData.append('title', eventNameInputEl.value.trim());
            formData.append('description', eventDescriptionInputEl.value.trim());
            formData.append('date', dateForAPI);
            formData.append('location', eventLocationInputEl.value.trim());
            formData.append('kategori', eventCategoryInputEl.value);
            formData.append('maxParticipants', eventCapacityInputEl.value);
            formData.append('images', eventImageInputEl.files[0]);
            formData.append('ticket', eventTicketsSelectEl.value);
            if (eventTicketsSelectEl.value === 'Berbayar') {
                formData.append('ticketPrice', ticketPriceInputEl.value);
            }

            const result = await fetchApiDashboardInternal(`/event/createEvent`, {
                method: 'POST',
                body: formData,
            });

            window.showGlobalNotification(result.message || 'Event berhasil dibuat!', 'success');
            closeCreateEventModalInternal();
            window.refreshDashboardData(); // Panggil refresh global

        } catch (error) {
            console.error("Error saat membuat event:", error);
            window.showGlobalNotification(error.message || 'Gagal membuat event.', 'error');
        } finally {
            if(saveEventButtonEl) saveEventButtonEl.disabled = false;
        }
    }


    // --- RENDER "MY EVENTS" ---
    function renderMyEventsListInternal(events) { /* ... implementasi dari versi sebelumnya ... */ 
        if (!eventListContainerDash) return;
        if (!events || events.length === 0) {
            eventListContainerDash.innerHTML = `<div class="empty-state col-span-full text-center py-10" data-aos="fade-up"><i class="fas fa-calendar-times fa-3x text-gray-400 mb-4"></i><p class="text-xl text-gray-600">Anda belum memiliki event.</p><button id="create-first-event-empty-btn" class="btn btn-primary mt-6 inline-block"> <i class="fas fa-plus mr-2"></i>Buat Event</button></div>`;
            document.getElementById('create-first-event-empty-btn')?.addEventListener('click', openCreateEventModalInternal);
            return;
        }
        eventListContainerDash.innerHTML = events.map(event => `
            <div class="event-item bg-white shadow-md rounded-lg overflow-hidden" data-aos="fade-up" data-id="${event._id}">
                <div class="event-img relative"><img src="${(event.images && event.images[0]) ? event.images[0] : '../../assets/image/default-event.jpg'}" alt="${event.title || 'Event'}" class="w-full h-48 object-cover" onerror="this.onerror=null; this.src='../../assets/image/default-event.jpg';"><span class="event-status absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded ${window.getDashboardStatusClass(event.status)}">${window.getDashboardStatusText(event.status)}</span></div>
                <div class="event-info p-4"><h3 class="event-title text-lg font-bold mb-2 truncate" title="${event.title}">${event.title || 'N/A'}</h3><div class="event-details text-sm text-gray-700 space-y-1"><p><i class="far fa-calendar-alt mr-2"></i>${window.formatDashboardDate(event.date)}</p><p><i class="far fa-clock mr-2"></i>${window.formatDashboardTime(event.date)}</p><p><i class="fas fa-map-marker-alt mr-2"></i>${event.location || 'N/A'}</p><p><i class="fas fa-tag mr-2"></i>${event.kategori || 'N/A'}</p><p><i class="fas fa-ticket-alt mr-2"></i>${event.ticket === 'Berbayar' ? `Rp ${Number(event.ticketPrice || 0).toLocaleString('id-ID')}` : (event.ticket || 'N/A')}</p><p><i class="fas fa-users mr-2"></i>${event.currentParticipants || 0}/${event.maxParticipants || '∞'} Peserta</p></div></div>
                <div class="event-actions p-4 border-t border-gray-200 flex space-x-2"><button class="btn-action btn-view flex-1 text-sm" data-action="view" data-event-id="${event._id}"><i class="fas fa-eye mr-1"></i>Lihat</button><button class="btn-action btn-edit flex-1 text-sm" data-action="edit" data-event-id="${event._id}"><i class="fas fa-edit mr-1"></i>Edit</button><button class="btn-action btn-delete flex-1 text-sm text-red-500 hover:text-red-700" data-action="delete" data-event-id="${event._id}"><i class="fas fa-trash-alt mr-1"></i>Hapus</button></div>
            </div>`).join('');
        if (typeof AOS !== 'undefined') AOS.refresh();
    }

    // --- MEMUAT DATA DASHBOARD ---
    async function loadMyEventsDataInternal() { /* ... implementasi seperti sebelumnya, gunakan currentUserId ... */ 
        if (!eventListContainerDash && !currentUserId) return;
        try {
            if(eventListContainerDash) eventListContainerDash.innerHTML = `<p class="col-span-full text-center py-10">Memuat event Anda...</p>`;
            const response = await fetchApiDashboardInternal(`/event/getByCreatorID/${currentUserId}`);
            myEventsCacheDash = response.data || [];
            renderMyEventsListInternal(myEventsCacheDash);
        } catch (error) {
            if (eventListContainerDash) renderMyEventsListInternal([]);
        }
    }
    async function loadDashboardStatsDataInternal() { /* ... implementasi seperti sebelumnya ... */ 
        if (!statsTotalEventsElDash) return; // Hanya muat jika elemen statistik ada
        try {
            const response = await fetchApiDashboardInternal(`/event/getUserStats`); // API tahu user dari token
            const stats = response.data; 
            if (stats) {
                if (statsTotalEventsElDash) statsTotalEventsElDash.textContent = stats.totalEventsCreated || 0;
                if (statsCreatedEventsElDash) statsCreatedEventsElDash.textContent = stats.eventsPending || 0;
                if (statsUpcomingEventsElDash) statsUpcomingEventsElDash.textContent = stats.eventsApproved || 0;
                if (statsCompletedEventsElDash) statsCompletedEventsElDash.textContent = stats.eventsCompleted || 0;
            }
        } catch (error) { console.error('Gagal memuat statistik dashboard:', error); }
    }
    async function loadDiscoverEventsDataInternal() { /* ... implementasi seperti sebelumnya ... */ 
        if (!discoverEventsContainerDash) return;
        discoverEventsContainerDash.innerHTML = `<p class="text-gray-500 p-4">Memuat event...</p>`;
        try {
            const response = await fetchApiDashboardInternal('/event/getAllEvents?limit=6&status=approved'); // Hanya tampilkan yang approved
            const events = response.data || [];
            if (events.length === 0) { discoverEventsContainerDash.innerHTML = `<p class="text-gray-500 p-4">Belum ada event untuk dijelajahi.</p>`; return; }
            discoverEventsContainerDash.innerHTML = events.map(event => `
             <div class="discover-event-card cursor-pointer" data-id="${event._id}" data-action="view-discover-event">
                 <div class="discover-event-img"><img src="${(event.images && event.images[0]) ? event.images[0] : '../../assets/image/default-event.jpg'}" alt="${event.title}" onerror="this.onerror=null; this.src='../../assets/image/default-event.jpg';"></div>
                 <div class="discover-event-content p-3"><span class="discover-event-date text-xs text-gray-500">${window.formatDashboardDate(event.date, {day: 'numeric', month: 'short', year: 'numeric'})}</span><h3 class="discover-event-title font-semibold truncate" title="${event.title}">${event.title}</h3><div class="discover-event-footer text-xs mt-1 flex justify-between items-center"><div class="discover-event-location truncate"><i class="fas fa-map-marker-alt mr-1"></i>${event.location}</div><div class="discover-event-category badge badge-info badge-sm">${event.kategori}</div></div></div>
             </div>`).join('');
            if (typeof AOS !== 'undefined') AOS.refresh();
        } catch (error) { discoverEventsContainerDash.innerHTML = `<p class="text-red-500 p-4">Gagal memuat event.</p>`; }
    }
    async function loadUpcomingEventsWidgetDataInternal() { /* ... implementasi seperti sebelumnya ... */ 
        if (!upcomingEventsContainerDash) return;
        upcomingEventsContainerDash.innerHTML = `<p class="text-gray-500 text-xs p-2">Memuat...</p>`;
        try {
            const response = await fetchApiDashboardInternal('/event/getAllEvents?sortBy=date&status=approved&limit=3'); // Ambil 3 event terdekat yang approved
            const events = response.data || [];
            if (events.length === 0) { upcomingEventsContainerDash.innerHTML = `<p class="text-gray-500 text-xs p-2">Tidak ada event mendatang.</p>`; return; }
            upcomingEventsContainerDash.innerHTML = events.map(event => { const d=new Date(event.date); return `
            <div class="upcoming-event flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer" data-id="${event._id}" data-action="view-upcoming-widget-event">
                <div class="upcoming-event-date text-center mr-3"><span class="upcoming-event-day block text-lg font-bold">${d.getDate()}</span><span class="upcoming-event-month block text-xs uppercase">${d.toLocaleString('id-ID', { month: 'short' })}</span></div>
                <div class="upcoming-event-info"><h3 class="upcoming-event-title font-semibold text-sm truncate" title="${event.title}">${event.title}</h3><div class="upcoming-event-time text-xs text-gray-500"><i class="far fa-clock mr-1"></i>${window.formatDashboardTime(event.date)}</div></div>
            </div>`}).join('');
            if (typeof AOS !== 'undefined') AOS.refresh();
        } catch (error) { upcomingEventsContainerDash.innerHTML = `<p class="text-red-500 text-xs p-2">Gagal memuat.</p>`;}
    }
    async function loadNotificationsDataInternal() { /* ... implementasi seperti sebelumnya ... */ 
        if (!notificationsContainerDash) return;
        notificationsContainerDash.innerHTML = `<p class="text-gray-500 text-xs p-2">Memuat notifikasi...</p>`;
        try {
            const response = await fetchApiDashboardInternal(`/notifications/getUserNotifications?userId=${currentUserId}&limit=4`); // Tambahkan userId
            const notifications = response.data || [];
            if (notifications.length === 0) { notificationsContainerDash.innerHTML = `<p class="text-gray-500 text-xs p-2">Tidak ada notifikasi baru.</p>`; return; }
            notificationsContainerDash.innerHTML = notifications.map(n => `
            <div class="notification flex items-start p-2 hover:bg-gray-100 rounded" data-id="${n._id}">
                <div class="notification-icon text-lg mr-3 w-5 text-center"><i class="fas ${window.getDashboardNotificationIcon(n.type || 'default')}"></i></div>
                <div class="notification-content"><div class="notification-text text-sm">${n.title ? `<strong>${n.title}</strong> ` : ''}${n.message}</div><div class="notification-time text-xs text-gray-500 mt-1">${window.formatDashboardTimeAgo(n.createdAt)}</div></div>
            </div>`).join('');
            if (typeof AOS !== 'undefined') AOS.refresh();
        } catch (error) { notificationsContainerDash.innerHTML = `<p class="text-red-500 text-xs p-2">Gagal memuat notifikasi.</p>`;}
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
        currentToken = null; currentUserId = null; currentUserData = null;
        setTimeout(() => { window.location.href = '../../pages/auth/login.html'; }, 1500); // Sesuaikan path
    }
    function handleMyEventsActionsInternal(e) { /* ... implementasi seperti sebelumnya ... */ 
        const button = e.target.closest('button.btn-action');
        if (!button) return;
        const action = button.dataset.action; const eventId = button.dataset.eventId;
        if (!action || !eventId) return;
        if (action === 'view') window.location.href = `../detailEvent.html?id=${eventId}`; // Sesuaikan path
        else if (action === 'edit') window.location.href = `../editEvent.html?id=${eventId}`; // Sesuaikan path
        else if (action === 'delete') confirmDeleteMyEventInternal(eventId, button.closest('.event-item')); // CSS class Anda .event-item
    }
    async function confirmDeleteMyEventInternal(eventId, eventElement) { /* ... implementasi seperti sebelumnya ... */ 
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
        if (discoverCard) { window.location.href = `../detailEvent.html?id=${discoverCard.dataset.id}`; return; } // Sesuaikan path
        const upcomingWidgetEvent = e.target.closest('.upcoming-event[data-action="view-upcoming-widget-event"]');
        if (upcomingWidgetEvent) { window.location.href = `../detailEvent.html?id=${upcomingWidgetEvent.dataset.id}`; return;} // Sesuaikan path
    }

    function updateUserInfoInUI() {
        if (currentUserData) {
            const userNameElements = document.querySelectorAll('.user-name'); // Digunakan di sidebar dashboardUser.html
            const userRoleElements = document.querySelectorAll('.user-role'); // Digunakan di sidebar dashboardUser.html
            const userAvatarElements = document.querySelectorAll('.user-avatar img'); // Untuk sidebar dan header
            const userDropdownName = userDropdownToggleDash?.querySelector('span');

            userNameElements.forEach(el => el.textContent = currentUserData.fullName || currentUserData.userName || 'Pengguna');
            userRoleElements.forEach(el => el.textContent = currentUserData.role === 'admin' ? 'Administrator' : 'Pengguna'); // Sesuaikan jika role berbeda
            userAvatarElements.forEach(el => el.src = currentUserData.profilePicture || '../../assets/image/default-avatar.png'); // Asumsi ada field profilePicture
            if(userDropdownName) userDropdownName.textContent = currentUserData.fullName || currentUserData.userName || 'Pengguna';
        }
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

        // Listener untuk modal create event
        openModalButtonEl?.addEventListener('click', openCreateEventModalInternal);
        quickOpenModalButtonEl?.addEventListener('click', openCreateEventModalInternal);
        closeModalButtonEl?.addEventListener('click', closeCreateEventModalInternal);
        cancelEventButtonEl?.addEventListener('click', closeCreateEventModalInternal);
        createEventFormEl?.addEventListener('submit', handleSubmitNewEventInternal);
        eventTicketsSelectEl?.addEventListener('change', toggleTicketPriceVisibilityInternal);
        toggleTicketPriceVisibilityInternal(); // Panggil sekali untuk inisialisasi
    }

    // --- INISIALISASI DASHBOARD ---
    function initializeUserDashboardInternal() {
        updateUserInfoInUI(); // Update info pengguna di UI
        setupDashboardEventListenersInternal();
        Promise.allSettled([
            loadMyEventsDataInternal(),
            loadDashboardStatsDataInternal(),
            loadDiscoverEventsDataInternal(),
            loadUpcomingEventsWidgetDataInternal(),
            loadNotificationsDataInternal()
        ]).then(results => {
            results.forEach(result => {
                if (result.status === 'rejected') console.warn('Sebagian data dashboard gagal dimuat:', result.reason);
            });
            console.log('Dashboard pengguna selesai diinisialisasi.');
            if (typeof AOS !== 'undefined') AOS.refresh();
        });
    }

    initializeUserDashboardInternal();

    // Ekspos fungsi untuk di panggil dari luar (misalnya, setelah edit event sukses)
    window.refreshDashboardData = () => {
        console.log('Memperbarui data dashboard dari panggilan eksternal...');
        loadMyEventsDataInternal();
        loadDashboardStatsDataInternal();
    };
});