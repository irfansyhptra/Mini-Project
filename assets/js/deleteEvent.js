// Constants
const API_URL = 'http://localhost:3000';
const TOKEN = localStorage.getItem('token');

// Check authentication
if (!TOKEN) {
    window.location.href = '../auth/login.html';
}

// Delete event function
async function deleteEvent(eventId) {
    if (!confirm('Apakah Anda yakin ingin menghapus event ini?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/event/deleteEvent/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${TOKEN}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete event');
        }

        const data = await response.json();
        
        if (data.status === 200) {
            showNotification('Event berhasil dihapus!', 'success');
            // Remove the event card from the DOM
            const eventCard = document.querySelector(`[data-id="${eventId}"]`);
            if (eventCard) {
                eventCard.remove();
            }
            // If no events left, show empty state
            const eventList = document.getElementById('event-list');
            if (eventList && eventList.children.length === 0) {
                eventList.innerHTML = `
                    <div class="empty-state" data-aos="fade-up">
                        <i class="fas fa-calendar-times"></i>
                        <p>Anda belum memiliki event. Buat event pertama Anda!</p>
                    </div>
                `;
            }
        } else {
            throw new Error(data.message || 'Failed to delete event');
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        showNotification(error.message || 'Gagal menghapus event', 'error');
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
