/* =========================================================
   SOREMED — Admin dashboard logic
   Orders are stored in localStorage ("soremedOrders").
   Orders placed from the cart page (cart.js) land here too.
   ========================================================= */

const ORDERS_KEY = 'soremedOrders';

const STATUS = {
    pending:   { label: 'En attente',     next: 'preparing', action: 'Préparer' },
    preparing: { label: 'En préparation', next: 'shipped',   action: 'Expédier' },
    shipped:   { label: 'Expédiée',       next: 'delivered', action: 'Marquer livrée' },
    delivered: { label: 'Livrée',         next: null },
    cancelled: { label: 'Annulée',        next: null },
};
const FLOW = ['pending', 'preparing', 'shipped', 'delivered'];

const SOURCES = {
    'Site web':           '#3EB596',
    'Application mobile': '#FEBA17',
    'Commercial terrain': '#3b82c4',
    'Téléphone':          '#f08c2e',
};

const CITIES = {
    'Casablanca': [33.5731, -7.5898], 'Rabat': [34.0209, -6.8416], 'Marrakech': [31.6295, -7.9811],
    'Fès': [34.0181, -5.0078], 'Tanger': [35.7595, -5.8340], 'Agadir': [30.4278, -9.5981],
    'Meknès': [33.8935, -5.5473], 'Oujda': [34.6814, -1.9086], 'Kénitra': [34.2610, -6.5802],
    'Tétouan': [35.5889, -5.3626], 'El Jadida': [33.2316, -8.5007], 'Laâyoune': [27.1253, -13.1625],
    'Béni Mellal': [32.3373, -6.3498], 'Nador': [35.1681, -2.9335], 'Safi': [32.2994, -9.2372],
};

const PRODUCTS = [
    { id: 'P001', name: 'DOLIPRANE TABS 1000MG BT 8', pph: 15.00, pv: 20.00 },
    { id: 'P002', name: 'ROC KEOPS DÉODORANT Bille 2x30ml', pph: 75.00, pv: 99.99 },
    { id: 'P003', name: 'Produit Tiers 3 (Générique)', pph: 50.00, pv: 65.00 },
    { id: 'P004', name: 'Produit Tiers 4 (Générique)', pph: 22.50, pv: 30.00 },
    { id: 'P005', name: 'Produit Tiers 5 (Générique)', pph: 100.00, pv: 130.00 },
    { id: 'P006', name: 'Produit Tiers 6 (Générique)', pph: 5.00, pv: 7.50 },
];

const PHARMACIES = ['Pharmacie Al Amal', 'Pharmacie Centrale', 'Pharmacie Ibn Sina', 'Pharmacie du Port',
    'Pharmacie Atlas', 'Pharmacie Al Majd', 'Pharmacie Hassan II', 'Pharmacie La Gare', 'Pharmacie Annakhil',
    'Pharmacie Les Orangers', 'Pharmacie Al Wifaq', 'Pharmacie Riad', 'Pharmacie Zerktouni', 'Pharmacie Agdal'];
const DOCTORS = ['Dr. Benali', 'Dr. El Idrissi', 'Dr. Alaoui', 'Dr. Tazi', 'Dr. Bennani', 'Dr. Chraibi', 'Dr. Lahlou', 'Dr. Ouazzani'];
const STREETS = ['Bd Mohammed V', 'Av. Hassan II', 'Rue Ibn Battouta', 'Bd Zerktouni', 'Av. des FAR', 'Rue Allal Ben Abdellah'];

/* ---------- helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const mad = n => 'MAD ' + Number(n).toLocaleString('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const totalPPH = o => o.items.reduce((s, i) => s + i.pph * i.qty, 0);
const totalPV = o => o.items.reduce((s, i) => s + i.pv * i.qty, 0);
const fmtDate = iso => new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
function timeAgo(iso) {
    const m = Math.round((Date.now() - new Date(iso)) / 60000);
    if (m < 1) return "à l'instant";
    if (m < 60) return `il y a ${m} min`;
    const h = Math.round(m / 60);
    if (h < 24) return `il y a ${h} h`;
    return `il y a ${Math.round(h / 24)} j`;
}
const PIN_SVG = '<svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>';

/* ---------- storage ---------- */
function loadOrders() {
    try { return JSON.parse(localStorage.getItem(ORDERS_KEY)) || null; } catch { return null; }
}
function saveOrders() {
    try { localStorage.setItem(ORDERS_KEY, JSON.stringify(orders)); } catch { /* storage unavailable */ }
}

let seq = 1000;
function makeOrder({ minutesAgo = 0, status = 'pending', city } = {}) {
    city = city || pick(Object.keys(CITIES));
    const [lat, lng] = CITIES[city];
    const items = [];
    const n = 1 + Math.floor(Math.random() * 3);
    const pool = [...PRODUCTS].sort(() => Math.random() - .5).slice(0, n);
    pool.forEach(p => items.push({ id: p.id, name: p.name, pph: p.pph, pv: p.pv, qty: 1 + Math.floor(Math.random() * 12) }));
    seq++;
    return {
        id: 'CMD-' + seq,
        client: pick(PHARMACIES),
        contact: pick(DOCTORS),
        phone: '+212 6' + Math.floor(10000000 + Math.random() * 89999999),
        city,
        address: `${Math.floor(1 + Math.random() * 200)}, ${pick(STREETS)}, ${city}`,
        lat: lat + (Math.random() - .5) * .06,
        lng: lng + (Math.random() - .5) * .06,
        source: pick(Object.keys(SOURCES)),
        date: new Date(Date.now() - minutesAgo * 60000).toISOString(),
        status,
        items,
    };
}

function seedOrders() {
    const statuses = ['delivered', 'delivered', 'delivered', 'shipped', 'shipped', 'preparing', 'pending', 'cancelled'];
    const list = [];
    for (let i = 0; i < 26; i++) {
        const minutesAgo = Math.floor(Math.pow(Math.random(), 1.6) * 60 * 24 * 40);
        let status = pick(statuses);
        if (minutesAgo < 180) status = pick(['pending', 'pending', 'preparing']);
        list.push(makeOrder({ minutesAgo, status }));
    }
    return list;
}

let orders = loadOrders() || [];
seq = Math.max(seq, ...orders.map(o => parseInt(String(o.id).replace(/\D/g, ''), 10) || 0));
// demo data is added once (even if real cart orders already exist)
let demoSeeded = false;
try { demoSeeded = localStorage.getItem('soremedDemoSeeded') === '1'; } catch { /* ignore */ }
if (!demoSeeded) {
    orders = orders.concat(seedOrders());
    saveOrders();
    try { localStorage.setItem('soremedDemoSeeded', '1'); } catch { /* ignore */ }
}

/* ---------- state ---------- */
const state = { days: 30, status: 'all', city: '', q: '', sort: 'date', dir: 'desc', heat: false };
let seenIds = new Set(orders.map(o => o.id));
let unseen = 0;

function inPeriod(o) {
    if (!state.days) return true;
    return Date.now() - new Date(o.date) <= state.days * 86400000;
}
function periodOrders() { return orders.filter(inPeriod); }
function filteredOrders() {
    const q = state.q.trim().toLowerCase();
    return periodOrders().filter(o =>
        (state.status === 'all' || o.status === state.status) &&
        (!state.city || o.city === state.city) &&
        (!q || [o.id, o.client, o.contact, o.city, o.address, o.source].join(' ').toLowerCase().includes(q))
    ).sort((a, b) => {
        const key = { total: totalPPH, date: o => new Date(o.date).getTime(), status: o => FLOW.indexOf(o.status) }[state.sort];
        const va = key ? key(a) : String(a[state.sort]).toLowerCase();
        const vb = key ? key(b) : String(b[state.sort]).toLowerCase();
        return (va > vb ? 1 : va < vb ? -1 : 0) * (state.dir === 'asc' ? 1 : -1);
    });
}

/* ---------- animated counters ---------- */
function countTo(el, value, format = v => Math.round(v)) {
    const from = el._v || 0;
    el._v = value;
    const start = performance.now(), dur = 900;
    const tick = now => {
        const t = Math.max(0, Math.min(1, (now - start) / dur));
        const e = 1 - Math.pow(1 - t, 3);
        el.textContent = format(from + (value - from) * e);
        if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}

/* ---------- render: stats ---------- */
function renderStats() {
    const list = periodOrders();
    const valid = list.filter(o => o.status !== 'cancelled');
    const revenue = valid.reduce((s, o) => s + totalPPH(o), 0);
    const cities = new Set(list.map(o => o.city));

    countTo($('#stat-orders'), list.length);
    countTo($('#stat-revenue'), revenue, v => 'MAD ' + Math.round(v).toLocaleString('fr-FR'));
    countTo($('#stat-pending'), list.filter(o => o.status === 'pending').length);
    countTo($('#stat-cities'), cities.size);

    const today = orders.filter(o => Date.now() - new Date(o.date) < 86400000).length;
    $('#stat-orders-sub').textContent = `${today} dans les dernières 24 h`;
    $('#stat-revenue-sub').textContent = valid.length ? `Panier moyen ${mad(revenue / valid.length)}` : '—';
    const top = topCities(list)[0];
    $('#stat-cities-sub').textContent = top ? `Top : ${top[0]}` : '—';
}
function topCities(list) {
    const m = {};
    list.forEach(o => { m[o.city] = (m[o.city] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
}

/* ---------- render: city bars ---------- */
function renderCityBars() {
    const rows = topCities(periodOrders()).slice(0, 7);
    const max = rows[0]?.[1] || 1;
    const box = $('#city-bars');
    box.innerHTML = rows.map(([c, n]) => `
        <div class="bar-row ${state.city === c ? 'active' : ''}" data-city="${esc(c)}" title="Filtrer sur ${esc(c)}">
            <span class="name">${esc(c)}</span>
            <div class="bar-track"><div class="bar-fill" data-w="${(n / max) * 100}"></div></div>
            <span class="count">${n}</span>
        </div>`).join('') || '<p class="muted">Aucune donnée</p>';
    requestAnimationFrame(() => requestAnimationFrame(() =>
        $$('.bar-fill', box).forEach(b => { b.style.width = b.dataset.w + '%'; })));
}

/* ---------- render: source donut ---------- */
function renderDonut() {
    const list = periodOrders();
    const counts = {};
    list.forEach(o => { counts[o.source] = (counts[o.source] || 0) + 1; });
    let acc = 0;
    const total = list.length || 1;
    const stops = Object.keys(SOURCES).map(s => {
        const from = acc; acc += (counts[s] || 0) / total * 360;
        return `${SOURCES[s]} ${from}deg ${acc}deg`;
    });
    const d = $('#source-donut');
    d.style.background = list.length ? `conic-gradient(${stops.join(',')})` : '#eee';
    d.style.animation = 'none'; void d.offsetWidth; d.style.animation = '';
    countTo($('#donut-center'), list.length);
    $('#source-legend').innerHTML = Object.keys(SOURCES).map(s =>
        `<li><i style="background:${SOURCES[s]}"></i>${s}<b>${counts[s] || 0}</b></li>`).join('');
}

/* ---------- render: tabs & table ---------- */
function renderTabs() {
    const base = periodOrders().filter(o => !state.city || o.city === state.city);
    $$('#status-tabs .tab').forEach(t => {
        const s = t.dataset.status;
        $('b', t).textContent = s === 'all' ? base.length : base.filter(o => o.status === s).length;
        t.classList.toggle('active', s === state.status);
    });
}

function renderCityFilter() {
    const sel = $('#city-filter');
    const cities = [...new Set(orders.map(o => o.city))].sort();
    sel.innerHTML = '<option value="">Toutes les villes</option>' +
        cities.map(c => `<option ${c === state.city ? 'selected' : ''}>${esc(c)}</option>`).join('');
}

function renderTable(flashId) {
    const list = filteredOrders();
    $('#orders-body').innerHTML = list.map((o, i) => {
        const st = STATUS[o.status] || STATUS.pending;
        return `
        <tr class="s-${o.status} ${o.id === flashId ? 'flash' : ''}" data-id="${esc(o.id)}" style="animation-delay:${Math.min(i, 15) * 35}ms">
            <td>${esc(o.id)}</td>
            <td><div class="client-name">${esc(o.client)}</div><div class="sub">${esc(o.contact)}</div></td>
            <td><span class="loc">${PIN_SVG}<span>${esc(o.city)}<div class="sub">${esc(o.address)}</div></span></span></td>
            <td><span class="source-pill" style="background:${SOURCES[o.source] || '#3EB596'}22">${esc(o.source)}</span></td>
            <td>${fmtDate(o.date)}<div class="sub">${timeAgo(o.date)}</div></td>
            <td><b>${mad(totalPPH(o))}</b><div class="sub">${o.items.reduce((s, i) => s + i.qty, 0)} articles</div></td>
            <td><span class="status s-${o.status}">${st.label}</span></td>
            <td>
                <span class="row-actions">
                    <button class="icon-btn" data-act="locate" title="Voir sur la carte">${PIN_SVG}</button>
                    ${st.next ? `<button class="icon-btn next" data-act="advance" title="${st.action}"><svg viewBox="0 0 24 24"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></button>` : ''}
                    <button class="icon-btn" data-act="open" title="Détails"><svg viewBox="0 0 24 24"><path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg></button>
                </span>
            </td>
        </tr>`;
    }).join('');
    $('#empty-state').classList.toggle('show', !list.length);
    $$('.orders-table th').forEach(th => {
        th.classList.remove('asc', 'desc');
        if (th.dataset.sort === state.sort) th.classList.add(state.dir);
    });
}

/* ---------- map ---------- */
let map, markerLayer, heatLayer, miniMap, miniMarker;
const markers = {};

function initMap() {
    if (typeof L === 'undefined') {
        $('#map').innerHTML = '<div class="map-fallback">Carte indisponible (pas de connexion internet).<br>Les localisations restent visibles dans le tableau.</div>';
        return;
    }
    map = L.map('map', { zoomControl: true, scrollWheelZoom: false }).setView([31.8, -7.1], 5.4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18, attribution: '&copy; OpenStreetMap',
    }).addTo(map);
    markerLayer = L.layerGroup().addTo(map);
    heatLayer = L.layerGroup();
    map.on('click', () => map.scrollWheelZoom.enable());
    map.on('popupopen', e => {
        const btn = e.popup.getElement()?.querySelector('button[data-open]');
        if (btn) btn.onclick = () => openDrawer(btn.dataset.open);
    });
}

function renderMap() {
    if (!map) return;
    markerLayer.clearLayers();
    heatLayer.clearLayers();
    for (const k in markers) delete markers[k];
    const list = filteredOrders();
    list.forEach(o => {
        const icon = L.divIcon({ className: '', html: `<div class="pin s-${o.status}"><b></b></div>`, iconSize: [18, 18], iconAnchor: [9, 9] });
        const m = L.marker([o.lat, o.lng], { icon }).addTo(markerLayer);
        m.bindPopup(`<div class="popup">
            <b>${esc(o.client)}</b><br>
            <span class="muted">${esc(o.id)} · ${esc(o.city)} · ${esc(o.source)}</span><br>
            ${mad(totalPPH(o))} — <span class="status s-${o.status}">${STATUS[o.status].label}</span>
            <button data-open="${esc(o.id)}">Voir la commande</button></div>`);
        markers[o.id] = m;
    });
    // volume circles per city
    topCities(list).forEach(([c, n]) => {
        const pts = list.filter(o => o.city === c);
        const total = pts.reduce((s, o) => s + totalPPH(o), 0);
        L.circle(CITIES[c] || [pts[0].lat, pts[0].lng], {
            radius: 9000 + n * 7000, color: '#3EB596', fillColor: '#FEBA17', fillOpacity: .35, weight: 2,
        }).bindTooltip(`<b>${esc(c)}</b> — ${n} commande(s), ${mad(total)}`).addTo(heatLayer);
    });
}

function fitAll() {
    if (!map) return;
    const pts = filteredOrders().map(o => [o.lat, o.lng]);
    if (pts.length) map.flyToBounds(pts, { padding: [40, 40], maxZoom: 9, duration: 1 });
}

function locate(id) {
    const o = orders.find(x => x.id === id);
    if (!o || !map) return;
    $('#map-section').scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
        map.flyTo([o.lat, o.lng], 12, { duration: 1.2 });
        setTimeout(() => markers[id]?.openPopup(), 1250);
    }, 350);
}

/* ---------- drawer ---------- */
let currentId = null;
function openDrawer(id) {
    const o = orders.find(x => x.id === id);
    if (!o) return;
    currentId = id;
    $('#d-id').textContent = o.id;
    $('#d-date').textContent = `${fmtDate(o.date)} · ${timeAgo(o.date)}`;
    $('#d-client').textContent = o.client;
    $('#d-contact').textContent = o.contact;
    $('#d-phone').innerHTML = o.phone ? `<a href="tel:${esc(o.phone.replace(/\s/g, ''))}">${esc(o.phone)}</a>` : '';
    $('#d-city').textContent = o.city;
    $('#d-address').textContent = o.address;
    $('#d-coords').textContent = `GPS : ${o.lat.toFixed(4)}, ${o.lng.toFixed(4)}`;
    const src = $('#d-source');
    src.textContent = 'Origine : ' + o.source;
    src.style.background = (SOURCES[o.source] || '#3EB596') + '22';
    $('#d-items').innerHTML = o.items.map(i =>
        `<div class="item-line"><span>${i.qty} × ${esc(i.name)}</span><span>${mad(i.pph * i.qty)}</span></div>`).join('');
    $('#d-total-pph').textContent = mad(totalPPH(o));
    $('#d-total-pv').textContent = mad(totalPV(o));

    // timeline
    const tl = $('#d-timeline');
    const idx = o.status === 'cancelled' ? 0 : FLOW.indexOf(o.status);
    tl.className = 'timeline' + (o.status === 'cancelled' ? ' cancelled' : '');
    tl.innerHTML = '<div class="progress"></div>' + FLOW.map((s, i) =>
        `<div class="step ${i <= idx ? 'done' : ''} ${i === idx ? 'current' : ''}"><i>${i <= idx ? '✓' : i + 1}</i>${STATUS[s].label}</div>`).join('');
    requestAnimationFrame(() => requestAnimationFrame(() => {
        $('.progress', tl).style.width = `calc((100% - 28px) * ${idx / (FLOW.length - 1)})`;
    }));

    // actions
    const st = STATUS[o.status];
    $('#d-actions').innerHTML = `
        ${st.next ? `<button class="btn btn-green" data-dact="advance">${st.action}</button>` : ''}
        <button class="btn btn-ghost" data-dact="locate">Voir sur la carte</button>
        <button class="btn btn-dark" data-dact="print">Imprimer</button>
        ${['pending', 'preparing'].includes(o.status) ? '<button class="btn btn-red" data-dact="cancel">Annuler</button>' : ''}`;

    $('#drawer').classList.add('open');
    $('#drawer').setAttribute('aria-hidden', 'false');
    $('#overlay').classList.add('show');

    if (typeof L !== 'undefined') {
        setTimeout(() => {
            if (!miniMap) {
                miniMap = L.map('mini-map', { zoomControl: false, attributionControl: false, dragging: true, scrollWheelZoom: false });
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(miniMap);
            }
            miniMap.invalidateSize();
            miniMap.setView([o.lat, o.lng], 13);
            if (miniMarker) miniMarker.remove();
            miniMarker = L.marker([o.lat, o.lng], {
                icon: L.divIcon({ className: '', html: `<div class="pin s-${o.status}"><b></b></div>`, iconSize: [18, 18], iconAnchor: [9, 9] }),
            }).addTo(miniMap);
        }, 380);
    }
}
function closeDrawer() {
    $('#drawer').classList.remove('open');
    $('#drawer').setAttribute('aria-hidden', 'true');
    $('#overlay').classList.remove('show');
    currentId = null;
}

/* ---------- actions ---------- */
function setStatus(id, status) {
    const o = orders.find(x => x.id === id);
    if (!o) return;
    const prev = o.status;
    o.status = status;
    saveOrders();
    renderAll(id);
    if (currentId === id) openDrawer(id);
    toast(`${o.id} → ${STATUS[status].label}`, 'ok', () => setStatus(id, prev));
}
function advance(id) {
    const o = orders.find(x => x.id === id);
    if (o && STATUS[o.status].next) setStatus(id, STATUS[o.status].next);
}

function printOrder(id) {
    const o = orders.find(x => x.id === id);
    if (!o) return;
    const w = window.open('', '_blank');
    if (!w) return toast("Autorisez les fenêtres pop-up pour imprimer", 'warn');
    w.document.write(`<html><head><title>${esc(o.id)}</title><style>body{font-family:sans-serif;padding:30px}h1{border-bottom:5px solid #FEBA17;display:inline-block}td,th{padding:6px 10px;border-bottom:1px solid #ddd;text-align:left}</style></head><body>
        <h1>SOREMED — ${esc(o.id)}</h1>
        <p><b>${esc(o.client)}</b> (${esc(o.contact)})<br>${esc(o.address)}<br>${esc(o.phone)}</p>
        <p>Date : ${fmtDate(o.date)} · Origine : ${esc(o.source)} · Statut : ${STATUS[o.status].label}</p>
        <table><tr><th>Article</th><th>Qté</th><th>PPH</th><th>Total</th></tr>
        ${o.items.map(i => `<tr><td>${esc(i.name)}</td><td>${i.qty}</td><td>${mad(i.pph)}</td><td>${mad(i.pph * i.qty)}</td></tr>`).join('')}
        </table><h3>Total PPH : ${mad(totalPPH(o))}</h3></body></html>`);
    w.document.close();
    w.print();
}

function exportCSV() {
    const list = filteredOrders();
    const rows = [['N°', 'Client', 'Contact', 'Téléphone', 'Ville', 'Adresse', 'Latitude', 'Longitude', 'Origine', 'Date', 'Statut', 'Total PPH', 'Total PV']];
    list.forEach(o => rows.push([o.id, o.client, o.contact, o.phone, o.city, o.address, o.lat.toFixed(5), o.lng.toFixed(5),
        o.source, new Date(o.date).toLocaleString('fr-FR'), STATUS[o.status].label, totalPPH(o).toFixed(2), totalPV(o).toFixed(2)]));
    const csv = '﻿' + rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `commandes-soremed-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast(`${list.length} commande(s) exportée(s)`);
}

function notifyNew(newOnes) {
    if (!newOnes.length) return;
    unseen += newOnes.length;
    const badge = $('#bell-badge');
    badge.textContent = unseen;
    badge.classList.add('show');
    const bell = $('#bell');
    bell.classList.remove('ring'); void bell.offsetWidth; bell.classList.add('ring');
    newOnes.forEach(o => toast(`Nouvelle commande ${o.id} — ${o.client} (${o.city})`, 'warn', null, () => openDrawer(o.id)));
}

/* ---------- toast ---------- */
function toast(msg, type = 'ok', undo, onView) {
    const t = document.createElement('div');
    t.className = 'toast' + (type === 'warn' ? ' warn' : '');
    t.innerHTML = `<span>${esc(msg)}</span>${undo ? '<button data-t="undo">Annuler</button>' : ''}${onView ? '<button data-t="view">Voir</button>' : ''}`;
    $('#toasts').appendChild(t);
    const close = () => { t.classList.add('out'); setTimeout(() => t.remove(), 300); };
    t.addEventListener('click', e => {
        if (e.target.dataset.t === 'undo') undo();
        if (e.target.dataset.t === 'view') onView();
        if (e.target.dataset.t) close();
    });
    setTimeout(close, 4000);
}

/* ---------- render all ---------- */
function renderAll(flashId) {
    renderStats();
    renderCityBars();
    renderDonut();
    renderTabs();
    renderTable(flashId);
    renderMap();
}

/* ---------- events ---------- */
// ripple on every button
document.addEventListener('pointerdown', e => {
    const b = e.target.closest('.btn, .chip, .tab');
    if (!b) return;
    const r = b.getBoundingClientRect();
    const s = Math.max(r.width, r.height);
    const span = document.createElement('span');
    span.className = 'ripple';
    span.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
    b.appendChild(span);
    setTimeout(() => span.remove(), 600);
});

$('#period-chips').addEventListener('click', e => {
    const c = e.target.closest('.chip');
    if (!c) return;
    $$('#period-chips .chip').forEach(x => x.classList.toggle('active', x === c));
    state.days = +c.dataset.days;
    renderAll();
    fitAll();
});

$('#status-tabs').addEventListener('click', e => {
    const t = e.target.closest('.tab');
    if (!t) return;
    state.status = t.dataset.status;
    renderTabs(); renderTable(); renderMap();
});

$('#city-filter').addEventListener('change', e => {
    state.city = e.target.value;
    renderAll();
    fitAll();
});

$('#city-bars').addEventListener('click', e => {
    const r = e.target.closest('.bar-row');
    if (!r) return;
    state.city = state.city === r.dataset.city ? '' : r.dataset.city;
    $('#city-filter').value = state.city;
    renderAll();
    fitAll();
});

let searchTimer;
$('#order-search').addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { state.q = e.target.value; renderTable(); renderMap(); }, 150);
});
$('#clear-search').addEventListener('click', () => {
    $('#order-search').value = ''; state.q = ''; renderTable(); renderMap();
});

$('.orders-table thead').addEventListener('click', e => {
    const th = e.target.closest('th[data-sort]');
    if (!th) return;
    if (state.sort === th.dataset.sort) state.dir = state.dir === 'asc' ? 'desc' : 'asc';
    else { state.sort = th.dataset.sort; state.dir = 'asc'; }
    renderTable();
});

$('#orders-body').addEventListener('click', e => {
    const tr = e.target.closest('tr');
    if (!tr) return;
    const id = tr.dataset.id;
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'locate') locate(id);
    else if (act === 'advance') advance(id);
    else openDrawer(id);
});

$('#reset-filters').addEventListener('click', () => {
    Object.assign(state, { status: 'all', city: '', q: '' });
    $('#order-search').value = ''; $('#city-filter').value = '';
    renderAll();
});

$$('.stat-card').forEach(c => c.addEventListener('click', () => {
    const f = c.dataset.filter;
    if (f === 'pending') state.status = 'pending';
    else if (f === 'all') state.status = 'all';
    renderTabs(); renderTable(); renderMap();
    $(f === 'cities' ? '#map-section' : '#orders').scrollIntoView({ behavior: 'smooth', block: 'start' });
}));

$('#refresh-btn').addEventListener('click', e => {
    const b = e.currentTarget;
    b.classList.add('spin');
    setTimeout(() => b.classList.remove('spin'), 450);
    syncFromStorage(true);
});
$('#export-btn').addEventListener('click', exportCSV);
$('#simulate-btn').addEventListener('click', () => {
    const o = makeOrder({ minutesAgo: 0, status: 'pending' });
    orders.unshift(o);
    saveOrders();
    seenIds.add(o.id);
    renderCityFilter();
    renderAll(o.id);
    notifyNew([o]);
});

$('#fit-map').addEventListener('click', () => {
    if (map) map.flyTo([31.8, -7.1], 5.4, { duration: 1 });
});
$('#toggle-heat').addEventListener('click', e => {
    if (!map) return;
    state.heat = !state.heat;
    e.currentTarget.classList.toggle('active', state.heat);
    state.heat ? heatLayer.addTo(map) : heatLayer.remove();
});

$('#bell').addEventListener('click', () => {
    unseen = 0;
    $('#bell-badge').classList.remove('show');
    state.status = 'pending'; state.sort = 'date'; state.dir = 'desc';
    renderTabs(); renderTable(); renderMap();
    $('#orders').scrollIntoView({ behavior: 'smooth' });
});

$('#overlay').addEventListener('click', closeDrawer);
$('#drawer-close').addEventListener('click', closeDrawer);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
$('#d-actions').addEventListener('click', e => {
    const a = e.target.closest('[data-dact]')?.dataset.dact;
    if (!a || !currentId) return;
    const id = currentId;
    if (a === 'advance') advance(id);
    if (a === 'cancel' && confirm(`Annuler la commande ${id} ?`)) setStatus(id, 'cancelled');
    if (a === 'locate') { closeDrawer(); locate(id); }
    if (a === 'print') printOrder(id);
});

// header menu: smooth scroll + active state
$$('.menu-items span[data-scroll]').forEach(s => s.addEventListener('click', () => {
    $$('.menu-items span').forEach(x => x.classList.toggle('active', x === s));
    $('#' + s.dataset.scroll).scrollIntoView({ behavior: 'smooth', block: 'start' });
}));

// scroll reveal
const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
}), { threshold: .08 });
$$('.reveal').forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 80}ms`; io.observe(el); });

// live clock
const clock = () => { $('#live-clock').textContent = new Date().toLocaleString('fr-FR', { weekday: 'long', hour: '2-digit', minute: '2-digit' }); };
clock(); setInterval(clock, 30000);

/* ---------- live sync with orders placed from the cart (other tab) ---------- */
function syncFromStorage(manual) {
    const fresh = loadOrders();
    if (!fresh) return;
    const newOnes = fresh.filter(o => !seenIds.has(o.id));
    orders = fresh;
    newOnes.forEach(o => seenIds.add(o.id));
    renderCityFilter();
    renderAll(newOnes[0]?.id);
    if (newOnes.length) notifyNew(newOnes);
    else if (manual) toast('Données à jour');
}
window.addEventListener('storage', e => { if (e.key === ORDERS_KEY) syncFromStorage(); });

/* ---------- boot ---------- */
initMap();
renderCityFilter();
renderAll();
