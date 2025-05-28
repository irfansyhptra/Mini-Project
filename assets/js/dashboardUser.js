// assets/js/dashboardUser.js (Optimized - Consistent CreatorID/ID Pelapor Usage)

document.addEventListener('DOMContentLoaded', async function () {
    const API_BASE_URL_DASH = 'https://back-end-eventory.vercel.app';
    let currentToken;
    let currentUserId; // Ini akan menjadi CreatorID (ID Pelapor)
    let currentUserData;
    let myEventsCacheDash = [];

    // 1. --- PENGAMBILAN TOKEN DAN INFORMASI PENGGUNA ---
    currentToken = localStorage.getItem('token');
    currentUserId = localStorage.getItem('userId'); // Langsung ambil userId (CreatorID)
    const userDataString = localStorage.getItem('user');

    // Validasi Token
    if (!currentToken || currentToken === "null" || currentToken === "undefined" || currentToken.trim() === "") {
        alert('Sesi Anda tidak valid atau telah berakhir (Token Bermasalah). Silakan login kembali.');
        localStorage.clear();
        window.location.href = 'login.html'; // Sesuaikan path jika perlu
        return;
    }

    // Validasi CreatorID (userId)
    if (!currentUserId || currentUserId === "null" || currentUserId === "undefined" || currentUserId.trim() === "") {
        alert('ID Pengguna (ID Pelapor) tidak ditemukan. Sesi mungkin tidak valid. Silakan login kembali.');
        localStorage.clear();
        window.location.href = 'login.html'; // Sesuaikan path jika perlu
        return;
    }

    // Validasi dan Parsing User Data
    if (!userDataString) {
        alert('Data pengguna tidak ditemukan di localStorage. Silakan login kembali.');
        localStorage.clear();
        window.location.href = 'login.html'; // Sesuaikan path
        return;
    }
    try {
        currentUserData = JSON.parse(userDataString);
        // Verifikasi apakah _id di currentUserData sesuai dengan currentUserId jika perlu
        if (currentUserData && currentUserData._id !== currentUserId) {
            console.warn("Ketidaksesuaian antara userId di localStorage dan _id dalam objek user. Menggunakan userId dari localStorage.");
            // Bisa jadi ada kasus dimana objek 'user' di-update tapi 'userId' tidak.
            // Untuk konsistensi, kita bisa update objek 'user' jika _id nya beda:
            // currentUserData._id = currentUserId;
            // localStorage.setItem('user', JSON.stringify(currentUserData));
        }
    } catch (e) {
        console.error("Error parsing user data:", e);
        alert('Data pengguna di localStorage rusak. Silakan login kembali.');
        localStorage.clear();
        window.location.href = 'login.html'; // Sesuaikan path
        return;
    }


    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, easing: 'ease-in-out', once: true });
    }

    // --- ELEMEN DOM (Pastikan ID sesuai dengan HTML Anda) ---
    const eventListContainerDash = document.getElementById('event-list');
    const menuToggleDash = document.getElementById('menu-toggle');
    const sidebarDash = document.getElementById('sidebar');
    const userDropdownToggleDash = document.getElementById('user-dropdown-toggle');
    const userDropdownMenuDash = document.getElementById('user-dropdown-menu');
    const logoutBtnDropdown = userDropdownMenuDash?.querySelector('a[href*="index.html"]'); // Atau path login yg benar
    const logoutBtnSidebar = document.getElementById('logout-btn-sidebar'); // Untuk myEvent.html

    const statsCreatedEventsElDash = document.getElementById('created-events'); // Elemen untuk "Event Dibuat"

    const createEventModalEl = document.getElementById('create-event-modal');
    const createEventFormEl = document.getElementById('create-event-form');
    const openModalButtonEl = document.getElementById('create-event-btn');
    const quickOpenModalButtonEl = document.getElementById('quick-create-event');
    const closeModalButtonEl = document.getElementById('close-event-modal-btn');
    const cancelEventButtonEl = document.getElementById('cancel-event-btn');
    const saveEventButtonEl = document.getElementById('save-event');

    const eventNameInputEl = document.getElementById('event-name');
    const eventDescriptionInputEl = document.getElementById('event-description');
    const eventDateInputEl = document.getElementById('event-date');
    const eventLocationInputEl = document.getElementById('event-location');
    const eventCategoryInputEl = document.getElementById('event-category');
    const eventCapacityInputEl = document.getElementById('event-capacity');
    const eventImageInputEl = document.getElementById('event-image');
    const eventTicketsSelectEl = document.getElementById('event-tickets');
    const ticketPriceGroupEl = document.getElementById('ticket-price-group');
    const ticketPriceInputEl = document.getElementById('ticket-price');

    // --- FUNGSI UTILITAS (Sama seperti sebelumnya: format Tanggal, Status, Notifikasi) ---
    window.formatDashboardDate = (dateString, options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) => { if (!dateString) return 'N/A'; try { return new Date(dateString).toLocaleDateString('id-ID', options); } catch (e) { console.warn("Invalid date for format:", dateString); return "Format Salah"; }};
    window.getDashboardStatusClass = (status) => { const s = { pending: 'pending', approved: 'approved', rejected: 'rejected', cancelled: 'cancelled', completed: 'completed', active: 'active', default: 'default' }; const sc = { [s.pending]: 'status-pending', [s.approved]: 'status-approved', [s.rejected]: 'status-rejected', [s.cancelled]: 'status-cancelled', [s.completed]: 'status-completed', [s.active]: 'status-active' }; return sc[String(status).toLowerCase()] || s.default; };
    window.getDashboardStatusText = (status) => { const s = { pending: 'pending', approved: 'approved', rejected: 'rejected', cancelled: 'cancelled', completed: 'completed', active: 'active' }; const st = { [s.pending]: 'Menunggu Verifikasi', [s.approved]: 'Terverifikasi', [s.rejected]: 'Ditolak', [s.cancelled]: 'Dibatalkan', [s.completed]: 'Selesai', [s.active]: 'Sedang Berlangsung' }; return st[String(status).toLowerCase()] || status || 'Tidak Diketahui'; };
    window.getDashboardNotificationIcon = (type) => { const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle', event_created: 'fa-calendar-plus', default: 'fa-info-circle' }; return icons[type] || icons.default; };
    function createGlobalNotificationAreaInternalDash() { let area = document.getElementById('global-notification-area'); if (!area) { area = document.createElement('div'); area.id = 'global-notification-area'; Object.assign(area.style, { position: 'fixed', top: '20px', right: '20px', zIndex: '2000', width: 'auto', maxWidth: '400px' }); document.body.appendChild(area); } return area; }
    window.showGlobalNotification = (message, type = 'info', duration = 5000) => { const area = createGlobalNotificationAreaInternalDash(); const n = document.createElement('div'); const bgColor = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#17a2b8'; n.style.cssText = `padding: 12px 15px; margin-bottom: 10px; border-radius: 5px; color: white; background-color: ${bgColor}; box-shadow: 0 2px 10px rgba(0,0,0,0.2); opacity: 0; transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out; display: flex; align-items: center; transform: translateX(100%);`; n.innerHTML = `<i class="fas ${window.getDashboardNotificationIcon(type)}" style="margin-right: 10px; font-size: 1.2em;"></i><span style="flex-grow: 1;">${message}</span><button style="background:none; border:none; color:white; font-size:1.4em; line-height:1; cursor:pointer; margin-left:10px;">&times;</button>`; area.prepend(n); requestAnimationFrame(() => { n.style.opacity = '1';  n.style.transform = 'translateX(0)'; }); const dismiss = () => { n.style.opacity = '0'; n.style.transform = 'translateX(100%)'; setTimeout(() => n.remove(), 300); }; n.querySelector('button').addEventListener('click', dismiss); if (duration) setTimeout(dismiss, duration); };


    // 2. --- PEMANGGILAN API ---
    async function fetchApiDashboardInternal(endpoint, options = {}) {
        // Token sudah divalidasi di awal, namun double check tidak ada salahnya
        if (!currentToken) {
            console.error("CRITICAL: Token hilang sebelum panggilan API ke", endpoint);
            window.showGlobalNotification("Sesi berakhir. Harap login ulang.", 'error');
            localStorage.clear(); window.location.href = 'login.html';
            throw new Error("Token tidak ada untuk panggilan API.");
        }

        const headers = { 'Authorization': `Bearer ${currentToken}`, ...options.headers };
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        try {
            const response = await fetch(`${API_BASE_URL_DASH}${endpoint}`, { ...options, headers });
            if (response.status === 401) {
                window.showGlobalNotification("Akses ditolak (401). Sesi Anda mungkin telah berakhir.", 'error');
                localStorage.clear(); window.location.href = 'login.html';
                throw new Error("Unauthorized (401): Token tidak valid atau kadaluarsa.");
            }
            const responseData = await response.json().catch(() => ({ success: false, message: `Respons server tidak valid (Status: ${response.status})` }));
            if (!response.ok) {
                throw new Error(responseData.message || `Gagal memproses. Status: ${response.status}`);
            }
            return responseData;
        } catch (error) {
            console.error(`API call to ${API_BASE_URL_DASH}${endpoint} error:`, error.message);
            if (!error.message.toLowerCase().includes("unauthorized") && !error.message.toLowerCase().includes("token")) {
                 window.showGlobalNotification(error.message || 'Terjadi kesalahan server/jaringan.', 'error');
            }
            throw error;
        }
    }

    // 3. --- FUNGSI MODAL CREATE EVENT ---
    function openCreateEventModalInternal() {
        if (createEventModalEl) {
            createEventFormEl?.reset();
            toggleTicketPriceVisibilityInternal();
            createEventModalEl.classList.add('show');
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
    function formatDateToISO_UTC_Internal(dateString) {
        if (!dateString) return null;
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? null : date.toISOString();
        } catch (e) { console.error("Error formatting date:", e); return null; }
    }

    async function handleSubmitNewEventInternal(event) {
        event.preventDefault();
        if (!createEventFormEl || !saveEventButtonEl) return;

        const requiredInputs = [eventNameInputEl, eventDescriptionInputEl, eventDateInputEl, eventLocationInputEl, eventCategoryInputEl, eventCapacityInputEl, eventImageInputEl, eventTicketsSelectEl];
        if (requiredInputs.some(input => !input) || (eventTicketsSelectEl?.value === 'Berbayar' && !ticketPriceInputEl)) {
            window.showGlobalNotification("Beberapa elemen form tidak ditemukan. Periksa ID di HTML.", 'error');
            return;
        }

        saveEventButtonEl.disabled = true;
        window.showGlobalNotification("Membuat event...", "info", null);

        try {
            const dateForAPI = formatDateToISO_UTC_Internal(eventDateInputEl.value);
            const imageFile = eventImageInputEl.files?.[0];

            if (!eventNameInputEl.value.trim()) throw new Error("Judul event wajib diisi.");
            if (!eventDescriptionInputEl.value.trim()) throw new Error("Deskripsi event wajib diisi.");
            if (!dateForAPI) throw new Error("Tanggal event tidak valid.");
            if (!eventLocationInputEl.value.trim()) throw new Error("Lokasi event wajib diisi.");
            if (!eventCategoryInputEl.value) throw new Error("Kategori event wajib dipilih.");
            if (!eventCapacityInputEl.value || parseInt(eventCapacityInputEl.value) < 1) throw new Error("Kapasitas minimal 1 peserta.");
            if (!imageFile) throw new Error("Gambar event wajib diunggah.");
            if (eventTicketsSelectEl.value === 'Berbayar' && !ticketPriceInputEl.value.trim()) {
                throw new Error('Harga tiket wajib diisi untuk event berbayar.');
            }

            const formData = new FormData();
            // Menggunakan currentUserId yang sudah divalidasi sebagai CreatorID (ID Pelapor)
            formData.append('CreatorID', currentUserId);
            formData.append('title', eventNameInputEl.value.trim());
            formData.append('description', eventDescriptionInputEl.value.trim());
            formData.append('date', dateForAPI);
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
            console.error("Error saat membuat event:", error.message);
            window.showGlobalNotification(error.message || 'Gagal membuat event.', 'error');
        } finally {
            saveEventButtonEl.disabled = false;
        }
    }

    // 4. --- RENDER "MY EVENTS" ---
    function renderMyEventsListInternal(events) {
        if (!eventListContainerDash) return;
        if (!events || events.length === 0) {
            eventListContainerDash.innerHTML = `<div class="no-events col-span-full text-center py-10"><i class="fas fa-calendar-day fa-3x text-gray-400 mb-4"></i><p class="text-xl text-gray-600">Anda belum memiliki event.</p><button id="create-first-event-empty-btn" class="btn btn-primary mt-6 inline-flex items-center"><i class="fas fa-plus mr-2"></i>Buat Event Baru</button></div>`;
            document.getElementById('create-first-event-empty-btn')?.addEventListener('click', openCreateEventModalInternal);
            return;
        }
        eventListContainerDash.innerHTML = events.map(event => `
            <div class="event-item bg-white shadow rounded-lg overflow-hidden flex flex-col" data-aos="fade-up" data-id="${event._id}">
                <div class="event-img h-48 w-full overflow-hidden">
                    <img src="${(event.images && event.images[0]) ? event.images[0] : '../../assets/image/default-event.jpg'}" alt="${event.title || 'Event Image'}" class="w-full h-full object-cover">
                </div>
                <div class="event-info p-4 flex-grow">
                    <h3 class="event-title font-semibold text-lg mb-1 truncate" title="${event.title}">${event.title || 'N/A'}</h3>
                    <p class="text-sm text-gray-600 mb-1 flex items-center"><i class="far fa-calendar-alt mr-2 text-blue-500"></i>${window.formatDashboardDate(event.date)}</p>
                    <p class="text-sm text-gray-600 mb-2 flex items-center"><i class="fas fa-map-marker-alt mr-2 text-red-500"></i>${event.location || 'N/A'}</p>
                    <span class="event-status text-xs font-semibold px-2 py-1 rounded-full ${window.getDashboardStatusClass(event.status)} text-white">${window.getDashboardStatusText(event.status)}</span>
                </div>
                <div class="event-actions p-3 border-t flex space-x-2">
                    <button class="btn-action btn-view flex-1 text-sm bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded" data-action="view" data-event-id="${event._id}"><i class="fas fa-eye mr-1"></i>Detail</button>
                    <button class="btn-action btn-edit flex-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-3 rounded" data-action="edit" data-event-id="${event._id}"><i class="fas fa-edit mr-1"></i>Edit</button>
                    <button class="btn-action btn-delete flex-1 text-sm bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded" data-action="delete" data-event-id="${event._id}"><i class="fas fa-trash-alt mr-1"></i>Hapus</button>
                </div>
            </div>`).join('');
        if (typeof AOS !== 'undefined') AOS.refresh();
    }

    // 5. --- MEMUAT DATA DASHBOARD ---
    async function loadMyEventsDataInternal() {
        if (!eventListContainerDash) { return; }
        // currentUserId sudah divalidasi di awal
        if (!currentUserId) {
            window.showGlobalNotification("Gagal memuat event: ID Pelapor (CreatorID) tidak tersedia.", 'error');
            renderMyEventsListInternal([]);
            return;
        }
        try {
            eventListContainerDash.innerHTML = `<p class="col-span-full text-center py-10 text-gray-500">Memuat event Anda...</p>`;
            // Endpoint ini membutuhkan CreatorID (ID Pelapor) sebagai path parameter
            const response = await fetchApiDashboardInternal(`/event/getByCreatorID/${currentUserId}`);
            myEventsCacheDash = response.data || [];
            renderMyEventsListInternal(myEventsCacheDash);
        } catch (error) {
            renderMyEventsListInternal([]);
        }
    }

    async function loadDashboardStatsDataInternal() {
        if (!statsCreatedEventsElDash /* && elemen stats lain */) return;
        if (!currentUserId) {
            console.warn("Tidak bisa memuat statistik: CreatorID (ID Pelapor) tidak ada.");
            if(statsCreatedEventsElDash) statsCreatedEventsElDash.textContent = '0';
            return;
        }
        try {
            const response = await fetchApiDashboardInternal(`/event/getUserStats/${currentUserId}`); // Ganti dengan endpoint stats Anda
            const stats = response.data;
            if (stats) {
                if (statsCreatedEventsElDash) statsCreatedEventsElDash.textContent = stats.totalEventsCreated || 0;
                // Update elemen statistik lain
            } else { if(statsCreatedEventsElDash) statsCreatedEventsElDash.textContent = '0';}
        } catch (error) {
            console.error('Gagal memuat statistik:', error.message);
            if(statsCreatedEventsElDash) statsCreatedEventsElDash.textContent = '0';
        }
    }

    // --- EVENT HANDLERS ---
    function handleSidebarToggleDashInternal() { sidebarDash?.classList.toggle('show'); }
    function handleUserDropdownToggleDashInternal(e) { e.stopPropagation(); userDropdownMenuDash?.classList.toggle('show'); }
    function handleClickOutsideDropdownDashInternal(e) { if (userDropdownMenuDash?.classList.contains('show') && !userDropdownToggleDash?.contains(e.target) && !userDropdownMenuDash.contains(e.target)) { userDropdownMenuDash.classList.remove('show'); } }
    function handleLogoutUserInternal(e) { e.preventDefault(); window.showGlobalNotification('Anda berhasil logout.', 'info', 2000); localStorage.clear(); setTimeout(() => { window.location.href = 'login.html'; }, 1500); }

    function handleMyEventsActionsInternal(e) { /* ... (Sama seperti sebelumnya) ... */
        const button = e.target.closest('button[data-action]');
        if (!button) return;
        const action = button.dataset.action; const eventId = button.dataset.eventId;
        if (!action || !eventId) return;
        if (action === 'view') window.location.href = `detail-event.html?id=${eventId}`;
        else if (action === 'edit') window.location.href = `editEvent.html?id=${eventId}`;
        else if (action === 'delete') confirmDeleteMyEventInternal(eventId, button.closest('.event-item'));
    }
    async function confirmDeleteMyEventInternal(eventId, eventElement) { /* ... (Sama seperti sebelumnya) ... */
        if (!confirm('Apakah Anda yakin ingin menghapus event ini? Tindakan ini tidak dapat dibatalkan.')) return;
        window.showGlobalNotification('Menghapus event...', 'info', null);
        try {
            await fetchApiDashboardInternal(`/event/deleteEvent/${eventId}`, { method: 'DELETE' });
            window.showGlobalNotification('Event berhasil dihapus!', 'success');
            if (eventElement) {
                 eventElement.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
                 eventElement.style.opacity = '0';
                 eventElement.style.transform = 'scale(0.95)';
                 setTimeout(() => {
                    eventElement.remove();
                    myEventsCacheDash = myEventsCacheDash.filter(event => event._id !== eventId);
                    if (myEventsCacheDash.length === 0 && eventListContainerDash) {
                       renderMyEventsListInternal([]);
                    }
                    if (typeof AOS !== 'undefined') AOS.refresh();
                 }, 300);
            } else { loadMyEventsDataInternal(); }
            loadDashboardStatsDataInternal();
        } catch (error) {/* error sudah ditangani */}
    }
    function updateUserInfoInUI() { /* ... (Sama seperti sebelumnya, pastikan currentUserData dan selector HTML benar) ... */
        if (currentUserData) {
            const fullName = currentUserData.fullName || 'Pengguna Eventory';
            const avatar = (currentUserData.images && currentUserData.images.length > 0) ? currentUserData.images[0] : '../../assets/image/dev1.jpg'; // Ganti default

            // Untuk myEvent.html atau struktur serupa
            const userNameSidebarMyEvent = document.getElementById('user-name-sidebar');
            const userAvatarSidebarMyEvent = document.getElementById('user-avatar-sidebar');
            const userNameHeaderMyEvent = document.getElementById('user-name-header');
            const userAvatarHeaderMyEvent = document.getElementById('user-avatar-header');

            if (userNameSidebarMyEvent) userNameSidebarMyEvent.textContent = fullName;
            if (userAvatarSidebarMyEvent) userAvatarSidebarMyEvent.src = avatar;
            if (userNameHeaderMyEvent) userNameHeaderMyEvent.textContent = fullName;
            if (userAvatarHeaderMyEvent) userAvatarHeaderMyEvent.src = avatar;

            // Untuk dashboardUser.html
            const dashboardUserFullNameEl = document.querySelector('.dashboard-container .user-info .user-name');
            const dashboardUserAvatarEl = document.querySelector('.dashboard-container .user-info .user-avatar img');
            const dashboardHeaderAvatarEl = document.querySelector('.dashboard-header .dropdown-toggle img');
            const dashboardHeaderNameEl = userDropdownToggleDash?.querySelector('span');

            if(dashboardUserFullNameEl) dashboardUserFullNameEl.textContent = fullName;
            if(dashboardUserAvatarEl) dashboardUserAvatarEl.src = avatar;
            if(dashboardHeaderAvatarEl) dashboardHeaderAvatarEl.src = avatar;
            if(dashboardHeaderNameEl) dashboardHeaderNameEl.textContent = fullName;
        }
    }


    // --- SETUP EVENT LISTENERS ---
    function setupDashboardEventListenersInternal() { /* ... (Sama seperti sebelumnya) ... */
        menuToggleDash?.addEventListener('click', handleSidebarToggleDashInternal);
        userDropdownToggleDash?.addEventListener('click', handleUserDropdownToggleDashInternal);
        document.addEventListener('click', handleClickOutsideDropdownDashInternal);
        if(logoutBtnDropdown) logoutBtnDropdown.addEventListener('click', handleLogoutUserInternal);
        if(logoutBtnSidebar) logoutBtnSidebar.addEventListener('click', handleLogoutUserInternal);

        eventListContainerDash?.addEventListener('click', handleMyEventsActionsInternal);

        openModalButtonEl?.addEventListener('click', openCreateEventModalInternal);
        quickOpenModalButtonEl?.addEventListener('click', openCreateEventModalInternal);
        closeModalButtonEl?.addEventListener('click', closeCreateEventModalInternal);
        cancelEventButtonEl?.addEventListener('click', closeCreateEventModalInternal);
        createEventFormEl?.addEventListener('submit', handleSubmitNewEventInternal);
        eventTicketsSelectEl?.addEventListener('change', toggleTicketPriceVisibilityInternal);
    }

    // --- INISIALISASI DASHBOARD ---
    function initializeUserDashboardInternal() { /* ... (Sama seperti sebelumnya) ... */
        updateUserInfoInUI();
        setupDashboardEventListenersInternal();
        toggleTicketPriceVisibilityInternal();
        Promise.allSettled([
            loadMyEventsDataInternal(),
            loadDashboardStatsDataInternal(),
        ]).then((results) => {
            results.forEach(result => {
                if (result.status === 'rejected') {
                    console.warn('Sebagian data dashboard gagal dimuat:', result.reason);
                }
            });
            console.log('Dashboard pengguna selesai diinisialisasi.');
            if (typeof AOS !== 'undefined') AOS.refresh();
        });
    }

    initializeUserDashboardInternal();

    window.refreshDashboardData = () => {
        console.log('Memperbarui data dashboard (dipanggil dari luar)...');
        loadMyEventsDataInternal();
        loadDashboardStatsDataInternal();
    };
});