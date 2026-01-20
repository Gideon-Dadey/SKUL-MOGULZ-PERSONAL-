# SKUL MOGULZ - Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.1.0] - 2026-01-20

### 🚀 Initial MVP Release

This is the first MVP release of SKUL MOGULZ, featuring core functionality for students and investors to connect.

### Added

#### Authentication
- User registration with email
- Login/logout functionality
- Role selection (Student/Investor)
- Persistent authentication with localStorage

#### Posts & Feed
- Create new posts with:
  - Project title and description
  - Category selection (10 categories)
  - Project stage (Idea → Scaling)
  - Tags (up to 5)
  - Funding goal and current funding
- View all posts in main feed
- Like posts
- Comment on posts with nested replies
- Single post detail view

#### Search & Filter
- Full-text search across posts
- Filter by category
- Filter by project stage
- Sort by: Recent, Trending, Popular

#### User Profiles
- Profile page with user information
- Display user's posts
- Follower/following counts
- Interest tags

#### Theme
- Light mode (default)
- Dark mode
- Theme toggle in navigation
- Persistent theme preference

#### Landing Page
- Modern hero section with CTAs
- Stats section
- Features grid
- How it works section
- Footer with navigation

### Technical

#### Frontend Stack
- React 19 with TypeScript
- Vite 7 for build tooling
- React Router 7 for routing
- Lucide React for icons
- CSS Variables for theming

#### Design System
- Plus Jakarta Sans typography
- Coral/Salmon primary color (#ff6b4a)
- Glassmorphism card components
- Responsive design (mobile → desktop)

#### Documentation
- README.md with setup instructions
- Architecture documentation
- Component library documentation
- API reference (for future backend)
- Style guide
- Contributing guide

---

## Upcoming

### [0.2.0] - Planned
- Real-time notifications
- Direct messaging between users
- Image uploads for posts
- Enhanced search with filters

### [0.3.0] - Planned
- Investor dashboard
- Analytics for projects
- Community groups
- Email notifications

### [1.0.0] - Future
- Payment/funding integration
- Mobile app (React Native)
- Advanced analytics
- API for third-party integrations

---

## Migration Notes

### From Development to Production
1. Configure environment variables
2. Set up MongoDB Atlas
3. Deploy backend to Railway
4. Deploy frontend to Vercel
5. Configure custom domain

---

*Maintained by the SKUL MOGULZ Team*
