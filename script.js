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

// ── SMOOTH VIDEO LOOP (Crossfade) ──
const video1 = document.querySelector(".video-1");
const video2 = document.querySelector(".video-2");
let activeVideo = video1;
let nextVideo = video2;
let isLooping = false;

// Video 2 ko thoda delay se start karo
video2.pause();

function handleVideoLoop() {
  // Jab video khatam hone wala ho (1.5 sec pehle)
  if (activeVideo.duration - activeVideo.currentTime <= 1.5) {
    // Next video start karo aur fade in karo
    nextVideo.currentTime = 0;
    nextVideo.play().catch((err) => console.log("Video play error:", err));
    nextVideo.style.opacity = "1";
    activeVideo.style.opacity = "0";

    // Swap karo
    let temp = activeVideo;
    activeVideo = nextVideo;
    nextVideo = temp;
  }
  requestAnimationFrame(handleVideoLoop);
}

// Page load par turant video play karo
function startVideoPlay() {
  if (!isLooping) {
    isLooping = true;
    video1.currentTime = 0;
    video1.play().catch((err) => console.log("Video play error:", err));
    handleVideoLoop();
  }
}

// Start playing when video has enough data to play smoothly
video1.addEventListener("canplaythrough", startVideoPlay, { once: true });

// Fallback: if canplaythrough takes too long, start on canplay
video1.addEventListener(
  "canplay",
  () => {
    if (!isLooping) {
      startVideoPlay();
    }
  },
  { once: true },
);

// Backup: start after a short delay if events don't fire
setTimeout(() => {
  if (!isLooping) {
    startVideoPlay();
  }
}, 2000);
