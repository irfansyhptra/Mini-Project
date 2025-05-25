        // Loading overlay
        setTimeout(function () {
            const loadingOverlay = document.getElementById('loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.style.opacity = '0';
                setTimeout(function () {
                    loadingOverlay.style.display = 'none';
                }, 500);
            }
        }, 1500);

        // Mobile menu toggle
        document.getElementById('mobile-menu-button')?.addEventListener('click', function () {
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu) {
                mobileMenu.classList.toggle('hidden');
            }
        });

        // User menu toggle
        document.getElementById('user-menu-button')?.addEventListener('click', function () {
            const userMenu = document.getElementById('user-menu');
            if (userMenu) {
                userMenu.classList.toggle('hidden');
            }
        });

        // Navigation scroll effect
        window.addEventListener('scroll', function () {
            const navbar = document.getElementById('navbar');
            if (navbar) {
                if (window.scrollY > 10) {
                    navbar.classList.add('shadow-md');
                } else {
                    navbar.classList.remove('shadow-md');
                }
            }
        });

        // Page navigation
        document.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const targetPage = this.getAttribute('data-target');
                if (!targetPage) return;

                // Hide all pages
                document.querySelectorAll('.page').forEach(page => {
                    page.classList.remove('active');
                });

                // Show target page
                const targetElement = document.getElementById(targetPage);
                if (targetElement) {
                    targetElement.classList.add('active');
                }

                // Scroll to top
                window.scrollTo(0, 0);

                // Close mobile menu if open
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }

                // Update active link
                document.querySelectorAll('.nav-link').forEach(navLink => {
                    navLink.classList.remove('active');
                    if (navLink.getAttribute('data-target') === targetPage) {
                        navLink.classList.add('active');
                    }
                });
            });
        });

