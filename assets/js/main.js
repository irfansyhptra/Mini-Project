document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const mobileNavToggle = document.querySelector('.toggle-sidebar');
    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', function() {
            const sidebar = document.querySelector('.sidebar');
            sidebar.classList.toggle('active');
        });
    }

    // Initialize AOS animation library if available
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true
        });
    }

    // Smooth scroll for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Dropdown functionality
    document.querySelectorAll('.dropdown-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const dropdownContent = this.nextElementSibling;
            if (dropdownContent.classList.contains('dropdown-content')) {
                dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
            }
        });
    });

    // Close dropdowns when clicking outside
    window.addEventListener('click', function(e) {
        if (!e.target.matches('.dropdown-btn') && !e.target.closest('.dropdown-btn')) {
            document.querySelectorAll('.dropdown-content').forEach(content => {
                content.style.display = 'none';
            });
        }
    });

    // Sticky header
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('sticky');
            } else {
                header.classList.remove('sticky');
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {
  AOS.init();
});
