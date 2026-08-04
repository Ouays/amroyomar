/* car.js — dynamic car detail page */

document.addEventListener('DOMContentLoaded', () => {

    /* ── 1. Load car data ── */
    const params = new URLSearchParams(window.location.search);
    const id     = params.get('id');
    const car    = id ? TDData.getCarById(id) : TDData.getCars()[0];

    if (!car) {
        document.querySelector('.car-detail').innerHTML =
            '<p style="padding:80px;text-align:center;font-size:18px">Voiture introuvable. <a href="fleet.html">Parcourir toutes les voitures →</a></p>';
        return;
    }

    /* ── 2. Page meta & hero ── */
    document.title                                       = `${car.name} – TangierDrive`;
    document.getElementById('carPageTitre').textContent  = car.name;
    document.getElementById('breadcrumbName').textContent = car.name;
    document.getElementById('carHeroBg').src             = car.images[0];

    /* ── 3. Build gallery slides + thumbs ── */
    const imgs    = car.images || ['img/car1.jpg'];
    const wrapper = document.getElementById('slidesWrapper');
    const thumbs  = document.getElementById('thumbsContainer');

    wrapper.innerHTML = imgs.map((src, i) =>
        `<div class="slide ${i===0?'active':''}"><img src="${src}" alt="${car.name}"></div>`
    ).join('');

    thumbs.innerHTML = imgs.map((src, i) =>
        `<div class="thumb ${i===0?'active':''}"><img src="${src}" alt="thumb ${i+1}"></div>`
    ).join('');

    /* ── 4. Gallery logic ── */
    let current = 0;
    const slideEls = wrapper.querySelectorAll('.slide');
    const thumbEls = thumbs.querySelectorAll('.thumb');

    function goToSlide(n) {
        slideEls[current].classList.remove('active');
        thumbEls[current].classList.remove('active');
        current = (n + slideEls.length) % slideEls.length;
        slideEls[current].classList.add('active');
        thumbEls[current].classList.add('active');
    }

    document.querySelector('.prev-arrow').addEventListener('click', () => goToSlide(current - 1));
    document.querySelector('.next-arrow').addEventListener('click', () => goToSlide(current + 1));
    thumbEls.forEach((th, i) => th.addEventListener('click', () => goToSlide(i)));

    /* ── 5. Booking panel ── */
    document.getElementById('carPrice').textContent   = car.price;
    document.getElementById('specPlaces').textContent  = `${car.seats} Places`;
    document.getElementById('specPortes').textContent  = `${car.doors} Portes`;
    document.getElementById('specTrans').textContent  = car.transmission;
    document.getElementById('specFuel').textContent   = car.fuel;
    document.getElementById('specAC').textContent     = car.hasAC  ? 'Climatisation' : 'Sans Clim';
    document.getElementById('specGPS').textContent    = car.hasGPS ? 'GPS' : 'Sans GPS';

    document.getElementById('waLink').href =
        `https://wa.me/212600000000?text=Bonjour, je suis intéressé par la location de ${encodeURIComponent(car.name)} pour ${car.price} €/jour.`;

    /* ── 6. Description & features ── */
    document.getElementById('carDescription').textContent = car.description || '';
    document.getElementById('carFeatures').innerHTML = (car.features || [])
        .map(f => `<li><i class="fa-solid fa-circle-check"></i> ${f}</li>`).join('');

    /* ── 7. Spec table ── */
    document.getElementById('stMarque').textContent   = car.brand;
    document.getElementById('stModèle').textContent   = car.name;
    document.getElementById('stAnnée').textContent    = car.year;
    document.getElementById('stTrans').textContent   = car.transmission;
    document.getElementById('stFuel').textContent    = car.fuel;
    document.getElementById('stMoteur').textContent  = car.engine;
    document.getElementById('stPlaces').textContent   = car.seats;
    document.getElementById('stPortes').textContent   = car.doors;
    document.getElementById('stBagages').textContent = car.luggage;
    document.getElementById('stCouleur').textContent   = car.color;

    /* ── 8. Related cars (same brand, max 3, exclude self) ── */
    const related      = TDData.getCars().filter(c => c.brand === car.brand && c.id !== car.id).slice(0, 3);
    const relatedTrack = document.getElementById('relatedTrack');
    const relatedTitre = document.getElementById('relatedTitre');

    relatedTitre.textContent = `Voitures Similaires (${car.brand})`;

    if (related.length) {
        document.querySelector('.related-section').style.display = '';
        relatedTrack.innerHTML = related.map(r => `
            <div class="related-card">
                <img src="${r.images[0]}" alt="${r.name}">
                <div class="related-info">
                    <h4>${r.name}</h4>
                    <div class="related-specs">
                        <span><i class="fa-solid fa-user-group"></i> ${r.seats} Places</span>
                        <span><i class="fa-solid fa-gears"></i> ${r.transmission}</span>
                        <span><i class="fa-solid fa-gas-pump"></i> ${r.fuel}</span>
                    </div>
                    <div class="related-footer">
                        <p class="related-price">${r.price} <span>€ / Jour</span></p>
                        <a href="car.html?id=${r.id}" class="related-btn">Voir les Détails</a>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /* ── 9. Related arrows ── */
    document.querySelector('.related-arrows .ra-prev').addEventListener('click', () =>
        relatedTrack.scrollBy({ left: -320, behavior: 'smooth' }));
    document.querySelector('.related-arrows .ra-next').addEventListener('click', () =>
        relatedTrack.scrollBy({ left:  320, behavior: 'smooth' }));

});