// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking on a link
    const navItems = document.querySelectorAll('.nav-link, .nav-cta');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navLinks.classList.remove('active');
        });
    });
    
    // Accordion functionality (for FAQ section if exists)
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const accordionItem = this.parentElement;
            const accordionContent = this.nextElementSibling;
            const accordionIcon = this.querySelector('.accordion-icon svg');
            
            // Toggle active class
            accordionItem.classList.toggle('active');
            
            // Toggle content display
            if (accordionItem.classList.contains('active')) {
                accordionContent.style.display = 'block';
                if (accordionIcon) {
                    accordionIcon.innerHTML = '<line x1="5" y1="12" x2="19" y2="12"></line>';
                }
            } else {
                accordionContent.style.display = 'none';
                if (accordionIcon) {
                    accordionIcon.innerHTML = '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>';
                }
            }
        });
    });
    
    // Set initial accordion state (first one open)
    if (accordionHeaders.length > 0) {
        accordionHeaders[0].click();
    }
    
    // Product page quantity selector
    const quantityMinusBtn = document.querySelector('.quantity-minus');
    const quantityPlusBtn = document.querySelector('.quantity-plus');
    const quantityInput = document.querySelector('.quantity-input');
    
    if (quantityMinusBtn && quantityPlusBtn && quantityInput) {
        quantityMinusBtn.addEventListener('click', function() {
            let currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });
        
        quantityPlusBtn.addEventListener('click', function() {
            let currentValue = parseInt(quantityInput.value);
            quantityInput.value = currentValue + 1;
        });
    }
    
    // Product gallery thumbnail click
    const productThumbnails = document.querySelectorAll('.product-thumbnail');
    const productMainImage = document.querySelector('.product-main-image');
    
    if (productThumbnails.length > 0 && productMainImage) {
        productThumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', function() {
                const thumbnailImg = this.querySelector('img');
                const thumbnailSrc = thumbnailImg.getAttribute('src');
                productMainImage.setAttribute('src', thumbnailSrc);
            });
        });
    }
    
    // Animation on scroll
    const animateElements = document.querySelectorAll('.animate-fadeInUp');
    
    function checkInView() {
        const windowHeight = window.innerHeight;
        const windowTop = window.scrollY;
        const windowBottom = windowTop + windowHeight;
        
        animateElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top + windowTop;
            const elementBottom = elementTop + element.offsetHeight;
            
            if (elementBottom > windowTop && elementTop < windowBottom) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    }
    
    // Initialize elements above fold
    animateElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
    });
    
    // Check for elements in view on scroll
    window.addEventListener('scroll', checkInView);
    
    // Initial check on page load
    checkInView();
    
    // Form validation for contact form
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic validation
            let valid = true;
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');
            
            if (nameInput && nameInput.value.trim() === '') {
                valid = false;
                nameInput.classList.add('is-invalid');
            } else if (nameInput) {
                nameInput.classList.remove('is-invalid');
            }
            
            if (emailInput) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailInput.value.trim())) {
                    valid = false;
                    emailInput.classList.add('is-invalid');
                } else {
                    emailInput.classList.remove('is-invalid');
                }
            }
            
            if (messageInput && messageInput.value.trim() === '') {
                valid = false;
                messageInput.classList.add('is-invalid');
            } else if (messageInput) {
                messageInput.classList.remove('is-invalid');
            }
            
            // If valid, you would typically submit the form or make an AJAX request
            if (valid) {
                // Simulate form submission success
                const submitBtn = contactForm.querySelector('[type="submit"]');
                if (submitBtn) {
                    const originalText = submitBtn.innerText;
                    submitBtn.innerText = 'Sending...';
                    submitBtn.disabled = true;
                    
                    // Simulate API call delay
                    setTimeout(() => {
                        contactForm.innerHTML = '<div class="alert alert-success">Thank you for your message! We\'ll get back to you shortly.</div>';
                    }, 1500);
                }
            }
        });
    }
});