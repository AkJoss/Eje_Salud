
// Initialize AOS
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// Preloader
window.addEventListener('load', function () {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
    }, 800);
});

// Navbar scroll effect
window.addEventListener('scroll', function () {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Scroll to top button
    const scrollTopBtn = document.querySelector('.scroll-top');
    if (window.scrollY > 300) {
        scrollTopBtn.classList.add('active');
    } else {
        scrollTopBtn.classList.remove('active');
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Scroll to top functionality
document.querySelector('.scroll-top').addEventListener('click', function () {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

const form = document.getElementById('appointmentForm');
if (form) {
    // Form submission
    document.getElementById('appointmentForm').addEventListener('submit', function (e) {
        e.preventDefault();
        alert('Thank you for your appointment request! We will contact you within 24 hours to confirm your consultation.');
        this.reset();
    });
}

// Close mobile menu on menu item click
document.querySelectorAll('.navbar-collapse .nav-link').forEach(link => {
    link.addEventListener('click', () => {
        const navbarCollapse = document.querySelector('.navbar-collapse');
        if (navbarCollapse.classList.contains('show')) {
            new bootstrap.Collapse(navbarCollapse).hide();
        }
    });
});


// faq.js - FAQs Page Functionality

document.addEventListener('DOMContentLoaded', function () {

    // Search functionality
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    const faqItems = document.querySelectorAll('.accordion-item');
    const categoryHeaders = document.querySelectorAll('.category-header');

    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();

        if (searchTerm === '') {
            // Reset everything if search is empty
            faqItems.forEach(item => {
                item.style.display = 'flex';
                item.style.flexDirection = 'column';
            });
            categoryHeaders.forEach(header => {
                header.parentElement.style.display = 'block';
            });
            return;
        }

        let foundResults = false;

        // Hide all categories initially
        categoryHeaders.forEach(header => {
            header.parentElement.style.display = 'none';
        });

        // Search through FAQ items
        faqItems.forEach(item => {
            const question = item.querySelector('.accordion-button').textContent.toLowerCase();
            const answer = item.querySelector('.accordion-body').textContent.toLowerCase();

            if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                item.style.display = 'flex';
                item.style.flexDirection = 'column';

                // Show the parent category
                const category = item.closest('.faq-category');
                if (category) {
                    category.style.display = 'block';
                    foundResults = true;

                    // Expand the matching item
                    const collapseId = item.querySelector('.accordion-button').getAttribute('data-bs-target');
                    const collapseElement = document.querySelector(collapseId);
                    if (collapseElement) {
                        new bootstrap.Collapse(collapseElement, {
                            toggle: true
                        });
                    }
                }
            } else {
                item.style.display = 'none';
            }
        });

        // Show message if no results found
        if (!foundResults) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.innerHTML = `
                <div class="no-results-content">
                    <i class="fas fa-search"></i>
                    <h3>No results found</h3>
                    <p>We couldn't find any questions matching "${searchTerm}"</p>
                    <button class="btn btn-primary" id="clearSearch">Clear Search</button>
                </div>
            `;

            const container = document.querySelector('.faq-container');
            const existingNoResults = container.querySelector('.no-results');
            if (existingNoResults) {
                existingNoResults.remove();
            }
            container.insertBefore(noResults, container.firstChild);

            document.getElementById('clearSearch').addEventListener('click', function () {
                searchInput.value = '';
                performSearch();
                noResults.remove();
            });
        }
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);

        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }



    // Category filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const faqCategories = document.querySelectorAll('.faq-category');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const category = this.getAttribute('data-category');

            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Filter categories
            faqCategories.forEach(cat => {
                if (category === 'all' || cat.getAttribute('data-category') === category) {
                    cat.style.display = 'block';
                    cat.style.animation = 'fadeIn 0.5s ease';
                } else {
                    cat.style.display = 'none';
                }
            });

            // Clear search when filtering
            searchInput.value = '';
            performSearch();
        });
    });

    // Expand all / collapse all functionality
    const expandAllBtn = document.createElement('button');
    expandAllBtn.innerHTML = '<i class="fas fa-expand-alt"></i> Expand All';
    expandAllBtn.className = 'expand-all-btn';

    const collapseAllBtn = document.createElement('button');
    collapseAllBtn.innerHTML = '<i class="fas fa-compress-alt"></i> Collapse All';
    collapseAllBtn.className = 'collapse-all-btn';

    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'faq-controls';
    controlsContainer.style.cssText = `
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
    `;

    controlsContainer.appendChild(expandAllBtn);
    controlsContainer.appendChild(collapseAllBtn);

    const container = document.querySelector('.faq-container');
    if(container){
        container.insertBefore(controlsContainer, container.firstChild);
    }
    

    expandAllBtn.addEventListener('click', function () {
        document.querySelectorAll('.accordion-button:not(.collapsed)').forEach(btn => {
            const collapseId = btn.getAttribute('data-bs-target');
            const collapseElement = document.querySelector(collapseId);
            if (collapseElement) {
                new bootstrap.Collapse(collapseElement, {
                    show: true
                });
            }
        });
    });

    collapseAllBtn.addEventListener('click', function () {
        document.querySelectorAll('.accordion-button.collapsed').forEach(btn => {
            const collapseId = btn.getAttribute('data-bs-target');
            const collapseElement = document.querySelector(collapseId);
            if (collapseElement) {
                new bootstrap.Collapse(collapseElement, {
                    hide: true
                });
            }
        });
    });

    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .no-results {
            background: white;
            border-radius: 10px;
            padding: 3rem;
            text-align: center;
            margin-bottom: 2rem;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }
        
        .no-results-content i {
            font-size: 3rem;
            color: #6c757d;
            margin-bottom: 1rem;
        }
        
        .no-results-content h3 {
            color: var(--text-dark);
            margin-bottom: 0.5rem;
        }
        
        .no-results-content p {
            color: var(--text-light);
            margin-bottom: 1.5rem;
        }
        
        .expand-all-btn, .collapse-all-btn {
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .expand-all-btn:hover, .collapse-all-btn:hover {
            background: var(--primary-dark);
            transform: translateY(-2px);
        }
        
        .faq-controls {
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
        }
    `;
    document.head.appendChild(style);

    // Auto-expand FAQ when linked from elsewhere
    function expandLinkedFAQ() {
        const hash = window.location.hash;
        if (hash) {
            const targetElement = document.querySelector(hash);
            if (targetElement && targetElement.classList.contains('accordion-collapse')) {
                // Scroll to the element
                setTimeout(() => {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);

                // Expand the accordion
                const button = document.querySelector(`[data-bs-target="${hash}"]`);
                if (button && !button.classList.contains('collapsed')) {
                    new bootstrap.Collapse(targetElement, {
                        show: true
                    });
                }
            }
        }
    }

    // Run on page load and hash change
    expandLinkedFAQ();
    window.addEventListener('hashchange', expandLinkedFAQ);

    // Handle rating clicks
    document.addEventListener('click', function (e) {
        if (e.target.closest('.rating-btn')) {
            const btn = e.target.closest('.rating-btn');
            const faqIndex = btn.getAttribute('data-faq');
            const isYes = btn.classList.contains('yes');

            // Store rating in localStorage
            const ratings = JSON.parse(localStorage.getItem('faqRatings') || '{}');
            ratings[faqIndex] = isYes;
            localStorage.setItem('faqRatings', JSON.stringify(ratings));

            // Update UI
            const ratingDiv = btn.closest('.faq-rating');
            const yesCount = ratingDiv.querySelector('.yes-count');
            const currentCount = parseInt(yesCount.textContent);

            if (isYes) {
                yesCount.textContent = currentCount + 1;
                btn.innerHTML = '<i class="fas fa-check"></i> Thank you!';
                btn.style.background = '#28a745';
            } else {
                const noBtn = ratingDiv.querySelector('.no');
                noBtn.innerHTML = '<i class="fas fa-check"></i> Thank you!';
                noBtn.style.background = '#dc3545';
            }

            // Disable both buttons
            ratingDiv.querySelectorAll('.rating-btn').forEach(b => {
                b.disabled = true;
                b.style.cursor = 'not-allowed';
            });
        }
    });

    // Load existing ratings
    function loadRatings() {
        const ratings = JSON.parse(localStorage.getItem('faqRatings') || '{}');
        Object.entries(ratings).forEach(([index, isYes]) => {
            const ratingDiv = document.querySelectorAll('.faq-rating')[index];
            if (ratingDiv) {
                const yesCount = ratingDiv.querySelector('.yes-count');
                const currentCount = parseInt(yesCount.textContent);
                if (isYes) {
                    yesCount.textContent = currentCount + 1;
                }

                // Disable buttons for already rated FAQs
                ratingDiv.querySelectorAll('.rating-btn').forEach(btn => {
                    btn.disabled = true;
                    btn.style.cursor = 'not-allowed';
                });
            }
        });
    }

    loadRatings();



    // Add keyboard navigation
    document.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();

            const openItems = Array.from(document.querySelectorAll('.accordion-button'));
            const currentIndex = openItems.findIndex(btn => btn === document.activeElement);

            if (currentIndex !== -1) {
                let nextIndex;
                if (e.key === 'ArrowDown') {
                    nextIndex = (currentIndex + 1) % openItems.length;
                } else {
                    nextIndex = (currentIndex - 1 + openItems.length) % openItems.length;
                }

                openItems[nextIndex].focus();
            }
        }
    });

    // Smooth scroll to categories from sidebar
    const categoryLinks = document.querySelectorAll('.filter-btn[data-category]');
    categoryLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const category = this.getAttribute('data-category');
            if (category !== 'all') {
                const targetElement = document.getElementById(category);
                if (targetElement) {
                    setTimeout(() => {
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                            inline: 'nearest'
                        });
                    }, 100);
                }
            }
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {

    const modalEl = document.getElementById("imageModal");
    const modalImage = document.getElementById("modalImage");

    if (!modalEl || !modalImage) return;

    const imageModal = new bootstrap.Modal(modalEl);

    document.querySelectorAll(".gallery-item").forEach(item => {
        item.addEventListener("click", function () {
            const img = this.querySelector("img");
            if (img) {
                modalImage.src = img.src;
                imageModal.show();
            }
        });
    });

});