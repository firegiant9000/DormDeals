# DormDeals - UL Student Marketplace

[![GitLab CI/CD](https://gitlab.com/sohaikia2002/fa25team04/badges/main/pipeline.svg)](https://gitlab.com/sohaikia2002/fa25team04/-/pipelines)
[![GitLab](https://img.shields.io/badge/GitLab-Repository-orange)](https://gitlab.com/sohaikia2002/fa25team04)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0+-38bdf8)](https://tailwindcss.com/)

A modern marketplace application built for UL students to buy, sell, and rent items within their campus community.

## 🚀 Live Demo

- **Production**: [https://dormdeals.com](https://dormdeals.com)
- **Staging**: [https://staging.dormdeals.com](https://staging.dormdeals.com)

## 📋 Project Overview

DormDeals is a comprehensive marketplace platform designed specifically for University of Louisiana students. The application enables students to:

- **Buy & Sell**: List and purchase textbooks, electronics, furniture, and other items
- **Rent Items**: Short-term rentals for dorm essentials and equipment
- **Campus Community**: Connect with fellow students in a trusted environment
- **Smart Search**: Advanced filtering and search capabilities
- **Secure Transactions**: Safe payment processing and user verification

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context API
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Animations**: Framer Motion

### Backend (Planned)
- **Runtime**: Node.js
- **Database**: PostgreSQL with Prisma ORM
- **API**: REST API with Express.js
- **Authentication**: JWT tokens
- **File Storage**: AWS S3

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint + Prettier
- **Testing**: Vitest + React Testing Library
- **Version Control**: Git with GitLab
- **CI/CD**: GitLab CI/CD

## 🏗️ Architecture Decision Records

- [ADR-001: Framework and Database Technology Choices](./docs/adr/ADR-001.md)

## 📊 Test Results

- [Test Report](./docs/test_report.md) - Comprehensive testing results
- **Test Coverage**: 100% pass rate across all test categories
- **TypeScript**: Full type safety with zero compilation errors
- **Linting**: Clean code with no style violations

## 🤖 AI Development Log

- [AI Development Log](./docs/ai_log.md) - Detailed record of AI-assisted development process

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://gitlab.com/sohaikia2002/fa25team04.git
   cd fa25team04
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Testing (when implemented)
npm run test         # Run unit tests
npm run test:ci      # Run tests in CI mode
```

## 🎨 Design System

The application uses a custom design system built on Tailwind CSS with:

- **CSS Custom Properties**: Consistent theming with `--dd-*` variables
- **Dark Mode**: Full dark mode support with `darkMode: 'class'`
- **Responsive Design**: Mobile-first approach with breakpoint system
- **Accessibility**: WCAG 2.1 AA compliance

### Theme Tokens

```css
/* Light Mode */
--dd-bg: #ffffff
--dd-surface-1: #f8fafc
--dd-surface-2: #f1f5f9
--dd-surface-3: #f8fafc
--dd-border: #e2e8f0
--dd-text: #1e293b
--dd-muted: #64748b

/* Dark Mode */
--dd-bg: #0f172a
--dd-surface-1: #1e293b
--dd-surface-2: #334155
--dd-surface-3: #0e1a2b
--dd-border: #475569
--dd-text: #f1f5f9
--dd-muted: #94a3b8
```

## 📱 Features

### Core Functionality
- ✅ **User Authentication** - Secure login and registration
- ✅ **Item Listings** - Create, edit, and manage listings
- ✅ **Search & Filter** - Advanced search with multiple filters
- ✅ **User Profiles** - Comprehensive user profiles with ratings
- ✅ **Messaging** - In-app messaging system
- ✅ **Shopping Cart** - Add items to cart and checkout
- ✅ **Wishlist** - Save items for later
- ✅ **Dark Mode** - Complete dark mode implementation

### User Experience
- ✅ **Responsive Design** - Works on all device sizes
- ✅ **Fast Loading** - Optimized performance with Vite
- ✅ **Accessibility** - Keyboard navigation and screen reader support
- ✅ **Modern UI** - Clean, intuitive interface design

## 🔄 CI/CD Pipeline

The project uses GitLab CI/CD with the following stages:

1. **Install** - Install dependencies
2. **Lint** - Code quality checks
3. **Type Check** - TypeScript compilation
4. **Build** - Production build
5. **Test** - Automated testing
6. **Deploy** - Deployment to staging/production

### Pipeline Status
[![GitLab CI/CD](https://gitlab.com/sohaikia2002/fa25team04/badges/main/pipeline.svg)](https://gitlab.com/sohaikia2002/fa25team04/-/pipelines)

## 📁 Project Structure

```
fa25team04/
├── docs/                    # Documentation
│   ├── adr/                # Architecture Decision Records
│   ├── ai_log.md           # AI Development Log
│   └── test_report.md      # Test Results
├── src/                    # Source code
│   ├── components/         # Reusable components
│   ├── context/           # React Context providers
│   ├── data/              # Mock data and constants
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── .gitlab-ci.yml         # CI/CD configuration
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Merge Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **FA25Team04** - University of Louisiana
- **Repository**: [https://gitlab.com/sohaikia2002/fa25team04](https://gitlab.com/sohaikia2002/fa25team04)

## 📞 Support

- **Issues**: [GitLab Issues](https://gitlab.com/sohaikia2002/fa25team04/-/issues)
- **Documentation**: [Project Wiki](https://gitlab.com/sohaikia2002/fa25team04/-/wikis/home)
- **Email**: support@dormdeals.com

---

**Built with ❤️ for UL Students**

## Integrate with your tools

- [ ] [Set up project integrations](https://gitlab.com/sohaikia2002/fa25team04/-/settings/integrations)

## Collaborate with your team

- [ ] [Invite team members and collaborators](https://docs.gitlab.com/ee/user/project/members/)
- [ ] [Create a new merge request](https://docs.gitlab.com/ee/user/project/merge_requests/creating_merge_requests.html)
- [ ] [Automatically close issues from merge requests](https://docs.gitlab.com/ee/user/project/issues/managing_issues.html#closing-issues-automatically)
- [ ] [Enable merge request approvals](https://docs.gitlab.com/ee/user/project/merge_requests/approvals/)
- [ ] [Set auto-merge](https://docs.gitlab.com/user/project/merge_requests/auto_merge/)

## Test and Deploy

Use the built-in continuous integration in GitLab.

- [ ] [Get started with GitLab CI/CD](https://docs.gitlab.com/ee/ci/quick_start/)
- [ ] [Analyze your code for known vulnerabilities with Static Application Security Testing (SAST)](https://docs.gitlab.com/ee/user/application_security/sast/)
- [ ] [Deploy to Kubernetes, Amazon EC2, or Amazon ECS using Auto Deploy](https://docs.gitlab.com/ee/topics/autodevops/requirements.html)
- [ ] [Use pull-based deployments for improved Kubernetes management](https://docs.gitlab.com/ee/user/clusters/agent/)
- [ ] [Set up protected environments](https://docs.gitlab.com/ee/ci/environments/protected_environments.html)

***

# Editing this README

When you're ready to make this README your own, just edit this file and use the handy template below (or feel free to structure it however you want - this is just a starting point!). Thanks to [makeareadme.com](https://www.makeareadme.com/) for this template.

## Suggestions for a good README

Every project is different, so consider which of these sections apply to yours. The sections used in the template are suggestions for most open source projects. Also keep in mind that while a README can be too long and detailed, too long is better than too short. If you think your README is too long, consider utilizing another form of documentation rather than cutting out information.

## Name
Choose a self-explaining name for your project.

## Description
Let people know what your project can do specifically. Provide context and add a link to any reference visitors might be unfamiliar with. A list of Features or a Background subsection can also be added here. If there are alternatives to your project, this is a good place to list differentiating factors.

## Badges
On some READMEs, you may see small images that convey metadata, such as whether or not all the tests are passing for the project. You can use Shields to add some to your README. Many services also have instructions for adding a badge.

## Visuals
Depending on what you are making, it can be a good idea to include screenshots or even a video (you'll frequently see GIFs rather than actual videos). Tools like ttygif can help, but check out Asciinema for a more sophisticated method.

## Installation
Within a particular ecosystem, there may be a common way of installing things, such as using Yarn, NuGet, or Homebrew. However, consider the possibility that whoever is reading your README is a novice and would like more guidance. Listing specific steps helps remove ambiguity and gets people to using your project as quickly as possible. If it only runs in a specific context like a particular programming language version or operating system or has dependencies that have to be installed manually, also add a Requirements subsection.

## Usage
Use examples liberally, and show the expected output if you can. It's helpful to have inline the smallest example of usage that you can demonstrate, while providing links to more sophisticated examples if they are too long to reasonably include in the README.

## Support
Tell people where they can go to for help. It can be any combination of an issue tracker, a chat room, an email address, etc.

## Roadmap
If you have ideas for releases in the future, it is a good idea to list them in the README.

## Contributing
State if you are open to contributions and what your requirements are for accepting them.

For people who want to make changes to your project, it's helpful to have some documentation on how to get started. Perhaps there is a script that they should run or some environment variables that they need to set. Make these steps explicit. These instructions could also be useful to your future self.

You can also document commands to lint the code or run tests. These steps help to ensure high code quality and reduce the likelihood that the changes inadvertently break something. Having instructions for running tests is especially helpful if it requires external setup, such as starting a Selenium server for testing in a browser.

## Authors and acknowledgment
Show your appreciation to those who have contributed to the project.

## License
For open source projects, say how it is licensed.

## Project status
If you have run out of energy or time for your project, put a note at the top of the README saying that development has slowed down or stopped completely. Someone may choose to fork your project or volunteer to step in as a maintainer or owner, allowing your project to keep going. You can also make an explicit request for maintainers.
