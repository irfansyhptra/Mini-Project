// File: createEvent.js

// Fungsi ini akan dijalankan setelah seluruh konten HTML dimuat
document.addEventListener('DOMContentLoaded', () => {
    // --- Referensi Elemen DOM ---
    const createEventModal = document.getElementById('create-event-modal');
    const createEventForm = document.getElementById('create-event-form');
    const openModalButton = document.getElementById('create-event-btn');
    const closeModalButton = document.getElementById('close-event-modal-btn');
    const cancelEventButton = document.getElementById('cancel-event-btn');
    const saveEventButton = document.getElementById('save-event');

    // Elemen input formulir
    const eventNameInput = document.getElementById('event-name');
    const eventDescriptionInput = document.getElementById('event-description');
    const eventDateInput = document.getElementById('event-date');
    const eventTimeInput = document.getElementById('event-time');
    const eventLocationInput = document.getElementById('event-location');
    const eventCategoryInput = document.getElementById('event-category');
    const eventCapacityInput = document.getElementById('event-capacity');
    const eventImageInput = document.getElementById('event-image');
    const eventTicketsSelect = document.getElementById('event-tickets');
    const ticketPriceGroup = document.getElementById('ticket-price-group');
    const ticketPriceInput = document.getElementById('ticket-price');

    // Overlay
    const loadingOverlay = document.getElementById('loading-overlay');
    const successOverlay = document.getElementById('success-overlay');
    const successCloseBtn = document.getElementById('success-close-btn');

    // --- Fungsi untuk Modal ---
    function showCreateEventModal() {
        if (createEventModal) {
            createEventModal.style.display = 'flex';
        }
    }

    function closeCreateEventModal() {
        if (createEventModal) {
            createEventModal.style.display = 'none';
        }
        if (createEventForm) {
            createEventForm.reset();
        }
        if (ticketPriceGroup) ticketPriceGroup.style.display = 'none';
        if (ticketPriceInput) {
            ticketPriceInput.value = '';
            ticketPriceInput.required = false;
        }
    }

    // --- Fungsi untuk Harga Tiket ---
    function toggleTicketPriceField() {
        if (eventTicketsSelect && ticketPriceGroup && ticketPriceInput) {
            if (eventTicketsSelect.value === 'Berbayar') {
                ticketPriceGroup.style.display = 'block';
                ticketPriceInput.required = true;
            } else {
                ticketPriceGroup.style.display = 'none';
                ticketPriceInput.required = false;
                ticketPriceInput.value = '';
            }
        }
    }

    // --- Fungsi Utama: Handle Submit Formulir ---
    async function handleEventSubmit(event) {
        event.preventDefault();
        console.log('Pengiriman formulir event dimulai...');

        if (saveEventButton) saveEventButton.disabled = true;
        if (loadingOverlay) loadingOverlay.classList.remove('hidden');

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Autentikasi gagal. Token tidak ditemukan. Silakan login kembali.');
            if (saveEventButton) saveEventButton.disabled = false;
            if (loadingOverlay) loadingOverlay.classList.add('hidden');
            return;
        }

        try {
            // 1. Ambil User Data dan CreatorID
            const userDataString = localStorage.getItem('user');
            if (!userDataString) {
                throw new Error('Data pengguna tidak ditemukan. Silakan login kembali.');
            }
            const userData = JSON.parse(userDataString);
            if (!userData || !userData._id) {
                throw new Error('ID pengguna (creatorID) tidak valid. Silakan login kembali.');
            }
            const creatorID = userData._id;

            // 2. Validasi Input Dasar
            if (!eventNameInput.value.trim() || !eventDescriptionInput.value.trim() ||
                !eventDateInput.value || !eventTimeInput.value ||
                !eventLocationInput.value.trim() || !eventCategoryInput.value ||
                !eventCapacityInput.value || !eventTicketsSelect.value) {
                throw new Error('Semua kolom yang ditandai (*) wajib diisi.');
            }

            if (eventTicketsSelect.value === 'Berbayar' && !ticketPriceInput.value.trim()) {
                throw new Error('Harga tiket wajib diisi jika event berbayar.');
            }
            if (eventCapacityInput.valueAsNumber < 1) {
                throw new Error('Kapasitas minimal adalah 1 peserta.');
            }

            // 3. Validasi dan Persiapan Gambar
            const imageFiles = eventImageInput.files;
            if (!imageFiles || imageFiles.length === 0) {
                throw new Error('Gambar event wajib diunggah.');
            }
            const imageFileToUpload = imageFiles[0];

            // 4. Gabungkan Tanggal dan Waktu, Format ke ISO String (UTC)
            const localEventDateTime = new Date(`${eventDateInput.value}T${eventTimeInput.value}`);
            if (isNaN(localEventDateTime.getTime())) {
                throw new Error('Format tanggal atau waktu tidak valid.');
            }
            const utcDateTimeString = localEventDateTime.toISOString();

            // 5. Buat Objek FormData
            const formData = new FormData();
            formData.append('creatorID', creatorID);
            formData.append('title', eventNameInput.value.trim());
            formData.append('description', eventDescriptionInput.value.trim());
            formData.append('date', utcDateTimeString);
            formData.append('location', eventLocationInput.value.trim());
            formData.append('kategori', eventCategoryInput.value);
            formData.append('maxParticipants', eventCapacityInput.value);
            formData.append('ticket', eventTicketsSelect.value);
            formData.append('images', imageFileToUpload);

            if (eventTicketsSelect.value === 'Berbayar') {
                formData.append('ticketPrice', ticketPriceInput.value);
            }

            // 6. Kirim Data ke Backend
            const response = await fetch('https://back-end-eventory.vercel.app/event/createEvent', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Server merespons dengan status ${response.status}. Tidak ada detail tambahan.` }));
                console.error('Error dari server:', errorData);
                throw new Error(errorData.message || `Gagal membuat event. Status: ${response.status}`);
            }

            const responseData = await response.json();
            console.log('Sukses! Respons dari server:', responseData);

            if (successOverlay) successOverlay.classList.remove('hidden');
            closeCreateEventModal();
            
            // Refresh data setelah event berhasil dibuat
            loadDashboardData();

        } catch (error) {
            console.error('Error saat mengirim event:', error);
            alert(`Error: ${error.message || 'Terjadi kesalahan saat membuat event. Silakan coba lagi.'}`);
        } finally {
            if (saveEventButton) saveEventButton.disabled = false;
            if (loadingOverlay) loadingOverlay.classList.add('hidden');
        }
    }

    // --- Setup Event Listeners ---
    if (openModalButton) {
        openModalButton.addEventListener('click', showCreateEventModal);
    }

    if (closeModalButton) closeModalButton.addEventListener('click', closeCreateEventModal);
    if (cancelEventButton) cancelEventButton.addEventListener('click', closeCreateEventModal);

    if (createEventForm) {
        createEventForm.addEventListener('submit', handleEventSubmit);
    }

    if (eventTicketsSelect) {
        eventTicketsSelect.addEventListener('change', toggleTicketPriceField);
        toggleTicketPriceField();
    }

    if (successCloseBtn && successOverlay) {
        successCloseBtn.addEventListener('click', () => {
            successOverlay.classList.add('hidden');
        });
    }

    // --- Fungsi untuk Memuat Data Dashboard ---
    async function loadDashboardData() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn('Token tidak ditemukan');
                return;
            }

            // Load stats
            const statsResponse = await fetch('https://back-end-eventory.vercel.app/event/getUserStats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                updateDashboardStats(statsData);
            }

            // Load my events
            const myEventsResponse = await fetch('https://back-end-eventory.vercel.app/event/getMyEvents', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (myEventsResponse.ok) {
                const myEventsData = await myEventsResponse.json();
                renderMyEvents(myEventsData);
            }

            // Load discover events
            const discoverEventsResponse = await fetch('https://back-end-eventory.vercel.app/event/getDiscoverEvents', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (discoverEventsResponse.ok) {
                const discoverEventsData = await discoverEventsResponse.json();
                renderDiscoverEvents(discoverEventsData);
            }

            // Load upcoming events
            const upcomingEventsResponse = await fetch('https://back-end-eventory.vercel.app/event/getUpcomingEvents', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (upcomingEventsResponse.ok) {
                const upcomingEventsData = await upcomingEventsResponse.json();
                renderUpcomingEvents(upcomingEventsData);
            }

            // Load notifications
            const notificationsResponse = await fetch('https://back-end-eventory.vercel.app/notifications/getUserNotifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (notificationsResponse.ok) {
                const notificationsData = await notificationsResponse.json();
                renderNotifications(notificationsData);
            }

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            showNotification('Gagal memuat data dashboard', 'error');
        }
    }

    // --- Fungsi untuk Update UI ---
    function updateDashboardStats(stats) {
        document.getElementById('total-events').textContent = stats.totalEvents || 0;
        document.getElementById('created-events').textContent = stats.createdEvents || 0;
        document.getElementById('upcoming-events').textContent = stats.upcomingEvents || 0;
        document.getElementById('completed-events').textContent = stats.completedEvents || 0;
    }

    function renderMyEvents(events) {
        const container = document.getElementById('my-events-list');
        if (!container) return;

        if (!events || events.length === 0) {
            container.innerHTML = `
                <div class="empty-state text-center py-10">
                    <i class="fas fa-calendar-times fa-3x text-gray-400 mb-4"></i>
                    <p class="text-xl text-gray-600">Belum ada event yang Anda buat.</p>
                    <button class="btn btn-primary mt-4" onclick="showCreateEventModal()">
                        <i class="fas fa-plus"></i> Buat Event Pertama
                    </button>
                </div>`;
            return;
        }

        container.innerHTML = events.map(event => createEventCard(event)).join('');
    }

    function renderDiscoverEvents(events) {
        const container = document.getElementById('discover-events-list');
        if (!container) return;

        if (!events || events.length === 0) {
            container.innerHTML = `
                <div class="empty-state text-center py-10">
                    <i class="fas fa-compass fa-3x text-gray-400 mb-4"></i>
                    <p class="text-xl text-gray-600">Belum ada event yang tersedia.</p>
                </div>`;
            return;
        }

        container.innerHTML = events.map(event => createDiscoverEventCard(event)).join('');
    }

    function renderUpcomingEvents(events) {
        const container = document.getElementById('upcoming-events-list');
        if (!container) return;

        if (!events || events.length === 0) {
            container.innerHTML = `
                <div class="empty-state text-center py-10">
                    <i class="fas fa-calendar fa-3x text-gray-400 mb-4"></i>
                    <p class="text-xl text-gray-600">Tidak ada event mendatang.</p>
                </div>`;
            return;
        }

        container.innerHTML = events.map(event => createUpcomingEventCard(event)).join('');
    }

    function renderNotifications(notifications) {
        const container = document.getElementById('notifications-list');
        if (!container) return;

        if (!notifications || notifications.length === 0) {
            container.innerHTML = `
                <div class="empty-state text-center py-10">
                    <i class="fas fa-bell fa-3x text-gray-400 mb-4"></i>
                    <p class="text-xl text-gray-600">Tidak ada notifikasi.</p>
                </div>`;
            return;
        }

        container.innerHTML = notifications.map(notification => createNotificationCard(notification)).join('');
    }

    // --- Helper Functions untuk Membuat Card ---
    function createEventCard(event) {
        return `
            <div class="event-card" data-id="${event._id}">
                <div class="event-image">
                    <img src="${event.images?.[0] || '../../assets/image/default-event.jpg'}" alt="${event.title}">
                </div>
                <div class="event-content">
                    <h3 class="event-title">${event.title}</h3>
                    <div class="event-details">
                        <p><i class="far fa-calendar"></i> ${formatDate(event.date)}</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
                        <p><i class="fas fa-users"></i> ${event.currentParticipants}/${event.maxParticipants}</p>
                    </div>
                    <div class="event-actions">
                        <button class="btn btn-view" onclick="viewEventDetails('${event._id}')">
                            <i class="fas fa-eye"></i> Lihat
                        </button>
                        <button class="btn btn-edit" onclick="editEvent('${event._id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-delete" onclick="deleteEvent('${event._id}')">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    function createDiscoverEventCard(event) {
        return `
            <div class="discover-event-card" data-id="${event._id}">
                <div class="discover-event-img">
                    <img src="${event.images?.[0] || '../../assets/image/default-event.jpg'}" alt="${event.title}">
                </div>
                <div class="discover-event-content">
                    <span class="discover-event-date">${formatDate(event.date)}</span>
                    <h3 class="discover-event-title">${event.title}</h3>
                    <div class="discover-event-footer">
                        <div class="discover-event-location">
                            <i class="fas fa-map-marker-alt"></i> ${event.location}
                        </div>
                        <div class="discover-event-category">
                            ${event.kategori}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function createUpcomingEventCard(event) {
        const date = new Date(event.date);
        return `
            <div class="upcoming-event" data-id="${event._id}">
                <div class="upcoming-event-date">
                    <span class="upcoming-event-day">${date.getDate()}</span>
                    <span class="upcoming-event-month">${date.toLocaleString('id-ID', { month: 'short' })}</span>
                </div>
                <div class="upcoming-event-info">
                    <h3 class="upcoming-event-title">${event.title}</h3>
                    <div class="upcoming-event-time">
                        <i class="far fa-clock"></i> ${formatTime(event.date)}
                    </div>
                </div>
            </div>
        `;
    }

    function createNotificationCard(notification) {
        return `
            <div class="notification" data-id="${notification._id}">
                <div class="notification-icon">
                    <i class="fas ${getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-text">
                        <strong>${notification.title}</strong> ${notification.message}
                    </div>
                    <div class="notification-time">${formatTimeAgo(notification.createdAt)}</div>
                </div>
            </div>
        `;
    }

    // --- Utility Functions ---
    function formatDate(dateString) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    }

    function formatTime(dateString) {
        const options = { hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleTimeString('id-ID', options);
    }

    function formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Baru saja';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
        return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
    }

    function getNotificationIcon(type) {
        const icons = {
            'event_created': 'fa-calendar-plus',
            'event_updated': 'fa-calendar-check',
            'event_deleted': 'fa-calendar-times',
            'event_reminder': 'fa-bell',
            'participant_joined': 'fa-user-plus',
            'participant_left': 'fa-user-minus',
            'default': 'fa-bell'
        };
        return icons[type] || icons.default;
    }

    // Load initial dashboard data
    loadDashboardData();
});
