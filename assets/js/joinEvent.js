// Constants
const API_URL = 'http://localhost:3000';
const TOKEN = localStorage.getItem('token');

// Check authentication
if (!TOKEN) {
    window.location.href = '../auth/login.html';
}

// Join event function
async function joinEvent(eventId) {
    try {
        const response = await fetch(`${API_URL}/event/joinEvent/${eventId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to join event');
        }

        const data = await response.json();
        
        if (data.status === 200) {
            showNotification('Berhasil bergabung dengan event!', 'success');
            // Update UI to show joined status
            updateEventUI(eventId, true);
        } else {
            throw new Error(data.message || 'Failed to join event');
        }
    } catch (error) {
        console.error('Error joining event:', error);
        showNotification(error.message || 'Gagal bergabung dengan event', 'error');
    }
}

// Leave event function
async function leaveEvent(eventId) {
    if (!confirm('Apakah Anda yakin ingin keluar dari event ini?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/event/leaveEvent/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${TOKEN}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to leave event');
        }

        const data = await response.json();
        
        if (data.status === 200) {
            showNotification('Berhasil keluar dari event!', 'success');
            // Update UI to show not joined status
            updateEventUI(eventId, false);
        } else {
            throw new Error(data.message || 'Failed to leave event');
        }
    } catch (error) {
        console.error('Error leaving event:', error);
        showNotification(error.message || 'Gagal keluar dari event', 'error');
    }
}

// Update event UI
function updateEventUI(eventId, isJoined) {
    const joinButton = document.querySelector(`[data-join-button="${eventId}"]`);
    const participantCount = document.querySelector(`[data-participant-count="${eventId}"]`);
    
    if (joinButton) {
        if (isJoined) {
            joinButton.innerHTML = '<i class="fas fa-user-minus"></i> Keluar';
            joinButton.classList.remove('btn-primary');
            joinButton.classList.add('btn-danger');
            joinButton.onclick = () => leaveEvent(eventId);
        } else {
            joinButton.innerHTML = '<i class="fas fa-user-plus"></i> Gabung';
            joinButton.classList.remove('btn-danger');
            joinButton.classList.add('btn-primary');
            joinButton.onclick = () => joinEvent(eventId);
        }
    }

    if (participantCount) {
        const currentCount = parseInt(participantCount.textContent);
        participantCount.textContent = isJoined ? currentCount + 1 : currentCount - 1;
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
