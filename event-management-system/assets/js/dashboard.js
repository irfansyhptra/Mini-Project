document.addEventListener('DOMContentLoaded', function() {
    // Toggle sidebar on mobile
    const toggleSidebarButton = document.querySelector('.toggle-sidebar');
    if (toggleSidebarButton) {
        toggleSidebarButton.addEventListener('click', function() {
            const sidebar = document.querySelector('.sidebar');
            const mainContent = document.querySelector('.main-content');
            
            sidebar.classList.toggle('active');
            mainContent.classList.toggle('sidebar-active');
        });
    }

    // Handle notification and message buttons
    const notificationBtn = document.querySelector('.notification-btn');
    const messagesBtn = document.querySelector('.messages-btn');
    
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            alert('Notifications feature coming soon!');
        });
    }
    
    if (messagesBtn) {
        messagesBtn.addEventListener('click', function() {
            alert('Messages feature coming soon!');
        });
    }

    // Table action buttons
    const viewButtons = document.querySelectorAll('.btn-action.view');
    const editButtons = document.querySelectorAll('.btn-action.edit');
    const deleteButtons = document.querySelectorAll('.btn-action.delete');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the event name from the row
            const eventRow = this.closest('tr');
            const eventName = eventRow.querySelector('.event-name span').textContent;
            window.location.href = '../event-detail.html';
        });
    });
    
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the event name from the row
            const eventRow = this.closest('tr');
            const eventName = eventRow.querySelector('.event-name span').textContent;
            alert(`Edit event: ${eventName}`);
        });
    });
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the event name from the row
            const eventRow = this.closest('tr');
            const eventName = eventRow.querySelector('.event-name span').textContent;
            
            if (confirm(`Are you sure you want to delete "${eventName}"?`)) {
                alert(`Event "${eventName}" has been deleted`);
                // In a real application, you would call an API to delete the event
                // and then remove the row from the table
                eventRow.remove();
            }
        });
    });

    // Search functionality
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                const searchValue = this.value.toLowerCase();
                alert(`Searching for: ${searchValue}`);
                // In a real application, you would implement actual search functionality
            }
        });
    }

    // Create event button
    const createEventBtn = document.querySelector('.btn-create-event');
    if (createEventBtn) {
        createEventBtn.addEventListener('click', function() {
            window.location.href = 'create-event.html';
        });
    }

    // Mock chart data visualization (if needed)
    // This would be implemented with a charting library like Chart.js in a real application
    const chartElements = document.querySelectorAll('.chart-container');
    if (chartElements.length > 0 && typeof Chart !== 'undefined') {
        // Initialize charts here
        console.log('Charts would be initialized here in a real application');
    }
});