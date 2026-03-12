// Navigation Toggle (null-safe)
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });
}

// Language switching functionality
let currentLanguage = 'tr';

function switchLanguage(language) {
    currentLanguage = language;
    
    // Update language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === language) {
            btn.classList.add('active');
        }
    });
    
    // Update all translatable elements
    document.querySelectorAll('[data-tr]').forEach(element => {
        const text = element.getAttribute(`data-${language}`);
        if (text) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.setAttribute('placeholder', text);
            } else if (element.tagName === 'TITLE') {
                element.textContent = text;
            } else {
                element.innerHTML = text;
            }
        }
    });
    
    // Save language preference
    localStorage.setItem('preferredLanguage', language);
    
    // Update document language
    document.documentElement.lang = language === 'tr' ? 'tr' : 'en';
}

// Language button event listeners
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const language = btn.getAttribute('data-lang');
        switchLanguage(language);
    });
});

// Load saved language preference
document.addEventListener('DOMContentLoaded', () => {
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'tr';
    switchLanguage(savedLanguage);
});

/* ---------- THEME TOGGLE (consolidated into script.js) ---------- */
/* - Controls body.dark
   - Persists choice to localStorage
   - Reacts to system preference changes
   - Updates toggle button aria and icons
*/

function setThemeState(isDark) {
    document.body.classList.toggle('dark', !!isDark);
    try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch (e) {}
    const btn = document.getElementById('theme-toggle');
    if (btn) {
        btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
        const sun = btn.querySelector('.icon-sun');
        const moon = btn.querySelector('.icon-moon');
        if (sun) sun.style.display = isDark ? 'inline-block' : 'none';
        if (moon) moon.style.display = isDark ? 'none' : 'inline-block';
    }
    updateNavbarOnScroll();
}

function initThemeToggle() {
    // determine initial theme: localStorage -> system -> light
    let saved = null;
    try { saved = localStorage.getItem('theme'); } catch (e) { saved = null; }
    if (saved === 'dark') setThemeState(true);
    else if (saved === 'light') setThemeState(false);
    else {
        // No saved preference -> default to dark mode
        setThemeState(true);
    }

    // click handler
    const btn = document.getElementById('theme-toggle');
    if (btn) {
        btn.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark');
            setThemeState(isDark);
        });
    }

    // listen to system preference changes and update only if user has no explicit choice
    if (window.matchMedia) {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        mq.addEventListener && mq.addEventListener('change', (e) => {
            // apply only if no saved preference
            let savedPref = null;
            try { savedPref = localStorage.getItem('theme'); } catch (err) { savedPref = null; }
            if (!savedPref) {
                setThemeState(e.matches);
            }
        });
    }
}

// initialize on DOM ready
document.addEventListener('DOMContentLoaded', initThemeToggle);

/* ---------- Navbar background on scroll (theme-aware & null-safe) ---------- */
function updateNavbarOnScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    const isDark = document.body.classList.contains('dark');
    if (window.scrollY > 100) {
        if (isDark) {
            navbar.style.background = 'rgba(7, 10, 18, 0.9)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.6)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
        }
    } else {
        if (isDark) {
            navbar.style.background = 'rgba(7, 10, 18, 0.85)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.6)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }
    }
}

window.addEventListener('scroll', updateNavbarOnScroll);
window.addEventListener('load', updateNavbarOnScroll);

// Close mobile menu when clicking on a link (null-safe)
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        if (navMenu) navMenu.classList.remove('active');
        if (navToggle) navToggle.classList.remove('active');
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Active navigation link highlighting
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Project filtering
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
const projectsFilter = document.querySelector('.projects-filter');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');

        const filterValue = button.getAttribute('data-filter');

        // Manage projects-filter state: if 'all' selected -> no has-selection,
        // otherwise add has-selection so CSS can style non-active buttons as 'unselected'
        if (projectsFilter) {
            if (filterValue === 'all') projectsFilter.classList.remove('has-selection');
            else projectsFilter.classList.add('has-selection');
        }

        projectCards.forEach(card => {
            if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                card.style.display = 'block';
                card.style.animation = 'fadeInUp 0.5s ease forwards';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Contact form handling (null-safe)
const contactForm = document.querySelector('.contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const nameEl = contactForm.querySelector('input[type="text"]');
        const emailEl = contactForm.querySelector('input[type="email"]');
        const subjectEls = contactForm.querySelectorAll('input[type="text"]');
        const textareaEl = contactForm.querySelector('textarea');

        const name = nameEl ? nameEl.value : '';
        const email = emailEl ? emailEl.value : '';
        const subject = subjectEls && subjectEls[1] ? subjectEls[1].value : '';
        const message = textareaEl ? textareaEl.value : '';

        // Get translation messages
        const messages = {
            tr: {
                fillFields: 'Lütfen tüm alanları doldurun!',
                validEmail: 'Geçerli bir e-posta adresi girin!',
                success: 'Mesajınız gönderildi! En kısa sürede dönüş yapacağım.'
            },
            en: {
                fillFields: 'Please fill in all fields!',
                validEmail: 'Please enter a valid email address!',
                success: 'Your message has been sent! I will get back to you soon.'
            }
        };

        // Simple validation
        if (!name || !email || !subject || !message) {
            showNotification(messages[currentLanguage].fillFields, 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showNotification(messages[currentLanguage].validEmail, 'error');
            return;
        }

        // Simulate form submission
        showNotification(messages[currentLanguage].success, 'success');
        contactForm.reset();
    });
}

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
function showNotification(message, type) {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 10000;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 350px;
        ${type === 'success' ? 'background: #10b981;' : 'background: #ef4444;'}
    `;

    // Add to DOM
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Auto hide after 5 seconds
    setTimeout(() => {
        hideNotification(notification);
    }, 5000);

    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        hideNotification(notification);
    });
}

function hideNotification(notification) {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 300);
}

// Typing animation for hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing animation when page loads
window.addEventListener('load', () => {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        typeWriter(heroTitle, originalText, 50);
    }
});

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('loading');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.skill-category, .project-card, .about-text, .about-image');
    animatedElements.forEach(el => observer.observe(el));
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroImage = document.querySelector('.hero-image');
    if (heroImage) {
        heroImage.style.transform = `translateY(${scrolled * 0.2}px)`;
    }
});

// Skills hover effect
document.querySelectorAll('.skill-item').forEach(skill => {
    skill.addEventListener('mouseenter', () => {
        skill.style.transform = 'scale(1.05) rotate(5deg)';
    });
    
    skill.addEventListener('mouseleave', () => {
        skill.style.transform = 'scale(1) rotate(0deg)';
    });
});

// Project card hover effects
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        const image = card.querySelector('.project-image img');
        if (image) {
            image.style.transform = 'scale(1.1)';
        }
    });
    
    card.addEventListener('mouseleave', () => {
        const image = card.querySelector('.project-image img');
        if (image) {
            image.style.transform = 'scale(1)';
        }
    });
});

// Dynamic copyright year
const currentYear = new Date().getFullYear();
const copyrightElement = document.querySelector('.footer-bottom p');
if (copyrightElement) {
    copyrightElement.innerHTML = copyrightElement.innerHTML.replace('2025', currentYear);
}

// Loading screen
function showLoadingScreen() {
    const loadingScreen = document.createElement('div');
    loadingScreen.id = 'loading-screen';
    loadingScreen.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner" aria-hidden="true"></div>
            <p>Yükleniyor...</p>
        </div>
    `;
    // Add to DOM (styles are provided by style.css; dark mode handled via body.dark)
    document.body.appendChild(loadingScreen);

    // Hide loading screen after content loads
    window.addEventListener('load', () => {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            loadingScreen.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                if (loadingScreen.parentNode) loadingScreen.remove();
            }, 500);
        }, 1000);
    });
}

// Initialize loading screen
document.addEventListener('DOMContentLoaded', showLoadingScreen);

// Back to top button
function createBackToTopButton() {
    const button = document.createElement('button');
    button.innerHTML = '↑';
    button.className = 'back-to-top';
    button.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 20px;
        font-weight: bold;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 20px rgba(79, 70, 229, 0.3);
    `;
    
    document.body.appendChild(button);
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            button.style.opacity = '1';
            button.style.visibility = 'visible';
        } else {
            button.style.opacity = '0';
            button.style.visibility = 'hidden';
        }
    });
    
    // Scroll to top functionality
    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Hover effects
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
    });
}

// Initialize back to top button
createBackToTopButton();

// Performance optimization: Lazy loading for images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', lazyLoadImages);

/* ---------- Stories (Instagram-like) ---------- */
(() => {
    // Stories list: supports both images and videos. Update paths as needed.
    const stories = [
        { type: 'image', src: './Docs/image/image-15.png' },
        { type: 'image', src: './Docs/image/image-16.png' },
        { type: 'video', src: './Docs/video/video-1.mp4' },
        { type: 'image', src: './Docs/image/image-17.png' },
        { type: 'video', src: './Docs/video/video-2.mp4' },
        { type: 'image', src: './Docs/image/image-18.png' },
        { type: 'image', src: './Docs/image/image-19.png' },
        { type: 'image', src: './Docs/image/image-20.png' },
        { type: 'image', src: './Docs/image/image-21.png' },
        { type: 'image', src: './Docs/image/image-22.png' },
        { type: 'image', src: './Docs/image/image-23.png' },
        { type: 'image', src: './Docs/image/image-24.png' },
        { type: 'image', src: './Docs/image/image-25.png' },
        { type: 'image', src: './Docs/image/image-26.png' },
        { type: 'image', src: './Docs/image/image-27.png' },
        { type: 'image', src: './Docs/image/image-28.png' }
    ];

    let currentIndex = 0;

    const openBtn = document.getElementById('open-stories');
    const modal = document.getElementById('story-modal');
    const backdrop = document.getElementById('story-backdrop');
    const closeBtn = document.getElementById('story-close');
    const prevBtn = document.getElementById('story-prev');
    const nextBtn = document.getElementById('story-next');
    const mediaContainer = document.getElementById('story-media');
    const counterEl = document.getElementById('story-counter');

    function clearMedia() {
        if (!mediaContainer) return;
        const existingVideo = mediaContainer.querySelector('video');
        if (existingVideo) {
            try { existingVideo.pause(); } catch (e) {}
        }
        mediaContainer.innerHTML = '';
    }

    function showStory(index) {
        if (!mediaContainer) return;
        currentIndex = (index + stories.length) % stories.length;
        const item = stories[currentIndex];
        counterEl.textContent = `${currentIndex + 1} / ${stories.length}`;
        clearMedia();

        if (item.type === 'video') {
            const v = document.createElement('video');
            v.src = item.src;
            v.autoplay = true;
            v.muted = true; // start muted to allow autoplay across browsers
            v.playsInline = true;
            v.controls = false;
            v.preload = 'metadata';
            v.style.width = '100%';
            v.style.height = '100%';
            v.style.objectFit = 'contain';
            v.setAttribute('aria-label', `Hikaye video ${currentIndex + 1}`);
            mediaContainer.appendChild(v);
            // attempt to play (may return a promise)
            v.play().catch(() => {});

            // toggle play/pause on click
            v.addEventListener('click', () => {
                if (lensSize === 100) openZoomFull(item);
                else if (v.paused) v.play(); else v.pause();
            });
        } else {
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = `Hikaye ${currentIndex + 1}`;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            mediaContainer.appendChild(img);
            img.addEventListener('click', () => {
                if (lensSize === 100) openZoomFull(item);
            });
        }
    }

    /* ---------- Zoom / Fullscreen logic ---------- */
    const lensSize = 100; // set desired magnifier size; when 100 => fullscreen zoom on click

    // create fullscreen zoom overlay (lazy)
    let zoomOverlay = null;

    function ensureZoomOverlay() {
        if (zoomOverlay) return zoomOverlay;
        zoomOverlay = document.createElement('div');
        zoomOverlay.className = 'zoom-fullscreen';
        zoomOverlay.innerHTML = `
            <button class="zoom-close" aria-label="Kapat">×</button>
            <div class="zoom-inner"></div>
        `;
        document.body.appendChild(zoomOverlay);
        // close handlers
        zoomOverlay.addEventListener('click', (e) => {
            if (e.target === zoomOverlay || e.target.classList.contains('zoom-close')) closeZoomFull();
        });
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeZoomFull();
        });
        return zoomOverlay;
    }

    function openZoomFull(item) {
        const overlay = ensureZoomOverlay();
        const inner = overlay.querySelector('.zoom-inner');
        inner.innerHTML = '';
        if (item.type === 'video') {
            const v = document.createElement('video');
            v.src = item.src;
            v.controls = true;
            v.autoplay = true;
            v.muted = true; // start muted to allow autoplay; user can unmute with controls
            v.playsInline = true;
            v.className = 'zoom-media';
            inner.appendChild(v);
            v.play().catch(() => {});
        } else {
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = 'Zoomed image';
            img.className = 'zoom-media';
            inner.appendChild(img);
        }
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeZoomFull() {
        if (!zoomOverlay) return;
        zoomOverlay.classList.remove('open');
        document.body.style.overflow = '';
        const media = zoomOverlay.querySelector('.zoom-media');
        if (media && media.tagName === 'VIDEO') {
            try { media.pause(); } catch (e) {}
        }
    }

    function openStories(startIndex = 0) {
        showStory(startIndex);
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        // trap focus could be added later; for now focus the displayed media if possible
        const firstMedia = mediaContainer && mediaContainer.firstElementChild;
        if (firstMedia && typeof firstMedia.focus === 'function') firstMedia.focus();
    }

    function closeStories() {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
    }

    if (openBtn) openBtn.addEventListener('click', () => openStories(0));
    if (closeBtn) closeBtn.addEventListener('click', closeStories);
    if (backdrop) backdrop.addEventListener('click', closeStories);
    if (prevBtn) prevBtn.addEventListener('click', () => showStory(currentIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => showStory(currentIndex + 1));

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('open')) return;
        if (e.key === 'ArrowLeft') showStory(currentIndex - 1);
        if (e.key === 'ArrowRight') showStory(currentIndex + 1);
        if (e.key === 'Escape') closeStories();
    });

    // preload media for smoother experience
    stories.forEach(item => {
        if (item.type === 'image') {
            const img = new Image(); img.src = item.src;
        } else if (item.type === 'video') {
            // create a short-lived video element to hint the browser to preload metadata
            const v = document.createElement('video');
            v.preload = 'metadata';
            v.src = item.src;
        }
    });
})();
