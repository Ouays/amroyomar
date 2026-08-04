/* fleet.js — reads from TDData, renders grid, filters */

document.addEventListener('DOMContentLoaded', () => {

    const cars = TDData.getCars();

    /* ── Fill search bar with only the brands/categories we actually have ── */
    TDData.populateSelect(document.getElementById('filterMarque'), TDData.getBrands(), 'Toutes les Marques');
    TDData.populateSelect(document.getElementById('filterCatégorie'), TDData.getCategories(), 'Toutes les Catégories');

    function renderCars(list) {
        const grid  = document.getElementById('carsGrid');
        const noRes = document.getElementById('noResults');
        document.getElementById('carCount').textContent = list.length;
        if (!list.length) { grid.innerHTML = ''; noRes.style.display = 'flex'; return; }
        noRes.style.display = 'none';
        grid.innerHTML = list.map(car => {
            return `
            <div class="car-item">
                <a href="car.html?id=${car.id}" class="car-item-img-wrap">
                    <img src="${car.images[0]}" alt="${car.name}" loading="lazy">
                </a>
                <div class="car-item-info">
                    <h3>${car.name}</h3>
                    <div class="car-item-specs">
                        <span><i class="fa-solid fa-user-group"></i> ${car.seats} Places</span>
                        <span><i class="fa-solid fa-gears"></i> ${car.transmission}</span>
                        <span><i class="fa-solid fa-gas-pump"></i> ${car.fuel}</span>
                    </div>
                    <div class="car-item-footer">
                        <p class="car-item-price">${car.price} <span>€ / Jour</span></p>
                        <a href="car.html?id=${car.id}" class="car-item-btn">Voir les Détails</a>
                    </div>
                </div>
            </div>
        `}).join('');
    }

    function getFiltered() {
        const brand = document.getElementById('filterMarque').value;
        const cat   = document.getElementById('filterCatégorie').value;
        const trans = document.getElementById('filterTransmission').value;
        const fuel  = document.getElementById('filterFuel').value;
        const sort  = document.getElementById('sortSelect').value;

        let list = TDData.getCars().filter(car => {
            if (brand && car.brand        !== brand) return false;
            if (cat   && car.category     !== cat)   return false;
            if (trans && car.transmission !== trans)  return false;
            if (fuel  && car.fuel         !== fuel)   return false;
            return true;
        });

        if (sort === 'price-asc')  list.sort((a,b) => a.price - b.price);
        if (sort === 'price-desc') list.sort((a,b) => b.price - a.price);
        if (sort === 'name')       list.sort((a,b) => a.name.localeCompare(b.name));
        return list;
    }

    document.getElementById('filterForm').addEventListener('submit', e => { e.preventDefault(); renderCars(getFiltered()); });
    document.getElementById('sortSelect').addEventListener('change', () => renderCars(getFiltered()));

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.toString()) {
        if (urlParams.get('brand')) document.getElementById('filterMarque').value        = urlParams.get('brand');
        if (urlParams.get('trans')) document.getElementById('filterTransmission').value = urlParams.get('trans');
        if (urlParams.get('fuel'))  document.getElementById('filterFuel').value         = urlParams.get('fuel');
        renderCars(getFiltered());
    } else {
        renderCars(cars);
    }
});