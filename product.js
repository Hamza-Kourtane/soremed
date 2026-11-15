// Menu functionality
const menuBtn = document.getElementById('menuBtn');
const closeBtn = document.getElementById('closeBtn');
const slideMenu = document.getElementById('slideMenu');
const overlay = document.getElementById('overlay');

menuBtn.addEventListener('click', () => {
    slideMenu.classList.add('active');
    overlay.classList.add('active');
});

closeBtn.addEventListener('click', () => {
    slideMenu.classList.remove('active');
    overlay.classList.remove('active');
});

overlay.addEventListener('click', () => {
    slideMenu.classList.remove('active');
    overlay.classList.remove('active');
});

// Quantity control
let quantity = 1;
const quantityValue = document.getElementById('quantityValue');
const decreaseBtn = document.getElementById('decreaseBtn');
const increaseBtn = document.getElementById('increaseBtn');

decreaseBtn.addEventListener('click', () => {
    if (quantity > 1) {
        quantity--;
        quantityValue.textContent = quantity;
    }
});

increaseBtn.addEventListener('click', () => {
    quantity++;
    quantityValue.textContent = quantity;
});

// Add to cart functionality
const addToCartBtns = document.querySelectorAll('.add-to-cart-btn, .card-btn');

addToCartBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        alert('Product added to cart!');
    });
});

// Favorite functionality
const favoriteBtns = document.querySelectorAll('.favorite-btn');

favoriteBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        btn.classList.toggle('favorite-active');
    });
});
