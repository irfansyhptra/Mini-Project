// Initialize AOS
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });

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

    saveEvent.addEventListener('click', () => {
        // Simulate saving event
        alert('Event berhasil disimpan!');
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
    `;
    document.head.appendChild(notificationStyles);

    // Show a welcome notification
    setTimeout(() => {
        showNotification('Selamat datang kembali, Irfan!');
    }, 1000);
