// createEvent.js

const initializeCreateEventForm = () => {
    const form = document.getElementById("create-event-form"); // Ganti dengan ID form event Anda
    if (!form) {
        console.error("Formulir 'create-event-form' tidak ditemukan di DOM.");
        return;
    }

    const submitButton = document.getElementById('save-name'); // Pastikan ID tombol submit benar
    const loadingOverlay = document.getElementById("loading-overlay-create"); // ID overlay loading khusus create
    const successOverlay = document.getElementById("success-overlay-create"); // ID overlay sukses khusus create
    // const successCloseButton = document.getElementById("success-close-btn-create"); // Tombol tutup overlay sukses

    // Elemen input spesifik untuk form create event
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

    // Elemen modal itu sendiri
    const createEventModalEl = document.getElementById('create-event-modal');
    const closeModalButtonEl = document.getElementById('close-event-modal-btn');
    const cancelEventButtonEl = document.getElementById('cancel-event-btn');
    const openModalButtonEl = document.getElementById('create-event-btn'); // Tombol utama pembuka modal

    if (!submitButton) {
        console.error("Tombol submit tidak ditemukan dalam form.");
        return;
    }
    if (!eventNameInput || !eventDescriptionInput || !eventDateInput || !eventTimeInput || !eventLocationInput || !eventCategoryInput || !eventCapacityInput || !eventImageInput || !eventTicketsSelect || !ticketPriceGroup || !ticketPriceInput) {
        console.error("Satu atau lebih elemen input form create event tidak ditemukan. Periksa ID elemen.");
        return;
    }
    if (!createEventModalEl || !closeModalButtonEl || !cancelEventButtonEl || !openModalButtonEl) {
        console.error("Elemen modal atau tombol kontrol modal tidak ditemukan.");
        return;
    }


    // --- Fungsi Notifikasi Lokal (atau panggil global jika ada) ---
    function showCreateNotificationLocal(message, type = 'info') {
        if (typeof window.showGlobalNotification === 'function') {
            window.showGlobalNotification(message, type);
        } else {
            alert(`[Buat Event - ${type.toUpperCase()}]: ${message}`);
        }
    }
    
    function showCreateLoading(show = true) {
        if (loadingOverlay) {
            loadingOverlay.style.display = show ? 'flex' : 'none'; // Atau pakai class hidden
            loadingOverlay.classList.toggle("hidden", !show);
        }
        if (submitButton) submitButton.disabled = show;
    }

    function showCreateSuccessOverlay() {
        if (successOverlay) {
            // Misalkan overlay sukses punya class 'hidden' untuk menyembunyikan
            successOverlay.classList.remove("hidden");
            successOverlay.classList.add("flex"); // Jika pakai flex untuk menampilkan
        } else {
            showCreateNotificationLocal("Event berhasil dibuat!", "success");
        }
    }

    // --- Fungsi untuk Modal ---
    function openModal() {
        form.reset(); // Reset form saat modal dibuka
        toggleTicketPrice(); // Atur visibilitas harga tiket
        createEventModalEl.style.display = 'flex';
        eventNameInput.focus();
    }

    function closeModal() {
        createEventModalEl.style.display = 'none';
        // Form sudah di-reset saat dibuka atau setelah sukses
    }

    // --- Fungsi untuk Harga Tiket ---
    function toggleTicketPrice() {
        const isPaid = eventTicketsSelect.value === 'Berbayar';
        ticketPriceGroup.style.display = isPaid ? 'block' : 'none';
        ticketPriceInput.required = isPaid;
        if (!isPaid) ticketPriceInput.value = '';
    }

     // --- Fungsi Format Tanggal ke ISO UTC ---
    function formatDateToISO_UTC_Local(dateString, timeString) {
        if (!dateString || !timeString) return null;
        try {
            const localDateTime = new Date(`${dateString}T${timeString}`);
            if (isNaN(localDateTime.getTime())) return null;
            return localDateTime.toISOString();
        } catch (e) { console.error("Error formatting date to ISO for create event:", e); return null; }
    }

    async function handleSubmitEventCreation(event) {
        event.preventDefault();
        console.log("Pengiriman form pembuatan event dimulai...");

        showCreateLoading(true);

        try {
            const token = localStorage.getItem("token");
            const userDataString = localStorage.getItem("user"); // Mengambil objek user
            let creatorID;

            if (!token) throw new Error("Anda tidak terautentikasi. Silakan login kembali.");
            if (!userDataString) throw new Error("Data pengguna tidak ditemukan. Silakan login kembali.");
            
            try {
                const userData = JSON.parse(userDataString);
                if (!userData || !userData._id) throw new Error("ID pengguna (CreatorID) tidak valid.");
                creatorID = userData._id;
            } catch (parseError) {
                throw new Error("Gagal memproses data pengguna. Format tidak valid.");
            }


            // Validasi Input Klien
            const requiredTextInputs = [
                { el: eventNameInput, name: "Judul Event" }, { el: eventDescriptionInput, name: "Deskripsi" },
                { el: eventDateInput, name: "Tanggal Event" }, { el: eventTimeInput, name: "Waktu Event" },
                { el: eventLocationInput, name: "Lokasi" }, { el: eventCategoryInput, name: "Kategori" },
                { el: eventCapacityInput, name: "Kapasitas" }, { el: eventTicketsSelect, name: "Jenis Tiket" }
            ];
            for (const field of requiredTextInputs) {
                if (!field.el.value.trim()) {
                    throw new Error(`${field.name} wajib diisi.`);
                }
            }
            if (eventTicketsSelect.value === 'Berbayar' && !ticketPriceInput.value.trim()) {
                throw new Error('Harga tiket wajib diisi untuk event berbayar.');
            }
            if (parseInt(eventCapacityInput.value) < 1) {
                throw new Error('Kapasitas minimal adalah 1 peserta.');
            }
            const imageFile = eventImageInput.files?.[0];
            if (!imageFile) {
                throw new Error('Gambar event wajib diunggah.');
            }

            const dateForAPI = formatDateToISO_UTC_Local(eventDateInput.value, eventTimeInput.value);
            if (!dateForAPI) {
                throw new Error('Format tanggal atau waktu event tidak valid.');
            }

            // Buat FormData
            const formData = new FormData();
            formData.append('CreatorID', creatorID);
            formData.append('title', eventNameInput.value.trim());
            formData.append('description', eventDescriptionInput.value.trim());
            formData.append('date', dateForAPI); // Kirim ISO UTC
            formData.append('location', eventLocationInput.value.trim());
            formData.append('kategori', eventCategoryInput.value);
            formData.append('maxParticipants', eventCapacityInput.value);
            formData.append('images', imageFile); // Hanya satu gambar sesuai form Anda
            formData.append('ticket', eventTicketsSelect.value);
            if (eventTicketsSelect.value === 'Berbayar') {
                formData.append('ticketPrice', ticketPriceInput.value);
            }

            console.log("FormData siap dikirim. CreatorID:", creatorID);
            // for (var pair of formData.entries()) { console.log(pair[0]+ ': ' + pair[1]); }


            // Kirim ke API
            const response = await fetch("https://back-end-eventory.vercel.app/event/createEvent", {
                method: "POST",
                headers: { 'Authorization': `Bearer ${token}` }, // Content-Type diatur otomatis oleh browser untuk FormData
                body: formData,
            });

            console.log("Respons status API:", response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Server error: ${response.statusText} (${response.status})` }));
                console.error("Error dari API:", errorData);
                throw new Error(errorData.message || "Gagal membuat event.");
            }

            const responseData = await response.json();
            console.log("Sukses! Respons API:", responseData);

            showCreateSuccessOverlay(); // Tampilkan overlay sukses
            // closeModal(); // Tutup modal DI SINI atau saat overlay sukses ditutup
            form.reset(); // Reset form setelah sukses
            toggleTicketPrice(); // Kembalikan tampilan harga tiket ke default

            // Panggil fungsi refresh dashboard jika tersedia (dari dashboardUser.js)
            if (typeof window.refreshDashboardData === 'function') {
                window.refreshDashboardData();
            } else {
                console.warn('Fungsi window.refreshDashboardData tidak ditemukan. Dashboard mungkin tidak otomatis refresh.');
            }

        } catch (error) {
            console.error("Error saat submit event:", error);
            showCreateNotificationLocal(error.message, 'error');
        } finally {
            showCreateLoading(false);
        }
    }

    // --- Attach Event Listeners ---
    form.addEventListener("submit", handleSubmitEventCreation);

    // Listener untuk tombol buka/tutup modal
    openModalButtonEl?.addEventListener('click', openModal);
    closeModalButtonEl?.addEventListener('click', closeModal);
    cancelEventButtonEl?.addEventListener('click', closeModal);

    // Listener untuk perubahan jenis tiket
    eventTicketsSelect?.addEventListener('change', toggleTicketPrice);
    toggleTicketPrice(); // Panggil sekali untuk set state awal

    // Listener untuk tombol tutup overlay sukses (jika ada tombolnya sendiri)
    // successCloseButton?.addEventListener('click', () => {
    //     if (successOverlay) {
    //         successOverlay.classList.add("hidden");
    //         successOverlay.classList.remove("flex");
    //     }
    //     closeModal(); // Tutup modal utama setelah overlay sukses ditutup
    // });
};

// Panggil fungsi utama saat DOM sudah siap
document.addEventListener("DOMContentLoaded", initializeCreateEventForm);