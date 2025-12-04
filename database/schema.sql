-- DormDeal Database Schema (LEGACY - NO LONGER USED)
-- PostgreSQL Database Schema for DormDeal Marketplace
-- 
-- NOTE: This schema is kept for historical reference only.
-- The application now uses Firebase Firestore for all data storage.
-- This file is not used in the current implementation.

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(20),
    university VARCHAR(100),
    graduation_year INTEGER,
    profile_image_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Listings table
CREATE TABLE listings (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    condition VARCHAR(20) CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
    seller_id INTEGER REFERENCES users(id),
    images TEXT[], -- Array of image URLs
    location VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    is_sold BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table (for communication between users)
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    sender_id INTEGER REFERENCES users(id),
    receiver_id INTEGER REFERENCES users(id),
    listing_id INTEGER REFERENCES listings(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversations table (to group messages)
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    listing_id INTEGER REFERENCES listings(id),
    buyer_id INTEGER REFERENCES users(id),
    seller_id INTEGER REFERENCES users(id),
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Favorites table (for users to save favorite listings)
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    listing_id INTEGER REFERENCES listings(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, listing_id)
);

-- Cart table (for users to save items in shopping cart)
CREATE TABLE cart (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    listing_id INTEGER REFERENCES listings(id),
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, listing_id)
);

-- Reviews table (for user ratings and reviews)
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    reviewer_id INTEGER REFERENCES users(id),
    reviewee_id INTEGER REFERENCES users(id),
    listing_id INTEGER REFERENCES listings(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(reviewer_id, reviewee_id, listing_id)
);

-- Reports table (for reporting inappropriate content)
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    reporter_id INTEGER REFERENCES users(id),
    listing_id INTEGER REFERENCES listings(id),
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_university ON users(university);

CREATE INDEX idx_listings_category_id ON listings(category_id);
CREATE INDEX idx_listings_seller_id ON listings(seller_id);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_created_at ON listings(created_at);
CREATE INDEX idx_listings_is_active ON listings(is_active);
CREATE INDEX idx_listings_is_sold ON listings(is_sold);
CREATE INDEX idx_listings_is_featured ON listings(is_featured);
CREATE INDEX idx_listings_location ON listings(location);

CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_listing_id ON messages(listing_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

CREATE INDEX idx_conversations_listing_id ON conversations(listing_id);
CREATE INDEX idx_conversations_buyer_id ON conversations(buyer_id);
CREATE INDEX idx_conversations_seller_id ON conversations(seller_id);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_listing_id ON favorites(listing_id);

CREATE INDEX idx_cart_user_id ON cart(user_id);
CREATE INDEX idx_cart_listing_id ON cart(listing_id);

CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX idx_reviews_listing_id ON reviews(listing_id);

CREATE INDEX idx_reports_listing_id ON reports(listing_id);
CREATE INDEX idx_reports_status ON reports(status);

-- Insert default categories
INSERT INTO categories (name, description, icon) VALUES
('Electronics', 'Laptops, phones, tablets, and other electronic devices', 'laptop'),
('Furniture', 'Desks, chairs, beds, and other furniture items', 'chair'),
('Textbooks', 'Course books, study materials, and academic resources', 'book'),
('Clothing', 'Clothes, shoes, and fashion accessories', 'shirt'),
('Sports & Recreation', 'Sports equipment, gym gear, and recreational items', 'dumbbell'),
('Home & Kitchen', 'Kitchen appliances, home decor, and household items', 'home'),
('Transportation', 'Bikes, scooters, and transportation accessories', 'bike'),
('Other', 'Miscellaneous items that don\'t fit other categories', 'package');

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_updated_at BEFORE UPDATE ON cart
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a function to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET last_message_at = NEW.created_at 
    WHERE (buyer_id = NEW.sender_id AND seller_id = NEW.receiver_id AND listing_id = NEW.listing_id)
       OR (buyer_id = NEW.receiver_id AND seller_id = NEW.sender_id AND listing_id = NEW.listing_id);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update conversation timestamp when new message is sent
CREATE TRIGGER update_conversation_on_message AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();

-- Create a view for listing details with user information
CREATE VIEW listing_details AS
SELECT 
    l.id,
    l.uuid,
    l.title,
    l.description,
    l.price,
    l.condition,
    l.images,
    l.location,
    l.is_active,
    l.is_sold,
    l.views_count,
    l.created_at,
    l.updated_at,
    c.name as category_name,
    c.icon as category_icon,
    u.username as seller_username,
    u.first_name as seller_first_name,
    u.last_name as seller_last_name,
    u.university as seller_university,
    u.profile_image_url as seller_profile_image
FROM listings l
JOIN categories c ON l.category_id = c.id
JOIN users u ON l.seller_id = u.id;

-- Create a view for conversation summaries
CREATE VIEW conversation_summaries AS
SELECT 
    c.id,
    c.uuid,
    c.listing_id,
    c.buyer_id,
    c.seller_id,
    c.last_message_at,
    c.created_at,
    l.title as listing_title,
    l.price as listing_price,
    l.images as listing_images,
    buyer.username as buyer_username,
    seller.username as seller_username
FROM conversations c
JOIN listings l ON c.listing_id = l.id
JOIN users buyer ON c.buyer_id = buyer.id
JOIN users seller ON c.seller_id = seller.id;
