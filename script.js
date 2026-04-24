document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. Hamburger Menü Logika ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links li');
    const body = document.body;
    const mainHeader = document.getElementById('mainHeader');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('nav-active');
        hamburger.classList.toggle('active');
        
        if(navLinks.classList.contains('nav-active')){
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = '';
        }

        navItems.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.2}s`;
            }
        });
    });

    navLinks.addEventListener('click', (e) => {
        if (e.target === navLinks || e.target.classList.contains('nav-cta') || e.target.closest('.mobile-cta')) {
            navLinks.classList.remove('nav-active');
            hamburger.classList.remove('active');
            body.style.overflow = '';
            navItems.forEach(link => link.style.animation = '');
        }
    });

    // --- Scrolled hatás a navigációra ---
    function handleScrollHeader() {
        if (window.scrollY > 10) {
            mainHeader.classList.add('scrolled');
        } else {
            mainHeader.classList.remove('scrolled');
        }
    }
    handleScrollHeader();
    window.addEventListener('scroll', handleScrollHeader);


    // --- Banner Karusszel & SWIPE ---
    const slides = document.querySelectorAll('.banner-slide');
    const dots = document.querySelectorAll('.dot');
    const bannerContainer = document.querySelector('.banner-carousel');
    const prevBtn = document.querySelector('.prev-slide');
    const nextBtn = document.querySelector('.next-slide');
    
    let currentSlide = 0;
    let slideInterval;
    let isAnimating = false;

    function showSlide(index) {
        if (index >= slides.length) index = 0;
        else if (index < 0) index = slides.length - 1;

        slides.forEach(slide => {
            slide.classList.remove('active');
            slide.style.transition = '';
            slide.style.transform = '';
            slide.style.opacity = '';
            slide.style.zIndex = '';
            slide.style.visibility = '';
        });
        dots.forEach(dot => dot.classList.remove('active'));
        
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentSlide = index;
    }

    function performSlideTransition(targetIndex, direction) {
        if (isAnimating) return;
        if (targetIndex >= slides.length) targetIndex = 0;
        if (targetIndex < 0) targetIndex = slides.length - 1;
        if (targetIndex === currentSlide) return;

        isAnimating = true;
        clearInterval(slideInterval);

        const outgoing = slides[currentSlide];
        const incoming = slides[targetIndex];

        incoming.style.transition = 'none';
        incoming.style.transform = `translateX(${direction * 100}%)`;
        incoming.style.opacity = '1';
        incoming.style.visibility = 'visible';
        incoming.style.zIndex = '3';
        incoming.classList.add('active'); 

        outgoing.style.zIndex = '2';

        void incoming.offsetWidth;

        const transitionVal = 'transform 480ms cubic-bezier(0.22, 1, 0.36, 1), opacity 480ms cubic-bezier(0.22, 1, 0.36, 1)';
        incoming.style.transition = transitionVal;
        outgoing.style.transition = transitionVal;

        incoming.style.transform = 'translateX(0)';
        outgoing.style.transform = `translateX(${-direction * 100}%)`;
        outgoing.style.opacity = '0';

        const cleanup = () => {
            outgoing.classList.remove('active');
            outgoing.style.transition = '';
            outgoing.style.transform = '';
            outgoing.style.opacity = '';
            outgoing.style.zIndex = '';
            outgoing.style.visibility = '';

            incoming.style.transition = '';
            incoming.style.transform = '';
            incoming.style.opacity = '';
            incoming.style.zIndex = '';
            incoming.style.visibility = '';

            dots.forEach(d => d.classList.remove('active'));
            if (dots[targetIndex]) dots[targetIndex].classList.add('active');

            currentSlide = targetIndex;
            isAnimating = false;
            resetAutoSlide();
        };

        const cleanupTimeout = setTimeout(cleanup, 520);

        const onTransitionEnd = (e) => {
            if (e.target === incoming) {
                clearTimeout(cleanupTimeout);
                incoming.removeEventListener('transitionend', onTransitionEnd);
                cleanup();
            }
        };
        incoming.addEventListener('transitionend', onTransitionEnd);
    }

    function nextSlide() { performSlideTransition((currentSlide + 1) % slides.length, 1); }
    function prevSlideFunc() { performSlideTransition((currentSlide - 1 + slides.length) % slides.length, -1); }

    function startAutoSlide() {
        slideInterval = setInterval(() => { if (!isAnimating) nextSlide(); }, 6000);
    }
    
    function resetAutoSlide() {
        clearInterval(slideInterval);
        startAutoSlide();
    }

    dots.forEach(dot => {
        dot.addEventListener('click', function() {
            const slideIndex = parseInt(this.getAttribute('data-slide')) - 1;
            if (slideIndex === currentSlide) return;
            const direction = slideIndex > currentSlide ? 1 : -1;
            performSlideTransition(slideIndex, direction);
        });
    });

    if(nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoSlide(); });
    if(prevBtn) prevBtn.addEventListener('click', () => { prevSlideFunc(); resetAutoSlide(); });

    startAutoSlide();

    // --- Drag / Swipe logika ---
    let isDragging = false;
    let dragStartX = 0;
    let dragCurrentX = 0;
    let dragDelta = 0;
    const dragThreshold = 60;

    if (bannerContainer) bannerContainer.style.cursor = 'grab';

    function unifyEventX(e) {
        if (e.type.startsWith('mouse')) return e.clientX;
        if (e.changedTouches && e.changedTouches[0]) return e.changedTouches[0].clientX;
        if (e.touches && e.touches[0]) return e.touches[0].clientX;
        return 0;
    }

    function onDragStart(e) {
        if (isAnimating) return;
        isDragging = true;
        dragStartX = unifyEventX(e);
        dragCurrentX = dragStartX;
        dragDelta = 0;
        clearInterval(slideInterval);
        if (bannerContainer) bannerContainer.style.cursor = 'grabbing';
        e.preventDefault();

        const activeBg = slides[currentSlide].querySelector('.slide-bg');
        if (activeBg) activeBg.style.transition = 'none';
    }

    function onDragMove(e) {
        if (!isDragging || isAnimating) return;
        dragCurrentX = unifyEventX(e);
        dragDelta = dragCurrentX - dragStartX;

        const activeBg = slides[currentSlide].querySelector('.slide-bg');
        if (activeBg) {
            const translateX = dragDelta * 0.35;
            activeBg.style.transform = `translateX(${translateX}px) scale(1.02)`;
        }

        const activeSlide = slides[currentSlide];
        if (activeSlide) {
            activeSlide.style.transition = 'none';
            activeSlide.style.transform = `translateX(${dragDelta * 0.15}px)`;
        }
    }

    function onDragEnd(e) {
        if (!isDragging || isAnimating) return;
        isDragging = false;
        if (bannerContainer) bannerContainer.style.cursor = 'grab';

        const activeBg = slides[currentSlide].querySelector('.slide-bg');
        if (activeBg) {
            activeBg.style.transition = 'transform 400ms cubic-bezier(0.22, 1, 0.36, 1)';
            activeBg.style.transform = '';
        }
        const activeSlide = slides[currentSlide];
        if (activeSlide) {
            activeSlide.style.transition = 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)';
            activeSlide.style.transform = '';
        }

        if (dragDelta < -dragThreshold) {
            performSlideTransition((currentSlide + 1) % slides.length, 1);
        } else if (dragDelta > dragThreshold) {
            performSlideTransition((currentSlide - 1 + slides.length) % slides.length, -1);
        } else {
            showSlide(currentSlide);
            resetAutoSlide();
        }
        dragDelta = 0;
    }

    if (bannerContainer) {
        bannerContainer.addEventListener('touchstart', onDragStart, {passive: false});
        bannerContainer.addEventListener('touchmove', onDragMove, {passive: false});
        bannerContainer.addEventListener('touchend', onDragEnd);
        bannerContainer.addEventListener('mousedown', onDragStart);
        window.addEventListener('mousemove', onDragMove);
        window.addEventListener('mouseup', onDragEnd);
    }

    // --- Görgetésre előtűnés (Scroll Reveal) a szekcióra ---
    const revealSections = document.querySelectorAll('.reveal-effect');
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealSections.forEach(section => {
        revealOnScroll.observe(section);
    });

    // --- RADIÁLIS MENÜ LOGIKA ---
    function setupRadialMenu() {
        const items = document.querySelectorAll('.radial-item');
        if (items.length === 0) return;

        function updatePositions() {
            const isMobile = window.innerWidth <= 768;
            // A sugár, amin a pontok elhelyezkednek a középponthoz képest
            const radius = isMobile ? 160 : 330; 
            const angleStep = 360 / items.length;

            items.forEach((item, index) => {
                // -90 fok hogy a legfelső pontból induljon (12 óra iránya)
                const angle = (angleStep * index) - 90; 
                // Fok konvertálása radiánba
                const rad = angle * (Math.PI / 180);
                
                const x = Math.round(radius * Math.cos(rad));
                const y = Math.round(radius * Math.sin(rad));

                // Alap transzformáció elmentése
                const baseTransform = `translate(${x}px, ${y}px)`;
                item.dataset.baseTransform = baseTransform;
                
                // Aktuális class alapján alkalmazzuk a scale-t
                if (item.classList.contains('active')) {
                    item.style.transform = `${baseTransform} scale(1.2)`;
                } else {
                    item.style.transform = baseTransform;
                }
            });
        }

        // Inicializálás és átméretezés figyelése
        updatePositions();
        window.addEventListener('resize', updatePositions);

        // Kattintás események
        const centerImg = document.getElementById('centerImg');
        const centerTitle = document.getElementById('centerTitle');
        const centerDesc = document.getElementById('centerDesc');
        const centerLink = document.getElementById('centerLink');
        const centerDisplay = document.getElementById('radialCenter');

        items.forEach(item => {
            
            // CSS Hover hatásokhoz JS segítség a baseTransform miatt
            item.addEventListener('mouseenter', () => {
                if (!item.classList.contains('active')) {
                    item.style.transform = `${item.dataset.baseTransform} scale(1.1)`;
                }
            });
            item.addEventListener('mouseleave', () => {
                if (!item.classList.contains('active')) {
                    item.style.transform = item.dataset.baseTransform;
                } else {
                    item.style.transform = `${item.dataset.baseTransform} scale(1.2)`;
                }
            });

            // Kattintás
            item.addEventListener('click', () => {
                if (item.classList.contains('active')) return;

                // Korábbi aktív levétele
                items.forEach(i => {
                    i.classList.remove('active');
                    i.style.transform = i.dataset.baseTransform; 
                });
                
                // Új aktív beállítása
                item.classList.add('active');
                item.style.transform = `${item.dataset.baseTransform} scale(1.2)`;

                // Középső tartalom cseréje Fade animációval
                centerDisplay.style.opacity = 0;
                
                setTimeout(() => {
                    centerImg.src = item.dataset.img;
                    centerTitle.textContent = item.dataset.title;
                    centerDesc.textContent = item.dataset.desc;
                    centerLink.href = item.dataset.link;
                    centerDisplay.style.opacity = 1;
                }, 300); // 300ms, mint a CSS opacity transition ideje
            });
        });
    }

    // Futtatjuk a radiális beállítást
    setupRadialMenu();
});

// CSS Animáció injektálása
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes navLinkFade {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
`;
document.head.appendChild(styleSheet);