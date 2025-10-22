# DormDeals Deployment Guide

This guide provides comprehensive instructions for deploying the DormDeals application to Render and other platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Deployment to Render](#deployment-to-render)
- [Deployment to Vercel](#deployment-to-vercel)
- [Environment Variables](#environment-variables)
- [Build Process](#build-process)
- [Troubleshooting](#troubleshooting)
- [Team Deployment Checklist](#team-deployment-checklist)

## Prerequisites

Before deploying, ensure you have:

- Node.js 16.0.0 or higher
- npm 8.0.0 or higher
- Git repository access
- Render account (for primary deployment)
- Vercel account (for alternative deployment)

## Environment Setup

### 1. Clone and Install Dependencies

```bash
git clone https://gitlab.com/sohaikia2002/fa25team04.git
cd fa25team04
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your variables:

```bash
cp .env.example .env
```

Edit `.env` with your actual values (see [Environment Variables](#environment-variables) section).

### 3. Local Testing

Test the application locally before deployment:

```bash
# Development server
npm run dev

# Production build test
npm run build:production
npm run preview
```

## Deployment to Render

### Step 1: Prepare Repository

1. Ensure all code is committed and pushed to your Git repository
2. Verify that `package.json` contains the correct build scripts
3. Check that `vercel.json` is properly configured

### Step 2: Create Render Service

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Static Site"
3. Connect your Git repository
4. Configure the following settings:

**Basic Settings:**
- **Name**: `dormdeals` (or your preferred name)
- **Branch**: `main` (or your default branch)
- **Root Directory**: Leave empty (root of repository)
- **Build Command**: `npm run build:production`
- **Publish Directory**: `dist`

**Advanced Settings:**
- **Node Version**: `18` (or latest LTS)
- **Environment**: `Production`

### Step 3: Environment Variables

In the Render dashboard, go to your service → Environment tab and add:

**Required Variables:**
```
NODE_ENV=production
VITE_APP_ENV=production
```

**API Configuration:**
```
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_API_TIMEOUT=10000
```

**Authentication:**
```
VITE_JWT_SECRET=your-secure-jwt-secret
VITE_ENCRYPTION_KEY=your-encryption-key
```

**External Services (as needed):**
```
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-key
VITE_GOOGLE_ANALYTICS_ID=your-analytics-id
```

### Step 4: Deploy

1. Click "Create Static Site"
2. Render will automatically build and deploy your application
3. Monitor the build logs for any errors
4. Once deployed, you'll receive a URL (e.g., `https://dormdeals.onrender.com`)

## Deployment to Vercel

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Deploy

```bash
# Login to Vercel
vercel login

# Deploy from project directory
vercel

# For production deployment
vercel --prod
```

### Step 3: Configure Environment Variables

In Vercel dashboard:
1. Go to your project → Settings → Environment Variables
2. Add all required environment variables
3. Redeploy if needed

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Application environment | `production` |
| `VITE_APP_ENV` | Frontend environment | `production` |
| `VITE_API_BASE_URL` | Backend API URL | `https://api.dormdeals.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_TIMEOUT` | API request timeout (ms) | `10000` |
| `VITE_MAX_FILE_SIZE` | Max file upload size (bytes) | `5242880` |
| `VITE_ENABLE_ANALYTICS` | Enable analytics | `true` |
| `VITE_ENABLE_DEBUG_MODE` | Enable debug mode | `false` |

### Service-Specific Variables

**Authentication:**
- `VITE_JWT_SECRET`: JWT signing secret
- `VITE_ENCRYPTION_KEY`: Data encryption key

**External APIs:**
- `VITE_GOOGLE_MAPS_API_KEY`: Google Maps integration
- `VITE_STRIPE_PUBLISHABLE_KEY`: Payment processing
- `VITE_GOOGLE_ANALYTICS_ID`: Analytics tracking

**File Upload:**
- `VITE_MAX_FILE_SIZE`: Maximum file size
- `VITE_ALLOWED_FILE_TYPES`: Allowed file types

## Build Process

### Local Build

```bash
# Type checking
npm run type-check

# Production build
npm run build:production

# Preview build
npm run preview
```

### Build Scripts

- `npm run dev`: Development server
- `npm run build`: Standard build
- `npm run build:production`: Production build with type checking
- `npm run preview`: Preview production build
- `npm run deploy`: Deploy command (builds for production)

### Build Output

The build process creates a `dist` directory containing:
- Static HTML, CSS, and JavaScript files
- Optimized assets
- Source maps (if enabled)

## Troubleshooting

### Common Issues

#### 1. Build Failures

**Error**: TypeScript compilation errors
```bash
# Solution: Fix TypeScript errors
npm run type-check
```

**Error**: Missing dependencies
```bash
# Solution: Install dependencies
npm install
```

#### 2. Environment Variables Not Loading

**Issue**: VITE_ variables not accessible in production
- Ensure variables start with `VITE_`
- Check that variables are set in deployment platform
- Verify no typos in variable names

#### 3. Routing Issues

**Issue**: 404 errors on page refresh
- Ensure `vercel.json` has proper routing configuration
- Check that all routes redirect to `index.html`

#### 4. API Connection Issues

**Issue**: API calls failing in production
- Verify `VITE_API_BASE_URL` is correct
- Check CORS configuration
- Ensure API server is running and accessible

#### 5. Asset Loading Issues

**Issue**: Images or CSS not loading
- Check file paths are relative
- Verify assets are in `public` directory
- Check build output in `dist` directory

### Debug Commands

```bash
# Check TypeScript errors
npm run type-check

# Lint code
npm run lint

# Build with verbose output
npm run build -- --debug

# Check environment variables
npm run dev -- --debug
```

### Logs and Monitoring

**Render:**
- Check build logs in Render dashboard
- Monitor service logs for runtime errors
- Set up alerts for deployment failures

**Vercel:**
- View function logs in Vercel dashboard
- Check build logs for deployment issues
- Monitor performance metrics

## Team Deployment Checklist

### Pre-Deployment

- [ ] All code reviewed and merged to main branch
- [ ] Environment variables documented and configured
- [ ] Build process tested locally
- [ ] TypeScript errors resolved
- [ ] Linting passes without errors
- [ ] All dependencies up to date

### Deployment

- [ ] Repository connected to deployment platform
- [ ] Build command configured correctly
- [ ] Environment variables set
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate enabled
- [ ] CDN configured (if applicable)

### Post-Deployment

- [ ] Application loads correctly
- [ ] All pages accessible
- [ ] API calls working
- [ ] File uploads functional
- [ ] Authentication working
- [ ] Performance acceptable
- [ ] Analytics tracking (if enabled)
- [ ] Error monitoring set up

### Rollback Plan

If deployment fails:

1. **Immediate**: Revert to previous working version
2. **Investigate**: Check build logs and error messages
3. **Fix**: Address issues in development
4. **Test**: Verify fix locally
5. **Redeploy**: Deploy corrected version

## Support

For deployment issues:

1. Check this documentation first
2. Review build logs in deployment platform
3. Test locally with production build
4. Contact team lead for assistance
5. Create issue in project repository

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)

---

**Last Updated**: October 2025
**Maintained By**: DormDeals Team
