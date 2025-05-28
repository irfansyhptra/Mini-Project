// createEvent.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Konfigurasi ---
    const API_CREATE_EVENT_URL_MODAL = 'https://back-end-eventory.vercel.app/event/createEvent';
    const TOKEN_MODAL = localStorage.getItem('token');
    // Mengambil userId dari localStorage jika ada, atau creatorID dari objek 'user'
    const USER_ID_MODAL = localStorage.getItem('userId'); 
    const USER_DATA_STRING_MODAL = localStorage.getItem('user');

    // --- Referensi Elemen DOM (Hanya untuk modal create) ---
    const createEventModalEl = document.getElementById('create-event-modal');
    const createEventFormEl = document.getElementById('create-event-form');
    const openModalButtonEl = document.getElementById('create-event-btn'); // Tombol untuk membuka modal ini
    const closeModalButtonEl = document.getElementById('close-event-modal-btn');
    const cancelEventButtonEl = document.getElementById('cancel-event-btn');
    const saveEventButtonEl = document.getElementById('save-event'); // Tombol submit form

    // Elemen input formulir
    const eventNameInputEl = document.getElementById('event-name');
    const eventDescriptionInputEl = document.getElementById('event-description');
    const eventDateInputEl = document.getElementById('event-date');
    const eventTimeInputEl = document.getElementById('event-time');
    const eventLocationInputEl = document.getElementById('event-location');
    const eventCategoryInputEl = document.getElementById('event-category');
    const eventCapacityInputEl = document.getElementById('event-capacity');
    const eventImageInputEl = document.getElementById('event-image');
    const eventTicketsSelectEl = document.getElementById('event-tickets');
    const ticketPriceGroupEl = document.getElementById('ticket-price-group');
    const ticketPriceInputEl = document.getElementById('ticket-price');

    // Overlay (gunakan global notification jika memungkinkan)
    const loadingOverlayCreateEl = document.getElementById('loading-overlay'); // Loading khusus modal create
    const successOverlayCreateEl = document.getElementById('success-overlay'); // Sukses khusus modal create
    const successCloseBtnCreateEl = document.getElementById('success-close-btn');

    // --- Fungsi Notifikasi Lokal (jika global tidak tersedia) ---
    function showModalLocalNotification(message, type = 'info') {
        if (typeof window.showGlobalNotification === 'function') {
            window.showGlobalNotification(message, type);
        } else {
            alert(`[Modal Event - ${type.toUpperCase()}]: ${message}`); // Fallback
        }
    }

    // --- Fungsi untuk Modal ---
    function openCreateEventModal() {
        if (createEventModalEl) {
            createEventFormEl?.reset(); // Reset form setiap kali modal dibuka
            toggleTicketPriceFieldVisibility(); // Atur visibilitas field harga tiket
            createEventModalEl.style.display = 'flex';
            eventNameInputEl?.focus(); // Fokus ke input pertama
        }
    }

    function closeCreateEventModalView() {
        if (createEventModalEl) {
            createEventModalEl.style.display = 'none';
        }
        // Form di-reset saat dibuka atau setelah submit berhasil
    }

    // --- Fungsi untuk Harga Tiket ---
    function toggleTicketPriceFieldVisibility() {
        if (eventTicketsSelectEl && ticketPriceGroupEl && ticketPriceInputEl) {
            const isPaidTicket = eventTicketsSelectEl.value === 'Berbayar';
            ticketPriceGroupEl.style.display = isPaidTicket ? 'block' : 'none';
            ticketPriceInputEl.required = isPaidTicket;
            if (!isPaidTicket) {
                ticketPriceInputEl.value = ''; // Kosongkan jika tidak berbayar
            }
        }
    }

    // --- Fungsi Utama: Handle Submit Formulir ---
    async function handleSubmitNewEvent(event) {
        event.preventDefault();
        console.log('Proses pembuatan event baru dimulai...');

        if (!TOKEN_MODAL) {
            showModalLocalNotification('Autentikasi gagal. Anda harus login untuk membuat event.', 'error');
            return;
        }

        let creatorIDToUse;
        if (USER_ID_MODAL) {
            creatorIDToUse = USER_ID_MODAL;
        } else if (USER_DATA_STRING_MODAL) {
            try {
                const userData = JSON.parse(USER_DATA_STRING_MODAL);
                if (userData && userData._id) {
                    creatorIDToUse = userData._id;
                } else {
                    throw new Error('Format data pengguna tidak valid.');
                }
            } catch (e) {
                showModalLocalNotification('Gagal memproses data pengguna. Silakan login ulang.', 'error');
                return;
            }
        } else {
            showModalLocalNotification('Informasi pengguna tidak ditemukan. Silakan login ulang.', 'error');
            return;
        }


        // Validasi Input Klien
        if (!eventNameInputEl.value.trim() || !eventDescriptionInputEl.value.trim() ||
            !eventDateInputEl.value || !eventTimeInputEl.value ||
            !eventLocationInputEl.value.trim() || !eventCategoryInputEl.value ||
            !eventCapacityInputEl.value || eventTicketsSelectEl.value === '') {
            showModalLocalNotification('Mohon lengkapi semua field yang wajib diisi (*).', 'warning');
            return;
        }
        if (eventTicketsSelectEl.value === 'Berbayar' && !ticketPriceInputEl.value.trim()) {
            showModalLocalNotification('Harga tiket wajib diisi untuk event berbayar.', 'warning');
            return;
        }
        if (parseInt(eventCapacityInputEl.value) < 1) {
            showModalLocalNotification('Kapasitas peserta minimal adalah 1.', 'warning');
            return;
        }
        const imageFilesToUpload = eventImageInputEl.files;
        if (!imageFilesToUpload || imageFilesToUpload.length === 0) {
            showModalLocalNotification('Anda wajib mengunggah minimal satu gambar event.', 'warning');
            return;
        }

        // Tampilkan loading
        if (saveEventButtonEl) saveEventButtonEl.disabled = true;
        if (loadingOverlayCreateEl) loadingOverlayCreateEl.classList.remove('hidden');

        try {
            // Gabungkan tanggal dan waktu, konversi ke ISO String (UTC)
            const localEventDateTime = new Date(`${eventDateInputEl.value}T${eventTimeInputEl.value}`);
            if (isNaN(localEventDateTime.getTime())) {
                throw new Error('Format tanggal atau waktu yang Anda masukkan tidak valid.');
            }
            const utcDateTimeStringForAPI = localEventDateTime.toISOString();

            // Persiapkan FormData
            const eventFormData = new FormData();
            eventFormData.append('creatorID', creatorIDToUse);
            eventFormData.append('title', eventNameInputEl.value.trim());
            eventFormData.append('description', eventDescriptionInputEl.value.trim());
            eventFormData.append('date', utcDateTimeStringForAPI); // Kirim dalam format UTC
            eventFormData.append('location', eventLocationInputEl.value.trim());
            eventFormData.append('kategori', eventCategoryInputEl.value);
            eventFormData.append('maxParticipants', eventCapacityInputEl.value);
            eventFormData.append('ticket', eventTicketsSelectEl.value);
            eventFormData.append('images', imageFilesToUpload[0]); // API Anda mungkin mendukung multiple, sesuaikan

            if (eventTicketsSelectEl.value === 'Berbayar') {
                eventFormData.append('ticketPrice', ticketPriceInputEl.value);
            }

            // Kirim ke Backend
            const response = await fetch(API_CREATE_EVENT_URL_MODAL, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${TOKEN_MODAL}` }, // Content-Type diatur otomatis oleh FormData
                body: eventFormData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Server merespons dengan ${response.status}.` }));
                throw new Error(errorData.message || `Gagal membuat event. Error: ${response.status}`);
            }

            const responseData = await response.json();
            console.log('Event berhasil dibuat! Respons server:', responseData);

            if (successOverlayCreateEl) successOverlayCreateEl.classList.remove('hidden');
            else showModalLocalNotification('Event Anda berhasil dibuat!', 'success');

            closeCreateEventModalView(); // Tutup modal setelah sukses
            // Form sudah di-reset saat modal dibuka berikutnya

            // Panggil fungsi refresh dashboard jika tersedia
            if (typeof window.refreshDashboardData === 'function') {
                window.refreshDashboardData();
            } else {
                console.warn('Fungsi window.refreshDashboardData tidak ditemukan. Dashboard mungkin tidak refresh otomatis.');
                showModalLocalNotification('Event dibuat, namun daftar event di dashboard mungkin belum terupdate. Silakan refresh manual jika perlu.', 'info');
            }

        } catch (error) {
            console.error('Terjadi error saat membuat event:', error);
            showModalLocalNotification(`Error: ${error.message || 'Gagal membuat event. Silakan coba lagi.'}`, 'error');
        } finally {
            if (saveEventButtonEl) saveEventButtonEl.disabled = false;
            if (loadingOverlayCreateEl) loadingOverlayCreateEl.classList.add('hidden');
        }
    }

    // --- Setup Event Listeners (Hanya untuk modal create) ---
    if (openModalButtonEl) {
        openModalButtonEl.addEventListener('click', openCreateEventModal);
    }
    if (closeModalButtonEl) {
        closeModalButtonEl.addEventListener('click', closeCreateEventModalView);
    }
    if (cancelEventButtonEl) {
        cancelEventButtonEl.addEventListener('click', closeCreateEventModalView);
    }
    if (createEventFormEl) {
        createEventFormEl.addEventListener('submit', handleSubmitNewEvent);
    }
    if (eventTicketsSelectEl) {
        eventTicketsSelectEl.addEventListener('change', toggleTicketPriceFieldVisibility);
    }
    if (successCloseBtnCreateEl && successOverlayCreateEl) {
        successCloseBtnCreateEl.addEventListener('click', () => {
            successOverlayCreateEl.classList.add('hidden');
        });
    }

    // Inisialisasi awal untuk field harga tiket jika modal mungkin sudah terlihat (jarang)
    toggleTicketPriceFieldVisibility(); 
});