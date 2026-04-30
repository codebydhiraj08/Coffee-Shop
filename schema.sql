-- Database Schema for Brewed Bliss Cafe

-- 1. Categories Table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    icon VARCHAR(10) -- e.g., '☕', '🥐'
);

-- 2. Menu Items Table
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255),
    is_popular BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Specials / Combos Table
CREATE TABLE specials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    badge_text VARCHAR(50), -- e.g., 'SAVE 20%', 'BEST VALUE'
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Testimonials Table
CREATE TABLE testimonials (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    customer_tag VARCHAR(100), -- e.g., 'Koregaon Park Regular'
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    avatar_icon VARCHAR(10) DEFAULT '👤',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Reservations Table
CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    guest_count VARCHAR(50) NOT NULL, -- e.g., '1 Guest', '2 Guests', 'Large Group (9+)'
    special_requests TEXT,
    status VARCHAR(20) DEFAULT 'Pending', -- 'Pending', 'Confirmed', 'Cancelled'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_menu_category ON menu_items(category_id);
CREATE INDEX idx_reservation_date ON reservations(reservation_date);
