document.addEventListener('DOMContentLoaded', function() {
    
    // --- 0. Sötét/Világos Téma Kezelés ---
    const themeToggle = document.getElementById('themeToggle');
    const htmlEl = document.documentElement;
    const themeIcon = themeToggle.querySelector('i');

    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlEl.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlEl.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        htmlEl.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        if(theme === 'dark') {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    }

    // --- 1. Hamburger Menü Logika ---
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;
    const mainHeader = document.getElementById('mainHeader');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('nav-active');
        hamburger.classList.toggle('active');
        body.style.overflow = navLinks.classList.contains('nav-active') ? 'hidden' : '';
    });

    navLinks.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' || e.target === navLinks) {
            navLinks.classList.remove('nav-active');
            hamburger.classList.remove('active');
            body.style.overflow = '';
        }
    });

    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) mainHeader.classList.add('scrolled');
        else mainHeader.classList.remove('scrolled');
    });

    // --- 2. Statisztika Számláló Animáció ---
    const counters = document.querySelectorAll('.counter');
    let hasCounted = false;

    function startCounting() {
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const duration = 2000; 
            const increment = target / (duration / 16); 
            
            let current = 0;
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.innerText = Math.ceil(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.innerText = target.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                }
            };
            updateCounter();
        });
    }

    const revealSections = document.querySelectorAll('.reveal-effect');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                if (entry.target.classList.contains('stats-section') && !hasCounted) {
                    startCounting();
                    hasCounted = true;
                }
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

    revealSections.forEach(sec => revealObserver.observe(sec));


    // --- 3. Banner Karusszel & JAVÍTOTT SWIPE ---
    const slides = document.querySelectorAll('.banner-slide');
    const dots = document.querySelectorAll('.dot');
    const bannerContainer = document.querySelector('.banner-carousel');
    let currentSlide = 0;
    let slideInterval;
    let isAnimating = false;

    function transitionSlide(targetIndex, direction) {
        if (isAnimating || targetIndex === currentSlide) return;
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

        const trans = 'transform 480ms cubic-bezier(0.22, 1, 0.36, 1), opacity 480ms';
        incoming.style.transition = trans;
        outgoing.style.transition = trans;
        incoming.style.transform = 'translateX(0)';
        outgoing.style.transform = `translateX(${-direction * 100}%)`;
        outgoing.style.opacity = '0';

        setTimeout(() => {
            outgoing.classList.remove('active');
            outgoing.style = ''; incoming.style = '';
            dots.forEach(d => d.classList.remove('active'));
            dots[targetIndex].classList.add('active');
            currentSlide = targetIndex;
            isAnimating = false;
            startAutoSlide();
        }, 500);
    }

    function nextSlide() { transitionSlide((currentSlide + 1) % slides.length, 1); }
    function prevSlideFunc() { transitionSlide((currentSlide - 1 + slides.length) % slides.length, -1); }
    function startAutoSlide() { clearInterval(slideInterval); slideInterval = setInterval(() => { if (!isAnimating) nextSlide(); }, 6000); }

    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            if(idx === currentSlide) return;
            transitionSlide(idx, idx > currentSlide ? 1 : -1);
        });
    });

    startAutoSlide();

    let isDragging = false;
    let dragStartX = 0, dragStartY = 0, dragCurrentX = 0, dragCurrentY = 0;
    let isScrollingDirection = null;

    function unifyEvent(e) { return e.changedTouches ? e.changedTouches[0] : e; }

    function onDragStart(e) {
        if (isAnimating) return;
        isDragging = true;
        isScrollingDirection = null;
        const unified = unifyEvent(e);
        dragStartX = unified.clientX;
        dragStartY = unified.clientY;
        clearInterval(slideInterval);
    }

    function onDragMove(e) {
        if (!isDragging || isAnimating) return;
        const unified = unifyEvent(e);
        dragCurrentX = unified.clientX;
        dragCurrentY = unified.clientY;
        const diffX = dragCurrentX - dragStartX;
        const diffY = dragCurrentY - dragStartY;

        if (isScrollingDirection === null) {
            if (Math.abs(diffY) > Math.abs(diffX)) isScrollingDirection = true;
            else isScrollingDirection = false;
        }

        if (isScrollingDirection) {
            isDragging = false;
            return;
        }

        e.preventDefault(); 
        const activeSlide = slides[currentSlide];
        activeSlide.style.transition = 'none';
        activeSlide.style.transform = `translateX(${diffX * 0.2}px)`;
    }

    function onDragEnd() {
        if (!isDragging || isScrollingDirection) {
            isDragging = false;
            startAutoSlide();
            return;
        }
        isDragging = false;
        const diffX = dragCurrentX - dragStartX;
        const activeSlide = slides[currentSlide];
        if (activeSlide) activeSlide.style = ''; 

        if (diffX < -50) nextSlide();
        else if (diffX > 50) prevSlideFunc();
        else startAutoSlide();
    }

    if (bannerContainer) {
        bannerContainer.addEventListener('touchstart', onDragStart, {passive: true}); 
        bannerContainer.addEventListener('touchmove', onDragMove, {passive: false});
        bannerContainer.addEventListener('touchend', onDragEnd);
        bannerContainer.addEventListener('mousedown', onDragStart);
        window.addEventListener('mousemove', onDragMove);
        window.addEventListener('mouseup', onDragEnd);
    }


    // --- 4. RADIÁLIS MENÜ ---
    function setupRadialMenu() {
        const items = document.querySelectorAll('.radial-item');
        if (items.length === 0) return;

        function updatePositions() {
            const isMobile = window.innerWidth <= 768;
            const radius = isMobile ? 155 : 330; 
            const angleStep = 360 / items.length;

            items.forEach((item, index) => {
                const angle = (angleStep * index) - 90; 
                const rad = angle * (Math.PI / 180);
                const x = Math.round(radius * Math.cos(rad));
                const y = Math.round(radius * Math.sin(rad));
                const baseTransform = `translate(${x}px, ${y}px)`;
                item.dataset.baseTransform = baseTransform;
                item.style.transform = item.classList.contains('active') ? `${baseTransform} scale(1.15)` : baseTransform;
            });
        }

        updatePositions();
        window.addEventListener('resize', updatePositions);

        const centerImg = document.getElementById('centerImg');
        const centerTitle = document.getElementById('centerTitle');
        const centerDesc = document.getElementById('centerDesc');
        const centerLink = document.getElementById('centerLink');
        const centerDisplay = document.getElementById('radialCenter');

        items.forEach(item => {
            item.addEventListener('click', () => {
                if (item.classList.contains('active')) return;
                items.forEach(i => {
                    i.classList.remove('active');
                    i.style.transform = i.dataset.baseTransform; 
                });
                item.classList.add('active');
                item.style.transform = `${item.dataset.baseTransform} scale(1.15)`;
                centerDisplay.style.opacity = 0;
                setTimeout(() => {
                    centerImg.src = item.dataset.img;
                    centerTitle.textContent = item.dataset.title;
                    centerDesc.textContent = item.dataset.desc;
                    centerLink.href = item.dataset.link;
                    centerDisplay.style.opacity = 1;
                }, 300);
            });
        });
    }
    setupRadialMenu();

    // --- 5. PARTNER CAROUSEL (JAVÍTOTT: Hover = Stop, Click = Drag) ---
    const partnerTrack = document.getElementById('partnerTrack');
    const partnerContainer = document.getElementById('partnerCarousel');
    
    if (partnerTrack && partnerContainer) {
        partnerTrack.innerHTML += partnerTrack.innerHTML;
        
        let currentPos = 0;
        let animationId;
        let isPartnerDragging = false;
        let isHovered = false; // Új állapot a megállításhoz
        let pDragStartX = 0;
        let pPrevX = 0;

        function animateMarquee() {
            // Csak akkor mozog, ha nem visszük rá az egeret ÉS nem húzzuk
            if (!isPartnerDragging && !isHovered) {
                currentPos -= 1; 
                if (currentPos <= -(partnerTrack.scrollWidth / 2)) {
                    currentPos = 0;
                }
                partnerTrack.style.transform = `translateX(${currentPos}px)`;
            }
            animationId = requestAnimationFrame(animateMarquee);
        }
        
        animateMarquee();

        // Egér ráhúzás: Csak megállítja a mozgást
        partnerContainer.addEventListener('mouseenter', () => {
            isHovered = true;
        });

        // Egér elhagyása: Újraindítja a mozgást (ha nem húzzuk épp)
        partnerContainer.addEventListener('mouseleave', () => {
            isHovered = false;
            if (!isPartnerDragging) {
                // Biztosítjuk, hogy az animáció fusson
            }
        });

        // Kattintás (Drag) kezdete
        function onPartnerDragStart(e) {
            isPartnerDragging = true;
            partnerContainer.style.cursor = 'grabbing';
            const unified = unifyEvent(e);
            pDragStartX = unified.clientX;
            pPrevX = pDragStartX;
        }

        // Húzás folyamata
        function onPartnerDragMove(e) {
            if (!isPartnerDragging) return;
            
            const unified = unifyEvent(e);
            const currentX = unified.clientX;
            const diffX = currentX - pPrevX;
            
            currentPos += diffX;
            pPrevX = currentX;
            
            // Végtelenített pozíció korrekció húzás közben
            if (currentPos > 0) currentPos = -(partnerTrack.scrollWidth / 2);
            if (currentPos <= -(partnerTrack.scrollWidth / 2)) {
                // Ha túlhúznánk balra, korrigálunk
            }
            
            partnerTrack.style.transform = `translateX(${currentPos}px)`;
        }

        // Elengedés
        function onPartnerDragEnd() {
            if (!isPartnerDragging) return;
            isPartnerDragging = false;
            partnerContainer.style.cursor = 'grab';
        }

        // PC Események
        partnerContainer.addEventListener('mousedown', onPartnerDragStart);
        window.addEventListener('mousemove', onPartnerDragMove);
        window.addEventListener('mouseup', onPartnerDragEnd);

        // Mobil Események (Érintésnél nincs hover, ott egyből drag van)
        partnerContainer.addEventListener('touchstart', onPartnerDragStart, {passive: true});
        window.addEventListener('touchmove', onPartnerDragMove, {passive: true});
        window.addEventListener('touchend', onPartnerDragEnd);
    }
});