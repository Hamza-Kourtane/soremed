/* =========================================================
   SOREMED — shared header behaviour (home / product / cart)
   - live product search with suggestions under the search bar
   - working nav bar (Accueil / Nouveau / Promotion) + burger side menu
   - product page filled from ?id=
   ========================================================= */
(function () {
    'use strict';

    /* ---------- product catalogue (same ids as script.js) ---------- */
    const CATALOGUE = [
        // every product has its own real photo (img/products/ = Wikimedia Commons, see img/products/CREDITS.txt)
        { id: 'P001', name: 'DOLIPRANE TABS 1000MG BT 8', short: 'DOLIPRANE TABS 1000MG', description: 'Médicament à base de paracétamol indiqué pour la douleur et la fièvre.', pph: 15.00, pv: 20.00, ref: '3400937435888', image: 'img/products/paracetamol.jpg', category: 'Douleur & fièvre', promo: 25 },
        { id: 'P002', name: 'ROC KEOPS DÉODORANT Bille 2x30ml', short: 'ROC KEOPS DÉODORANT', description: 'Désodorisant longue durée pour une protection efficace.', pph: 75.00, pv: 99.99, ref: '5060072731689', image: 'img/roc-keops-deodorant-a-bille-lot-de-2x30ml-removebg-preview.png', category: 'Hygiène', isNew: true },
        { id: 'P003', name: 'NATURACTIVE MAUX DE TÊTE FLASH BIO', short: 'NATURACTIVE MAUX DE TÊTE', description: 'Complément à base de plantes pour soulager rapidement les maux de tête.', pph: 50.00, pv: 65.00, ref: 'SRM-1003', image: 'img/7f6e526a9813f44e15aec2598d6e-removebg-preview.png', category: 'Douleur & fièvre', promo: 20 },
        { id: 'P004', name: 'LA ROCHE-POSAY ANTHELIOS UVMUNE 400 SPF50+ 50ml', short: 'ANTHELIOS SPF50+', description: 'Crème solaire hydratante très haute protection, peaux sensibles.', pph: 145.00, pv: 189.00, ref: 'SRM-1004', image: 'img/4aaa44902e1b1edaa8e82c2807e4-removebg-preview4.png', category: 'Dermo-cosmétique', isNew: true },
        { id: 'P005', name: "NATURE'S PLUS VITAMINE B1 300MG 90 cp", short: 'VITAMINE B1 300MG', description: 'Vitamine B1 à libération prolongée, soutien du système nerveux.', pph: 100.00, pv: 130.00, ref: 'SRM-1005', image: 'img/image-removebg-preview3.png', category: 'Vitamines' },
        { id: 'P006', name: 'SVR SUN SECURE BLUR SPF50+ 50ml', short: 'SVR SUN SECURE SPF50+', description: 'Crème mousse solaire effet flouteur optique, très haute protection.', pph: 120.00, pv: 159.00, ref: 'SRM-1006', image: 'img/image-removebg-preview1.png', category: 'Dermo-cosmétique', promo: 20 },
        { id: 'P007', name: 'AMOXICILLINE 500MG 12 gélules', short: 'AMOXICILLINE 500MG', description: 'Antibiotique de la famille des pénicillines. Sur ordonnance.', pph: 38.00, pv: 49.90, ref: 'SRM-1007', image: 'img/products/amoxicilline.jpg', category: 'Antibiotiques', isNew: true },
        { id: 'P008', name: 'SPASFON LYOC 80MG BT 10', short: 'SPASFON LYOC 80MG', description: 'Antispasmodique (phloroglucinol) pour les douleurs abdominales.', pph: 24.00, pv: 32.00, ref: 'SRM-1008', image: 'img/products/spasfon.jpg', category: 'Digestion' },
        { id: 'P009', name: 'DIOSMECTITE MYLAN 3G SACHETS BT 30', short: 'DIOSMECTITE MYLAN 3G', description: 'Traitement symptomatique de la diarrhée (générique de Smecta).', pph: 42.00, pv: 55.00, ref: 'SRM-1009', image: 'img/products/smecta.jpg', category: 'Digestion', promo: 15 },
        { id: 'P010', name: 'VITAMINE C 1000MG EFFERVESCENT', short: 'VITAMINE C 1000MG', description: 'Complément alimentaire contre la fatigue, comprimés effervescents.', pph: 18.50, pv: 25.00, ref: 'SRM-1010', image: 'img/products/vitamine-c.jpg', category: 'Vitamines', isNew: true },
    ];
    window.SOREMED_CATALOGUE = CATALOGUE;

    const $ = (s, el = document) => el.querySelector(s);
    const $$ = (s, el = document) => [...el.querySelectorAll(s)];
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const mad = n => 'MAD ' + Number(n).toFixed(2);
    const page = location.pathname.split('/').pop() || 'home.html';
    const isHome = page === '' || page === 'home.html' || page === 'index.html';

    /* ---------- cart (same storage key as script.js) ---------- */
    function getCart() { try { return JSON.parse(localStorage.getItem('soremedCart')) || []; } catch { return []; } }
    function addToCart(id, qty = 1) {
        const p = CATALOGUE.find(x => x.id === id);
        if (!p) return;
        const cart = getCart();
        const line = cart.find(i => i.id === id);
        if (line) line.quantity += qty;
        else cart.push({ id: p.id, name: p.name, description: p.description, price_pph: p.pph, price_pv: p.pv, ref: p.ref, image: p.image, quantity: qty });
        try { localStorage.setItem('soremedCart', JSON.stringify(cart)); } catch { /* storage unavailable */ }
        updateCartBadge();
        toast(`« ${p.name} » ajouté au panier (${qty}x)`);
    }
    function updateCartBadge() {
        const link = $('.header2 a[href$="cartpage.html"]') || $('.header2 .cart-icon');
        if (!link) return;
        const count = getCart().reduce((s, i) => s + (i.quantity || 0), 0);
        let b = $('.shop-cart-badge', link.parentElement);
        if (!b) {
            const wrap = document.createElement('span');
            wrap.className = 'shop-cart-wrap';
            link.parentNode.insertBefore(wrap, link);
            wrap.appendChild(link);
            b = document.createElement('span');
            b.className = 'shop-cart-badge';
            wrap.appendChild(b);
        }
        b.textContent = count;
        b.classList.toggle('show', count > 0);
        b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
    }

    /* ---------- toast ---------- */
    function toast(msg) {
        let zone = $('.shop-toasts');
        if (!zone) { zone = document.createElement('div'); zone.className = 'shop-toasts'; document.body.appendChild(zone); }
        const t = document.createElement('div');
        t.className = 'shop-toast';
        t.textContent = msg;
        zone.appendChild(t);
        setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, 2600);
    }

    /* =====================================================
       LIVE SEARCH
       ===================================================== */
    const input = $('#medicine-search');
    if (input) {
        const container = input.closest('.search-container');
        const box = document.createElement('div');
        box.className = 'search-results';
        box.setAttribute('role', 'listbox');
        container.appendChild(box);
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('role', 'combobox');
        input.setAttribute('aria-expanded', 'false');

        let results = [];
        let active = -1;

        const highlight = (text, q) => {
            if (!q) return esc(text);
            const i = norm(text).indexOf(norm(q));
            if (i < 0) return esc(text);
            return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
        };

        function search(q) {
            const nq = norm(q.trim());
            if (!nq) return [];
            const words = nq.split(/\s+/);
            return CATALOGUE
                .map(p => {
                    const hay = norm([p.name, p.ref, p.category, p.description].join(' '));
                    if (!words.every(w => hay.includes(w))) return null;
                    const n = norm(p.name);
                    const score = n.startsWith(nq) ? 0 : n.includes(nq) ? 1 : norm(p.ref).includes(nq) ? 2 : 3;
                    return { p, score };
                })
                .filter(Boolean)
                .sort((a, b) => a.score - b.score || a.p.name.localeCompare(b.p.name))
                .map(r => r.p);
        }

        function render() {
            const q = input.value.trim();
            results = search(q);
            active = -1;
            if (!q) { close(); return; }
            const shown = results.slice(0, 6);
            box.innerHTML = shown.length
                ? `<div class="sr-head">${results.length} produit${results.length > 1 ? 's' : ''} trouvé${results.length > 1 ? 's' : ''}</div>` +
                  shown.map((p, i) => `
                    <div class="sr-item" role="option" data-id="${p.id}" style="animation-delay:${i * 40}ms">
                        <img src="${esc(p.image)}" alt="">
                        <div class="sr-info">
                            <div class="sr-name">${highlight(p.name, q)}</div>
                            <div class="sr-meta">${esc(p.category)} · Réf. ${highlight(p.ref, q)}
                                ${p.promo ? `<span class="sr-tag promo">-${p.promo}%</span>` : ''}${p.isNew ? '<span class="sr-tag new">Nouveau</span>' : ''}</div>
                        </div>
                        <div class="sr-price">${mad(p.pv)}<small>PV</small></div>
                        <button class="sr-add" data-add="${p.id}" title="Ajouter au panier">
                            <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                        </button>
                    </div>`).join('') +
                  (results.length > 6 ? `<div class="sr-more">+ ${results.length - 6} autre(s) — affinez votre recherche</div>` : '')
                : `<div class="sr-empty"><img src="img/search.png" alt="">Aucun produit pour « ${esc(q)} »</div>`;
            open();
        }
        function open() { box.classList.add('open'); input.setAttribute('aria-expanded', 'true'); }
        function close() { box.classList.remove('open'); input.setAttribute('aria-expanded', 'false'); active = -1; }
        function setActive(i) {
            const items = $$('.sr-item', box);
            if (!items.length) return;
            active = (i + items.length) % items.length;
            items.forEach((el, k) => el.classList.toggle('active', k === active));
            items[active].scrollIntoView({ block: 'nearest' });
        }
        const goTo = id => { location.href = 'product.html?id=' + encodeURIComponent(id); };

        let timer;
        input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(render, 80); });
        input.addEventListener('focus', () => { if (input.value.trim()) render(); });
        input.addEventListener('keydown', e => {
            if (e.key === 'ArrowDown') { e.preventDefault(); if (!box.classList.contains('open')) render(); setActive(active + 1); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
            else if (e.key === 'Enter') {
                e.preventDefault();
                const pick = active >= 0 ? results[active] : results[0];
                if (pick) goTo(pick.id);
            } else if (e.key === 'Escape') { close(); input.blur(); }
        });
        box.addEventListener('mousedown', e => e.preventDefault()); // keep focus in input
        box.addEventListener('click', e => {
            const add = e.target.closest('[data-add]');
            if (add) {
                addToCart(add.dataset.add, 1);
                add.classList.remove('done'); void add.offsetWidth; add.classList.add('done');
                return;
            }
            const item = e.target.closest('.sr-item');
            if (item) goTo(item.dataset.id);
        });
        document.addEventListener('click', e => { if (!container.contains(e.target)) close(); });

        // search icon button: run / focus
        const searchBtn = $('.icon-button[title="Search"]', container);
        if (searchBtn) searchBtn.addEventListener('click', () => {
            if (input.value.trim() && results[0]) goTo(results[0].id); else input.focus();
        });

        // "/" shortcut focuses search
        document.addEventListener('keydown', e => {
            if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); input.focus(); }
        });
    }

    /* =====================================================
       NAV BAR
       ===================================================== */
    const SECTIONS = {
        accueil:   { title: 'Accueil',   filter: () => true },
        nouveau:   { title: 'Nouveau',   filter: p => p && p.isNew },
        promotion: { title: 'Promotion', filter: p => p && p.promo },
    };
    const navSpans = $$('.header2 .menu-items span');
    const keyOf = span => norm(span.textContent.trim());

    function applySection(key, scroll) {
        if (!SECTIONS[key]) key = 'accueil';
        navSpans.forEach(s => s.classList.toggle('active', keyOf(s) === key));
        $$('.side-menu a[data-section]').forEach(a => a.classList.toggle('active', a.dataset.section === key));
        if (!isHome) return;

        const h1 = $('.product-tiltel h1');
        if (h1) {
            h1.textContent = SECTIONS[key].title;
            h1.classList.remove('title-swap'); void h1.offsetWidth; h1.classList.add('title-swap');
        }
        let visible = 0;
        $$('.product-card').forEach(card => {
            const p = CATALOGUE.find(x => x.id === card.dataset.id);
            const show = SECTIONS[key].filter(p);
            card.classList.toggle('card-hidden', !show);
            if (show) {
                visible++;
                card.classList.remove('card-in'); void card.offsetWidth; card.classList.add('card-in');
                // promo badge only meaningful in promo section, keep visible otherwise
            }
        });
        let empty = $('.section-empty');
        if (!empty) {
            empty = document.createElement('p');
            empty.className = 'section-empty';
            const list = $('.product-list');
            if (list) list.parentNode.insertBefore(empty, list);
        }
        empty.textContent = visible ? '' : 'Aucun produit dans cette section pour le moment.';
        empty.style.display = visible ? 'none' : 'block';

        if (history.replaceState) history.replaceState(null, '', key === 'accueil' ? location.pathname : '#' + key);
        if (scroll) {
            const t = $('.product-tiltel');
            if (t) window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 140, behavior: 'smooth' });
        }
    }

    navSpans.forEach(span => {
        span.setAttribute('tabindex', '0');
        span.setAttribute('role', 'link');
        const go = () => {
            const key = keyOf(span);
            if (isHome) applySection(key, true);
            else location.href = 'home.html' + (key === 'accueil' ? '' : '#' + key);
        };
        span.addEventListener('click', go);
        span.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
    });

    // logo -> home
    const logo = $('.header1 > img:first-child');
    if (logo) { logo.style.cursor = 'pointer'; logo.addEventListener('click', () => { location.href = 'home.html'; }); }

    /* ---------- burger side menu ---------- */
    const burger = $('.header2 .menu-icon');
    if (burger) {
        const overlay = document.createElement('div');
        overlay.className = 'side-overlay';
        const menu = document.createElement('nav');
        menu.className = 'side-menu';
        menu.setAttribute('aria-hidden', 'true');
        const count = getCart().reduce((s, i) => s + (i.quantity || 0), 0);
        menu.innerHTML = `
            <div class="side-head">
                <img src="img/SOREMED icon.png" alt="SOREMED">
                <span>SOREMED</span>
                <button class="side-close" title="Fermer"><img src="img/close.png" alt="fermer"></button>
            </div>
            <div class="side-links">
                <a href="home.html" data-section="accueil"><img src="img/home.png" alt="">Accueil</a>
                <a href="home.html#nouveau" data-section="nouveau"><img src="img/new.png" alt="">Nouveau</a>
                <a href="home.html#promotion" data-section="promotion"><img src="img/discount-tag.png" alt="">Promotion</a>
                <div class="side-sep"></div>
                <a href="cartpage.html"><img src="img/shopping-cart.png" alt="">Mon panier <b class="side-count">${count || ''}</b></a>
                <a href="../logingform/login.html"><img src="img/user.png" alt="">Mon compte</a>
                <a href="admin.html"><img src="img/dashboard.png" alt="">Administration</a>
            </div>
            <div class="side-cats">
                <h4>Catégories</h4>
                ${[...new Set(CATALOGUE.map(p => p.category))].map(c => `<button class="side-cat" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}
            </div>`;
        document.body.append(overlay, menu);
        burger.style.cursor = 'pointer';
        burger.setAttribute('tabindex', '0');
        burger.setAttribute('role', 'button');
        burger.setAttribute('aria-label', 'Ouvrir le menu');

        const openMenu = () => { menu.classList.add('open'); overlay.classList.add('show'); burger.classList.add('spin'); menu.setAttribute('aria-hidden', 'false'); };
        const closeMenu = () => { menu.classList.remove('open'); overlay.classList.remove('show'); burger.classList.remove('spin'); menu.setAttribute('aria-hidden', 'true'); };
        burger.addEventListener('click', openMenu);
        burger.addEventListener('keydown', e => { if (e.key === 'Enter') openMenu(); });
        overlay.addEventListener('click', closeMenu);
        $('.side-close', menu).addEventListener('click', closeMenu);
        document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

        menu.addEventListener('click', e => {
            const a = e.target.closest('a[data-section]');
            if (a && isHome) { e.preventDefault(); closeMenu(); applySection(a.dataset.section, true); }
            const cat = e.target.closest('.side-cat');
            if (cat && input) {
                closeMenu();
                input.value = cat.dataset.cat;
                input.focus();
                input.dispatchEvent(new Event('input'));
            }
        });
    }

    /* ---------- home: initial section from URL hash + add-to-cart ---------- */
    if (isHome) {
        applySection(norm(location.hash.slice(1)) || 'accueil', false);
        window.addEventListener('hashchange', () => applySection(norm(location.hash.slice(1)), true));
        document.addEventListener('click', e => {
            const btn = e.target.closest('.add-to-cart');
            if (!btn) return;
            const id = btn.closest('.product-card')?.dataset.id;
            if (id) { e.stopImmediatePropagation(); addToCart(id, 1); }
        }, true);
    } else {
        navSpans.forEach(s => s.classList.remove('active'));
    }

    /* ---------- product page: fill from ?id= ---------- */
    if (page === 'product.html') {
        const id = new URLSearchParams(location.search).get('id') || 'P001';
        const p = CATALOGUE.find(x => x.id === id) || CATALOGUE[0];
        const set = (sel, html) => { const el = $(sel); if (el) el.innerHTML = html; };
        document.title = 'SOREMED - ' + p.name;
        set('#product-title', esc(p.name));
        set('#product-description', esc(p.description));
        set('#product-price-pph', `${mad(p.pph)} PPH`);
        set('#product-price-pv', `${mad(p.pv)} <span class="price-pv">PV</span>`);
        set('#product-ref', `Réf : ${esc(p.ref)}`);
        set('#product-breadcrumb', esc(p.name));
        const img = $('#product-main-image');
        if (img) { img.src = p.image; img.alt = p.name; }

        let qty = 1;
        const qv = $('#quantityValue');
        $('#decreaseBtn')?.addEventListener('click', () => { if (qty > 1) qv.textContent = --qty; });
        $('#increaseBtn')?.addEventListener('click', () => { qv.textContent = ++qty; });
        $('#detail-add-to-cart-btn')?.addEventListener('click', () => addToCart(p.id, qty));

        renderSimilar(p);
    }

    /* ---------- "Produits Similaires" carousel ---------- */
    function getFavs() { try { return JSON.parse(localStorage.getItem('soremedFavs')) || []; } catch { return []; } }
    function setFavs(f) { try { localStorage.setItem('soremedFavs', JSON.stringify(f)); } catch { /* ignore */ } }

    function renderSimilar(p) {
        const sim = $('.similar-section');
        if (!sim || $('.sim-carousel', sim)) return;
        // same category first, then closest price
        const others = CATALOGUE.filter(x => x.id !== p.id)
            .map(x => ({ x, s: (x.category === p.category ? 0 : 1000) + Math.abs(x.pv - p.pv) }))
            .sort((a, b) => a.s - b.s).map(r => r.x);
        const favs = getFavs();

        const head = document.createElement('p');
        head.className = 'sim-sub';
        const same = others.filter(o => o.category === p.category).length;
        head.innerHTML = same
            ? `${same} produit${same > 1 ? 's' : ''} de la catégorie <b>${esc(p.category)}</b>, puis d'autres produits qui pourraient vous intéresser`
            : `D'autres produits qui pourraient vous intéresser`;

        const wrap = document.createElement('div');
        wrap.className = 'sim-carousel';
        wrap.innerHTML = `
            <button class="sim-arrow prev" aria-label="Précédent"><svg viewBox="0 0 24 24"><path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg></button>
            <div class="sim-track">
                ${others.map((o, i) => `
                <article class="sim-card" data-id="${o.id}" style="animation-delay:${i * 60}ms">
                    <div class="sim-img">
                        ${o.promo ? `<span class="sim-tag promo">-${o.promo}%</span>` : ''}${o.isNew ? '<span class="sim-tag new">Nouveau</span>' : ''}
                        <button class="sim-fav ${favs.includes(o.id) ? 'on' : ''}" data-fav="${o.id}" title="Favori">
                            <svg viewBox="0 0 24 24"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                        </button>
                        <a href="product.html?id=${o.id}"><img src="${esc(o.image)}" alt="${esc(o.name)}" loading="lazy"></a>
                    </div>
                    <div class="sim-body">
                        <span class="sim-cat">${esc(o.category)}</span>
                        <a class="sim-name" href="product.html?id=${o.id}">${esc(o.name)}</a>
                        <div class="sim-prices">
                            <span class="sim-pv">${mad(o.pv)} <small>PV</small></span>
                            <span class="sim-pph">${mad(o.pph)} PPH</span>
                        </div>
                        <button class="sim-add" data-add="${o.id}">
                            <svg viewBox="0 0 24 24"><path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                            <span>Ajouter au panier</span>
                        </button>
                    </div>
                </article>`).join('')}
            </div>
            <button class="sim-arrow next" aria-label="Suivant"><svg viewBox="0 0 24 24"><path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg></button>
            <div class="sim-dots"></div>`;
        sim.append(head, wrap);

        const track = $('.sim-track', wrap);
        const dots = $('.sim-dots', wrap);
        const step = () => ($('.sim-card', track)?.offsetWidth || 240) + 18;
        const pages = () => Math.max(1, Math.ceil((track.scrollWidth - track.clientWidth) / step()) + 1);
        function update() {
            const n = pages();
            const cur = Math.round(track.scrollLeft / step());
            if (dots.children.length !== n) dots.innerHTML = Array.from({ length: n }, (_, i) => `<button data-page="${i}" aria-label="Page ${i + 1}"></button>`).join('');
            [...dots.children].forEach((d, i) => d.classList.toggle('on', i === Math.min(cur, n - 1)));
            $('.prev', wrap).disabled = track.scrollLeft <= 8;
            $('.next', wrap).disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 8;
            dots.style.display = n > 1 ? '' : 'none';
        }
        $('.prev', wrap).addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
        $('.next', wrap).addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
        dots.addEventListener('click', e => {
            const d = e.target.closest('[data-page]');
            if (d) track.scrollTo({ left: +d.dataset.page * step(), behavior: 'smooth' });
        });
        track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
        window.addEventListener('resize', update);
        update();

        // drag to scroll with the mouse
        let down = false, startX = 0, startLeft = 0, moved = false;
        track.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft; });
        window.addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - startX; if (Math.abs(dx) > 5) { moved = true; track.classList.add('dragging'); } track.scrollLeft = startLeft - dx; });
        window.addEventListener('pointerup', () => { down = false; track.classList.remove('dragging'); });
        track.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
        track.addEventListener('dragstart', e => e.preventDefault());

        wrap.addEventListener('click', e => {
            const add = e.target.closest('[data-add]');
            if (add) {
                addToCart(add.dataset.add, 1);
                add.classList.add('added');
                $('span', add).textContent = 'Ajouté ✓';
                setTimeout(() => { add.classList.remove('added'); $('span', add).textContent = 'Ajouter au panier'; }, 1600);
            }
            const fav = e.target.closest('[data-fav]');
            if (fav) {
                let f = getFavs();
                const on = !f.includes(fav.dataset.fav);
                f = on ? [...f, fav.dataset.fav] : f.filter(x => x !== fav.dataset.fav);
                setFavs(f);
                fav.classList.toggle('on', on);
                fav.classList.remove('pop'); void fav.offsetWidth; fav.classList.add('pop');
                toast(on ? 'Ajouté aux favoris' : 'Retiré des favoris');
            }
        });
    }

    updateCartBadge();
})();
