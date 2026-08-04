/* ================================================================
   data.js — shared data layer
   Tous pages read/write through window.TDData
================================================================ */

/* ── DATA VERSION ──────────────────────────────────────────────
   The site stores cars/slides/reviews in the browser's localStorage
   so admin edits made through admin.html persist across visits.
   That's why editing the arrays below directly did NOT show up:
   once localStorage has data saved in it, it always wins over these
   defaults.

   Fix: bump the number below (e.g. "1" -> "2") every time you hand
   -edit the default data in this file. On next page load, the code
   will notice the version changed and clear the old cached data so
   your new defaults show up again (any admin-panel edits made after
   that point will keep working normally, as before).
================================================================ */
const _DATA_VERSION = "4";

(function _syncDataVersion() {
    try {
        const stored = localStorage.getItem('td_data_version');
        if (stored !== _DATA_VERSION) {
            localStorage.removeItem('td_cars');
            localStorage.removeItem('td_slides');
            localStorage.removeItem('td_reviews');
            localStorage.setItem('td_data_version', _DATA_VERSION);
        }
    } catch (e) { /* ignore (e.g. privacy mode) */ }
})();

const _DEFAULT_CARS = [
    { id:1,  name:"Renault Clio",           brand:"Renault",         category:"Citadine",     transmission:"Automatique", fuel:"Diesel",  seats:5, doors:4, price:45, year:2022, engine:"1.5L", color:"Gris",  luggage:"2 Grandes", hasAC:true, hasGPS:true, description:"La Renault Clio 5 allie polyvalence, sobriété et confort moderne. Idéale pour les trajets urbains comme pour les longues distances grâce à sa motorisation économe et son habitacle connecté..", features:["Bluetooth","Tousoy Wheels","Régulateur de Vitesse","Climatisation Multi-zones","Capteurs de Stationnement","Électrique Places","Démarrage Sans Clé","USB / AUX"], images:["img/fleet/renault clio 1/img1.png","img/fleet/renault clio 1/img2.png","img/fleet/renault clio 1/img3.png","img/fleet/renault clio 1/img4.png"] },
    { id:2,  name:"Peugeot 208",   brand:"Peugeot",    category:"Citadine",     transmission:"Automatique", fuel:"Diesel",  seats:5, doors:4, price:40, year:2022, engine:"2.0L", color:"Gris",  luggage:"2 Grandes", hasAC:true, hasGPS:true, description:"La Peugeot 208 séduit par son design dynamique et son poste de conduite innovant PEUGEOT i-Cockpit®. Moderne, agile et très économique, cette citadine offre une conduite fluide et réactive, idéale aussi bien pour les trajets urbains quotidiens que pour les escapades sur autoroute.", features:["Bluetooth","Toit Ouvrant","Aide au Maintien de Voie","Capteurs de Stationnement","Heated Places","USB / AUX","Phares LED","Régulateur de Vitesse"], images:["img/fleet/peugeot 208 1/img1.png","img/fleet/peugeot 208 1/img2.png","img/fleet/peugeot 208 1/img3.png","img/fleet/peugeot 208 1/img4.png"] },
    { id:3,  name:"Renault Clio", brand:"Renault", category:"Citadine",       transmission:"Automatique", fuel:"Diesel",  seats:5, doors:4, price:45, year:2023, engine:"2.0L", color:"bleue",  luggage:"3 Grandes", hasAC:true, hasGPS:true, description:"Moderne, fluide et agréablement réactive, la Renault Clio en boîte automatique offre un confort de conduite exceptionnel en milieu urbain comme sur autoroute. Équipée d'une transmission automatique de dernière génération, elle assure des passages de vitesses doux et une gestion optimale de la consommation, pour des trajets sans effort et en toute sérénité.", features:["Bluetooth","4x4","Toit Ouvrant","Heated Places","Navigation GPS","Capteurs de Stationnement","Apple CarPlay","Régulateur de Vitesse"], images:["img/fleet/renault clio 2/img1.png","img/fleet/renault clio 2/img2.png","img/fleet/renault clio 2/img3.png","img/fleet/renault clio 2/img4.png"] },
    { id:4,  name:"Peugeot 208",       brand:"Peugeot",       category:"Citadine",       transmission:"Manuelle",    fuel:"Diesel",  seats:5, doors:4, price:40, year:2021, engine:"1.5L", color:"Grise",   luggage:"2 Grandes", hasAC:true, hasGPS:false, description:"Avec son moteur 1.5L BlueHDi particulièrement économe, la Peugeot 208 diesel combine autonomie exceptionnelle et faibles coûts d'utilisation. Son design affûté et son poste de conduite connecté i-Cockpit® en font une citadine idéale pour les conducteurs effectuant de grands trajets quotidiens.", features:["Bluetooth","USB / AUX","Barres de Toit","Contrôle de Descente","Caméra de Recul"], images:["img/fleet/peugeot 208 2/img1.png","img/fleet/peugeot 208 2/img2.png","img/fleet/peugeot 208 2/img3.png","img/fleet/peugeot 208 2/img4.png"] },
    { id:5,  name:"Hyundia Accent",             brand:"Hyundai",         category:"Berline",       transmission:"Automatique", fuel:"Diesel",  seats:5, doors:4, price:50, year:2022, engine:"2.0L", color:"Noire",  luggage:"3 Grandes", hasAC:true, hasGPS:true, description:"Fiable, spacieuse et très économe, la Hyundai Accent en boîte automatique et motorisation diesel est une berline compacte idéale pour les longs trajets comme pour la ville. Grâce à son moteur CRDi offrant un excellent couple et une faible consommation, elle assure une conduite fluide, confortable et particulièrement économique.", features:["Bluetooth","Tousoy Wheels","Toit Panoramique","Heated Places","Capteurs de Stationnement","USB / AUX","Régulateur de Vitesse","4x4"], images:["img/fleet/Hyundai accent/img1.png","img/fleet/Hyundai accent/img2.png","img/fleet/Hyundai accent/img3.png","img/fleet/Hyundai accent/img4.png"] },
    { id:6,  name:"Dacia Duster",   brand:"Dacia",    category:"SUV",    transmission:"Automatique", fuel:"Diesel",  seats:5, doors:4, price:60, year:2023, engine:"2.0L", color:"Vert", luggage:"2 Grandes", hasAC:true, hasGPS:true, description:"Robuste, polyvalent et particulièrement économique, le Dacia Duster en boîte automatique et motorisation diesel est le SUV idéal pour la ville comme pour les longues distances. Associant un moteur 1.5 dCi éprouvé à une transmission automatique fluide, il offre un confort de conduite optimal, un espace intérieur généreux et un grand coffre pour tous vos trajets.", features:["Bluetooth","Massage Places","Éclairage Ambiant","Aide à la Conduite","Toit Panoramique","Son Burmester","Apple CarPlay","Régulateur de Vitesse"], images:["img/fleet/dacia duster/img1.png","img/fleet/dacia duster/img2.png","img/fleet/dacia duster/img3.png","img/fleet/dacia duster/img4.png"] },
    { id:7,  name:"Citroën C3",            brand:"Citroën",        category:"Citadine",     transmission:"Automatique", fuel:"Diesel",  seats:5, doors:4, price:40, year:2022, engine:"2.0L", color:"Sable",   luggage:"2 Grandes", hasAC:true, hasGPS:true, description:"Axée sur le confort et la polyvalence, la Citroën C3 se distingue par son design original et ses suspensions à butées hydrauliques offrant une conduite ultra-douce. Économe et pratique, cette citadine est idéale pour se faufiler en ville tout en assurant un excellent niveau de confort sur les longs trajets.", features:["Bluetooth","Cockpit Virtuel","Quattro AWD","Heated Places","Capteurs de Stationnement","USB / AUX","Phares LED Matrix","Régulateur de Vitesse"], images:["img/fleet/citroen c3/img1.png","img/fleet/citroen c3/img2.png","img/fleet/citroen c3/img3.png","img/fleet/citroen c3/img4.png"] },
    { id:8,  name:"Citroën C-Élysée",  brand:"Citroën",  category:"Berline",       transmission:"Automatique", fuel:"Diesel",  seats:5, doors:4, price:40, year:2022, engine:"2.0L", color:"Gris",  luggage:"3 Grandes", hasAC:true, hasGPS:true, description:"Spacieuse, robuste et particulièrement économique, la Citroën C-Élysée est une berline tricorps conçue pour les grands trajets et l'usage quotidien. Dotée d'une excellente habitabilité à l'arrière et d'un coffre généreux, elle offre un confort de roulement remarquable et une sobriété exemplaire pour voyager en toute sérénité.", features:["Bluetooth","Apple CarPlay","Capteurs de Stationnement","Heated Places","USB / AUX","Régulateur de Vitesse","Phares LED","Barres de Toit"], images:["img/fleet/citroen c-elysee/img1.png","img/fleet/citroen c-elysee/img2.png","img/fleet/citroen c-elysee/img3.png"] },
    { id:9,  name:"Renault Clio",  brand:"Renault",  category:"Citadine",       transmission:"Manuelle", fuel:"Diesel",  seats:5, doors:4, price:40, year:2022, engine:"2.0L", color:"Gris",  luggage:"3 Grandes", hasAC:true, hasGPS:true, description:"Référence incontournable de sa catégorie, la Renault Clio allie design dynamique, technologie intuitive et confort supérieur. Équipée d'aides à la conduite modernes et d'un grand coffre, elle offre une expérience fluide aussi bien sur les trajets urbains que sur autoroute..", features:["Bluetooth","Apple CarPlay","Capteurs de Stationnement","Heated Places","USB / AUX","Régulateur de Vitesse","Phares LED","Barres de Toit"], images:["img/fleet/renault clio 3/img1.png","img/fleet/renault clio 3/img2.png","img/fleet/renault clio 3/img3.png", "img/fleet/renault clio 3/img4.png"] },
   ];

const _DEFAULT_SLIDES = [
    { img:"img/img1.jpg", badge:"🔥 OFFRE SPÉCIALE",     title:"Conduisez Luxe<br>Pour Moins",    subtitle:"Voitures premium. Meilleurs prix.<br>Voyages inoubliables.", btn:"Réserver sur WhatsApp" },
    { img:"img/img2.jpg", badge:"SÉLECTION PREMIUM",     title:"Explorez le Maroc",              subtitle:"Voitures confortables pour chaque aventure.",                   btn:"Réserver Maintenant" },
    { img:"img/img3.png", badge:"MEILLEUR PRIX",       title:"Le Luxe Commence Ici",           subtitle:"Conduisez des véhicules premium à des prix abordables.",          btn:"Contactez-nous" }
];

const _DEFAULT_REVIEWS = [
    { id:1, name:"Mariem", location:"Maroc", text:"Je recommande vivement cette agence. J'ai déjà loué une voiture chez eux et l'expérience a été excellente. Le propriétaire était très réactif et le service était parfait.", stars:5 },
    { id:2, name:"Asonion ",  location:"Espagne",     text:"Excellent service, personnel très poli et serviable, et tout a été réalisé dans les temps. Je recommande vivement !", stars:5 },
    { id:3, name:"Andrea", location:"Espagne",      text:"Excellent ! Nous sommes arrivés à l'aéroport de Tétouan et nous les avons contactés, et dès le premier instant, ils ont été extrêmement professionnels et sympas. Nous avons vraiment apprécié la voiture. Je recommande vivement et je suis très reconnaissant !", stars:5 },
    { id:4, name:"Badr eddine",  location:"Maroc",    text:"Je tiens à exprimer toute ma gratitude à Amro et Omar pour leur excellent service et leur ponctualité. Ce fut un réel plaisir de faire appel à leurs services. Je recommande vivement !", stars:5 },
    { id:5, name:"Thomas",  location:" France",    text:"J'ai réservé une voiture chez Amr & Omar Car. C'était notre première expérience avec eux. Ce fut une excellente expérience et je les recommande à tous, car ils offrent un excellent service et leurs voitures sont excellentes.", stars:5 }
];

window.TDData = {

    getCars() {
        try { const s = localStorage.getItem('td_cars'); return s ? JSON.parse(s) : JSON.parse(JSON.stringify(_DEFAULT_CARS)); }
        catch(e) { return JSON.parse(JSON.stringify(_DEFAULT_CARS)); }
    },

    saveCars(cars) {
        // Safety net: never let two cars share an id (last one wins),
        // and never store a car with no id — that's what causes every
        // "View Details" link to quietly land on the wrong car.
        const seen = new Map();
        cars.forEach(c => { if (c && c.id !== undefined && c.id !== null && c.id !== '') seen.set(String(c.id), c); });
        localStorage.setItem('td_cars', JSON.stringify(Array.from(seen.values())));
    },

    getCarById(id) { return this.getCars().find(c => String(c.id) === String(id)) || null; },

    saveCar(car) {
        const cars = this.getCars();
        if (car.id === undefined || car.id === null || car.id === '') car.id = this.nextId();
        const idx  = cars.findIndex(c => String(c.id) === String(car.id));
        if (idx > -1) cars[idx] = car; else cars.push(car);
        this.saveCars(cars);
    },

    deleteCar(id) { this.saveCars(this.getCars().filter(c => String(c.id) !== String(id))); },

    nextId() { const cars = this.getCars(); return cars.length ? Math.max(...cars.map(c=>c.id)) + 1 : 1; },

    /* ── Distinct values actually present in the fleet ──
       Used to build the search filters (home + fleet pages) and the
       admin brand/category suggestions, so only real values show up. */
    getBrands() {
        return [...new Set(this.getCars().map(c => c.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'));
    },

    getCategories() {
        return [...new Set(this.getCars().map(c => c.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'));
    },

    /* Refill a <select>'s options from a list of values, keeping its
       currently selected value if that value still exists. */
    populateSelect(select, values, allLabel) {
        if (!select) return;
        const current = select.value;
        select.innerHTML = `<option value="">${allLabel}</option>` +
            values.map(v => `<option value="${v}">${v}</option>`).join('');
        if (values.includes(current)) select.value = current;
    },

    getSlides() {
        try { const s = localStorage.getItem('td_slides'); return s ? JSON.parse(s) : JSON.parse(JSON.stringify(_DEFAULT_SLIDES)); }
        catch(e) { return JSON.parse(JSON.stringify(_DEFAULT_SLIDES)); }
    },

    saveSlides(slides) { localStorage.setItem('td_slides', JSON.stringify(slides)); },

    getReviews() {
        try { const s = localStorage.getItem('td_reviews'); return s ? JSON.parse(s) : JSON.parse(JSON.stringify(_DEFAULT_REVIEWS)); }
        catch(e) { return JSON.parse(JSON.stringify(_DEFAULT_REVIEWS)); }
    },

    saveReviews(reviews) { localStorage.setItem('td_reviews', JSON.stringify(reviews)); },

    saveReview(review) {
        const reviews = this.getReviews();
        const idx = reviews.findIndex(r => r.id === review.id);
        if (idx > -1) reviews[idx] = review; else reviews.push(review);
        this.saveReviews(reviews);
    },

    deleteReview(id) { this.saveReviews(this.getReviews().filter(r => r.id !== id)); },

    nextReviewId() { const r = this.getReviews(); return r.length ? Math.max(...r.map(x=>x.id)) + 1 : 1; },

    compressImage(file, maxW = 900, q = 0.78) {
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = e => {
                const img = new Image();
                img.onload = () => {
                    const scale = Math.min(1, maxW / img.width);
                    const c = document.createElement('canvas');
                    c.width  = img.width  * scale;
                    c.height = img.height * scale;
                    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
                    resolve(c.toDataURL('image/jpeg', q));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
};