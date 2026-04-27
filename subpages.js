document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. REFERENZEN LIGHTBOX LOGIKA ---
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    
    if (galleryItems.length > 0 && lightbox) {
        const lightboxImg = document.getElementById('lightboxImg');
        const lightboxDesc = document.getElementById('lightboxDesc');
        const closeBtn = document.querySelector('.lightbox-close');
        const nextBtn = document.querySelector('.lightbox-nav.next');
        const prevBtn = document.querySelector('.lightbox-nav.prev');
        
        let currentIndex = 0;
        const itemsData = Array.from(galleryItems).map(item => ({
            img: item.getAttribute('data-img'),
            desc: item.getAttribute('data-desc')
        }));

        function openLightbox(index) {
            currentIndex = index;
            updateLightboxContent();
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // Ne görgessen a háttér
        }

        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }

        function updateLightboxContent() {
            lightboxImg.src = itemsData[currentIndex].img;
            lightboxDesc.textContent = itemsData[currentIndex].desc;
            
            // Kicsi animáció csere közben
            lightboxImg.style.opacity = 0;
            setTimeout(() => { lightboxImg.style.opacity = 1; lightboxImg.style.transition = 'opacity 0.3s'; }, 50);
        }

        function nextImage() {
            currentIndex = (currentIndex + 1) % itemsData.length;
            updateLightboxContent();
        }

        function prevImage() {
            currentIndex = (currentIndex - 1 + itemsData.length) % itemsData.length;
            updateLightboxContent();
        }

        // Eseménykezelők
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => openLightbox(index));
        });

        closeBtn.addEventListener('click', closeLightbox);
        nextBtn.addEventListener('click', (e) => { e.stopPropagation(); nextImage(); });
        prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prevImage(); });
        
        // Zárás ha a háttérre kattint
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-content-wrapper')) {
                closeLightbox();
            }
        });

        // Billentyűzet támogatás
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        });

        // --- MOBIL SWIPE (SODRÁS) TÁMOGATÁS A LIGHTBOXBAN ---
        let startX = 0;
        let currentX = 0;
        let isSwiping = false;

        lightboxImg.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isSwiping = true;
            lightboxImg.style.transition = 'none';
        }, {passive: true});

        lightboxImg.addEventListener('touchmove', (e) => {
            if (!isSwiping) return;
            currentX = e.touches[0].clientX;
            const diffX = currentX - startX;
            // Kép elmozdítása az ujjunkkal
            lightboxImg.style.transform = `translateX(${diffX * 0.5}px)`;
        }, {passive: true});

        lightboxImg.addEventListener('touchend', (e) => {
            if (!isSwiping) return;
            isSwiping = false;
            const diffX = currentX - startX;
            
            lightboxImg.style.transition = 'transform 0.3s ease, opacity 0.3s';
            lightboxImg.style.transform = 'translateX(0)'; // Visszaállás középre

            // Ha elég nagyot húztunk
            if (Math.abs(diffX) > 50) {
                if (diffX < 0) {
                    nextImage(); // Balra húzás -> Következő
                } else {
                    prevImage(); // Jobbra húzás -> Előző
                }
            }
        });
    }

    // --- 2. PRODUKTE PDF KATTINTÁS (Opcionális extra logika) ---
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // A HTML-ben "target='_blank'" van megadva, így automatikusan új lapon nyílik meg.
            // Ide bekerülhet extra analitika vagy egyedi betöltő képernyő a PDF előtt 2026-os stílusban.
        });
    });

});