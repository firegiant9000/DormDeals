import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine the correct dist path for Render deployment
// On Render, build happens at project root, so dist is relative to process.cwd()
const distPath = path.join(process.cwd(), 'dist');
const indexPath = path.join(distPath, 'index.html');

// Verify dist folder exists
if (!existsSync(indexPath)) {
  console.error('❌ Error: dist/index.html not found');
  console.error(`   Expected location: ${indexPath}`);
  console.error(`   Current working directory: ${process.cwd()}`);
  console.error(`   __dirname: ${__dirname}`);
  console.error('   Please ensure the build completed successfully.');
}

// Environment variable validation
const requiredEnvVars = ['DATABASE_URL', 'SECRET_KEY', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => {
    console.error(`   - ${envVar}`);
  });
  console.error('\nPlease set these in the Render Dashboard under "Environment" section.');
  console.error('For Render deployment, these MUST be set as environment variables.');
  
  // Don't exit in development, but warn in production
  if (process.env.NODE_ENV === 'production') {
    console.error('⚠️  Production deployment requires all environment variables to be set.');
  }
}

const app = express();

// Database connection with error handling
let pool;
try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
} catch (error) {
  console.error('❌ Failed to create database pool:', error.message);
}

// Database connection pool for Render deployment

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for Vite dev server compatibility
}));
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from dist folder (Vite build output)
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log(`📁 Serving static files from: ${distPath}`);
} else {
  console.error(`⚠️  Warning: dist folder not found at ${distPath}`);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// API Routes
app.get('/api/listings', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM listings ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM listings WHERE id = $1', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/listings', async (req, res) => {
  try {
    const { title, description, price, category, condition, seller_id, images, location } = req.body;
    
    if (!title || !description || !price || !seller_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Map category name to category_id
    let categoryId = null;
    if (category) {
      const categoryMap = {
        'Electronics': 'Electronics',
        'Books': 'Books',
        'Appliances': 'Appliances',
        'Furniture': 'Furniture',
        'Clothing': 'Clothing',
        'Sports & Recreation': 'Sports & Recreation',
        'Other': 'Other'
      };
      
      const categoryName = categoryMap[category] || category;
      const categoryResult = await pool.query(
        'SELECT id FROM categories WHERE name = $1',
        [categoryName]
      );
      
      if (categoryResult.rows.length > 0) {
        categoryId = categoryResult.rows[0].id;
      } else {
        // Create category if it doesn't exist
        const newCategory = await pool.query(
          'INSERT INTO categories (name) VALUES ($1) RETURNING id',
          [categoryName]
        );
        categoryId = newCategory.rows[0].id;
      }
    }
    
    const { rows } = await pool.query(
      `INSERT INTO listings (title, description, price, category_id, condition, seller_id, images, location) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, description, price, categoryId, condition, seller_id, images || [], location || 'UL Campus']
    );
    
    // Transform response to match frontend format
    const listing = rows[0];
    const transformedListing = {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      price: parseFloat(listing.price),
      category: category || 'Other',
      condition: listing.condition,
      images: listing.images || [],
      location: listing.location,
      status: listing.is_sold ? 'Sold' : (listing.is_active ? 'Active' : 'Inactive'),
      views: listing.views_count || 0,
      createdAt: listing.created_at,
      isSold: listing.is_sold,
      isActive: listing.is_active
    };
    
    res.status(201).json(transformedListing);
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, category, condition, images } = req.body;
    
    const { rows } = await pool.query(
      'UPDATE listings SET title = $1, description = $2, price = $3, category = $4, condition = $5, images = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
      [title, description, price, category, condition, images, id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('DELETE FROM listings WHERE id = $1 RETURNING *', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User routes
// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT id, uuid, username, email, first_name, last_name, phone, university, 
       graduation_year, profile_image_url, is_verified, is_active, created_at, updated_at
       FROM users WHERE id = $1`,
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by email (for linking Firebase auth to PostgreSQL)
app.get('/api/users/email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { rows } = await pool.query(
      `SELECT id, uuid, username, email, first_name, last_name, phone, university, 
       graduation_year, profile_image_url, is_verified, is_active, created_at, updated_at
       FROM users WHERE email = $1`,
      [email]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching user by email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get full user profile with stats
app.get('/api/users/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user data
    const userQuery = await pool.query(
      `SELECT id, uuid, username, email, first_name, last_name, phone, university, 
       graduation_year, profile_image_url, is_verified, is_active, created_at, updated_at
       FROM users WHERE id = $1`,
      [id]
    );
    
    if (userQuery.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userQuery.rows[0];
    
    // Get user stats
    const statsQuery = await pool.query(
      `SELECT 
        COUNT(DISTINCT l.id) as total_listings,
        COUNT(DISTINCT CASE WHEN l.is_sold = true THEN l.id END) as total_sales,
        COUNT(DISTINCT f.id) as total_favorites,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.id) as review_count
       FROM users u
       LEFT JOIN listings l ON l.seller_id = u.id
       LEFT JOIN favorites f ON f.user_id = u.id
       LEFT JOIN reviews r ON r.reviewee_id = u.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [id]
    );
    
    const stats = statsQuery.rows[0] || {
      total_listings: 0,
      total_sales: 0,
      total_favorites: 0,
      avg_rating: 0,
      review_count: 0
    };
    
    // Combine user data with stats
    const profile = {
      ...user,
      displayName: user.first_name && user.last_name 
        ? `${user.first_name} ${user.last_name}` 
        : user.username,
      name: user.first_name && user.last_name 
        ? `${user.first_name} ${user.last_name}` 
        : user.username,
      location: user.university || 'UL Campus',
      school: user.university || 'University of Louisiana',
      rating: parseFloat(stats.avg_rating) || 0,
      reviewCount: parseInt(stats.review_count) || 0,
      totalSales: parseInt(stats.total_sales) || 0,
      totalListings: parseInt(stats.total_listings) || 0,
      totalFavorites: parseInt(stats.total_favorites) || 0,
      profileImage: user.profile_image_url,
      joinedDate: user.created_at,
      joinDate: user.created_at
    };
    
    res.json(profile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's listings
app.get('/api/users/:id/listings', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT l.*, c.name as category_name
       FROM listings l
       LEFT JOIN categories c ON l.category_id = c.id
       WHERE l.seller_id = $1
       ORDER BY l.created_at DESC`,
      [id]
    );
    
    // Transform to match frontend format
    const listings = rows.map(listing => ({
      id: listing.id?.toString() || '',
      title: listing.title,
      description: listing.description,
      price: parseFloat(listing.price),
      category: listing.category_name || 'Other',
      condition: listing.condition,
      images: listing.images || [],
      location: listing.location,
      status: listing.is_sold ? 'Sold' : (listing.is_active ? 'Active' : 'Inactive'),
      views: listing.views_count || 0,
      createdAt: listing.created_at,
      isSold: listing.is_sold,
      isActive: listing.is_active
    }));
    
    res.json(listings);
  } catch (error) {
    console.error('Error fetching user listings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's favorites (wishlist)
app.get('/api/users/:id/favorites', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT l.*, c.name as category_name, f.created_at as favorited_at
       FROM favorites f
       JOIN listings l ON f.listing_id = l.id
       LEFT JOIN categories c ON l.category_id = c.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [id]
    );
    
    // Transform to match frontend format
    const favorites = rows.map(listing => ({
      id: listing.id?.toString() || '',
      listing_id: listing.id,
      title: listing.title,
      description: listing.description,
      price: parseFloat(listing.price),
      category: listing.category_name || 'Other',
      condition: listing.condition,
      images: listing.images || [],
      location: listing.location,
      status: listing.is_sold ? 'Sold' : (listing.is_active ? 'Active' : 'Inactive'),
      views: listing.views_count || 0,
      createdAt: listing.created_at,
      favoritedAt: listing.favorited_at
    }));
    
    res.json(favorites);
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add item to favorites (wishlist)
app.post('/api/users/:id/favorites', async (req, res) => {
  try {
    const { id } = req.params;
    const { listing_id } = req.body;
    
    if (!listing_id) {
      return res.status(400).json({ error: 'listing_id is required' });
    }
    
    const { rows } = await pool.query(
      `INSERT INTO favorites (user_id, listing_id) 
       VALUES ($1, $2) 
       ON CONFLICT (user_id, listing_id) DO NOTHING
       RETURNING *`,
      [id, listing_id]
    );
    
    if (rows.length === 0) {
      return res.status(200).json({ message: 'Item already in favorites' });
    }
    
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove item from favorites (wishlist)
app.delete('/api/users/:id/favorites/:listing_id', async (req, res) => {
  try {
    const { id, listing_id } = req.params;
    
    const { rows } = await pool.query(
      `DELETE FROM favorites 
       WHERE user_id = $1 AND listing_id = $2 
       RETURNING *`,
      [id, listing_id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const sanitizeUsername = (value) => {
  if (!value) return 'user';
  return value.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';
};

const generateUniqueUsername = async (base) => {
  let attempt = 0;
  let candidate = sanitizeUsername(base);

  while (attempt < 1000) {
    const { rows } = await pool.query('SELECT 1 FROM users WHERE username = $1', [candidate]);
    if (rows.length === 0) {
      return candidate;
    }
    attempt += 1;
    candidate = `${sanitizeUsername(base)}${attempt}`;
  }

  // Fallback to timestamp-based username if too many collisions
  return `user${Date.now()}`;
};

app.post('/api/users/sync', async (req, res) => {
  try {
    if (!pool) {
      return res.status(500).json({ error: 'Database pool not initialized' });
    }

    const {
      firebaseUid,
      email,
      displayName,
      firstName,
      lastName,
      phone,
      university,
      profileImageUrl
    } = req.body || {};

    if (!firebaseUid || !email) {
      return res.status(400).json({ error: 'firebaseUid and email are required' });
    }

    const normalizedEmail = email.toLowerCase();
    const defaultFirst = firstName || displayName?.split(' ')?.[0] || '';
    const defaultLast = lastName || displayName?.split(' ')?.slice(1).join(' ') || '';

    const existingUser = await pool.query(
      `SELECT id, username, email FROM users WHERE email = $1`,
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      const currentUsername = existingUser.rows[0].username;
      const usernameToUse = currentUsername || await generateUniqueUsername(displayName || normalizedEmail.split('@')[0]);

      const { rows } = await pool.query(
        `UPDATE users
         SET username = $2,
             first_name = COALESCE($3, first_name),
             last_name = COALESCE($4, last_name),
             phone = COALESCE($5, phone),
             university = COALESCE($6, university),
             profile_image_url = COALESCE($7, profile_image_url),
             updated_at = NOW()
         WHERE email = $1
         RETURNING id, uuid, username, email, first_name, last_name, phone, university,
                   graduation_year, profile_image_url, is_verified, is_active, created_at, updated_at`,
        [
          normalizedEmail,
          usernameToUse,
          defaultFirst || null,
          defaultLast || null,
          phone || null,
          university || 'University of Louisiana',
          profileImageUrl || null
        ]
      );

      return res.json(rows[0]);
    }

    const username = await generateUniqueUsername(displayName || normalizedEmail.split('@')[0]);
    const passwordHash = crypto.randomBytes(32).toString('hex');

    const { rows } = await pool.query(
      `INSERT INTO users
        (username, email, password_hash, first_name, last_name, phone, university, is_verified, is_active, profile_image_url)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, false, true, $8)
       RETURNING id, uuid, username, email, first_name, last_name, phone, university,
                 graduation_year, profile_image_url, is_verified, is_active, created_at, updated_at`,
      [
        username,
        normalizedEmail,
        passwordHash,
        defaultFirst || null,
        defaultLast || null,
        phone || null,
        university || 'University of Louisiana',
        profileImageUrl || null
      ]
    );

    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error syncing Firebase user:', error);
    return res.status(500).json({ error: 'Failed to sync user record' });
  }
});

// Get user's cart items
app.get('/api/users/:id/cart', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT l.*, cat.name as category_name, cart.quantity, cart.created_at as added_at, cart.updated_at
       FROM cart
       JOIN listings l ON cart.listing_id = l.id
       LEFT JOIN categories cat ON l.category_id = cat.id
       WHERE cart.user_id = $1
       ORDER BY cart.created_at DESC`,
      [id]
    );
    
    // Transform to match frontend format
    const cartItems = rows.map(item => ({
      id: item.listing_id?.toString() || item.id?.toString() || '',
      listing_id: item.listing_id,
      title: item.title,
      description: item.description,
      price: parseFloat(item.price),
      category: item.category_name || 'Other',
      condition: item.condition,
      images: item.images || [],
      location: item.location,
      status: item.is_sold ? 'Sold' : (item.is_active ? 'Active' : 'Inactive'),
      views: item.views_count || 0,
      quantity: item.quantity || 1,
      addedAt: item.added_at,
      createdAt: item.created_at
    }));
    
    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add item to cart
app.post('/api/users/:id/cart', async (req, res) => {
  try {
    const { id } = req.params;
    const { listing_id, quantity = 1 } = req.body;
    
    if (!listing_id) {
      return res.status(400).json({ error: 'listing_id is required' });
    }
    
    const { rows } = await pool.query(
      `INSERT INTO cart (user_id, listing_id, quantity) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (user_id, listing_id) 
       DO UPDATE SET quantity = cart.quantity + $3, updated_at = NOW()
       RETURNING *`,
      [id, listing_id, quantity]
    );
    
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update cart item quantity
app.put('/api/users/:id/cart/:listing_id', async (req, res) => {
  try {
    const { id, listing_id } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'quantity must be at least 1' });
    }
    
    const { rows } = await pool.query(
      `UPDATE cart 
       SET quantity = $1, updated_at = NOW() 
       WHERE user_id = $2 AND listing_id = $3 
       RETURNING *`,
      [quantity, id, listing_id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove item from cart
app.delete('/api/users/:id/cart/:listing_id', async (req, res) => {
  try {
    const { id, listing_id } = req.params;
    
    const { rows } = await pool.query(
      `DELETE FROM cart 
       WHERE user_id = $1 AND listing_id = $2 
       RETURNING *`,
      [id, listing_id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
app.put('/api/users/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, phone, university, graduation_year, profile_image_url } = req.body;
    
    const { rows } = await pool.query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone),
           university = COALESCE($4, university),
           graduation_year = COALESCE($5, graduation_year),
           profile_image_url = COALESCE($6, profile_image_url),
           updated_at = NOW()
       WHERE id = $7
       RETURNING id, uuid, username, email, first_name, last_name, phone, university, 
                 graduation_year, profile_image_url, is_verified, is_active, created_at, updated_at`,
      [first_name, last_name, phone, university, graduation_year, profile_image_url, id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  // Don't serve SPA for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  
  // Serve the React app for all other routes
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(500).json({ 
      error: 'Application not built properly. Please check build logs.',
      details: { distPath, indexPath, cwd: process.cwd() }
    });
  }
});

// Server startup for Render deployment
const PORT = process.env.PORT || 3000;

// Start server for Render deployment
// This file is executed directly with 'node index.js' on Render
// The server listens on the PORT environment variable set by Render

// Verify build exists before starting server
if (!existsSync(indexPath)) {
  console.error('❌ Cannot start server: dist/index.html not found');
  console.error(`   Expected location: ${indexPath}`);
  console.error(`   Current working directory: ${process.cwd()}`);
  console.error('   Please ensure the build completed successfully.');
  console.error('   Check Render build logs to see if the build step succeeded.');
  process.exit(1);
}

console.log(`✅ Build verified: dist/index.html exists at ${indexPath}`);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Server listening on 0.0.0.0:${PORT}`);
  console.log(`📁 Serving static files from: ${distPath}`);
});

export default app;
