// Quantity controls
document.querySelectorAll('.cart-item').forEach(item => {
    const minusBtn = item.querySelector('.minus-btn');
    const plusBtn = item.querySelector('.plus-btn');
    const qtyValue = item.querySelector('.qty-value');
    
    let quantity = 1;
    
    minusBtn.addEventListener('click', () => {
        if (quantity > 1) {
            quantity--;
            qtyValue.textContent = quantity;
            updateSummary();
        }
    });
    
    plusBtn.addEventListener('click', () => {
        quantity++;
        qtyValue.textContent = quantity;
        updateSummary();
    });
});

// Favorite toggle
document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const isFavorite = btn.getAttribute('data-favorite') === 'true';
        btn.setAttribute('data-favorite', !isFavorite);
    });
});

// Remove item
document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const cartItem = btn.closest('.cart-item');
        if (confirm('Voulez-vous supprimer cet article du panier?')) {
            cartItem.remove();
            updateSummary();
            updateCartBadge();
        }
    });
});

// Update summary
function updateSummary() {
    const items = document.querySelectorAll('.cart-item');
    let totalPPH = 0;
    let totalPV = 0;
    
    items.forEach(item => {
        const quantity = parseInt(item.querySelector('.qty-value').textContent);
        const priceRows = item.querySelectorAll('.price-row');
        
        // Get PPH price (first price row)
        const pphText = priceRows[0].querySelector('.price-amount').textContent;
        const pph = parseFloat(pphText.replace('MAD ', ''));
        
        // Get PV price (second price row)
        const pvText = priceRows[1].querySelector('.price-amount').textContent;
        const pv = parseFloat(pvText.replace('MAD ', ''));
        
        totalPPH += pph * quantity;
        totalPV += pv * quantity;
    });
    
    // Update summary totals
    const totalRows = document.querySelectorAll('.total-row');
    if (totalRows.length >= 2) {
        totalRows[0].querySelector('.total-amount').textContent = `MAD ${totalPV}`;
        totalRows[1].querySelector('.total-amount').textContent = `MAD ${totalPPH}`;
    }
}

// Update cart badge
function updateCartBadge() {
    const itemCount = document.querySelectorAll('.cart-item').length;
    const badge = document.querySelector('.cart-badge');
    if (badge) {
        badge.textContent = itemCount;
        if (itemCount === 0) {
            badge.style.display = 'none';
        }
    }
}

// Mobile menu toggle (optional enhancement)
const menuBtn = document.querySelector('.menu-btn');
const mainNav = document.querySelector('.main-nav');

if (menuBtn && mainNav) {
    menuBtn.addEventListener('click', () => {
        mainNav.style.display = mainNav.style.display === 'flex' ? 'none' : 'flex';
    });
}

// ======================================================
// Checkout -> create an order visible in the admin page
// (admin.html reads the same "soremedOrders" storage key)
// ======================================================
(function () {
    const btn = document.querySelector('.checkout-btn');
    if (!btn || btn.dataset.bound) return;
    btn.dataset.bound = '1';

    const CITY_COORDS = {
        'Casablanca': [33.5731, -7.5898], 'Rabat': [34.0209, -6.8416], 'Marrakech': [31.6295, -7.9811],
        'Fès': [34.0181, -5.0078], 'Tanger': [35.7595, -5.8340], 'Agadir': [30.4278, -9.5981],
        'Meknès': [33.8935, -5.5473], 'Oujda': [34.6814, -1.9086], 'Kénitra': [34.2610, -6.5802],
        'Tétouan': [35.5889, -5.3626], 'El Jadida': [33.2316, -8.5007], 'Laâyoune': [27.1253, -13.1625],
        'Béni Mellal': [32.3373, -6.3498], 'Nador': [35.1681, -2.9335], 'Safi': [32.2994, -9.2372],
    };
    function nearestCity(lat, lng) {
        let best = 'Casablanca', d = Infinity;
        for (const [c, [a, b]] of Object.entries(CITY_COORDS)) {
            const dd = (a - lat) ** 2 + (b - lng) ** 2;
            if (dd < d) { d = dd; best = c; }
        }
        return best;
    }
    function readItems() {
        return [...document.querySelectorAll('.cart-item')].map(item => {
            const prices = item.querySelectorAll('.price-row .price-amount');
            const num = el => parseFloat((el?.textContent || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
            return {
                name: item.querySelector('.item-title')?.textContent.trim() || 'Article',
                qty: parseInt(item.querySelector('.qty-value')?.textContent, 10) || 1,
                pph: num(prices[0]),
                pv: num(prices[1]),
            };
        });
    }
    function getPosition() {
        return new Promise(resolve => {
            if (!navigator.geolocation) return resolve(null);
            navigator.geolocation.getCurrentPosition(
                p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
                () => resolve(null),
                { timeout: 8000 }
            );
        });
    }

    btn.addEventListener('click', async () => {
        const items = readItems();
        if (!items.length) { alert('Votre panier est vide.'); return; }
        btn.disabled = true;
        const original = btn.textContent;
        btn.textContent = 'Envoi de la commande...';

        const pos = await getPosition();
        const city = pos ? nearestCity(pos.lat, pos.lng) : 'Casablanca';
        const [cLat, cLng] = CITY_COORDS[city];
        let orders = [];
        try { orders = JSON.parse(localStorage.getItem('soremedOrders')) || []; } catch (e) { orders = []; }
        const maxId = orders.reduce((m, o) => Math.max(m, parseInt(String(o.id).replace(/\D/g, ''), 10) || 0), 1000);
        const order = {
            id: 'CMD-' + (maxId + 1),
            client: (() => {
                const n = (document.querySelector('.header1 p')?.textContent || '').replace(/Bienvenue,|!/g, '').trim();
                return n && !n.startsWith('[') ? n : 'Client web';
            })(),
            contact: 'Commande en ligne',
            phone: '',
            city,
            address: pos ? `Position GPS du client (près de ${city})` : `${city} (localisation non partagée)`,
            lat: pos ? pos.lat : cLat,
            lng: pos ? pos.lng : cLng,
            source: 'Site web',
            date: new Date().toISOString(),
            status: 'pending',
            items,
        };
        orders.unshift(order);
        try { localStorage.setItem('soremedOrders', JSON.stringify(orders)); } catch (e) { /* storage unavailable */ }

        btn.textContent = `Commande ${order.id} envoyée ✓`;
        setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 2500);
    });
})();
