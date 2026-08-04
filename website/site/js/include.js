/* ============================================================
   include.js
   Loads includes/navbar.html and includes/footer.html into every
   page, then wires up the mobile menu + active-link highlighting.

   NOTE: this uses fetch() to read local files, which browsers
   only allow over http(s) — not when a page is opened directly
   as file:///... . Run the site through a local server while
   testing (e.g. VS Code "Live Server", or `python3 -m http.server`)
   and it will work normally once uploaded to real hosting.
   ============================================================ */

(function () {

    function loadInclude(selector, url) {
        const target = document.querySelector(selector);
        if (!target) return Promise.resolve();

        return fetch(url)
            .then(res => {
                if (!res.ok) throw new Error('Failed to load ' + url);
                return res.text();
            })
            .then(html => {
                target.outerHTML = html;
            })
            .catch(err => {
                console.error(err);
                target.innerHTML = '<p style="text-align:center;padding:20px;color:#c0392b;">'
                    + 'Erreur de chargement (' + url + '). Le site doit être servi via http(s), pas ouvert directement en double-cliquant sur le fichier.'
                    + '</p>';
            });
    }

    function initMobileMenu() {
        const toggle  = document.querySelector('.nav-toggle');
        const links   = document.querySelector('.nav-links');
        const overlay = document.querySelector('.nav-overlay');
        if (!toggle || !links || !overlay) return;

        const openMenu = () => {
            toggle.classList.add('active');
            links.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        };
        const closeMenu = () => {
            toggle.classList.remove('active');
            links.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        toggle.addEventListener('click', () => {
            links.classList.contains('active') ? closeMenu() : openMenu();
        });
        overlay.addEventListener('click', closeMenu);
        links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
        window.addEventListener('resize', () => {
            if (window.innerWidth > 950) closeMenu();
        });
    }

    function initActiveLink() {
        const page = document.body.dataset.page;
        if (!page) return;
        document.querySelectorAll('.nav-links a[data-page], .footer-col a[data-page]').forEach(a => {
            if (a.dataset.page === page) a.classList.add('active');
        });
    }

    function initFooterYear() {
        const el = document.getElementById('current-year');
        if (el) el.textContent = new Date().getFullYear();
    }

    document.addEventListener('DOMContentLoaded', () => {
        Promise.all([
            loadInclude('#site-header', 'includes/navbar.html'),
            loadInclude('#site-footer', 'includes/footer.html')
        ]).then(() => {
            initMobileMenu();
            initActiveLink();
            initFooterYear();
        });
    });

})();
