// dashboardUser.js

// --- KONFIGURASI & KONSTANTA GLOBAL ---
const API_BASE_URL_DASH = 'https://back-end-eventory.vercel.app';
let currentToken;
let currentUserId;
let currentUserData; // Untuk menyimpan data user setelah login

document.addEventListener('DOMContentLoaded', async function () {
    // --- PENGAMBILAN TOKEN DAN USER DATA, CEK AUTENTIKASI ---
    currentToken = localStorage.getItem('token');
    const userDataString = localStorage.getItem('user');

    if (!currentToken || !userDataString) {
        alert('Sesi Anda tidak valid atau telah berakhir. Silakan login kembali.');
        window.location.href = '../../pages/auth/login.html'; // Sesuaikan path
        return;
    }

    try {
        currentUserData = JSON.parse(userDataString);
        if (!currentUserData || !currentUserData._id) {
            throw new Error("Data pengguna tidak lengkap atau rusak.");
        }
        currentUserId = currentUserData._id; // Ini seharusnya sudah ada dari login.js Anda
        
        // Tambahan: Jika localStorage.getItem('userId') kosong tapi currentUserData._id ada, sinkronkan.
        if (!localStorage.getItem('userId') && currentUserId) {
            localStorage.setItem('userId', currentUserId);
            console.log("userId disinkronkan ke localStorage dari objek 'user'.");
        }

    } catch (e) {
        console.error("Error memproses data pengguna:", e);
        alert('Data pengguna rusak atau tidak lengkap. Silakan login kembali.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        window.location.href = '../../pages/auth/login.html'; // Sesuaikan path
        return;
    }

    // Initialize AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, easing: 'ease-in-out', once: true });
    } else {
        console.warn('AOS library not found.');
    }

    // --- ELEMEN DOM ---
    // (Salin semua deklarasi elemen DOM dari versi dashboardUser.js sebelumnya yang lengkap)
    // Pastikan ID elemen di HTML (dashboardUser.html atau myEvent.html) sesuai dengan yang ada di sini.
    const eventListContainerDash = document.getElementById('event-list'); // Untuk "My Events"
    const menuToggleDash = document.getElementById('menu-toggle');
    const sidebarDash = document.getElementById('sidebar');
    const userDropdownToggleDash = document.getElementById('user-dropdown-toggle');
    const userDropdownMenuDash = document.getElementById('user-dropdown-menu');
    const logoutBtnDash = userDropdownMenuDash?.querySelector('a[href*="login.html"]') || document.getElementById('logout-btn-sidebar') || document.getElementById('logout-btn');


    const statsTotalEventsElDash = document.getElementById('total-events');
    const statsCreatedEventsElDash = document.getElementById('created-events');
    const statsUpcomingEventsElDash = document.getElementById('upcoming-events-stat') || document.getElementById('upcoming-events'); // ID untuk statistik upcoming di dashboardUser.html
    const statsCompletedEventsElDash = document.getElementById('completed-events-stat');


    const discoverEventsContainerDash = document.getElementById('discover-events-list') || document.getElementById('discover-events');
    const upcomingEventsWidgetContainerDash = document.getElementById('upcoming-events-list') || document.getElementById('upcoming-events'); // Untuk widget di dashboardUser.html
    const notificationsContainerDash = document.getElementById('notifications-list') || document.getElementById('notifications');

    // Elemen Modal Create Event (Pastikan ID ini ada di HTML dashboard Anda)
    const createEventModalEl = document.getElementById('create-event-modal'); // ID modal dari dashboardUser.html / myEvent.html
    const createEventFormEl = document.getElementById('create-event-form'); // ID form dari dashboardUser.html / myEvent.html
    
    // Tombol pembuka modal bisa ada beberapa
    const openModalButtonEl = document.getElementById('create-event-btn') || document.getElementById('open-create-event-modal-btn'); // dari dashboardUser.html atau myEvent.html
    const quickOpenModalButtonEl = document.getElementById('quick-create-event'); // dari dashboardUser.html

    // Tombol di dalam modal (pastikan ID konsisten dengan HTML modal Anda)
    const closeModalButtonEl = document.getElementById('close-modal-btn') || document.getElementById('close-event-modal-btn'); // ID dari dashboardUser.html atau myEvent.html
    const cancelEventButtonEl = document.getElementById('cancel-event-modal-btn') || document.getElementById('cancel-event-btn'); // ID dari dashboardUser.html atau myEvent.html
    const saveEventButtonEl = document.getElementById('save-event-modal-btn') || document.getElementById('save-event'); // ID dari dashboardUser.html atau myEvent.html

    // Input Fields (pastikan ID konsisten dengan HTML modal Anda)
    const eventNameInputEl = document.getElementById('event-title-modal') || document.getElementById('event-name');
    const eventDescriptionInputEl = document.getElementById('event-description-modal') || document.getElementById('event-description');
    const eventDateInputEl = document.getElementById('event-date-modal') || document.getElementById('event-date');
    const eventTimeInputEl = document.getElementById('event-time-modal') || document.getElementById('event-time');
    const eventLocationInputEl = document.getElementById('event-location-modal') || document.getElementById('event-location');
    const eventCategoryInputEl = document.getElementById('event-category-modal') || document.getElementById('event-category');
    const eventCapacityInputEl = document.getElementById('max-participants-modal') || document.getElementById('event-capacity');
    const eventImageInputEl = document.getElementById('event-images-modal') || document.getElementById('event-image');
    const eventTicketsSelectEl = document.getElementById('event-tickets-modal') || document.getElementById('event-tickets');
    const ticketPriceGroupEl = document.getElementById('ticket-price-group-modal') || document.getElementById('ticket-price-group');
    const ticketPriceInputEl = document.getElementById('ticket-price-modal') || document.getElementById('ticket-price');


    // --- STATE APLIKASI ---
    let myEventsCacheDash = [];

    // --- FUNGSI UTILITAS GLOBAL ---
    // (Salin/tempel semua fungsi utilitas: window.formatDashboardDate, window.showGlobalNotification, dll. dari versi sebelumnya)
    window.formatDashboardDate = (d, o = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) => { if (!d) return 'N/A'; try { return new Date(d).toLocaleDateString('id-ID', o); } catch (e) { return "Err"; }};
    window.formatDashboardTime = (d, o = { hour: '2-digit', minute: '2-digit' }) => { if (!d) return 'N/A'; try { return new Date(d).toLocaleTimeString('id-ID', o); } catch (e) { return "Err"; }};
    window.formatDashboardTimeAgo = (d) => { if(!d) return 'N/A'; try {const dt=new Date(d),n=new Date(),s=Math.floor((n-dt)/1e3);if(s<5)return"Baru saja";if(s<60)return s+" dtk lalu";if(s<3600)return Math.floor(s/60)+" mnt lalu";if(s<86400)return Math.floor(s/3600)+" jam lalu";return Math.floor(s/86400)+" hr lalu"}catch(e){return"Err"}};
    window.getDashboardStatusClass = (st) => {const s={p:'pending',a:'approved',r:'rejected',c:'cancelled',co:'completed',ac:'active'},sc={[s.p]:'status-pending',[s.a]:'status-approved',[s.r]:'status-rejected',[s.c]:'status-cancelled',[s.co]:'status-completed',[s.ac]:'status-active'}; return sc[String(st).toLowerCase()]||'status-default'};
    window.getDashboardStatusText = (st) => {const s={p:'pending',a:'approved',r:'rejected',c:'cancelled',co:'completed',ac:'active'},sd={[s.p]:'Menunggu Verifikasi',[s.a]:'Terverifikasi',[s.r]:'Ditolak',[s.c]:'Dibatalkan',[s.co]:'Selesai',[s.ac]:'Sedang Berlangsung'}; return sd[String(st).toLowerCase()]||st||'Tidak Diketahui'};
    window.getDashboardNotificationIcon = (t) => {const i={success:'fa-check-circle',error:'fa-exclamation-circle',warning:'fa-exclamation-triangle',info:'fa-info-circle',event_created:'fa-calendar-plus',default:'fa-info-circle'}; return i[t]||i.default};
    function createNotificationAreaInternal(){let a=document.getElementById('global-notification-area');if(!a){a=document.createElement('div');a.id='global-notification-area';document.body.appendChild(a);}return a};
    window.showGlobalNotification=(msg,type='info',dur=3000)=>{const a=createNotificationAreaInternal(),n=document.createElement('div');n.className=`custom-notification custom-notification-${type}`;n.innerHTML=`<div class="custom-notification-icon"><i class="fas ${window.getDashboardNotificationIcon(type)}"></i></div><div class="custom-notification-message">${msg}</div><button class="custom-notification-close">&times;</button>`;a.appendChild(n);setTimeout(()=>n.classList.add('show'),10);const ds=()=>{n.classList.remove('show');setTimeout(()=>n.remove(),300)};n.querySelector('.custom-notification-close').addEventListener('click',ds);if(dur)setTimeout(ds,dur)};

    // --- PEMANGGILAN API ---
    async function fetchApiDashboardInternal(endpoint, options = {}) { /* ... implementasi dari versi sebelumnya ... */
        const headers = {'Authorization': `Bearer ${currentToken}`, ...options.headers,};
        if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
        try {
            const response = await fetch(`${API_BASE_URL_DASH}${endpoint}`, { ...options, headers });
            if (!response.ok) { const errD = await response.json().catch(()=>({message:`Server Error: ${response.status}`})); throw new Error(errD.message || `Gagal. Status: ${response.status}`);}
            const ct = response.headers.get("content-type");
            if (ct && ct.includes("application/json")) return response.json();
            return response.text();
        } catch (error) { console.error(`API call to ${API_BASE_URL_DASH}${endpoint} failed:`, error); window.showGlobalNotification(error.message || 'Kesalahan jaringan.', 'error'); throw error;}
    }

    // --- FUNGSI MODAL CREATE EVENT ---
    function openCreateEventModalInternal() { /* ... implementasi dari versi sebelumnya, sesuaikan ID elemen ... */ 
        if (createEventModalEl) {
            createEventFormEl?.reset();
            if(ticketPriceGroupEl) ticketPriceGroupEl.style.display = 'none';
            if(ticketPriceInputEl) { ticketPriceInputEl.value = ''; ticketPriceInputEl.required = false; }
            if(eventTicketsSelectEl) eventTicketsSelectEl.value = 'Gratis'; // Atau default value Anda
            createEventModalEl.style.display = 'flex'; // Atau .classList.add('show')
            eventNameInputEl?.focus();
        }
    }
    function closeCreateEventModalInternal() { /* ... implementasi dari versi sebelumnya ... */ 
        if (createEventModalEl) createEventModalEl.style.display = 'none'; // Atau .classList.remove('show')
    }
    function toggleTicketPriceVisibilityInternal() { /* ... implementasi dari versi sebelumnya, sesuaikan ID ... */ 
        if (eventTicketsSelectEl && ticketPriceGroupEl && ticketPriceInputEl) {
            const isPaid = eventTicketsSelectEl.value === 'Berbayar';
            ticketPriceGroupEl.style.display = isPaid ? 'block' : 'none';
            ticketPriceInputEl.required = isPaid;
            if (!isPaid) ticketPriceInputEl.value = '';
        }
    }
    function formatDateToISO_UTC_Internal(dateStr, timeStr) {if(!dateStr||!timeStr)return null;try{const dt=new Date(`${dateStr}T${timeStr}`);return isNaN(dt.getTime())?null:dt.toISOString()}catch(e){return null}};

    async function handleSubmitNewEventInternal(event) { /* ... implementasi dari versi sebelumnya ... */
        event.preventDefault();
        if(saveEventButtonEl) saveEventButtonEl.disabled = true;
        window.showGlobalNotification("Memproses...", "info", null);

        try {
            // Validasi
            const title = eventNameInputEl.value.trim();
            // ... (tambahkan validasi untuk semua field lain seperti di versi createEvent.js Anda)
            if (!title /* || ...field lain... */ || !eventImageInputEl.files[0]) {
                 throw new Error("Harap lengkapi semua field wajib dan unggah gambar.");
            }
            const dateForAPI = formatDateToISO_UTC_Internal(eventDateInputEl.value, eventTimeInputEl.value);
            if (!dateForAPI) throw new Error("Format tanggal atau waktu event tidak valid.");

            const formData = new FormData();
            formData.append('CreatorID', currentUserId);
            formData.append('title', title);
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

            const result = await fetchApiDashboardInternal(`/event/createEvent`, { method: 'POST', body: formData });
            window.showGlobalNotification(result.message || 'Event berhasil dibuat!', 'success');
            closeCreateEventModalInternal();
            window.refreshDashboardData();
        } catch (error) { window.showGlobalNotification(error.message || 'Gagal buat event.', 'error');
        } finally { if(saveEventButtonEl) saveEventButtonEl.disabled = false; }
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
            <div class="event-item event-card bg-white shadow-lg rounded-lg overflow-hidden" data-aos="fade-up" data-id="${event._id}">
                <div class="event-image relative"><img src="${(event.images && event.images[0]) ? event.images[0] : '../../assets/image/default-event.jpg'}" alt="${event.title || 'Event'}" class="w-full h-48 object-cover" onerror="this.onerror=null; this.src='../../assets/image/default-event.jpg';"><span class="event-status absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded ${window.getDashboardStatusClass(event.status)}">${window.getDashboardStatusText(event.status)}</span></div>
                <div class="event-content p-4"><h3 class="event-title text-xl font-bold mb-2 truncate" title="${event.title || 'N/A'}">${event.title || 'N/A'}</h3><div class="event-details text-sm text-gray-600 space-y-1"><p><i class="far fa-calendar w-4 mr-2 text-center"></i>${window.formatDashboardDate(event.date)}</p><p><i class="far fa-clock w-4 mr-2 text-center"></i>${window.formatDashboardTime(event.date)}</p><p><i class="fas fa-map-marker-alt w-4 mr-2 text-center"></i>${event.location || 'N/A'}</p><p><i class="fas fa-tag w-4 mr-2 text-center"></i>${event.kategori || 'N/A'}</p><p><i class="fas fa-ticket-alt w-4 mr-2 text-center"></i>${event.ticket === 'Berbayar' ? `Rp ${Number(event.ticketPrice || 0).toLocaleString('id-ID')}` : (event.ticket || 'N/A')}</p><p><i class="fas fa-users w-4 mr-2 text-center"></i>${event.currentParticipants || 0}/${event.maxParticipants || '∞'} Peserta</p></div>
                <div class="event-actions mt-4 flex space-x-2"><button class="btn btn-outline btn-view flex-1" data-action="view" data-event-id="${event._id}"><i class="fas fa-eye mr-1"></i>Lihat</button><button class="btn btn-outline btn-edit flex-1" data-action="edit" data-event-id="${event._id}"><i class="fas fa-edit mr-1"></i>Edit</button><button class="btn btn-danger btn-delete flex-1" data-action="delete" data-event-id="${event._id}"><i class="fas fa-trash mr-1"></i>Hapus</button></div></div>
            </div>`).join('');
        if (typeof AOS !== 'undefined') AOS.refresh();
    }


    // --- RENDER "DISCOVER EVENTS" ---
    function renderDiscoverEventsInternal(events) {
        if (!discoverEventsContainerDash) return;
        if (!events || events.length === 0) {
            discoverEventsContainerDash.innerHTML = `<p class="text-gray-500 p-4 text-center">Belum ada event untuk dijelajahi.</p>`;
            return;
        }
        discoverEventsContainerDash.innerHTML = events.map(event => {
            // Jangan tampilkan event milik pengguna sendiri di Discover
            if (event.CreatorID === currentUserId || (event.creator && event.creator._id === currentUserId)) return '';

            const isFull = (event.currentParticipants || 0) >= (event.maxParticipants || Infinity);
            return `
             <div class="discover-event-card bg-white shadow rounded-lg overflow-hidden" data-id="${event._id}" data-aos="fade-up">
                 <div class="discover-event-img relative h-40"><img src="${(event.images && event.images[0]) ? event.images[0] : '../../assets/image/default-event.jpg'}" alt="${event.title}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='../../assets/image/default-event.jpg';"></div>
                 <div class="discover-event-content p-4">
                     <span class="discover-event-date text-xs text-blue-600 font-semibold">${window.formatDashboardDate(event.date, {day: 'numeric', month: 'short'})}</span>
                     <h3 class="discover-event-title text-md font-bold mt-1 mb-2 truncate" title="${event.title}">${event.title}</h3>
                     <div class="discover-event-footer text-xs text-gray-500 flex justify-between items-center mb-3">
                         <div class="discover-event-location truncate"><i class="fas fa-map-marker-alt mr-1"></i>${event.location}</div>
                         <div class="discover-event-category badge badge-sm">${event.kategori}</div>
                     </div>
                     <div class="flex space-x-2">
                        <button class="btn btn-outline btn-xs flex-1" data-action="view-discover-event" data-event-id="${event._id}"><i class="fas fa-eye"></i> Detail</button>
                        <button class="btn btn-primary btn-xs flex-1" data-action="join-event" data-event-id="${event._id}" ${isFull ? 'disabled title="Event Penuh"' : ''}>
                            <i class="fas fa-user-plus"></i> ${isFull ? 'Penuh' : 'Gabung'}
                        </button>
                     </div>
                 </div>
             </div>`;
        }).join('');
        if (typeof AOS !== 'undefined') AOS.refresh();
    }


    // --- MEMUAT DATA DASHBOARD ---
    async function loadMyEventsDataInternal() { /* ... implementasi dari versi sebelumnya, gunakan currentUserId ... */
        if (!eventListContainerDash || !currentUserId) return;
        try {
            if(eventListContainerDash) eventListContainerDash.innerHTML = `<p class="col-span-full text-center py-10">Memuat event Anda...</p>`;
            const response = await fetchApiDashboardInternal(`/event/getByCreatorID/${currentUserId}`);
            myEventsCacheDash = response.data || [];
            renderMyEventsListInternal(myEventsCacheDash);
        } catch (error) {
            if (eventListContainerDash) renderMyEventsListInternal([]);
        }
    }
    async function loadDashboardStatsDataInternal() { /* ... implementasi dari versi sebelumnya ... */ 
         if (!statsTotalEventsElDash) return; 
        try {
            const response = await fetchApiDashboardInternal(`/event/getUserStats`); // Endpoint ini perlu CreatorID atau mengambil dari token di backend
            const stats = response.data; 
            if (stats) {
                if (statsTotalEventsElDash) statsTotalEventsElDash.textContent = stats.totalEventsCreated || 0;
                if (statsCreatedEventsElDash) statsCreatedEventsElDash.textContent = stats.eventsPending || 0;
                if (statsUpcomingEventsElDash) statsUpcomingEventsElDash.textContent = stats.eventsApproved || 0;
                if (statsCompletedEventsElDash) statsCompletedEventsElDash.textContent = stats.eventsCompleted || 0;
            }
        } catch (error) { console.error('Gagal load stats:', error); }
    }
    async function loadDiscoverEventsDataInternal() {
        if (!discoverEventsContainerDash) return;
        discoverEventsContainerDash.innerHTML = `<p class="text-gray-500 p-4 text-center">Memuat event lainnya...</p>`;
        try {
            // Anda bisa pilih salah satu: /getAllEvents atau /getOtherUsersEvents
            // /getOtherUsersEvents lebih cocok jika ingin filter event buatan sendiri
            const response = await fetchApiDashboardInternal('/event/getOtherUsersEvents?limit=6'); 
            // Atau jika ingin semua event (termasuk milik sendiri, lalu filter di frontend atau biarkan saja):
            // const response = await fetchApiDashboardInternal('/event/getAllEvents?limit=6&status=approved'); 
            const events = response.data || [];
            renderDiscoverEventsInternal(events);
        } catch (error) {
            if (discoverEventsContainerDash) discoverEventsContainerDash.innerHTML = `<p class="text-red-500 p-4 text-center">Gagal memuat event.</p>`;
        }
    }
    async function loadUpcomingEventsWidgetDataInternal() { /* ... implementasi seperti sebelumnya ... */
        if (!upcomingEventsWidgetContainerDash) return;
        upcomingEventsWidgetContainerDash.innerHTML = `<p class="text-gray-500 text-xs p-2 text-center">Memuat...</p>`;
        try {
            // Ambil semua event yang approved dan urutkan berdasarkan tanggal terdekat
            const response = await fetchApiDashboardInternal('/event/getAllEvents?sortBy=date&status=approved&limit=3');
            const events = response.data || [];
            if (events.length === 0) { upcomingEventsWidgetContainerDash.innerHTML = `<p class="text-gray-500 text-xs p-2 text-center">Tidak ada event mendatang.</p>`; return; }
            upcomingEventsWidgetContainerDash.innerHTML = events.map(event => { const d=new Date(event.date); return `
            <div class="upcoming-event flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer" data-id="${event._id}" data-action="view-upcoming-widget-event">
                <div class="upcoming-event-date text-center mr-3"><span class="upcoming-event-day block text-lg font-bold">${d.getDate()}</span><span class="upcoming-event-month block text-xs uppercase">${d.toLocaleString('id-ID', { month: 'short' })}</span></div>
                <div class="upcoming-event-info"><h3 class="upcoming-event-title font-semibold text-sm truncate" title="${event.title}">${event.title}</h3><div class="upcoming-event-time text-xs text-gray-500"><i class="far fa-clock mr-1"></i>${window.formatDashboardTime(event.date)}</div></div>
            </div>`}).join('');
            if (typeof AOS !== 'undefined') AOS.refresh();
        } catch (error) { upcomingEventsWidgetContainerDash.innerHTML = `<p class="text-red-500 text-xs p-2 text-center">Gagal memuat.</p>`;}
    }
    async function loadNotificationsDataInternal() { /* ... implementasi seperti sebelumnya ... */ 
        if (!notificationsContainerDash) return;
        notificationsContainerDash.innerHTML = `<p class="text-gray-500 text-xs p-2 text-center">Memuat notifikasi...</p>`;
        try {
            // Pastikan endpoint ini benar dan menggunakan currentUserId jika perlu filter by user
            const response = await fetchApiDashboardInternal(`/notifications/getUserNotifications?userId=${currentUserId}&limit=4`); 
            const notifications = response.data || []; // Sesuaikan jika struktur data beda
            if (notifications.length === 0) { notificationsContainerDash.innerHTML = `<p class="text-gray-500 text-xs p-2 text-center">Tidak ada notifikasi baru.</p>`; return; }
            notificationsContainerDash.innerHTML = notifications.map(n => `
            <div class="notification flex items-start p-2 hover:bg-gray-100 rounded" data-id="${n._id}">
                <div class="notification-icon text-lg mr-3 w-5 text-center"><i class="fas ${window.getDashboardNotificationIcon(n.type || 'default')}"></i></div>
                <div class="notification-content"><div class="notification-text text-sm">${n.title ? `<strong>${n.title}</strong> ` : ''}${n.message}</div><div class="notification-time text-xs text-gray-500 mt-1">${window.formatDashboardTimeAgo(n.createdAt)}</div></div>
            </div>`).join('');
            if (typeof AOS !== 'undefined') AOS.refresh();
        } catch (error) { notificationsContainerDash.innerHTML = `<p class="text-red-500 text-xs p-2 text-center">Gagal memuat notifikasi.</p>`;}
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
        // Panggil API Logout Backend jika ada
        // try { await fetchApiDashboardInternal('/auth/logout', { method: 'POST' }); } catch(err){ console.warn("Logout API call failed", err); }
        localStorage.removeItem('token'); localStorage.removeItem('userId'); localStorage.removeItem('user');
        currentToken = null; currentUserId = null; currentUserData = null;
        setTimeout(() => { window.location.href = '../../pages/auth/login.html'; }, 1500);
    }
    
    function handleMyEventsActionsInternal(e) { /* ... implementasi seperti sebelumnya ... */ 
        const button = e.target.closest('button.btn-action'); // Pastikan class .btn-action ada di tombol
        if (!button) return;
        const action = button.dataset.action; const eventId = button.dataset.eventId;
        if (!action || !eventId) return;
        if (action === 'view') window.location.href = `../detailEvent.html?id=${eventId}`; // Path relatif ke halaman detail
        else if (action === 'edit') window.location.href = `../editEvent.html?id=${eventId}`; // Path relatif ke halaman edit
        else if (action === 'delete') confirmDeleteMyEventInternal(eventId, button.closest('.event-item') || button.closest('.event-card')); // Sesuaikan selector
    }

    async function confirmDeleteMyEventInternal(eventId, eventElement) { /* ... implementasi seperti sebelumnya ... */ 
         if (!confirm('Apakah Anda yakin ingin menghapus event ini?')) return;
        window.showGlobalNotification('Menghapus event...', 'info', null);
        try {
            await fetchApiDashboardInternal(`/event/deleteEvent/${eventId}`, { method: 'DELETE' });
            window.showGlobalNotification('Event berhasil dihapus!', 'success');
            if (eventElement) {
                eventElement.style.transition = 'opacity 0.3s, transform 0.3s'; eventElement.style.opacity='0'; eventElement.style.transform='scale(0.95)';
                setTimeout(() => { 
                    eventElement.remove(); 
                    myEventsCacheDash=myEventsCacheDash.filter(ev=>ev._id!==eventId); 
                    if(myEventsCacheDash.length===0 && eventListContainerDash)renderMyEventsListInternal([]); 
                    if(typeof AOS!=='undefined')AOS.refresh();
                },300);
            } else { loadMyEventsDataInternal(); } // Fallback
            loadDashboardStatsDataInternal(); // Update statistik
        } catch (error) { /* error sudah ditangani fetchApiDashboardInternal */ }
    }

    async function handleJoinEventInternal(eventId) {
        if (!eventId) return;
        window.showGlobalNotification("Memproses permintaan bergabung...", "info", null);
        try {
            const response = await fetchApiDashboardInternal(`/event/joinEvent`, { // Asumsi eventId dikirim di body
                method: 'POST',
                body: JSON.stringify({ eventId: eventId, userId: currentUserId }) // atau hanya eventId jika backend tahu user dari token
            });
            window.showGlobalNotification(response.message || 'Berhasil bergabung dengan event!', 'success');
            loadDiscoverEventsDataInternal(); // Refresh daftar discover untuk update jumlah partisipan atau status tombol
            // Mungkin juga perlu refresh upcoming events jika event yang dijoin ada di sana
        } catch (error) {
            window.showGlobalNotification(error.message || 'Gagal bergabung dengan event.', 'error');
        }
    }
    
    function handleGeneralDashboardClicksInternal(e) { /* ... implementasi seperti sebelumnya ... */ 
        const viewDiscoverButton = e.target.closest('button[data-action="view-discover-event"]');
        if (viewDiscoverButton) { window.location.href = `../detailEvent.html?id=${viewDiscoverButton.dataset.eventId}`; return; }

        const joinButton = e.target.closest('button[data-action="join-event"]');
        if (joinButton) { handleJoinEventInternal(joinButton.dataset.eventId); return; }
        
        const upcomingWidgetEvent = e.target.closest('.upcoming-event[data-action="view-upcoming-widget-event"]');
        if (upcomingWidgetEvent) { window.location.href = `../detailEvent.html?id=${upcomingWidgetEvent.dataset.id}`; return;}
    }

    function updateUserInfoInUI() { /* ... implementasi dari versi sebelumnya ... */ 
         if (currentUserData) {
            const userNameElements = document.querySelectorAll('.user-name'); 
            const userRoleElements = document.querySelectorAll('.user-role'); 
            const userAvatarElements = document.querySelectorAll('.user-avatar img, #user-avatar-header');
            const userDropdownName = userDropdownToggleDash?.querySelector('span');

            userNameElements.forEach(el => el.textContent = currentUserData.fullName || currentUserData.userName || 'Pengguna');
            userRoleElements.forEach(el => el.textContent = currentUserData.role === 'admin' ? 'Administrator' : 'Pengguna');
            userAvatarElements.forEach(el => el.src = currentUserData.profilePicture || '../../assets/image/default-avatar.png'); 
            if(userDropdownName) userDropdownName.textContent = currentUserData.fullName || currentUserData.userName || 'Pengguna';
        }
    }

    // --- SETUP EVENT LISTENERS ---
    function setupDashboardEventListenersInternal() {
        menuToggleDash?.addEventListener('click', handleSidebarToggleDashInternal);
        userDropdownToggleDash?.addEventListener('click', handleUserDropdownToggleDashInternal);
        document.addEventListener('click', handleClickOutsideDropdownDashInternal);
        logoutBtnDash?.addEventListener('click', handleLogoutUserInternal);
        
        eventListContainerDash?.addEventListener('click', handleMyEventsActionsInternal); // Untuk "My Events"
        discoverEventsContainerDash?.addEventListener('click', handleGeneralDashboardClicksInternal); // Untuk "Discover Events"
        upcomingEventsWidgetContainerDash?.addEventListener('click', handleGeneralDashboardClicksInternal); // Untuk "Upcoming Widget"

        // Listener untuk modal create event
        openModalButtonEl?.addEventListener('click', openCreateEventModalInternal);
        quickOpenModalButtonEl?.addEventListener('click', openCreateEventModalInternal);
        closeModalButtonEl?.addEventListener('click', closeCreateEventModalInternal);
        cancelEventButtonEl?.addEventListener('click', closeCreateEventModalInternal);
        createEventFormEl?.addEventListener('submit', handleSubmitNewEventInternal);
        eventTicketsSelectEl?.addEventListener('change', toggleTicketPriceVisibilityInternal);
        if(eventTicketsSelectEl) toggleTicketPriceVisibilityInternal(); // Panggil sekali untuk inisialisasi
    }

    // --- INISIALISASI DASHBOARD ---
    function initializeUserDashboardInternal() { /* ... implementasi dari versi sebelumnya ... */ 
        updateUserInfoInUI();
        setupDashboardEventListenersInternal();
        Promise.allSettled([
            loadMyEventsDataInternal(), loadDashboardStatsDataInternal(),
            loadDiscoverEventsDataInternal(), loadUpcomingEventsWidgetDataInternal(),
            loadNotificationsDataInternal()
        ]).then(results => {
            results.forEach(result => { if (result.status === 'rejected') console.warn('Sebagian data gagal:', result.reason); });
            console.log('Dashboard pengguna selesai diinisialisasi.');
            if (typeof AOS !== 'undefined') AOS.refresh();
        });
    }

    initializeUserDashboardInternal();

    // Ekspos fungsi untuk di panggil dari luar
    window.refreshDashboardData = () => {
        console.log('Memperbarui data dashboard...');
        loadMyEventsDataInternal();
        loadDashboardStatsDataInternal();
        // Mungkin juga discover dan upcoming jika relevan
        loadDiscoverEventsDataInternal();
        loadUpcomingEventsWidgetDataInternal();
    };
});