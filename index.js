import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
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

const app = express();

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

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  // Serve the React app for all routes
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
console.log(`✅ Application is now Firebase-only (no PostgreSQL dependencies)`);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Server listening on 0.0.0.0:${PORT}`);
  console.log(`📁 Serving static files from: ${distPath}`);
});

export default app;
