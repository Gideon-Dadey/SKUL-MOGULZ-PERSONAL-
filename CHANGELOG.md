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
- Coral/Salmon primary color (#A5D6B7)
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

## [0.2.0] - 2026-01-28

### 📡 Real-time Communication & Backend Integration

Major update transitioning from mock data to a fully functional backend with real-time capabilities.

### Added

#### Messaging & Calls
- **Real-time Chat**: Individual messaging system powered by Socket.io.
- **Voice & Video Calls**: Integrated calling functionality using Jitsi Meet.
- **Call Signaling**: Backend socket events for starting, accepting, and ending calls.
- **Call Overlay**: Modern UI for incoming and active calls.

#### Backend Integration
- **Node.js/Express Server**: Complete backend API for users, projects, and interactions.
- **MongoDB Persistence**: Real data storage for all platform entities.
- **JWT Auth**: Secure, token-based authentication system.
- **Socket.io Server**: Dedicated socket handler for real-time events.

#### UX Enhancements
- **Notifications Page**: Centralized hub for platform updates.
- **Analytics Dashboard**: Visual data representation for professional metrics.
- **Improved Profiles**: Dynamic profile fetching with real user data.

### Technical
- **SocketContext**: Global state for socket connection management.
- **CallContext**: Sophisticated state machine for managing call lifecycles.
- **API Wrapper**: Centralized Axios instance for authenticated requests.

---

## [0.2.1] - 2026-01-30

### 🎨 Branding & Cross-Platform Synchronization

Refined the visual identity and synchronized the experience between the web and mobile applications.

### Added
- **Unified Branding**: Established `icon.png` as the official platform logo and default avatar fallback across all platforms.
- **Shared Assets**: Integrated brand assets into both `client` (web) and `mobile` projects.
- **Mobile Action Bar Sync**: Synchronized the "Create Post" bar on mobile to match the web's design:
  - Reordered actions to Media, Event, and Article.
  - Updated icons and brand-specific colors (#3b82f6 for Media, #f59e0b for Event, #10b981 for Article).
- **Default Avatar System**: Implemented a global fallback system where the platform icon is used for any user without a profile picture, ensuring a professional and consistent look.

### Changed
- **Mobile Feed UI**: Replaced the "Goal" action with "Article" to match the web's utility-first approach.
- **Iconography**: Updated the "Goal/Article" icon to a professional `Target`/`FileText` icon for a more realistic feel.

---

## Upcoming

### [0.3.0] - Planned
- File uploads for projects and profile avatars.
- Enhanced search with advanced filtering (University, Funding).
- Community groups and niche-specific forums.
- Email notification system (SendGrid integration).

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
