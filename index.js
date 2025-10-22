import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment variable validation
const requiredEnvVars = ['DATABASE_URL', 'SECRET_KEY', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => {
    console.error(`   - ${envVar}`);
  });
  console.error('\nPlease check your .env file or environment configuration.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection with error handling
let pool;
try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
} catch (error) {
  console.error('❌ Failed to create database pool:', error.message);
  process.exit(1);
}

// Test database connection on startup
const testDatabaseConnection = async () => {
  try {
    console.log('🔄 Testing database connection...');
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connection successful');
    console.log(`   Connected at: ${result.rows[0].now}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(`   Error: ${error.message}`);
    console.error('   Please check your DATABASE_URL environment variable.');
    console.error('   Make sure your database is running and accessible.');
    return false;
  }
};

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for Vite dev server compatibility
}));
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from dist folder (Vite build output)
app.use(express.static(path.join(__dirname, 'dist')));

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
  res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).json({ error: 'Failed to serve application' });
    }
  });
});

// Start server with database connection check
const startServer = async () => {
  // Test database connection before starting server
  const dbConnected = await testDatabaseConnection();
  
  if (!dbConnected) {
    console.error('❌ Server startup aborted due to database connection failure');
    process.exit(1);
  }
  
  // Start the server
  app.listen(PORT, () => {
    console.log('🚀 DormDeal server started successfully!');
    console.log(`   Port: ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV}`);
    console.log(`   Health check: http://localhost:${PORT}/health`);
    console.log(`   API base: http://localhost:${PORT}/api`);
  });
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  if (pool) {
    pool.end(() => {
      console.log('✅ Database pool closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  if (pool) {
    pool.end(() => {
      console.log('✅ Database pool closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// Start the server
startServer().catch((error) => {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
});

export default app;
