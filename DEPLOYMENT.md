# DormDeal Deployment Guide

This guide provides step-by-step instructions for deploying the DormDeal Express.js + SQL application to Vercel.

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager
- Git repository with your code
- Vercel account (free tier available)
- PostgreSQL database (recommended: Neon, Supabase, or Railway)

## Step 1: Prepare Your Database

### Option A: Using Neon (Recommended)
1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy your connection string (it will look like: `postgresql://username:password@hostname:port/database?sslmode=require`)

### Option B: Using Supabase
1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Go to Settings > Database
4. Copy your connection string

### Option C: Using Railway
1. Go to [Railway](https://railway.app/)
2. Create a new PostgreSQL database
3. Copy your connection string

## Step 2: Database Schema Setup

Run the following SQL commands in your database to create the required tables:

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Listings table
CREATE TABLE listings (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50),
    condition VARCHAR(20),
    seller_id INTEGER REFERENCES users(id),
    images TEXT[], -- Array of image URLs
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table (for communication between users)
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id),
    receiver_id INTEGER REFERENCES users(id),
    listing_id INTEGER REFERENCES listings(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_seller_id ON listings(seller_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
```

## Step 3: Environment Variables Setup

Create a `.env` file in your project root with the following variables:

```env
# Database
DATABASE_URL=postgresql://username:password@hostname:port/database?sslmode=require

# Server Configuration
PORT=3000
NODE_ENV=production

# Security
SECRET_KEY=your-super-secret-key-here
JWT_SECRET=your-jwt-secret-key-here

# Optional: Email Configuration (if implementing email features)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Optional: File Upload (if using cloud storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Step 4: Deploy to Vercel

### Method 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI globally:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy your project:**
   ```bash
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? `Y`
   - Which scope? (Choose your account)
   - Link to existing project? `N`
   - Project name: `dormdeal-api`
   - Directory: `./`
   - Override settings? `N`

### Method 2: Using Vercel Dashboard

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "New Project"**
3. **Import your Git repository**
4. **Configure project settings:**
   - Framework Preset: `Other`
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

## Step 5: Configure Environment Variables in Vercel

1. **Go to your project dashboard in Vercel**
2. **Navigate to Settings > Environment Variables**
3. **Add the following variables:**

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `DATABASE_URL` | Your PostgreSQL connection string | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |
| `SECRET_KEY` | Your secret key | Production, Preview, Development |
| `JWT_SECRET` | Your JWT secret | Production, Preview, Development |

## Step 6: Deploy and Test

1. **Trigger a new deployment:**
   ```bash
   vercel --prod
   ```

2. **Test your API endpoints:**
   ```bash
   # Health check
   curl https://your-app.vercel.app/health
   
   # Test listings endpoint
   curl https://your-app.vercel.app/api/listings
   ```

## Step 7: Frontend Integration

Update your React frontend to use the deployed API:

```typescript
// In your API service file
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-app.vercel.app/api'
  : 'http://localhost:3000/api';

export const apiService = {
  async getListings() {
    const response = await fetch(`${API_BASE_URL}/listings`);
    return response.json();
  },
  
  async createListing(listingData) {
    const response = await fetch(`${API_BASE_URL}/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(listingData),
    });
    return response.json();
  }
};
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Errors
**Error:** `Error: connect ECONNREFUSED`
**Solution:**
- Verify your `DATABASE_URL` is correct
- Ensure your database allows external connections
- Check if your database provider requires SSL

#### 2. Port Conflicts
**Error:** `EADDRINUSE: address already in use :::3000`
**Solution:**
- Vercel automatically handles port configuration
- Don't hardcode port numbers in production
- Use `process.env.PORT || 3000`

#### 3. Environment Variables Not Loading
**Error:** `undefined` environment variables
**Solution:**
- Ensure variables are set in Vercel dashboard
- Check variable names match exactly (case-sensitive)
- Redeploy after adding new environment variables

#### 4. Build Failures
**Error:** Build command fails
**Solution:**
- Check your `package.json` scripts
- Ensure all dependencies are in `dependencies` (not `devDependencies`)
- Verify Node.js version compatibility

#### 5. CORS Issues
**Error:** CORS policy blocks requests
**Solution:**
- Configure CORS in your Express app
- Add your frontend domain to allowed origins
- Use environment variables for different domains

#### 6. Database SSL Issues
**Error:** SSL connection required
**Solution:**
- Add SSL configuration to your database connection
- Use `sslmode=require` in your connection string
- Configure SSL in your database provider

### Performance Optimization

1. **Database Connection Pooling:**
   ```javascript
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     max: 20,
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000,
   });
   ```

2. **Caching:**
   - Implement Redis for session storage
   - Use Vercel's edge caching for static content
   - Cache database queries when appropriate

3. **Monitoring:**
   - Set up Vercel Analytics
   - Monitor database performance
   - Use logging services like LogRocket or Sentry

## Security Best Practices

1. **Environment Variables:**
   - Never commit `.env` files to version control
   - Use strong, unique secrets
   - Rotate secrets regularly

2. **Database Security:**
   - Use connection pooling
   - Implement proper authentication
   - Use prepared statements to prevent SQL injection

3. **API Security:**
   - Implement rate limiting
   - Use HTTPS in production
   - Validate all input data
   - Implement proper error handling

## Monitoring and Maintenance

1. **Health Checks:**
   - Monitor `/health` endpoint
   - Set up uptime monitoring
   - Track response times

2. **Database Maintenance:**
   - Regular backups
   - Monitor connection usage
   - Optimize slow queries

3. **Logging:**
   - Implement structured logging
   - Monitor error rates
   - Track user activity

## Support

If you encounter issues not covered in this guide:

1. Check Vercel's [documentation](https://vercel.com/docs)
2. Review your database provider's documentation
3. Check the application logs in Vercel dashboard
4. Test your API endpoints using tools like Postman or curl

## Next Steps

After successful deployment:

1. Set up a custom domain
2. Configure SSL certificates
3. Implement monitoring and alerting
4. Set up automated backups
5. Plan for scaling as your user base grows

---

**Note:** This deployment guide assumes you're using PostgreSQL. If you're using a different database, adjust the connection string and SQL schema accordingly.
