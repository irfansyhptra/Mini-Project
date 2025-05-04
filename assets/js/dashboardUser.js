// Initialize AOS
AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true
});

// Contoh fetch untuk mengambil event milik user
function getUserEvents(userName) {
  fetch(`http://localhost:3000/user-events/${userName}`, {
    method: 'GET',
    credentials: 'include' // Penting untuk mengirim cookies (token)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log('Events data:', data);
    if (data.status === 'success') {
      renderUserEvents(data.data); // Panggil fungsi render yang sudah Anda buat
    } else {
      console.error('Error:', data.message);
    }
  })
  .catch(error => {
    console.error('Error fetching events:', error);
    renderUserEvents([]); // Render empty state jika terjadi error
  });
}

// Contoh penggunaan di halaman HTML
document.addEventListener('DOMContentLoaded', function() {
  // Ambil userName dari localStorage atau dari data login
  const userData = JSON.parse(localStorage.getItem('userData'));
  if (userData && userData.userName) {
    getUserEvents(userData.userName);
  } else {
    // Redirect ke halaman login atau tampilkan pesan
    console.error('User not logged in');
  }
});

// Fetch event berdasarkan ID
function getEventById(eventId) {
  fetch(`http://localhost:3000/event/${eventId}`, {
    method: 'GET',
    credentials: 'include'
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === 'success') {
      // Tampilkan detail event
      console.log('Event detail:', data.data);
    } else {
      console.error('Error:', data.message);
    }
  })
  .catch(error => {
    console.error('Error fetching event details:', error);
  });
}

// Toggle sidebar on mobile
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');

menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('show');
});

// User dropdown toggle
const userDropdownToggle = document.getElementById('user-dropdown-toggle');
const userDropdownMenu = document.getElementById('user-dropdown-menu');

userDropdownToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdownMenu.classList.toggle('show');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (userDropdownMenu.classList.contains('show') && !userDropdownToggle.contains(e.target)) {
        userDropdownMenu.classList.remove('show');
    }
});

// Modal functionality
const createEventBtn = document.getElementById('create-event-btn');
const createEventModal = document.getElementById('create-event-modal');
const closeModal = document.getElementById('close-modal');
const cancelEvent = document.getElementById('cancel-event');
const saveEvent = document.getElementById('save-event');
const eventTickets = document.getElementById('event-tickets');
const ticketPriceGroup = document.getElementById('ticket-price-group');

createEventBtn.addEventListener('click', () => {
    createEventModal.classList.add('show');
});

closeModal.addEventListener('click', () => {
    createEventModal.classList.remove('show');
});

cancelEvent.addEventListener('click', () => {
    createEventModal.classList.remove('show');
});

// Show/hide ticket price field based on event type
eventTickets.addEventListener('change', () => {
    if (eventTickets.value === 'paid') {
        ticketPriceGroup.style.display = 'block';
    } else {
        ticketPriceGroup.style.display = 'none';
    }
});

// Close modal when clicking outside the modal content
createEventModal.addEventListener('click', (e) => {
    if (e.target === createEventModal) {
        createEventModal.classList.remove('show');
    }
});

// Save event functionality
saveEvent.addEventListener('click', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        showNotification('Silakan login terlebih dahulu');
        return;
    }
    
    console.log('Current user:', currentUser);
    
    // Get form values
    const nama_event = document.getElementById('event-name').value;
    const deskripsi_event = document.getElementById('event-description').value;
    const tanggal_event = document.getElementById('event-date').value;
    const waktu_event = document.getElementById('event-time').value;
    const lokasi_event = document.getElementById('event-location').value;
    const kategori_event = document.getElementById('event-category').value;
    const kapasitas = document.getElementById('event-capacity').value;
    const tipe_event = document.getElementById('event-tickets').value;
    const gambarInput = document.getElementById('event-image');
    
    console.log('Form data:', {
        nama_event, deskripsi_event, tanggal_event, waktu_event,
        lokasi_event, kategori_event, kapasitas, tipe_event
    });
    
    // Validate form
    if (!nama_event || !deskripsi_event || !tanggal_event || !waktu_event || !lokasi_event || !kategori_event) {
        showNotification('Harap lengkapi semua field yang diperlukan!');
        return;
    }
    
    // Create FormData object for file upload
    const formData = new FormData();
    formData.append('nama_event', nama_event);
    formData.append('deskripsi_event', deskripsi_event);
    formData.append('tanggal_event', tanggal_event);
    formData.append('waktu_event', waktu_event);
    formData.append('lokasi_event', lokasi_event);
    formData.append('kategori_event', kategori_event);
    formData.append('kapasitas', kapasitas);
    formData.append('tipe_event', tipe_event);
    formData.append('userName', currentUser.userName);
    
    // Add the file if it exists
    if (gambarInput.files[0]) {
        formData.append('gambar', gambarInput.files[0]);
        console.log('Image file:', gambarInput.files[0].name);
    } else {
        console.log('No image selected');
    }
    
    // Show loading indicator
    showNotification('Sedang membuat event...');
    
    // Send to server
    fetch('http://localhost:3000/create-event', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        console.log('Response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Server response:', data);
        if (data.status === 200) {
            showNotification('Event berhasil dibuat!');
            createEventModal.classList.remove('show');
            
            // Reset form
            document.getElementById('create-event-form').reset();
            
            // Reload events with a slight delay to ensure the database has updated
            setTimeout(() => {
                loadUserEvents(currentUser.userName);
            }, 500);
        } else {
            showNotification('Gagal membuat event: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error creating event:', error);
        showNotification('Terjadi kesalahan: ' + error.message);
    });
});

// Function to load user events
function loadUserEvents(userName) {
    console.log('Loading events for user:', userName);
    
    fetch(`http://localhost:3000/user-events/${userName}`)
        .then(response => {
            console.log('Response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('API Response:', data);
            
            // Handle different response formats
            if (data.status === 200 && data.data) {
                renderUserEvents(data.data);
            } else if (Array.isArray(data)) {
                // If the response is directly an array of events
                renderUserEvents(data);
            } else if (data.data && Array.isArray(data.data)) {
                // If the data is nested in a data property
                renderUserEvents(data.data);
            } else if (data.message === "success" && data.data) {
                // Structure from your response helper
                renderUserEvents(data.data);
            } else {
                showNotification('Gagal memuat event: Format respons tidak sesuai');
                console.error('Unexpected response format:', data);
            }
        })
        .catch(error => {
            showNotification('Terjadi kesalahan: ' + error.message);
            console.error('Error fetching events:', error);
        });
}

// Function to render user events
function renderUserEvents(events) {
    console.log('Rendering events:', events);
    const eventListContainer = document.getElementById('event-list');
    
    // Clear current events
    eventListContainer.innerHTML = '';
    
    if (!events || events.length === 0) {
        eventListContainer.innerHTML = '<div class="no-events">Anda belum memiliki event. Buat event pertama Anda!</div>';
        return;
    }
    
    // Render each event
    events.forEach(event => {
        try {
            // Format date
            const eventDate = new Date(event.tanggal_event);
            const formattedDate = eventDate.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
            
            // Determine status class
            let statusClass = '';
            let statusText = '';
            
            switch (event.status_event) {
                case 'Menunggu Verifikasi':
                    statusClass = 'status-pending';
                    statusText = 'Menunggu Verifikasi';
                    break;
                case 'Terverifikasi':
                    const today = new Date();
                    if (eventDate > today) {
                        statusClass = 'status-upcoming';
                        statusText = 'Mendatang';
                    } else {
                        statusClass = 'status-active';
                        statusText = 'Aktif';
                    }
                    break;
                default:
                    statusClass = 'status-completed';
                    statusText = 'Selesai';
            }
            
            // Fix the image path - SOLUSI PERBAIKAN
            let imagePath = '';
            if (event.gambar) {
                // Gunakan URL lengkap ke server untuk mengakses gambar
                imagePath = `http://localhost:3000/assets/image/events/${event.gambar}`;
            } else {
                // Fallback ke gambar default jika tidak ada
                imagePath = '../../assets/image/default-event.jpg';
            }

            // Tambahkan ke container
            eventListContainer.innerHTML += `
                <div class="event-item" data-id="${event.id}">
                    <div class="event-img">
                        <img src="${imagePath}" alt="${event.nama_event}" onerror="this.src='../../assets/image/default-event.jpg'">
                    </div>
                    <div class="event-info">
                        <h3 class="event-title">${event.nama_event}</h3>
                        <div class="event-date">
                            <i class="far fa-calendar-alt"></i> ${formattedDate}, ${event.waktu_event}
                        </div>
                        <div class="event-location">
                            <i class="fas fa-map-marker-alt"></i> ${event.lokasi_event}
                        </div>
                        <span class="event-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="event-actions">
                        <button class="btn-view" title="Lihat" onclick="viewEvent(${event.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-edit" title="Edit" onclick="editEvent(${event.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" title="Hapus" onclick="deleteEvent(${event.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error rendering event:', error, event);
        }
    });
}

// Function to view event details (placeholder)
function viewEvent(eventId) {
    // This would typically open a detailed view or a new page
    showNotification('Melihat detail event ID: ' + eventId);
}

// Function to edit event (placeholder)
function editEvent(eventId) {
    // This would typically populate the form with event data for editing
    showNotification('Edit event ID: ' + eventId);
}

// Function to delete event
function deleteEvent(eventId) {
    if (confirm('Apakah Anda yakin ingin menghapus event ini?')) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        fetch(`http://localhost:3000/event/${eventId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            console.log('Delete response:', data);
            if (data.status === 200) {
                showNotification('Event berhasil dihapus!');
                // Reload events
                loadUserEvents(currentUser.userName);
            } else {
                showNotification('Gagal menghapus event: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error deleting event:', error);
            showNotification('Terjadi kesalahan: ' + error.message);
        });
    }
}

// Feature: Show notification when a new event is added
const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.className = 'notification-toast';
    notification.innerHTML = `
        <div class="notification-toast-content">
            <i class="fas fa-bell"></i>
            <span>${message}</span>
        </div>
        <button class="notification-toast-close">&times;</button>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.right = '20px';
    }, 100);

    setTimeout(() => {
        notification.style.right = '-300px';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);

    notification.querySelector('.notification-toast-close').addEventListener('click', () => {
        notification.style.right = '-300px';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    });
};

// Add notification styles
const notificationStyles = document.createElement('style');
notificationStyles.innerHTML = `
    .notification-toast {
        position: fixed;
        top: 20px;
        right: -300px;
        width: 280px;
        background-color: var(--white);
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        padding: 15px;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: space-between;
        transition: right 0.3s ease-in-out;
    }
    
    .notification-toast-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification-toast-content i {
        color: var(--primary-red);
        font-size: 18px;
    }
    
    .notification-toast-close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: var(--medium-grey);
    }
    
    .status-pending {
        background-color: #ffc107;
        color: #000;
    }
    
    .no-events {
        text-align: center;
        padding: 20px;
        color: var(--medium-grey);
        font-style: italic;
    }
`;


// Simpan event yang telah dibuat dalam array lokal jika belum ada akses ke backend
let userEvents = JSON.parse(localStorage.getItem('userEvents')) || [];

// Fungsi untuk mengambil event dari backend/localStorage dan menampilkannya
function displayUserEvents() {
    const eventListContainer = document.getElementById('event-list');
    eventListContainer.innerHTML = ''; // Bersihkan container sebelum menambahkan event baru
    
    if (userEvents.length === 0) {
        // Tampilkan pesan jika tidak ada event
        eventListContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <p>Anda belum membuat event. Klik "Buat Event" untuk membuat event pertama Anda.</p>
            </div>
        `;
        return;
    }
    
    // Tampilkan setiap event dalam container
    userEvents.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = 'my-event-card';
        
        // Format tanggal
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
        
        eventCard.innerHTML = `
            <div class="my-event-img">
                <img src="${event.image || '../../assets/image/event-placeholder.jpg'}" alt="${event.name}">
            </div>
            <div class="my-event-content">
                <div class="my-event-header">
                    <span class="my-event-date">${formattedDate}</span>
                    <span class="my-event-time">${event.time || '00:00'}</span>
                </div>
                <h3 class="my-event-title">${event.name}</h3>
                <p class="my-event-description">${event.description.substring(0, 100)}${event.description.length > 100 ? '...' : ''}</p>
                <div class="my-event-footer">
                    <div class="my-event-location">
                        <i class="fas fa-map-marker-alt"></i> ${event.location}
                    </div>
                    <div class="my-event-category">
                        ${event.category}
                    </div>
                </div>
                <div class="my-event-actions">
                    <button class="btn btn-sm btn-outline" onclick="editEvent(${userEvents.indexOf(event)})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteEvent(${userEvents.indexOf(event)})">
                        <i class="fas fa-trash"></i> Hapus
                    </button>
                </div>
            </div>
        `;
        
        eventListContainer.appendChild(eventCard);
    });
}

// Fungsi untuk menambahkan event baru
function addNewEvent(eventData) {
    userEvents.push(eventData);
    localStorage.setItem('userEvents', JSON.stringify(userEvents));
    displayUserEvents(); // Refresh tampilan
}

// Fungsi untuk mengedit event
function editEvent(index) {
    // Logika untuk mengedit event
    // Implementasi dapat ditambahkan nanti
    console.log("Edit event with index:", index);
}

// Fungsi untuk menghapus event
function deleteEvent(index) {
    if (confirm("Apakah Anda yakin ingin menghapus event ini?")) {
        userEvents.splice(index, 1);
        localStorage.setItem('userEvents', JSON.stringify(userEvents));
        displayUserEvents(); // Refresh tampilan
    }
}

// Fungsi untuk menangani pembuatan event baru
function handleCreateEvent() {
    const eventName = document.getElementById('event-name').value;
    const eventDescription = document.getElementById('event-description').value;
    const eventDate = document.getElementById('event-date').value;
    const eventTime = document.getElementById('event-time').value;
    const eventLocation = document.getElementById('event-location').value;
    const eventCategory = document.getElementById('event-category').value;
    const eventCapacity = document.getElementById('event-capacity').value;
    const eventTicketType = document.getElementById('event-tickets').value;
    const ticketPrice = document.getElementById('ticket-price').value;
    
    // Validasi data yang diperlukan
    if (!eventName || !eventDescription || !eventDate || !eventLocation) {
        alert("Mohon lengkapi data event yang diperlukan");
        return;
    }
    
    // Buat objek event baru
    const newEvent = {
        name: eventName,
        description: eventDescription,
        date: eventDate,
        time: eventTime,
        location: eventLocation,
        category: eventCategory,
        capacity: eventCapacity,
        ticketType: eventTicketType,
        price: ticketPrice,
        createdAt: new Date().toISOString()
    };
    
    // Tambahkan event baru ke daftar dan tampilkan
    addNewEvent(newEvent);
    
    // Tutup modal setelah menyimpan
    document.getElementById('create-event-modal').style.display = 'none';
    
    // Reset form
    document.getElementById('create-event-form').reset();
}

// Event listener saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    // Tampilkan event yang sudah ada
    displayUserEvents();
    
    // Event listener untuk tombol Buat Event
    const createEventBtn = document.getElementById('create-event-btn');
    if (createEventBtn) {
        createEventBtn.addEventListener('click', function() {
            document.getElementById('create-event-modal').style.display = 'block';
        });
    }
    
    // Event listener untuk tombol Close di modal
    const closeModalBtn = document.getElementById('close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            document.getElementById('create-event-modal').style.display = 'none';
        });
    }
    
    // Event listener untuk tombol Cancel di modal
    const cancelEventBtn = document.getElementById('cancel-event');
    if (cancelEventBtn) {
        cancelEventBtn.addEventListener('click', function() {
            document.getElementById('create-event-modal').style.display = 'none';
        });
    }
    
    // Event listener untuk tombol Save di modal
    const saveEventBtn = document.getElementById('save-event');
    if (saveEventBtn) {
        saveEventBtn.addEventListener('click', handleCreateEvent);
    }
    
    // Event listener untuk dropdown berbayar/gratis
    const eventTicketsSelect = document.getElementById('event-tickets');
    if (eventTicketsSelect) {
        eventTicketsSelect.addEventListener('change', function() {
            const ticketPriceGroup = document.getElementById('ticket-price-group');
            if (this.value === 'paid') {
                ticketPriceGroup.style.display = 'block';
            } else {
                ticketPriceGroup.style.display = 'none';
            }
        });
    }
});
document.head.appendChild(notificationStyles);

// Tambahkan CSS untuk tampilan kartu event
const style = document.createElement('style');
style.textContent = `
.my-event-card {
    display: flex;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 20px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.my-event-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.my-event-img {
    flex: 0 0 200px;
    overflow: hidden;
}

.my-event-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.my-event-content {
    flex: 1;
    padding: 15px;
    display: flex;
    flex-direction: column;
}

.my-event-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
}

.my-event-date, .my-event-time {
    font-size: 0.85rem;
    color: #666;
}

.my-event-title {
    margin: 0 0 10px 0;
    font-size: 1.2rem;
    font-weight: 600;
}

.my-event-description {
    margin: 0 0 12px 0;
    font-size: 0.9rem;
    color: #555;
    flex-grow: 1;
}

.my-event-footer {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 0.85rem;
}

.my-event-location, .my-event-category {
    color: #666;
}

.my-event-actions {
    display: flex;
    gap: 10px;
}

.empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #666;
}

.empty-state i {
    font-size: 3rem;
    margin-bottom: 15px;
    color: #ccc;
}

.btn-sm {
    padding: 5px 10px;
    font-size: 0.85rem;
}

.btn-danger {
    background-color: #ff4d4f;
    color: white;
    border: none;
}

.btn-danger:hover {
    background-color: #ff7875;
}

@media (max-width: 768px) {
    .my-event-card {
        flex-direction: column;
    }
    
    .my-event-img {
        flex: none;
        height: 180px;
    }
}
`;
document.head.appendChild(style);
