# SKUL MOGULZ 💀🚀
> **The Operating System for Student Titans.**

![Status](https://img.shields.io/badge/Status-Stealth_Mode-black?style=for-the-badge&logo=github)
![Vibe](https://img.shields.io/badge/Vibe-Hardcore-A5D6B7?style=for-the-badge)

## 🧠 The Vision
We are not building a social network. We are building a utility network for the next generation of Elon Musks and Mark Zuckerbergs.

*   **See the Master Plan:** [`docs/vision/MASTER_PLAN.md`](./docs/vision/MASTER_PLAN.md)
*   **See the Roadmap:** [`docs/vision/PRODUCT_ROADMAP.md`](./docs/vision/PRODUCT_ROADMAP.md)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/Gideon-Dadey/SKUL-MOGULZ-PERSONAL-.git
cd SKUL-MOGULZ-PERSONAL-

# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`

---

## 📁 Project Structure

```
SKUL MOGULZ/
├── client/                      # Frontend React application
│   ├── src/
│   │   ├── assets/              # Static assets (images, icons)
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Navbar/          # Navigation component
│   │   │   └── PostCard/        # Shared post/project card
│   │   ├── context/             # React Context providers
│   │   │   ├── AuthContext.tsx  # Authentication state
│   │   │   └── ThemeContext.tsx # Theme management
│   │   ├── data/                # Mock data for development
│   │   │   └── mockData.ts      # Sample users, posts, notifications
│   │   ├── hooks/               # Custom React hooks
│   │   ├── pages/               # Page components
│   │   │   ├── FeedPage/        # Main feed (LinkedIn style)
│   │   │   ├── CreatePostPage/  # Modern post editor
│   │   │   ├── PostDetailPage/  # Article view for posts
│   │   │   ├── ProfilePage/     # Professional user profile
│   │   │   ├── NetworkPage/     # Connection management
│   │   │   ├── ProjectsPage/    # Project discovery grid
│   │   │   └── MessagesPage/    # Real-time chat interface
│   │   ├── services/            # API service functions
│   │   ├── styles/              # Global CSS styles
│   │   │   └── index.css        # Main stylesheet
│   │   ├── types/               # TypeScript type definitions
│   │   ├── utils/               # Utility functions
│   │   ├── App.tsx              # Main application component with routing
│   │   └── main.tsx             # Application entry point
│   ├── index.html               # HTML template
│   ├── package.json             # Client dependencies
│   ├── tsconfig.json            # TypeScript configuration
│   └── vite.config.ts           # Vite configuration
├── server/                      # Backend Node.js application (future)
├── docs/                        # Documentation
├── implementation_plan.md       # MVP implementation plan
├── package.json                 # Root package.json
└── README.md                    # This file
```

---

## ✨ Features

### MVP Features (Current)

| Feature | Description | Status |
|---------|-------------|--------|
| **User Registration** | Email-based signup with role selection (Student/Investor) | ✅ |
| **User Authentication** | Login/logout with localStorage persistence | ✅ |
| **Professional Feed** | LinkedIn-style feed with sidebars, news, and suggestions | ✅ |
| **Create Posts** | Modern editor with formatting, category, stage, and funding goals | ✅ |
| **Network Management** | Manage connections, handle invitations, and find new people | ✅ |
| **Project Discovery** | Dedicated grid view for discovering student startups with filters | ✅ |
| **Direct Messaging** | Professional chat interface with conversation history | ✅ |
| **User Profiles** | Detailed profiles with banners, stats, activity, and about sections | ✅ |
| **Search & Filter** | Find posts, people, and projects by keyword or category | ✅ |
| **Like & Comment** | Rich interactions on posts and projects | ✅ |
| **Theme Toggle** | Switch between light and dark mode | ✅ |
| **Responsive Design** | Fully responsive layout for all devices | ✅ |

### Future Enhancements (Planned)

- [ ] Backend API integration (Node.js/Express)
- [ ] Database persistence (MongoDB Atlas)
- [ ] Real-time Socket.io integration for messages/notifications
- [ ] Advanced Analytics Dashboard
- [ ] Payment gateway for funding projects
- [ ] Email notifications
- [ ] File uploads (Images/Documents)

---

## 🛠 Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.x | UI framework |
| **TypeScript** | 5.x | Type safety |
| **Vite** | 6.x | Build tool & dev server |
| **React Router** | 7.x | Client-side routing |
| **Lucide React** | Latest | Icon library |
| **Axios** | 1.x | HTTP client |
| **CSS Variables** | N/A | Theming & Design System |

### Backend (Planned)
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime |
| **Express** | Web framework |
| **MongoDB Atlas** | Database |
| **JWT** | Authentication |

### Design
| Aspect | Choice |
|--------|--------|
| **Typography** | Plus Jakarta Sans |
| **Primary Color** | Coral/Salmon (#A5D6B7) |
| **Theme** | Light (default) & Dark |
| **CSS** | Custom CSS Modules & Variables |

---

## 📖 Documentation

- [Architecture Guide](./docs/ARCHITECTURE.md) - System architecture and design patterns
- [Component Library](./docs/COMPONENTS.md) - Reusable components documentation
- [API Reference](./docs/API.md) - API endpoints (for backend)
- [Contributing Guide](./docs/CONTRIBUTING.md) - How to contribute
- [Style Guide](./docs/STYLE_GUIDE.md) - CSS and design conventions

---

## 🎨 Design System

### Colors

```css
/* Light Theme */
--primary: #A5D6B7;        /* Mint Green */
--primary-hover: #89C29D;
--bg-main: #ffffff;
--bg-card: #f8f9fb;
--text-main: #1a1a2e;
--text-muted: #64748b;

/* Dark Theme */
--bg-main: #0c0c14;
--bg-card: #141422;
--text-main: #f4f4f5;
--text-muted: #a1a1aa;
```

### Typography

```css
--font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
```

### Spacing & Radius

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 24px;
```

---

## 🧪 Running Tests

```bash
# Run unit tests (future)
npm run test

# Run e2e tests (future)
npm run test:e2e
```

---

## 📦 Building for Production

```bash
cd client
npm run build
```

The production build will be generated in `client/dist/`.

---

## 🚢 Deployment

### Recommended Platforms
- **Vercel** - Frontend hosting
- **Railway** - Backend hosting
- **MongoDB Atlas** - Database

### Environment Variables

Create a `.env` file in the client directory:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=SKUL MOGULZ
```

---

## 👥 Team

| Role | Responsibility |
|------|----------------|
| Project Manager | Timelines & deliverables |
| Lead Engineer | System architecture |
| Frontend Developer | React/TypeScript UI |
| Backend Developer | APIs & database |
| UI/UX Designer | Wireframes & design |
| QA Tester | Testing & bug reports |

---

## 📄 License

This project is proprietary and confidential.

---

## 📞 Support

For questions or support, please contact the development team.

---

**Built with ❤️ by the SKUL MOGULZ Team**
