document.addEventListener('DOMContentLoaded', function() {
    // Event registration button
    const registerEventBtn = document.querySelector('.btn-register-event');
    if (registerEventBtn) {
        registerEventBtn.addEventListener('click', function() {
            const eventTitle = document.querySelector('.event-title h1').textContent;
            
            // Check if user is logged in
            const isLoggedIn = false; // This would be determined by your auth system
            
            if (!isLoggedIn) {
                alert(`Please log in to register for "${eventTitle}"`);
                window.location.href = 'login.html';
            } else {
                alert(`You have successfully registered for "${eventTitle}"`);
                // In a real application, you would call an API to register the user
            }
        });
    }

    // Contact organizer button
    const contactOrganizerBtn = document.querySelector('.btn-contact-organizer');
    if (contactOrganizerBtn) {
        contactOrganizerBtn.addEventListener('click', function() {
            const organizerName = document.querySelector('.organizer h4').textContent;
            
            // Simple modal or form would be shown here
            alert(`Contact form for ${organizerName} will be displayed here`);
        });
    }

    // Social share buttons
    const shareButtons = document.querySelectorAll('.share-btn');
    shareButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const eventTitle = document.querySelector('.event-title h1').textContent;
            const eventUrl = window.location.href;
            let shareUrl = '';
            
            if (this.classList.contains('facebook')) {
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`;
            } else if (this.classList.contains('twitter')) {
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${eventTitle}`)}&url=${encodeURIComponent(eventUrl)}`;
            } else if (this.classList.contains('instagram')) {
                shareUrl = `https://www.instagram.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`;
            } else if (this.classList.contains('whatsapp')) {
                shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out ${eventTitle}: ${eventUrl}`)}`;
            }
            
            if (shareUrl) {
                window.open(shareUrl, '_blank');
            }
        });
    });

    // Get directions button
    const getDirectionBtn = document.querySelector('.btn-get-direction');
    if (getDirectionBtn) {
        getDirectionBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const venueName = document.querySelector('.event-location').textContent;
            const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueName)}`;
            window.open(mapUrl, '_blank');
        });
    }

    // Image gallery (if present)
    const galleryImages = document.querySelectorAll('.event-gallery img');
    if (galleryImages.length > 0) {
        galleryImages.forEach(image => {
            image.addEventListener('click', function() {
                // Simple lightbox effect
                const modal = document.createElement('div');
                modal.classList.add('image-modal');
                
                const modalImg = document.createElement('img');
                modalImg.src = this.src;
                
                const closeBtn = document.createElement('span');
                closeBtn.innerHTML = '&times;';
                closeBtn.classList.add('close-modal');
                
                modal.appendChild(closeBtn);
                modal.appendChild(modalImg);
                document.body.appendChild(modal);
                
                closeBtn.addEventListener('click', function() {
                    document.body.removeChild(modal);
                });
            });
        });
    }
});