# DormDeals — Frontend Deployment (Vite React SPA)

This is a static Vite + React + TypeScript SPA. No Node/Express server is required.

## 1) Local production test
```bash
npm ci
npm run build:production
npm run preview
```

## 2) Vercel deployment
1. Connect your GitLab repo to Vercel
2. Vercel will auto-detect Vite framework
3. Build command: `npm run build`
4. Output directory: `dist`
5. Deploy!

## 3) Environment variables
Copy `.env.example` to `.env` and configure:
- `VITE_API_BASE_URL` - Your API endpoint
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- Other `VITE_*` variables as needed

## 4) GitLab CI/CD
The `.gitlab-ci.yml` handles:
- Node 20 Alpine image
- ESLint with flat config
- TypeScript type checking
- Production build
- Artifact generation

## 5) SPA routing
`vercel.json` ensures client-side routes work on refresh:
- `/checkout` → `/index.html`
- `/listing/123` → `/index.html`
- All routes serve the React app