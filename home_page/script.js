// --- CENTRAL PRODUCT DATA ---
const ALL_PRODUCTS = [
    { id: 'P001', name: 'DOLIPRANE TABS 1000MG BT 8', description: 'Médicament à base de paracétamol indiqué pour la douleur.', price_pph: 15.00, price_pv: 20.00, ref: '3400937435888', image: 'img/image-removebg-preview.png' },
    { id: 'P002', name: 'ROC KEOPS DÉODORANT Bille - Lot de 2x30ml', description: 'Désodorisant longue durée pour une protection efficace.', price_pph: 75.00, price_pv: 99.99, ref: '5060072731689', image: 'img/image-removebg-preview.png' },
    { id: 'P003', name: 'Produit Tiers 3 (Générique)', description: 'Description générique pour produit 3.', price_pph: 50.00, price_pv: 65.00, ref: 'REF003', image: 'img/image-removebg-preview.png' },
    { id: 'P004', name: 'Produit Tiers 4 (Générique)', description: 'Description générique pour produit 4.', price_pph: 22.50, price_pv: 30.00, ref: 'REF004', image: 'img/image-removebg-preview.png' },
    { id: 'P005', name: 'Produit Tiers 5 (Générique)', description: 'Description générique pour produit 5.', price_pph: 100.00, price_pv: 130.00, ref: 'REF005', image: 'img/image-removebg-preview.png' },
    { id: 'P006', name: 'Produit Tiers 6 (Générique)', description: 'Description générique pour produit 6.', price_pph: 5.00, price_pv: 7.50, ref: 'REF006', image: 'img/image-removebg-preview.png' },
];

// --- CART MANAGEMENT FUNCTIONS ---
function getCart() {
    const cartJson = localStorage.getItem('soremedCart');
    return cartJson ? JSON.parse(cartJson) : [];
}

function saveCart(cart) {
    localStorage.setItem('soremedCart', JSON.stringify(cart));
}

function updateQuantity(productId, newQuantity) {
    let cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
        if (newQuantity > 0) {
            cart[itemIndex].quantity = newQuantity;
        } else {
            cart.splice(itemIndex, 1);
        }
    }
    saveCart(cart);
    if (document.URL.includes('cart.html')) renderCart();
}

function addToCart(productId, quantity = 1) {
    const productData = ALL_PRODUCTS.find(p => p.id === productId);
    if (!productData) {
        console.error(`Product ID ${productId} not found.`);
        return;
    }

    let cart = getCart();
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ ...productData, quantity });
    }
    saveCart(cart);
    alert(`Produit "${productData.name}" (${quantity}x) ajouté au panier !`);
    console.log('Cart Updated:', cart);
}

// --- HOME PAGE ---
if (document.URL.includes('index.html') || document.URL.endsWith('/')) {
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('add-to-cart')) {
            const productCard = event.target.closest('.product-card');
            const id = productCard?.dataset.id;
            if (id) addToCart(id, 1);
        }
    });
}
    