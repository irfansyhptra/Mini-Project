// dashboardUser.js (Optimized and Refactored - No Time Input for Event Creation)

document.addEventListener('DOMContentLoaded', async function () {
    // --- KONFIGURASI & KONSTANTA GLOBAL ---
    const API_BASE_URL_DASH = 'https://back-end-eventory.vercel.app';
    let currentToken;
    let currentUserId;
    let currentUserData;
    let myEventsCacheDash = [];

    // --- PENGAMBILAN TOKEN DAN USER DATA, CEK AUTENTIKASI ---
    currentToken = localStorage.getItem('token');
    const userDataString = localStorage.getItem('user');
    currentUserId = localStorage.getItem('userId');

    if (!currentToken || !userDataString) {
        alert('Sesi Anda tidak valid atau telah berakhir. Silakan login kembali.');
        window.location.href = 'login.html'; // Sesuaikan path
        return;
    }

    try {
        currentUserData = JSON.parse(userDataString);
        if (!currentUserId && currentUserData && currentUserData._id) {
            currentUserId = currentUserData._id;
            localStorage.setItem('userId', currentUserId);
        }
        if (!currentUserId) {
            throw new Error("ID Pengguna tidak ditemukan.");
        }
    } catch (e) {
        console.error("Error parsing user data:", e);
        alert('Data pengguna rusak. Silakan login kembali.');
        localStorage.clear();
        window.location.href = 'login.html'; // Sesuaikan path
        return;
    }

    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, easing: 'ease-in-out', once: true });
    }

    // --- ELEMEN DOM ---
    const eventListContainerDash = document.getElementById('event-list');
    const menuToggleDash = document.getElementById('menu-toggle');
    const sidebarDash = document.getElementById('sidebar');
    const userDropdownToggleDash = document.getElementById('user-dropdown-toggle');
    const userDropdownMenuDash = document.getElementById('user-dropdown-menu');
    const logoutBtnDropdown = userDropdownMenuDash?.querySelector('a[href*="index.html"]');
    const logoutBtnSidebar = document.getElementById('logout-btn-sidebar'); // ID dari myEvent.html

    const statsTotalEventsElDash = document.getElementById('total-events'); // dari dashboardUser.html
    const statsCreatedEventsElDash = document.getElementById('created-events'); // dari dashboardUser.html
    const statsUpcomingEventsElDash = document.getElementById('upcoming-events-stat'); // dari dashboardUser.html
    const statsCompletedEventsElDash = document.getElementById('completed-events-stat'); // dari dashboardUser.html

    const createEventModalEl = document.getElementById('create-event-modal'); // dari dashboardUser.html
    const createEventFormEl = document.getElementById('create-event-form'); // dari dashboardUser.html
    const openModalButtonEl = document.getElementById('create-event-btn'); // dari dashboardUser.html
    const quickOpenModalButtonEl = document.getElementById('quick-create-event'); // dari dashboardUser.html
    const closeModalButtonEl = document.getElementById('close-event-modal-btn'); // dari dashboardUser.html
    const cancelEventButtonEl = document.getElementById('cancel-event-btn'); // dari dashboardUser.html
    const saveEventButtonEl = document.getElementById('save-event'); // dari dashboardUser.html

    // Input Modal (Pastikan ID ini SAMA dengan di dashboardUser.html)
    const eventNameInputEl = document.getElementById('event-name');
    const eventDescriptionInputEl = document.getElementById('event-description');
    const eventDateInputEl = document.getElementById('event-date');
    // eventTimeInputEl dihapus
    const eventLocationInputEl = document.getElementById('event-location');
    const eventCategoryInputEl = document.getElementById('event-category');
    const eventCapacityInputEl = document.getElementById('event-capacity');
    const eventImageInputEl = document.getElementById('event-image');
    const eventTicketsSelectEl = document.getElementById('event-tickets');
    const ticketPriceGroupEl = document.getElementById('ticket-price-group');
    const ticketPriceInputEl = document.getElementById('ticket-price');

    // --- FUNGSI UTILITAS GLOBAL ---
    window.formatDashboardDate = (dateString, options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) => { if (!dateString) return 'N/A'; try { return new Date(dateString).toLocaleDateString('id-ID', options); } catch (e) { return "Format Salah"; }};
    window.formatDashboardTime = (dateString, options = { hour: '2-digit', minute: '2-digit' }) => { if (!dateString) return 'N/A'; try { /* Jika API mengembalikan date tanpa waktu, ini mungkin menunjukkan 00:00 */ return new Date(dateString).toLocaleTimeString('id-ID', options); } catch (e) { return "Format Salah"; }};
    window.formatDashboardTimeAgo = (dateString) => { if (!dateString) return 'N/A'; try { const date = new Date(dateString); const now = new Date(); const diffInSeconds = Math.floor((now - date) / 1000); if (diffInSeconds < 5) return 'Baru saja'; if (diffInSeconds < 60) return `${diffInSeconds} dtk lalu`; if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mnt lalu`; if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`; return `${Math.floor(diffInSeconds / 86400)} hr lalu`; } catch (e) { return "Format Salah"; }};
    window.getDashboardStatusClass = (status) => { const s = { p: 'pending', a: 'approved', r: 'rejected', c: 'cancelled', co: 'completed', ac: 'active' }; const sc = { [s.p]: 'status-pending', [s.a]: 'status-approved', [s.r]: 'status-rejected', [s.c]: 'status-cancelled', [s.co]: 'status-completed', [s.ac]: 'status-active' }; return sc[String(status).toLowerCase()] || 'status-default'; };
    window.getDashboardStatusText = (status) => { const s = { p: 'pending', a: 'approved', r: 'rejected', c: 'cancelled', co: 'completed', ac: 'active' }; const st = { [s.p]: 'Menunggu Verifikasi', [s.a]: 'Terverifikasi', [s.r]: 'Ditolak', [s.c]: 'Dibatalkan', [s.co]: 'Selesai', [s.ac]: 'Sedang Berlangsung' }; return st[String(status).toLowerCase()] || status || 'Tidak Diketahui'; };
    window.getDashboardNotificationIcon = (type) => { const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle', event_created: 'fa-calendar-plus', default: 'fa-info-circle' }; return icons[type] || icons.default; };
    function createGlobalNotificationAreaInternalDash() { let area = document.getElementById('global-notification-area'); if (!area) { area = document.createElement('div'); area.id = 'global-notification-area'; area.style.position = 'fixed'; area.style.top = '20px'; area.style.right = '20px'; area.style.zIndex = '2000'; document.body.appendChild(area); } return area; }
    window.showGlobalNotification = (message, type = 'info', duration = 5000) => { const area = createGlobalNotificationAreaInternalDash(); const n = document.createElement('div'); n.className = `custom-notification custom-notification-${type}`;  n.style.padding = '10px'; n.style.marginBottom = '10px'; n.style.borderRadius = '5px'; n.style.color = 'white'; n.style.backgroundColor = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'; n.innerHTML = `<i class="fas ${window.getDashboardNotificationIcon(type)}"></i><span>${message}</span><button style="float:right; background:none; border:none; color:white; font-size:1.2em;">&times;</button>`; area.appendChild(n); setTimeout(() => n.style.opacity = '1', 10); const dismiss = () => { n.style.opacity = '0'; setTimeout(() => n.remove(), 300); }; n.querySelector('button').addEventListener('click', dismiss); if (duration) setTimeout(dismiss, duration); };

    // --- PEMANGGILAN API ---
    async function fetchApiDashboardInternal(endpoint, options = {}) {
        const headers = { 'Authorization': `Bearer ${currentToken}`, ...options.headers };
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }
        try {
            const response = await fetch(`${API_BASE_URL_DASH}${endpoint}`, { ...options, headers });
            const responseData = await response.json().catch(() => ({ message: `Respons tidak valid (Status: ${response.status})` }));
            if (!response.ok) throw new Error(responseData.message || `Error: ${response.status}`);
            return responseData;
        } catch (error) {
            console.error(`API call to ${API_BASE_URL_DASH}${endpoint} failed:`, error);
            window.showGlobalNotification(error.message || 'Kesalahan jaringan.', 'error');
            throw error;
        }
    }

    // --- FUNGSI MODAL CREATE EVENT ---
    function openCreateEventModalInternal() {
        if (createEventModalEl) {
            createEventFormEl?.reset();
            toggleTicketPriceVisibilityInternal();
            createEventModalEl.classList.add('show'); // Gunakan class dari CSS dashboardUser.html
        }
    }
    function closeCreateEventModalInternal() { createEventModalEl?.classList.remove('show'); }
    function toggleTicketPriceVisibilityInternal() {
        if (eventTicketsSelectEl && ticketPriceGroupEl && ticketPriceInputEl) {
            const isPaid = eventTicketsSelectEl.value === 'Berbayar';
            ticketPriceGroupEl.style.display = isPaid ? 'block' : 'none';
            ticketPriceInputEl.required = isPaid;
            if (!isPaid) ticketPriceInputEl.value = '';
        }
    }
    function formatDateToISO_UTC_Internal(dateString) { // Hanya menerima dateString
        if (!dateString) return null;
        try {
            // Mengatur tanggal ke awal hari (00:00:00) dalam UTC
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return null;
            date.setUTCHours(0, 0, 0, 0); // Set ke awal hari UTC
            return date.toISOString();
        } catch (e) { console.error("Error formatting date:", e); return null; }
    }

    async function handleSubmitNewEventInternal(event) {
        event.preventDefault();
        if (!createEventFormEl || !saveEventButtonEl) return;

        if (!eventNameInputEl || !eventDescriptionInputEl || !eventDateInputEl ||
            !eventLocationInputEl || !eventCategoryInputEl || !eventCapacityInputEl || !eventImageInputEl ||
            !eventTicketsSelectEl || !ticketPriceInputEl) {
            window.showGlobalNotification("Elemen form tidak lengkap.", 'error');
            return;
        }

        saveEventButtonEl.disabled = true;
        window.showGlobalNotification("Memproses...", "info", null);

        try {
            const dateForAPI = formatDateToISO_UTC_Internal(eventDateInputEl.value); // Hanya tanggal
            const imageFile = eventImageInputEl.files?.[0];

            if (!eventNameInputEl.value.trim() || !eventDescriptionInputEl.value.trim() || !dateForAPI ||
                !eventLocationInputEl.value.trim() || !eventCategoryInputEl.value || !eventCapacityInputEl.value || !imageFile) {
                throw new Error("Harap lengkapi semua field wajib (*) dan unggah gambar.");
            }
            if (eventTicketsSelectEl.value === 'Berbayar' && !ticketPriceInputEl.value.trim()) {
                throw new Error('Harga tiket wajib diisi untuk event berbayar.');
            }

            const formData = new FormData();
            formData.append('CreatorID', currentUserId);
            formData.append('title', eventNameInputEl.value.trim());
            formData.append('description', eventDescriptionInputEl.value.trim());
            formData.append('date', dateForAPI); // API harus bisa menangani tanggal tanpa waktu spesifik
            formData.append('location', eventLocationInputEl.value.trim());
            formData.append('kategori', eventCategoryInputEl.value);
            formData.append('maxParticipants', eventCapacityInputEl.value);
            formData.append('images', imageFile);
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
            window.refreshDashboardData();

        } catch (error) {
            console.error("Error saat membuat event:", error);
            window.showGlobalNotification(error.message || 'Gagal membuat event.', 'error');
        } finally {
            saveEventButtonEl.disabled = false;
        }
    }

    // --- RENDER "MY EVENTS" ---
    function renderMyEventsListInternal(events) {
        if (!eventListContainerDash) return;
        if (!events || events.length === 0) {
            eventListContainerDash.innerHTML = `<div class="no-events col-span-full"><p>Anda belum memiliki event.</p><button id="create-first-event-empty-btn" class="btn btn-primary mt-4"><i class="fas fa-plus mr-2"></i>Buat Event Baru</button></div>`;
            document.getElementById('create-first-event-empty-btn')?.addEventListener('click', openCreateEventModalInternal);
            return;
        }
        // Perhatikan di sini, formatDashboardTime mungkin tidak lagi relevan jika Anda hanya punya tanggal
        eventListContainerDash.innerHTML = events.map(event => `
            <div class="event-item" data-aos="fade-up" data-id="${event._id}">
                <div class="event-img"><img src="${(event.images && event.images[0]) ? event.images[0] : '../../assets/image/default-event.jpg'}" alt="${event.title || 'Event Image'}"></div>
                <div class="event-info">
                    <h3 class="event-title">${event.title || 'N/A'}</h3>
                    <div class="event-date"><i class="far fa-calendar-alt"></i> ${window.formatDashboardDate(event.date)}</div>
                    <div class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location || 'N/A'}</div>
                    <span class="event-status ${window.getDashboardStatusClass(event.status)}">${window.getDashboardStatusText(event.status)}</span>
                </div>
                <div class="event-actions">
                    <button class="btn-view" data-action="view" data-event-id="${event._id}"><i class="fas fa-eye"></i></button>
                    <button class="btn-edit" data-action="edit" data-event-id="${event._id}"><i class="fas fa-edit"></i></button>
                    <button class="btn-delete" data-action="delete" data-event-id="${event._id}"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>`).join('');
        if (typeof AOS !== 'undefined') AOS.refresh();
    }

    // --- MEMUAT DATA DASHBOARD ---
    async function loadMyEventsDataInternal() {
        if (!eventListContainerDash || !currentUserId) return;
        try {
            eventListContainerDash.innerHTML = `<p class="col-span-full text-center py-10">Memuat event Anda...</p>`;
            const response = await fetchApiDashboardInternal(`/event/getByCreatorID/${currentUserId}`);
            myEventsCacheDash = response.data || [];
            renderMyEventsListInternal(myEventsCacheDash);
        } catch (error) {
            if (eventListContainerDash) renderMyEventsListInternal([]);
        }
    }

    async function loadDashboardStatsDataInternal() {
        if (!statsTotalEventsElDash && !statsCreatedEventsElDash && !statsUpcomingEventsElDash && !statsCompletedEventsElDash) return;
        try {
             // Ganti dengan endpoint yang sesuai jika ada, atau hitung manual dari myEventsCacheDash jika perlu
            const response = await fetchApiDashboardInternal(`/event/getUserStats/${currentUserId}`); // Asumsi endpoint ini ada
            const stats = response.data;
            if (stats) {
                if (statsTotalEventsElDash) statsTotalEventsElDash.textContent = stats.totalEventsJoined || 0; // Field dari API
                if (statsCreatedEventsElDash) statsCreatedEventsElDash.textContent = stats.totalEventsCreated || 0; // Field dari API
                if (statsUpcomingEventsElDash) statsUpcomingEventsElDash.textContent = stats.upcomingEvents || 0; // Field dari API
                if (statsCompletedEventsElDash) statsCompletedEventsElDash.textContent = stats.completedEvents || 0; // Field dari API
            } else {
                 // Fallback jika API stats tidak ada, hitung dari event yang sudah dimuat
                if (statsTotalEventsElDash) statsTotalEventsElDash.textContent = myEventsCacheDash.length; // Contoh saja
                // ... dan seterusnya untuk stats lain jika perlu dihitung dari frontend
            }
        } catch (error) {
            console.error('Gagal memuat statistik dashboard:', error);
            // Set nilai default jika error
            if (statsTotalEventsElDash) statsTotalEventsElDash.textContent = 0;
            if (statsCreatedEventsElDash) statsCreatedEventsElDash.textContent = 0;
            if (statsUpcomingEventsElDash) statsUpcomingEventsElDash.textContent = 0;
            if (statsCompletedEventsElDash) statsCompletedEventsElDash.textContent = 0;
        }
    }


    // --- EVENT HANDLERS ---
    function handleSidebarToggleDashInternal() { sidebarDash?.classList.toggle('show'); }
    function handleUserDropdownToggleDashInternal(e) { e.stopPropagation(); userDropdownMenuDash?.classList.toggle('show'); }
    function handleClickOutsideDropdownDashInternal(e) { if (userDropdownMenuDash?.classList.contains('show') && !userDropdownToggleDash?.contains(e.target) && !userDropdownMenuDash.contains(e.target)) { userDropdownMenuDash.classList.remove('show'); } }
    function handleLogoutUserInternal(e) { e.preventDefault(); window.showGlobalNotification('Logout...', 'info', null); localStorage.clear(); setTimeout(() => { window.location.href = 'login.html'; }, 1500); }
    function handleMyEventsActionsInternal(e) {
        const button = e.target.closest('button[data-action]');
        if (!button) return;
        const action = button.dataset.action; const eventId = button.dataset.eventId;
        if (!action || !eventId) return;
        if (action === 'view') window.location.href = `detail-event.html?id=${eventId}`; // Path ke detail event Anda
        else if (action === 'edit') window.location.href = `editEvent.html?id=${eventId}`; // Path ke edit event Anda
        else if (action === 'delete') confirmDeleteMyEventInternal(eventId, button.closest('.event-item'));
    }
    async function confirmDeleteMyEventInternal(eventId, eventElement) {
        if (!confirm('Yakin hapus event ini?')) return;
        window.showGlobalNotification('Menghapus...', 'info', null);
        try {
            await fetchApiDashboardInternal(`/event/deleteEvent/${eventId}`, { method: 'DELETE' });
            window.showGlobalNotification('Event dihapus!', 'success');
            if (eventElement) { eventElement.remove(); }
            else { loadMyEventsDataInternal(); }
            myEventsCacheDash = myEventsCacheDash.filter(event => event._id !== eventId);
             if (myEventsCacheDash.length === 0 && eventListContainerDash) {
                renderMyEventsListInternal([]);
            }
            loadDashboardStatsDataInternal();
        } catch (error) { /* error sudah ditangani */ }
    }

    function updateUserInfoInUI() {
        if (currentUserData) {
            // Untuk dashboardUser.html
            const userNameSidebar = document.getElementById('user-name-sidebar'); // dari myEvent.html
            const userAvatarSidebar = document.getElementById('user-avatar-sidebar'); // dari myEvent.html
            const userNameHeader = document.getElementById('user-name-header'); // dari myEvent.html
            const userAvatarHeader = document.getElementById('user-avatar-header'); // dari myEvent.html

            // Untuk dashboardUser.html (yang mungkin berbeda dari myEvent.html)
            const dashboardUserNameElements = document.querySelectorAll('.user-name'); // Selector umum untuk nama pengguna
            const dashboardUserAvatarElements = document.querySelectorAll('.user-avatar img, .dropdown-toggle img'); // Selector umum untuk avatar
            const dashboardUserDropdownName = userDropdownToggleDash?.querySelector('span');


            const fullName = currentUserData.fullName || 'Pengguna';
            const avatar = currentUserData.profilePicture || '../../assets/image/dev1.jpg'; // Ganti dengan avatar default Anda

            if (userNameSidebar) userNameSidebar.textContent = fullName;
            if (userAvatarSidebar) userAvatarSidebar.src = avatar;
            if (userNameHeader) userNameHeader.textContent = fullName;
            if (userAvatarHeader) userAvatarHeader.src = avatar;

            dashboardUserNameElements.forEach(el => el.textContent = fullName);
            dashboardUserAvatarElements.forEach(el => el.src = avatar);
            if (dashboardUserDropdownName) dashboardUserDropdownName.textContent = fullName;
        }
    }


    // --- SETUP EVENT LISTENERS ---
    function setupDashboardEventListenersInternal() {
        menuToggleDash?.addEventListener('click', handleSidebarToggleDashInternal);
        userDropdownToggleDash?.addEventListener('click', handleUserDropdownToggleDashInternal);
        document.addEventListener('click', handleClickOutsideDropdownDashInternal);
        logoutBtnDropdown?.addEventListener('click', handleLogoutUserInternal);
        logoutBtnSidebar?.addEventListener('click', handleLogoutUserInternal);
        eventListContainerDash?.addEventListener('click', handleMyEventsActionsInternal);

        openModalButtonEl?.addEventListener('click', openCreateEventModalInternal);
        quickOpenModalButtonEl?.addEventListener('click', openCreateEventModalInternal);
        closeModalButtonEl?.addEventListener('click', closeCreateEventModalInternal);
        cancelEventButtonEl?.addEventListener('click', closeCreateEventModalInternal);
        createEventFormEl?.addEventListener('submit', handleSubmitNewEventInternal);
        eventTicketsSelectEl?.addEventListener('change', toggleTicketPriceVisibilityInternal);
    }

    // --- INISIALISASI DASHBOARD ---
    function initializeUserDashboardInternal() {
        updateUserInfoInUI();
        setupDashboardEventListenersInternal();
        toggleTicketPriceVisibilityInternal(); // Panggil untuk set state awal jika form sudah ada
        Promise.allSettled([
            loadMyEventsDataInternal(),
            loadDashboardStatsDataInternal(),
        ]).then(() => {
            console.log('Dashboard pengguna selesai diinisialisasi.');
            if (typeof AOS !== 'undefined') AOS.refresh();
        });
    }

    initializeUserDashboardInternal();

    window.refreshDashboardData = () => {
        console.log('Memperbarui data dashboard...');
        loadMyEventsDataInternal();
        loadDashboardStatsDataInternal();
    };
});