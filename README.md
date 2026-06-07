# DormDeals 🏠

**"Your Campus Marketplace - Buy, Sell, Rent with Ease"**

A modern marketplace platform designed specifically for university students to buy, sell, and rent their belongings within their campus community.

## 📋 Description

DormDeals is a comprehensive marketplace application that connects university students, enabling them to easily trade items within their campus community. Whether you're looking to sell textbooks, rent furniture, or find great deals on campus essentials, DormDeals provides a secure and user-friendly platform tailored for student needs.

## ✨ Features

### Core Functionality
- **Item Listings**: Create, browse, and manage product listings with detailed descriptions and images
- **Search & Filter**: Advanced search capabilities with category and price filters
- **User Profiles**: Personal profiles for buyers and sellers with transaction history
- **Messaging System**: Built-in chat functionality for buyer-seller communication
- **Shopping Cart**: Add multiple items to cart for batch purchasing
- **Checkout Process**: Streamlined payment and transaction management

### User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Smooth Animations**: Enhanced UX with Framer Motion animations
- **Dark/Light Theme**: Customizable theme preferences
- **Page Transitions**: Seamless navigation between pages
- **Loading States**: User-friendly loading indicators and error handling

### Technical Features
- **Real-time Updates**: Live data synchronization
- **Type Safety**: Full TypeScript implementation
- **Component Library**: Reusable UI components
- **State Management**: Context-based state management
- **API Integration**: RESTful API with Express.js backend

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **Framer Motion** - Animation library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger

### Development Tools
- **ESLint** - Code linting
- **Jest** - Testing framework
- **Testing Library** - React component testing
- **Nodemon** - Development server
- **Concurrently** - Run multiple commands

## 👥 Team Members

- **Tech Lead**: [Arlo Kharod]
- **Feature Developer**: [Clarence Chong]
- **QA/Documentation Lead**: [Hans Trosclair]
- **UI/UX Designer**: [Olivia Deshotel]

## 🚀 Installation

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (version 16.0.0 or higher)
- **npm** (version 8.0.0 or higher)
- **PostgreSQL** (version 12 or higher)
- **Git**

### Clone Repository

```bash
git clone https://gitlab.com/sohaikia2002/fa25team04.git
cd fa25team04
```

### Install Dependencies

```bash
npm install
```

### Environment Setup

1. Copy the environment example file:
```bash
cp .env.example .env
```

2. Update the `.env` file with your database credentials and other configuration:
```env
# Database Configuration (REQUIRED)
DATABASE_URL=postgresql://username:password@hostname:port/database?sslmode=require

# Server Configuration
PORT=3000
NODE_ENV=development

# Security Keys (REQUIRED)
SECRET_KEY=your-super-secret-key-here-change-this-in-production
JWT_SECRET=your-jwt-secret-key-here-change-this-in-production

# Optional: Frontend Configuration
VITE_API_BASE_URL=http://localhost:3000
```

**Note**: For production deployment, see the [Deployment Guide](#-deployment) section below.

### Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE dormdeals;
```

2. Run the database schema:
```bash
psql -d dormdeals -f database/schema.sql
```

### Run Application

#### Development Mode
```bash
npm run dev
```
This will start the Vite development server for the frontend. The backend API can be run separately if needed, but for development, you can use mock data or configure the frontend to point to a separate API server.

#### Production Mode
```bash
# Build the application
npm run build

# Start the production server
npm start
```

The application will be available at:
- **Full Stack**: http://localhost:3000 (Express serves both frontend and API)
- **API Endpoints**: http://localhost:3000/api/*

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the Vite development server (frontend only) |
| `npm run build` | Build the React app for production (outputs to `dist/`) |
| `npm run build:production` | Type-check and build for production |
| `npm start` | Start the production Express server (serves frontend + API) |
| `npm run start:dev` | Preview the production build with Vite preview server |
| `npm run lint` | Run ESLint to check code quality |
| `npm run lint:ci` | Run ESLint with JUnit output for CI/CD |
| `npm test` | Run Jest test suite |
| `npm run preview` | Preview the production build |
| `npm run type-check` | Run TypeScript type checking |

## 📁 Project Structure

```
fa25team04/
├── api/
│   └── server.js              # API server entry point
├── database/
│   └── schema.sql             # PostgreSQL database schema
├── dist/                      # Production build output (generated)
├── docs/
│   ├── adr/                   # Architecture Decision Records
│   ├── ai_log.md             # AI development log
│   └── test_report.md        # Testing documentation
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Layout.tsx
│   │   └── ...
│   ├── context/               # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── ShopContext.tsx
│   │   └── ThemeContext.tsx
│   ├── pages/                 # Page components
│   │   ├── Home.tsx
│   │   ├── Marketplace.tsx
│   │   ├── Profile.tsx
│   │   └── ...
│   ├── services/              # API services
│   │   ├── api.ts
│   │   └── apiService.ts
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/                 # Utility functions
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   └── animations.ts
│   ├── __tests__/             # Test files
│   │   └── App.test.tsx
│   ├── App.tsx                # Main application component
│   └── index.tsx              # Application entry point
├── index.js                   # Express server entry point
├── index.html                 # HTML template
├── index.js                   # Production Express server (npm start → serves dist/)
├── package.json               # Dependencies and scripts
├── render.yaml                # Render deployment configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite configuration
├── .env.example               # Environment variables template
├── DEPLOYMENT.md              # Render deployment guide
└── README.md                  # This file
```

## 🚀 Deployment

### Deploying to Render

DormDeals is configured for deployment on [Render](https://render.com). The project includes a `render.yaml` configuration file for easy setup.

#### Quick Deploy Steps

1. **Push your code to Git** (GitHub, GitLab, or Bitbucket)

2. **Create a Render Account**
   - Go to [render.com](https://render.com)
   - Sign up or log in

3. **Create a PostgreSQL Database**
   - In Render Dashboard, click "New +" → "PostgreSQL"
   - Choose a name and plan (free tier available)
   - Copy the "Internal Database URL" or "External Database URL"

4. **Create a Web Service**
   - Click "New +" → "Web Service"
   - Connect your Git repository
   - Render will auto-detect the `render.yaml` configuration
   - Set the following environment variables:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `SECRET_KEY`: Generate with `openssl rand -base64 32`
     - `JWT_SECRET`: Generate with `openssl rand -base64 32`
     - `NODE_ENV`: `production` (automatically set)

5. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy your application

#### Environment Variables for Render

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - Session encryption key
- `JWT_SECRET` - JWT token signing key
- `PORT` - Automatically set by Render
- `NODE_ENV` - Set to `production` automatically

#### Build Process

Render will automatically:
1. Install dependencies with `npm ci`
2. Build the React app with `npm run build`
3. Verify the build output exists
4. Start the server with `npm start`

#### Deployment URL

After successful deployment, your app will be available at:
- `https://your-service-name.onrender.com`

**Note**: Free tier services on Render spin down after 15 minutes of inactivity and may take 30-60 seconds to spin back up on first request.

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions from the team! Please follow these guidelines:

1. Create a feature branch from `main`
2. Make your changes with proper TypeScript types
3. Write tests for new functionality
4. Run `npm run lint` and `npm test` before committing
5. Create a merge request with a clear description

## 📞 Support

For questions or support, please contact the development team or create an issue in the project repository.

---

**DormDeals** - Making campus life more affordable and sustainable, one transaction at a time! 🎓
