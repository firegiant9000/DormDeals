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
cp env.example .env
```

2. Update the `.env` file with your database credentials and other configuration:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dormdeals
DB_USER=your_username
DB_PASSWORD=your_password

# Server Configuration
PORT=3001
NODE_ENV=development

# Client Configuration
VITE_API_URL=http://localhost:3001
```

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
This will start both the frontend (Vite dev server) and backend (Express server) concurrently.

#### Production Mode
```bash
npm run build
npm start
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start both frontend and backend in development mode |
| `npm run client:dev` | Start only the frontend development server |
| `npm run server:dev` | Start only the backend development server |
| `npm run build` | Build the application for production |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint to check code quality |
| `npm test` | Run Jest test suite |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run preview` | Preview the production build |
| `npm run type-check` | Run TypeScript type checking |

## 📁 Project Structure

```
fa25team04/
├── database/
│   └── schema.sql              # Database schema
├── docs/
│   ├── adr/                    # Architecture Decision Records
│   ├── ai_log.md              # AI development log
│   └── test_report.md         # Testing documentation
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Layout.tsx
│   │   └── ...
│   ├── context/               # React Context providers
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
├── index.js                   # Backend entry point
├── package.json               # Dependencies and scripts
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite configuration
└── README.md                  # This file
```

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
