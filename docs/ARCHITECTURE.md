# SKUL MOGULZ Architecture

## Overview

SKUL MOGULZ follows a modern client-server architecture designed for scalability, maintainability, and performance.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Pages     │  │  Components │  │      Context/State      │  │
│  │  - Landing  │  │  - PostCard │  │  - AuthContext          │  │
│  │  - Feed     │  │  - Search   │  │  - ThemeContext         │  │
│  │  - Profile  │  │  - Navbar   │  │                         │  │
│  │  - Create   │  │  - Footer   │  │                         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                              │                                   │
│                    ┌─────────▼─────────┐                        │
│                    │  Services (API)   │                        │
│                    │  - axios client   │                        │
│                    └─────────┬─────────┘                        │
└──────────────────────────────┼──────────────────────────────────┘
                               │ HTTP/REST
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SERVER (Node.js)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Routes    │  │ Controllers │  │       Services          │  │
│  │  /api/auth  │  │  - Auth     │  │  - User Service         │  │
│  │  /api/posts │  │  - Posts    │  │  - Post Service         │  │
│  │  /api/users │  │  - Users    │  │  - Notification Service │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                              │                                   │
│                    ┌─────────▼─────────┐                        │
│                    │  Data Access      │                        │
│                    │  - Mongoose ODM   │                        │
│                    └─────────┬─────────┘                        │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE (MongoDB)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Users     │  │    Posts    │  │     Notifications       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Directory Structure

```
client/src/
├── assets/              # Static files (images, fonts)
├── components/          # Reusable UI components
├── context/             # React Context providers
├── data/                # Mock data (development)
├── hooks/               # Custom React hooks
├── pages/               # Route-level components
├── services/            # API service layer
├── styles/              # Global styles
├── types/               # TypeScript definitions
├── utils/               # Helper functions
├── App.tsx              # Root component
└── main.tsx             # Entry point
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        App.tsx                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   ThemeProvider                      │   │
│  │  ┌───────────────────────────────────────────────┐  │   │
│  │  │                 AuthProvider                   │  │   │
│  │  │  ┌─────────────────────────────────────────┐  │  │   │
│  │  │  │              Router                      │  │  │   │
│  │  │  │  ┌─────────────────────────────────┐    │  │  │   │
│  │  │  │  │         Navbar                   │    │  │  │   │
│  │  │  │  └─────────────────────────────────┘    │  │  │   │
│  │  │  │  ┌─────────────────────────────────┐    │  │  │   │
│  │  │  │  │      Routes (Pages)              │    │  │  │   │
│  │  │  │  └─────────────────────────────────┘    │  │  │   │
│  │  │  └─────────────────────────────────────────┘  │  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### State Management

We use React Context for global state:

| Context | Purpose | Data |
|---------|---------|------|
| **ThemeContext** | Theme management | `theme`, `toggleTheme()` |
| **AuthContext** | Authentication | `user`, `isAuthenticated`, `login()`, `logout()`, `register()` |

### Routing

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | LandingPage | Public homepage |
| `/feed` | FeedPage | Main post feed |
| `/post/:id` | PostDetailPage | Single post view |
| `/create-post` | CreatePostPage | Create new post |
| `/profile` | ProfilePage | Current user profile |
| `/profile/:username` | ProfilePage | Other user profile |
| `/login` | LoginPage | Authentication |
| `/register` | RegisterPage | User registration |

---

## Data Models

### User

```typescript
interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    avatar?: string;
    bio?: string;
    role: 'student' | 'investor';
    interests: string[];
    createdAt: string;
}
```

### Post

```typescript
interface Post {
    id: string;
    author: User;
    title: string;
    content: string;
    category: ProjectCategory;
    tags: string[];
    images?: string[];
    likes: number;
    likedBy: string[];
    comments: Comment[];
    projectStage: 'idea' | 'prototype' | 'mvp' | 'growth' | 'scaling';
    fundingGoal?: number;
    currentFunding?: number;
    createdAt: string;
    updatedAt: string;
}
```

### Comment

```typescript
interface Comment {
    id: string;
    author: User;
    content: string;
    likes: number;
    createdAt: string;
}
```

### Notification

```typescript
interface Notification {
    id: string;
    type: 'like' | 'comment' | 'follow' | 'new_post';
    message: string;
    read: boolean;
    relatedPostId?: string;
    fromUser?: User;
    createdAt: string;
}
```

---

## Project Categories

| Category | Label | Icon |
|----------|-------|------|
| `technology` | Technology | 💻 |
| `healthcare` | Healthcare | 🏥 |
| `fintech` | FinTech | 💰 |
| `education` | Education | 📚 |
| `sustainability` | Sustainability | 🌱 |
| `entertainment` | Entertainment | 🎬 |
| `ecommerce` | E-Commerce | 🛒 |
| `social-impact` | Social Impact | 🤝 |
| `ai-ml` | AI & Machine Learning | 🤖 |
| `other` | Other | ✨ |

---

## API Design (Future Backend)

### Authentication

```
POST   /api/auth/register     # Create new account
POST   /api/auth/login        # Login and get token
POST   /api/auth/logout       # Invalidate token
GET    /api/auth/me           # Get current user
```

### Users

```
GET    /api/users             # List users
GET    /api/users/:id         # Get user by ID
PUT    /api/users/:id         # Update user
DELETE /api/users/:id         # Delete user
GET    /api/users/:id/posts   # Get user's posts
```

### Posts

```
GET    /api/posts             # List posts (with filters)
POST   /api/posts             # Create post
GET    /api/posts/:id         # Get post by ID
PUT    /api/posts/:id         # Update post
DELETE /api/posts/:id         # Delete post
POST   /api/posts/:id/like    # Like post
DELETE /api/posts/:id/like    # Unlike post
POST   /api/posts/:id/comments # Add comment
```

### Notifications

```
GET    /api/notifications     # Get user notifications
PUT    /api/notifications/:id # Mark as read
DELETE /api/notifications/:id # Delete notification
```

---

## Security Considerations

### Authentication
- JWT tokens with expiration
- Secure password hashing (bcrypt)
- HTTPS in production

### Authorization
- Role-based access control (Student vs Investor)
- Resource ownership validation

### Data Protection
- Input validation with Zod schemas
- XSS prevention
- CORS configuration

---

## Performance Optimizations

### Frontend
- Code splitting with React.lazy()
- Image optimization
- CSS minification
- Tree shaking

### Backend (Future)
- Database indexing
- Query optimization
- Response caching
- Rate limiting

---

## Deployment Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Vercel    │────▶│   Railway   │────▶│   MongoDB   │
│  (Frontend) │     │  (Backend)  │     │   Atlas     │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       └───────┬───────────┘
               ▼
        ┌─────────────┐
        │   Cloudinary│
        │   (Images)  │
        └─────────────┘
```

---

## Monitoring & Logging (Future)

- **Error Tracking**: Sentry
- **Analytics**: Mixpanel or Amplitude
- **Logging**: Winston + LogRocket

---

## Version Control

- **Branching**: Git Flow
  - `main` - Production
  - `develop` - Development
  - `feature/*` - New features
  - `bugfix/*` - Bug fixes

---

*Last Updated: January 2026*
