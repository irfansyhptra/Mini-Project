
        // Initialize AOS
        document.addEventListener('DOMContentLoaded', function () {
            AOS.init({
                duration: 800,
                easing: 'ease-in-out',
                once: true
            });

            // Initialize components
            initializeSidebar();
            initializeDropdown();
            initializeModal();
            loadEvents();
            loadDiscoverEvents();
            loadUpcomingEvents();
            loadNotifications();
        });

        // Sidebar functionality
        function initializeSidebar() {
            const menuToggle = document.getElementById('menu-toggle');
            const sidebar = document.getElementById('sidebar');

            if (menuToggle && sidebar) {
                menuToggle.addEventListener('click', function () {
                    sidebar.classList.toggle('show');
                });
            }
        }

        // Dropdown functionality
        function initializeDropdown() {
            const dropdownToggle = document.getElementById('user-dropdown-toggle');
            const dropdownMenu = document.getElementById('user-dropdown-menu');

            if (dropdownToggle && dropdownMenu) {
                dropdownToggle.addEventListener('click', function (e) {
                    e.stopPropagation();
                    dropdownMenu.classList.toggle('show');
                });

                document.addEventListener('click', function (e) {
                    if (!dropdownToggle.contains(e.target)) {
                        dropdownMenu.classList.remove('show');
                    }
                });
            }
        }

        // Modal functionality
        function initializeModal() {
            const createEventBtn = document.getElementById('create-event-btn');
            const quickCreateEventBtn = document.getElementById('quick-create-event');
            const closeEventModalBtn = document.getElementById('close-event-modal-btn');
            const cancelEventBtn = document.getElementById('cancel-event-btn');
            const createEventModal = document.getElementById('create-event-modal');
            const eventTicketsSelect = document.getElementById('event-tickets');
            const ticketPriceGroup = document.getElementById('ticket-price-group');
            const saveEventBtn = document.getElementById('save-event');
            const createEventForm = document.getElementById('create-event-form');

            if (createEventBtn && closeEventModalBtn && cancelEventBtn && createEventModal) {
                // Open modal function
                function openModal() {
                    createEventModal.classList.add('show');
                }

                // Close modal function
                function closeModal() {
                    createEventModal.classList.remove('show');
                    createEventForm.reset();
                }

                createEventBtn.addEventListener('click', openModal);

                if (quickCreateEventBtn) {
                    quickCreateEventBtn.addEventListener('click', openModal);
                }

                closeEventModalBtn.addEventListener('click', closeModal);
                cancelEventBtn.addEventListener('click', closeModal);

                // Show/hide ticket price based on ticket type
                if (eventTicketsSelect && ticketPriceGroup) {
                    eventTicketsSelect.addEventListener('change', function () {
                        if (this.value === 'Berbayar') {
                            ticketPriceGroup.style.display = 'block';
                            document.getElementById('ticket-price').setAttribute('required', 'required');
                        } else {
                            ticketPriceGroup.style.display = 'none';
                            document.getElementById('ticket-price').removeAttribute('required');
                        }
                    });
                }

                // Form submission
                if (saveEventBtn && createEventForm) {
                    createEventForm.addEventListener('submit', function (e) {
                        e.preventDefault();

                        // Get form data and create new event
                        const eventData = {
                            name: document.getElementById('event-name').value,
                            description: document.getElementById('event-description').value,
                            date: document.getElementById('event-date').value,
                            time: document.getElementById('event-time').value,
                            location: document.getElementById('event-location').value,
                            category: document.getElementById('event-category').value,
                            capacity: document.getElementById('event-capacity').value,
                            ticketType: document.getElementById('event-tickets').value,
                            ticketPrice: document.getElementById('event-tickets').value === 'Berbayar'
                                ? document.getElementById('ticket-price').value
                                : 0
                        };

                        // Save the new event
                        saveEvent(eventData);

                        // Close modal
                        closeModal();
                    });
                }
            }
        }

        // Save event function
        function saveEvent(eventData) {
            // In a real application, this would send data to a server
            // For now, we'll just add it to our local event list
            const newEvent = {
                id: Math.floor(Math.random() * 1000),
                name: eventData.name,
                description: eventData.description,
                date: formatDate(eventData.date),
                time: eventData.time,
                location: eventData.location,
                category: eventData.category,
                status: 'pending',
                image: '../../assets/image/event' + (Math.floor(Math.random() * 13) + 1) + '.jpg'
            };

            // Add to events list in DOM
            addEventToList(newEvent);
        }

        // Format date function
        function formatDate(dateString) {
            const date = new Date(dateString);
            const options = { day: 'numeric', month: 'short', year: 'numeric' };
            return date.toLocaleDateString('id-ID', options);
        }

        // Load events from data
        function loadEvents() {
            const eventListElement = document.getElementById('event-list');

            if (!eventListElement) return;

            // Clear existing content
            eventListElement.innerHTML = '';

            // Sample events data
            const events = [
                {
                    id: 1,
                    name: 'Informatics Festival 2025',
                    description: 'Festival teknologi informatika tahunan',
                    date: '15 Mar 2025',
                    time: '09:00',
                    location: 'Banda Aceh',
                    category: 'Festival',
                    status: 'upcoming',
                    image: '../../assets/image/event1.jpg'
                },
                {
                    id: 2,
                    name: 'Digital Marketing Workshop',
                    description: 'Workshop tentang digital marketing',
                    date: '10 Apr 2025',
                    time: '13:00',
                    location: 'Banda Aceh',
                    category: 'Workshop',
                    status: 'active',
                    image: '../../assets/image/event2.jpg'
                },
                {
                    id: 3,
                    name: 'Aceh Culinary Festival',
                    description: 'Festival kuliner khas Aceh',
                    date: '5 Feb 2025',
                    time: '10:00',
                    location: 'Banda Aceh',
                    category: 'Festival',
                    status: 'completed',
                    image: '../../assets/image/event4.jpeg'
                }
            ];

            // Check if there are events
            if (events.length === 0) {
                eventListElement.innerHTML = '<div class="no-events">Anda belum memiliki event. Silakan buat event baru.</div>';
                return;
            }

            // Add events to list
            events.forEach(event => {
                addEventToList(event);
            });
        }

        // Add event to list function
        function addEventToList(event) {
            const eventListElement = document.getElementById('event-list');

            if (!eventListElement) return;

            // Create event item element
            const eventItem = document.createElement('div');
            eventItem.className = 'event-item';

            // Status label text
            let statusText = '';
            switch (event.status) {
                case 'upcoming':
                    statusText = 'Akan Datang';
                    break;
                case 'active':
                    statusText = 'Aktif';
                    break;
                case 'completed':
                    statusText = 'Selesai';
                    break;
                case 'pending':
                    statusText = 'Menunggu Persetujuan';
                    break;
                default:
                    statusText = 'Tidak Diketahui';
            }

            // Set event item HTML
            eventItem.innerHTML = `
                <div class="event-img">
                    <img src="${event.image}" alt="${event.name}">
                </div>
                <div class="event-info">
                    <h3 class="event-title">${event.name}</h3>
                    <div class="event-date">
                        <i class="far fa-calendar-alt"></i> ${event.date}
                    </div>
                    <div class="event-location">
                        <i class="fas fa-map-marker-alt"></i> ${event.location}
                    </div>
                    <span class="event-status status-${event.status}">${statusText}</span>
                </div>
                <div class="event-actions">
                    <button class="btn-view" title="Lihat Detail">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-edit" title="Edit Event">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" title="Hapus Event">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;

            // Add event item to list
            eventListElement.appendChild(eventItem);

            // Add event listeners to buttons
            const viewBtn = eventItem.querySelector('.btn-view');
            const editBtn = eventItem.querySelector('.btn-edit');
            const deleteBtn = eventItem.querySelector('.btn-delete');

            viewBtn.addEventListener('click', () => viewEvent(event.id));
            editBtn.addEventListener('click', () => editEvent(event.id));
            deleteBtn.addEventListener('click', () => deleteEvent(event.id, eventItem));
        }

        // View event function
        function viewEvent(eventId) {
            console.log('View event:', eventId);
            // In a real application, this would open the event details page
            alert('Melihat detail event ID: ' + eventId);
        }

        // Edit event function
        function editEvent(eventId) {
            console.log('Edit event:', eventId);
            // In a real application, this would open the edit event form
            alert('Mengedit event ID: ' + eventId);
        }

        // Delete event function
        function deleteEvent(eventId, eventElement) {
            console.log('Delete event:', eventId);
            // In a real application, this would show a confirmation dialog and delete the event
            if (confirm('Apakah Anda yakin ingin menghapus event ini?')) {
                // Remove event from DOM
                eventElement.remove();
            }
        }

        // Load discover events function
        function loadDiscoverEvents() {
            const discoverEventsElement = document.getElementById('discover-events');

            if (!discoverEventsElement) return;

            // Clear existing content
            discoverEventsElement.innerHTML = '';

            // Sample discover events data
            const discoverEvents = [
                {
                    id: 101,
                    name: 'Aceh Ramadhan Festival 2025',
                    date: '12-17 Mar 2025',
                    location: 'Banda Aceh',
                    category: 'Festival',
                    image: '../../assets/image/event1.jpg'
                },
                {
                    id: 102,
                    name: 'Aceh Culinary Festival',
                    date: '10 Apr 2025',
                    location: 'Banda Aceh',
                    category: 'Kuliner',
                    image: '../../assets/image/event2.jpg'
                },
                {
                    id: 103,
                    name: 'Festival Kupi',
                    date: '8 Jun 2025',
                    location: 'Banda Aceh',
                    category: 'Kuliner',
                    image: '../../assets/image/event4.jpeg'
                },
                {
                    id: 104,
                    name: 'Peringatan Tsunami Aceh',
                    date: '26 Des 2024',
                    location: 'Banda Aceh',
                    category: 'Festival',
                    image: '../../assets/image/event5.jpeg'
                },
                {
                    id: 105,
                    name: 'HMM Fest 2025',
                    date: '18 Jun 2025',
                    location: 'Banda Aceh',
                    category: 'Festival',
                    image: '../../assets/image/event6.jpeg'
                },
                {
                    id: 106,
                    name: 'Duta Kebudayaan Aceh 2025',
                    date: '20 Feb - 20 Mar 2025',
                    location: 'Banda Aceh',
                    category: 'Festival',
                    image: '../../assets/image/event7.jpeg'
                }
            ];

            // Add discover events to grid
            discoverEvents.forEach(event => {
                const eventCard = document.createElement('div');
                eventCard.className = 'discover-event-card';
                eventCard.innerHTML = `
                    <div class="discover-event-img">
                        <img src="${event.image}" alt="${event.name}">
                    </div>
                    <div class="discover-event-content">
                        <span class="discover-event-date">${event.date}</span>
                        <h3 class="discover-event-title">${event.name}</h3>
                        <div class="discover-event-footer">
                            <div class="discover-event-location">
                                <i class="fas fa-map-marker-alt"></i> ${event.location}
                            </div>
                            <div class="discover-event-category">
                                ${event.category}
                            </div>
                        </div>
                    </div>
                `;

                discoverEventsElement.appendChild(eventCard);

                // Add click event to card
                eventCard.addEventListener('click', () => viewDiscoverEvent(event.id));
            });
        }

        // View discover event function
        function viewDiscoverEvent(eventId) {
            console.log('View discover event:', eventId);
            // In a real application, this would open the event details page
            alert('Melihat detail event ID: ' + eventId);
        }

        // Load upcoming events function
        function loadUpcomingEvents() {
            const upcomingEventsElement = document.getElementById('upcoming-events');

            if (!upcomingEventsElement) return;

            // Clear existing content
            upcomingEventsElement.innerHTML = '';

            // Sample upcoming events data
            const upcomingEvents = [
                {
                    id: 201,
                    name: 'Festival Kupi 2025',
                    date: '8 Jun 2025',
                    time: '09:00 - 17:00',
                    day: '8',
                    month: 'Jun'
                },
                {
                    id: 202,
                    name: 'Digital Marketing Workshop',
                    date: '10 Apr 2025',
                    time: '13:00 - 16:00',
                    day: '10',
                    month: 'Apr'
                },
                {
                    id: 203,
                    name: 'Indonesia Music Festival',
                    date: '15 May 2025',
                    time: '14:00 - 23:00',
                    day: '15',
                    month: 'May'
                }
            ];

            // Add upcoming events to list
            upcomingEvents.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = 'upcoming-event';
                eventElement.innerHTML = `
                    <div class="upcoming-event-date">
                        <span class="upcoming-event-day">${event.day}</span>
                        <span class="upcoming-event-month">${event.month}</span>
                    </div>
                    <div class="upcoming-event-info">
                        <h3 class="upcoming-event-title">${event.name}</h3>
                        <div class="upcoming-event-time">
                            <i class="far fa-clock"></i> ${event.time}
                        </div>
                    </div>
                `;

                upcomingEventsElement.appendChild(eventElement);

                // Add click event
                eventElement.addEventListener('click', () => viewUpcomingEvent(event.id));
            });
        }

        // View upcoming event function
        function viewUpcomingEvent(eventId) {
            console.log('View upcoming event:', eventId);
            // In a real application, this would open the event details page
            alert('Melihat detail event ID: ' + eventId);
        }

        // Load notifications function
        function loadNotifications() {
            const notificationsElement = document.getElementById('notifications');

            if (!notificationsElement) return;

            // Clear existing content
            notificationsElement.innerHTML = '';

            // Sample notifications data
            const notifications = [
                {
                    id: 301,
                    icon: 'fas fa-bell',
                    text: '<strong>Event Baru:</strong> Informatic Festival 2025 telah ditambahkan.',
                    time: '5 menit yang lalu'
                },
                {
                    id: 302,
                    icon: 'fas fa-envelope',
                    text: '<strong>Pengingat:</strong> Festival Kupi akan dimulai dalam 45 hari.',
                    time: '1 jam yang lalu'
                },
                {
                    id: 303,
                    icon: 'fas fa-user-plus',
                    text: '<strong>Pendaftaran:</strong> 5 peserta baru mendaftar di event Informatics Festival Anda.',
                    time: '2 jam yang lalu'
                }
            ];

            // Add notifications to list
            notifications.forEach(notification => {
                const notificationElement = document.createElement('div');
                notificationElement.className = 'notification';
                notificationElement.innerHTML = `
                    <div class="notification-icon">
                        <i class="${notification.icon}"></i>
                    </div>
                    <div class="notification-content">
                        <div class="notification-text">
                            ${notification.text}
                        </div>
                        <div class="notification-time">${notification.time}</div>
                    </div>
                `;

                notificationsElement.appendChild(notificationElement);
            });
        }