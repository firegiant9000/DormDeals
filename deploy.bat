@echo off
REM DormDeals Vercel Deployment Script for Windows

echo 🚀 Starting DormDeals deployment to Vercel...

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI not found. Installing...
    npm install -g vercel
)

REM Run pre-deployment checks
echo 🔍 Running pre-deployment checks...

REM Type check
echo 📝 Running TypeScript type check...
npm run type-check
if %errorlevel% neq 0 (
    echo ❌ TypeScript errors found. Please fix them before deploying.
    exit /b 1
)

REM Lint check
echo 🧹 Running ESLint...
npm run lint
if %errorlevel% neq 0 (
    echo ❌ Linting errors found. Please fix them before deploying.
    exit /b 1
)

REM Build check
echo 🏗️  Building application...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed. Please fix build errors before deploying.
    exit /b 1
)

echo ✅ All checks passed!

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...
vercel --prod

echo 🎉 Deployment complete!
echo 📱 Your app should be live at the URL provided above.
pause
