const API_URL = 'https://back-end-eventory.vercel.app/event/createEvent';
const TOKEN = localStorage.getItem('token');

// Check authentication
if (!TOKEN) {
    window.location.href = '/pages/login.html';
}

// DOM Elements
const createEventForm = document.getElementById('create-event-form');
const eventTickets = document.getElementById('event-tickets');
const ticketPriceGroup = document.getElementById('ticket-price-group');
const loadingOverlay = document.getElementById('loading-overlay');
const successOverlay = document.getElementById('success-overlay');
const successCloseBtn = document.getElementById('success-close-btn');
const eventDateInput = document.getElementById('event-date');
const eventTimeInput = document.getElementById('event-time');
const eventLocationInput = document.getElementById('event-location');
const eventCategoryInput = document.getElementById('event-category');
const eventCapacityInput = document.getElementById('event-capacity');
const eventImageInput = document.getElementById('event-image');
const ticketPriceInput = document.getElementById('ticket-price');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

function setupEventListeners() {
    // Ticket type change
    eventTickets?.addEventListener('change', toggleTicketPriceField);
    toggleTicketPriceField(); // Initial state

    // Form submission
    createEventForm?.addEventListener('submit', handleCreateEvent);

    // Success overlay close
    successCloseBtn?.addEventListener('click', () => {
        successOverlay.classList.add('hidden');
        window.location.href = 'myEvent.html';
    });
}

// Toggle ticket price field visibility
function toggleTicketPriceField() {
    if (eventTickets && ticketPriceGroup && ticketPriceInput) {
        if (eventTickets.value === 'Berbayar') {
            ticketPriceGroup.style.display = 'block';
            ticketPriceInput.required = true;
        } else {
            ticketPriceGroup.style.display = 'none';
            ticketPriceInput.required = false;
        }
    }
}

// Handle create event
async function handleCreateEvent(e) {
    e.preventDefault();
    
    try {
        // Validate required fields
        if (!eventDateInput.value || !eventTimeInput.value ||
            !eventLocationInput.value.trim() || !eventCategoryInput.value ||
            !eventCapacityInput.value || !eventTickets.value) {
            throw new Error('Semua kolom yang ditandai (*) wajib diisi.');
        }

        if (eventTickets.value === 'Berbayar' && !ticketPriceInput.value.trim()) {
            throw new Error('Harga tiket wajib diisi jika event berbayar.');
        }

        // Validate image
        const imageFile = eventImageInput.files[0];
        if (!imageFile) {
            throw new Error('Gambar event wajib diunggah.');
        }

        // Create FormData
        const formData = new FormData();
        formData.append('title', document.getElementById('event-title').value);
        formData.append('description', document.getElementById('event-description').value);
        formData.append('date', eventDateInput.value);
        formData.append('time', eventTimeInput.value);
        formData.append('location', eventLocationInput.value);
        formData.append('kategori', eventCategoryInput.value);
        formData.append('maxParticipants', eventCapacityInput.value);
        formData.append('ticket', eventTickets.value);
        formData.append('images', imageFile);
        formData.append('creatorID', localStorage.getItem('userId'));

        if (eventTickets.value === 'Berbayar') {
            formData.append('ticketPrice', ticketPriceInput.value);
        }

        // Show loading overlay
        loadingOverlay.classList.remove('hidden');

        // Send request
        const response = await fetch(`${API_URL}/createEvent`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOKEN}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create event');
        }

        const data = await response.json();
        showNotification('Event berhasil dibuat!', 'success');
        successOverlay.classList.remove('hidden');
    } catch (error) {
        console.error('Error creating event:', error);
        showNotification(error.message || 'Gagal membuat event', 'error');
    } finally {
        loadingOverlay.classList.add('hidden');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);

    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Get notification icon
function getNotificationIcon(type) {
    const icons = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

// Fungsi ini akan dijalankan setelah seluruh konten HTML dimuat
document.addEventListener('DOMContentLoaded', () => {
    // --- Referensi Elemen DOM ---
    const createEventModal = document.getElementById('create-event-modal');
    const openModalButton = document.getElementById('open-create-event-btn'); // Ganti dengan ID tombol Anda untuk membuka modal
    const closeModalButton = document.getElementById('close-event-modal-btn');
    const cancelEventButton = document.getElementById('cancel-event-btn');
    const saveEventButton = document.getElementById('save-event'); // Tombol submit

    // Elemen input formulir
    const eventNameInput = document.getElementById('event-name');
    const eventDescriptionInput = document.getElementById('event-description');
    const eventDateInput = document.getElementById('event-date');
    const eventTimeInput = document.getElementById('event-time');
    const eventLocationInput = document.getElementById('event-location');
    const eventCategoryInput = document.getElementById('event-category');
    const eventCapacityInput = document.getElementById('event-capacity');
    const eventImageInput = document.getElementById('event-image');
    const ticketPriceInput = document.getElementById('ticket-price');

    // --- Fungsi untuk Modal ---
    function showCreateEventModal() {
        if (createEventModal) {
            createEventModal.style.display = 'flex'; // Atau 'block', sesuaikan dengan CSS Anda
        }
    }

    function closeCreateEventModal() {
        if (createEventModal) {
            createEventModal.style.display = 'none';
        }
        if (createEventForm) {
            createEventForm.reset(); // Reset formulir saat modal ditutup
        }
        // Sembunyikan juga field harga tiket dan reset nilainya
        if (ticketPriceGroup) ticketPriceGroup.style.display = 'none';
        if (ticketPriceInput) {
            ticketPriceInput.value = '';
            ticketPriceInput.required = false;
        }
        // Pastikan select tiket kembali ke default jika perlu (misal, 'Gratis')
        if (eventTickets) {
             // eventTickets.value = 'Gratis'; // Atau value default Anda
        }
    }

    // --- Fungsi untuk Harga Tiket ---
    function toggleTicketPriceField() {
        if (eventTickets && ticketPriceGroup && ticketPriceInput) {
            if (eventTickets.value === 'Berbayar') {
                ticketPriceGroup.style.display = 'block';
                ticketPriceInput.required = true;
            } else {
                ticketPriceGroup.style.display = 'none';
                ticketPriceInput.required = false;
                ticketPriceInput.value = ''; // Kosongkan harga jika gratis
            }
        }
    }

    // --- Fungsi Utama: Handle Submit Formulir ---
    async function handleEventSubmit(event) {
        event.preventDefault(); // Mencegah submit form standar
        console.log('Pengiriman formulir event dimulai...');

        if (saveEventButton) saveEventButton.disabled = true;
        if (loadingOverlay) loadingOverlay.classList.remove('hidden');

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Autentikasi gagal. Token tidak ditemukan. Silakan login kembali.');
            if (saveEventButton) saveEventButton.disabled = false;
            if (loadingOverlay) loadingOverlay.classList.add('hidden');
            // window.location.href = '/halaman-login.html'; // Arahkan ke login
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

            // 2. Validasi Input Dasar (keberadaan nilai untuk field required)
            // HTML attribute 'required' sudah menangani ini, tapi validasi JS adalah lapisan tambahan yang baik
            if (!eventNameInput.value.trim() || !eventDescriptionInput.value.trim() ||
                !eventDateInput.value || !eventTimeInput.value ||
                !eventLocationInput.value.trim() || !eventCategoryInput.value ||
                !eventCapacityInput.value || !eventTickets.value) {
                throw new Error('Semua kolom yang ditandai (*) wajib diisi.');
            }

            if (eventTickets.value === 'Berbayar' && !ticketPriceInput.value.trim()) {
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
            // Backend Anda mengharapkan field 'images' (plural)
            // Jika input file Anda tidak 'multiple', hanya file pertama yang akan ada.
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
            formData.append('kategori', eventCategoryInput.value); // Nilai sudah sesuai dari HTML
            formData.append('maxParticipants', eventCapacityInput.value);
            formData.append('ticket', eventTickets.value); // Nilai sudah sesuai dari HTML
            formData.append('images', imageFileToUpload); // Field 'images' untuk backend

            if (eventTickets.value === 'Berbayar') {
                formData.append('ticketPrice', ticketPriceInput.value); // Kirim harga jika berbayar
                // Pastikan backend Anda siap menerima field 'ticketPrice' ini
            }

            console.log('FormData siap dikirim:');
            for (let pair of formData.entries()) {
                 console.log(`${pair[0]}: ${pair[1] instanceof File ? pair[1].name : pair[1]}`);
            }


            // 6. Kirim Data ke Backend
            const response = await fetch(`${API_URL}/createEvent`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // 'Content-Type' tidak perlu di-set manual untuk FormData
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
            closeCreateEventModal(); // Tutup dan reset form setelah sukses

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
    } else {
        // Jika tidak ada tombol khusus, mungkin modal dibuka dengan cara lain atau selalu terlihat
        // Untuk pengujian, Anda bisa panggil showCreateEventModal() langsung jika diperlukan
        // console.warn('Tombol untuk membuka modal (ID: open-create-event-btn) tidak ditemukan.');
    }

    if (closeModalButton) closeModalButton.addEventListener('click', closeCreateEventModal);
    if (cancelEventButton) cancelEventButton.addEventListener('click', closeCreateEventModal);

    if (createEventForm) {
        createEventForm.addEventListener('submit', handleEventSubmit);
    } else {
        console.error('Formulir event (ID: create-event-form) tidak ditemukan.');
    }

    if (eventTickets) {
        eventTickets.addEventListener('change', toggleTicketPriceField);
        toggleTicketPriceField(); // Panggil sekali saat load untuk set kondisi awal
    }

    if (successCloseBtn && successOverlay) {
        successCloseBtn.addEventListener('click', () => {
            successOverlay.classList.add('hidden');
            // Anda mungkin ingin melakukan redirect atau tindakan lain di sini
            // window.location.href = '/halaman-event-saya.html'; // Ganti dengan URL yang sesuai
        });
    }

    // (Opsional) Jika Anda memiliki tombol "Gunakan Lokasi Saat Ini"
    const getCurrentLocationButton = document.getElementById('get-current-location-button'); // Ganti dengan ID yang benar
    if (getCurrentLocationButton && eventLocationInput) {
        getCurrentLocationButton.addEventListener('click', async () => {
            if (!navigator.geolocation) {
                alert('Geolocation tidak didukung oleh browser Anda.');
                return;
            }
            getCurrentLocationButton.disabled = true;
            getCurrentLocationButton.textContent = 'Mencari...';
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
                });
                const { latitude, longitude } = position.coords;
                // Contoh menggunakan Nominatim (layanan gratis, perhatikan batas penggunaan)
                const geoResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
                if (!geoResponse.ok) throw new Error('Gagal mendapatkan nama lokasi.');
                const geoData = await geoResponse.json();
                eventLocationInput.value = geoData.display_name || `Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)}`;
            } catch (err) {
                console.error('Error mendapatkan lokasi:', err);
                alert(err.message || 'Tidak dapat mengakses lokasi Anda. Pastikan izin lokasi diberikan.');
                eventLocationInput.focus();
            } finally {
                getCurrentLocationButton.disabled = false;
                getCurrentLocationButton.textContent = 'Gunakan Lokasi Saat Ini';
            }
        });
    }

    console.log('Script createEvent.js berhasil dimuat dan event listener telah dipasang.');
});
