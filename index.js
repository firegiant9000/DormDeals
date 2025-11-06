import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

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
    const { title, description, price, category, condition, seller_id, images } = req.body;
    
    const { rows } = await pool.query(
      'INSERT INTO listings (title, description, price, category, condition, seller_id, images) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, description, price, category, condition, seller_id, images]
    );
    
    res.status(201).json(rows[0]);
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
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT id, username, email, created_at FROM users WHERE id = $1', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
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
