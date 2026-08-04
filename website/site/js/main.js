/* main.js — homepage only */

document.addEventListener('DOMContentLoaded', () => {

    /* ── Hero slideshow from TDData ── */
    const slides  = TDData.getSlides();
    const wrapper = document.querySelector('.heroSwiper .swiper-wrapper');

    if (wrapper) {
        wrapper.innerHTML = slides.map(s => `
            <div class="swiper-slide">
                <img src="${s.img}" alt="slide">
                <div class="overlay"></div>
                <div class="hero-content">
                    <span class="badge">${s.badge}</span>
                    <h1>${s.title}</h1>
                    <p>${s.subtitle}</p>
                    <a href="https://wa.me/212600000000" class="hero-btn">${s.btn}</a>
                </div>
            </div>
        `).join('');
    }

    /* ── Init Swiper ── */
    if (document.querySelector('.heroSwiper')) {
        new Swiper('.heroSwiper', {
            loop: true, speed: 800,
            autoplay: { delay: 5000, disableOnInteraction: false },
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
            pagination: { el: '.swiper-pagination', clickable: true },
            effect: 'slide', fadeEffect: { crossFade: true }
        });
    }

    if (document.querySelector('.testimonialSwiper')) {
        new Swiper('.testimonialSwiper', {
            loop: true, speed: 700, spaceBetween: 25,
            autoplay: { delay: 3500, disableOnInteraction: false },
            breakpoints: { 0:{ slidesPerView:1 }, 768:{ slidesPerView:2 }, 1024:{ slidesPerView:3 } }
        });
    }

    /* ── Fill search bar with only the brands we actually have ── */
    TDData.populateSelect(document.querySelector('.filter-bar select[name="brand"]'), TDData.getBrands(), 'Toutes les Marques');

    /* ── Featured cars on homepage (top 4) ── */
    const featuredGrid = document.querySelector('.cars-grid');
    if (featuredGrid) {
        const top4 = TDData.getCars().slice(0, 4);
        featuredGrid.innerHTML = top4.map(car => `
            <div class="car-card">
                <img src="${car.images[0]}" alt="${car.name}">
                <div class="car-info">
                    <h3>${car.name}</h3>
                    <p class="car-specs">${car.transmission} &middot; ${car.fuel} &middot; ${car.seats} Places</p>
                    <p class="car-price">${car.price} <span>€/jour</span></p>
                    <a href="car.html?id=${car.id}" class="car-whatsapp"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>
                </div>
            </div>
        `).join('');
    }

    /* ── Accueilpage filter → redirect to fleet ── */
 const filterForm = document.querySelector('.filter-bar');
if (filterForm) {
    filterForm.addEventListener('submit', e => {
        e.preventDefault();
        const params = new URLSearchParams();
        const brand = filterForm.querySelector('[name="brand"]').value;
        const trans = filterForm.querySelector('[name="transmission"]').value;
        const fuel  = filterForm.querySelector('[name="fuel"]').value;
        const price = filterForm.querySelector('[name="price"]').value;
        if (brand) params.set('brand', brand);
        if (trans) params.set('trans', trans);
        if (fuel)  params.set('fuel',  fuel);
        if (price) params.set('price', price);
        window.location.href = `fleet.html?${params.toString()}`;
    });
}

});
