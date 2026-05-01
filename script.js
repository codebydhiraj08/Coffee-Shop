// Scroll reveal
const reveals = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add("visible"), i * 80);
      }
    });
  },
  { threshold: 0.1 },
);
reveals.forEach((el) => observer.observe(el));

// Scroll top button
const scrollBtn = document.querySelector(".scroll-top");
window.addEventListener("scroll", () => {
  scrollBtn.classList.toggle("visible", window.scrollY > 400);
});

// Category chips - Filter menu items
const filterMenuByCategory = (selectedCategory) => {
  const menuCards = document.querySelectorAll(".menu-card");
  menuCards.forEach((card) => {
    const cardCategory = card.getAttribute("data-category");
    if (cardCategory === selectedCategory) {
      card.style.display = "block";
      card.style.opacity = "1";
      card.style.pointerEvents = "auto";
    } else {
      card.style.opacity = "0";
      setTimeout(() => {
        card.style.display = "none";
        card.style.pointerEvents = "none";
      }, 300);
    }
  });
};

// Show all menu items
const showAllMenuItems = () => {
  const menuCards = document.querySelectorAll(".menu-card");
  menuCards.forEach((card) => {
    card.style.display = "block";
    card.style.opacity = "1";
    card.style.pointerEvents = "auto";
  });
};

document.querySelectorAll(".cat-chip").forEach((chip) => {
  chip.addEventListener("click", function () {
    // Update active chip
    document
      .querySelectorAll(".cat-chip")
      .forEach((c) => c.classList.remove("active"));
    this.classList.add("active");

    // Get selected category and filter
    const selectedCategory = this.getAttribute("data-category");
    filterMenuByCategory(selectedCategory);
  });
});

// Initialize menu - show all items on page load
window.addEventListener("load", () => {
  showAllMenuItems();
});

// Add to cart button animation
document.querySelectorAll(".btn-add").forEach((btn) => {
  btn.addEventListener("click", function () {
    const orig = this.textContent;
    this.textContent = "✓";
    this.style.background = "#4CAF50";
    setTimeout(() => {
      this.textContent = orig;
      this.style.background = "";
    }, 1200);
  });
});

// Reserve form submit - Save locally with localStorage
document.getElementById("res-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const btn = document.getElementById("btn-reserve");
  const originalText = btn.textContent;

  // Get values
  const name = document.getElementById("res-name").value.trim();
  const phone = document.getElementById("res-phone").value.trim();
  const date = document.getElementById("res-date").value;
  const time = document.getElementById("res-time").value;
  const guests = document.getElementById("res-guests").value || "1";
  const requests = document.getElementById("res-requests").value.trim();

  if (!name || !phone || !date || !time) {
    alert("Please fill all required fields (Name, Phone, Date, Time).");
    return;
  }

  btn.textContent = "Processing...";
  btn.style.opacity = "0.8";
  btn.disabled = true;

  try {
    // Get existing reservations from localStorage
    let reservations = JSON.parse(localStorage.getItem("reservations")) || [];

    // Create new reservation object
    const newReservation = {
      id: Date.now(),
      customer_name: name,
      phone_number: phone,
      reservation_date: date,
      reservation_time: time,
      guest_count: guests,
      special_requests: requests,
      status: "Pending",
      created_at: new Date().toISOString(),
    };

    // Add to array
    reservations.push(newReservation);

    // Save to localStorage
    localStorage.setItem("reservations", JSON.stringify(reservations));

    // Show success message
    btn.textContent = "✓ Reservation Saved!";
    btn.style.background = "#4CAF50";
    btn.style.opacity = "1";

    // Clear form
    document.getElementById("res-name").value = "";
    document.getElementById("res-phone").value = "";
    document.getElementById("res-date").value = "";
    document.getElementById("res-time").value = "";
    document.getElementById("res-guests").value = "";
    document.getElementById("res-requests").value = "";

    console.log("✓ Reservation saved:", newReservation);
  } catch (err) {
    console.error("Error saving reservation:", err);
    alert("Error saving reservation. Please try again.");
    btn.textContent = originalText;
    btn.style.opacity = "1";
  }

  setTimeout(() => {
    btn.textContent = "Confirm Reservation →";
    btn.style.background = "";
    btn.disabled = false;
  }, 3500);
});

// -- CART & ORDERING SYSTEM --
let cart = [];
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const closeCartBtn = document.getElementById("close-cart");
const cartCount = document.getElementById("cart-count");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotalPrice = document.getElementById("cart-total-price");
const orderForm = document.getElementById("order-form");
const btnPlaceOrder = document.getElementById("btn-place-order");

// Toggle Modal
cartBtn.addEventListener("click", () => cartModal.classList.add("active"));
closeCartBtn.addEventListener("click", () => cartModal.classList.remove("active"));
cartModal.addEventListener("click", (e) => {
  if (e.target === cartModal) cartModal.classList.remove("active");
});

// Update Cart UI
function updateCart() {
  cartCount.textContent = cart.length;
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `<div class="empty-cart">Your cart is empty.</div>`;
    cartTotalPrice.textContent = "0";
    orderForm.style.display = "none";
    return;
  }

  let total = 0;
  cartItemsContainer.innerHTML = "";
  cart.forEach((item, index) => {
    total += item.price;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <div class="cart-item-name">${item.name}</div>
      <div class="cart-item-price">₹${item.price} <button onclick="removeFromCart(${index})" style="background:none; border:none; color:red; cursor:pointer; margin-left: 10px;">&times;</button></div>
    `;
    cartItemsContainer.appendChild(div);
  });
  
  cartTotalPrice.textContent = total;
  orderForm.style.display = "block";
}

window.removeFromCart = function(index) {
  cart.splice(index, 1);
  updateCart();
};

// Add to Cart
document.querySelectorAll(".btn-add").forEach((btn) => {
  // Override the existing click listener or add a new one
  btn.addEventListener("click", function (e) {
    // Find the closest menu card
    const card = this.closest(".menu-card");
    if (!card) return;
    
    const name = card.querySelector(".menu-card-name").textContent.trim();
    let priceText = card.querySelector(".menu-card-price").textContent.replace("₹", "").replace("?", "").trim();
    const price = parseInt(priceText, 10);
    
    cart.push({ name, price });
    updateCart();
    
    // Animation
    const orig = this.textContent;
    this.textContent = "✓";
    this.style.background = "#4CAF50";
    setTimeout(() => {
      this.textContent = "+";
      this.style.background = "";
    }, 1200);
  });
});

// Place Order
orderForm.addEventListener("submit", async function(e) {
  e.preventDefault();
  const name = document.getElementById("order-name").value.trim();
  const table = document.getElementById("order-table").value.trim();
  
  if (!name || !table || cart.length === 0) return;
  
  btnPlaceOrder.textContent = "Placing Order...";
  btnPlaceOrder.disabled = true;
  
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  
  try {
    const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:8080' : '';
    const response = await fetch(API_BASE + "/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_name: name,
        table_number: table,
        items: cart,
        total_amount: total
      })
    });
    
    if (!response.ok) throw new Error("Failed to place order");
    
    // Success
    btnPlaceOrder.style.background = "#4CAF50";
    btnPlaceOrder.textContent = "? Order Placed!";
    
    setTimeout(() => {
      cart = [];
      updateCart();
      cartModal.classList.remove("active");
      btnPlaceOrder.style.background = "";
      btnPlaceOrder.textContent = "Place Order ?";
      btnPlaceOrder.disabled = false;
      document.getElementById("order-name").value = "";
      document.getElementById("order-table").value = "";
    }, 2000);
    
  } catch (err) {
    console.error(err);
    alert("Error placing order. Please try again.");
    btnPlaceOrder.textContent = "Place Order ?";
    btnPlaceOrder.disabled = false;
  }
});

