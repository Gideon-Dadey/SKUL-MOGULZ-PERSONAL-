# SKUL MOGULZ Component Library

This document describes all reusable components in the SKUL MOGULZ frontend application.

---

## Table of Contents

- [Layout Components](#layout-components)
- [UI Components](#ui-components)
- [Form Components](#form-components)
- [Page Components](#page-components)

---

## Layout Components

### Navbar

**Location:** `src/App.tsx` (inline)

The main navigation bar component.

**Features:**
- Logo with link to home
- Navigation links (Features, Explore, Investors, About)
- Theme toggle button
- Authentication buttons (Login/Signup or Logout)

**Usage:**
```tsx
// Included in App.tsx layout
<nav className="navbar">
    {/* ... */}
</nav>
```

---

## UI Components

### PostCard

**Location:** `src/components/PostCard/PostCard.tsx`

Displays a single post in card format.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `post` | `Post` | Yes | The post data to display |
| `onLike` | `(postId: string) => void` | No | Callback when like button is clicked |
| `compact` | `boolean` | No | Show compact version (default: false) |

**Features:**
- Author avatar and info
- Post title and content preview
- Project stage badge (color-coded)
- Funding progress bar (if applicable)
- Category and tags
- Like, comment, share, and save buttons

**Usage:**
```tsx
import PostCard from '../components/PostCard/PostCard';

<PostCard 
    post={postData} 
    onLike={(id) => handleLike(id)}
    compact={false}
/>
```

**Styling:** `src/components/PostCard/PostCard.css`

---

### SearchFilter

**Location:** `src/components/SearchFilter/SearchFilter.tsx`

Search bar with expandable filter options.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `searchQuery` | `string` | Yes | Current search query |
| `onSearchChange` | `(query: string) => void` | Yes | Search query change handler |
| `selectedCategory` | `ProjectCategory \| 'all'` | Yes | Selected category filter |
| `onCategoryChange` | `(category: ProjectCategory \| 'all') => void` | Yes | Category change handler |
| `selectedStage` | `string` | Yes | Selected stage filter |
| `onStageChange` | `(stage: string) => void` | Yes | Stage change handler |

**Features:**
- Search input with clear button
- Expandable filters panel
- Category filter buttons (10 categories)
- Project stage filter buttons (5 stages)
- Clear all filters button

**Usage:**
```tsx
import SearchFilter from '../components/SearchFilter/SearchFilter';

<SearchFilter
    searchQuery={searchQuery}
    onSearchChange={setSearchQuery}
    selectedCategory={selectedCategory}
    onCategoryChange={setSelectedCategory}
    selectedStage={selectedStage}
    onStageChange={setSelectedStage}
/>
```

**Styling:** `src/components/SearchFilter/SearchFilter.css`

---

## Form Components

### Button

**Location:** Defined in `src/styles/index.css`

Standard button styles.

**Variants:**
- `.btn` - Base button styles
- `.btn-primary` - Primary action button (coral)
- `.btn-outline` - Secondary/outline button

**Usage:**
```tsx
<button className="btn btn-primary">Primary Action</button>
<button className="btn btn-outline">Secondary Action</button>
```

---

### Glass Card

**Location:** Defined in `src/styles/index.css`

Glassmorphism card container.

**Usage:**
```tsx
<div className="glass-card">
    {/* Card content */}
</div>
```

**Features:**
- Translucent background
- Subtle border
- Hover animation (lift effect)
- Shadow on hover

---

### Theme Toggle

**Location:** `src/App.tsx` (inline)

Button to toggle between light and dark themes.

**Usage:**
```tsx
import { useTheme } from './context/ThemeContext';

const { theme, toggleTheme } = useTheme();

<button className="theme-toggle" onClick={toggleTheme}>
    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
</button>
```

---

## Page Components

### LandingPage

**Location:** `src/pages/LandingPage.tsx`

The public homepage/landing page.

**Sections:**
1. **Hero Section** - Main value proposition with CTAs
2. **Stats Section** - Platform statistics
3. **Features Section** - Key features grid
4. **How It Works** - 3-step process
5. **CTA Section** - Final call-to-action
6. **Footer** - Links and legal

**Usage:**
```tsx
import LandingPage from './pages/LandingPage';

<Route path="/" element={<LandingPage />} />
```

---

### FeedPage

**Location:** `src/pages/FeedPage/FeedPage.tsx`

Main feed displaying all posts.

**Layout:**
- Left sidebar: Quick actions, trending topics
- Main content: Search/filter + post list
- Right sidebar: Top investors, platform stats

**Features:**
- Search by keyword
- Filter by category and stage
- Sort by recent, trending, or popular
- Infinite scroll (future)

**Usage:**
```tsx
import FeedPage from './pages/FeedPage/FeedPage';

<Route path="/feed" element={<FeedPage />} />
```

**Styling:** `src/pages/FeedPage/FeedPage.css`

---

### CreatePostPage

**Location:** `src/pages/CreatePostPage/CreatePostPage.tsx`

Form to create a new post.

**Form Fields:**
1. Project Title (required)
2. Description (required, markdown supported)
3. Category (required, 10 options)
4. Project Stage (required, 5 options)
5. Tags (optional, max 5)
6. Looking for funding? (toggle)
7. Funding Goal (if funding enabled)
8. Current Funding (if funding enabled)

**Usage:**
```tsx
import CreatePostPage from './pages/CreatePostPage/CreatePostPage';

<Route path="/create-post" element={<CreatePostPage />} />
```

**Styling:** `src/pages/CreatePostPage/CreatePostPage.css`

---

### PostDetailPage

**Location:** `src/pages/PostDetailPage/PostDetailPage.tsx`

Full post view with comments.

**Sections:**
1. Back navigation
2. Post header (author, stage, date)
3. Post title and content
4. Funding progress (if applicable)
5. Tags
6. Action buttons (like, comment, share, save)
7. Comments section
8. Comment form

**URL Params:**
- `id` - Post ID

**Usage:**
```tsx
import PostDetailPage from './pages/PostDetailPage/PostDetailPage';

<Route path="/post/:id" element={<PostDetailPage />} />
```

**Styling:** `src/pages/PostDetailPage/PostDetailPage.css`

---

### ProfilePage

**Location:** `src/pages/ProfilePage/ProfilePage.tsx`

User profile page.

**Sections:**
1. Profile header (avatar, name, role, bio)
2. User meta (join date)
3. Stats (posts, followers, following, likes)
4. Interests tags
5. Content tabs (Posts, Liked, Following)
6. User's posts list

**URL Params:**
- `username` (optional) - If not provided, shows current user

**Usage:**
```tsx
import ProfilePage from './pages/ProfilePage/ProfilePage';

<Route path="/profile" element={<ProfilePage />} />
<Route path="/profile/:username" element={<ProfilePage />} />
```

**Styling:** `src/pages/ProfilePage/ProfilePage.css`

---

## Context Providers

### ThemeProvider

**Location:** `src/context/ThemeContext.tsx`

Manages light/dark theme state.

**Exports:**
- `ThemeProvider` - Wrap app to provide theme context
- `useTheme()` - Hook to access theme state

**Values:**
```typescript
{
    theme: 'light' | 'dark',
    toggleTheme: () => void
}
```

**Usage:**
```tsx
import { ThemeProvider, useTheme } from './context/ThemeContext';

// In App.tsx
<ThemeProvider>
    <App />
</ThemeProvider>

// In components
const { theme, toggleTheme } = useTheme();
```

---

### AuthProvider

**Location:** `src/context/AuthContext.tsx`

Manages authentication state.

**Exports:**
- `AuthProvider` - Wrap app to provide auth context
- `useAuth()` - Hook to access auth state

**Values:**
```typescript
{
    user: User | null,
    isAuthenticated: boolean,
    loading: boolean,
    login: (email: string, password: string) => Promise<void>,
    register: (userData: Partial<User> & { password: string }) => Promise<void>,
    logout: () => void,
    updateProfile: (data: Partial<User>) => void
}
```

**Usage:**
```tsx
import { AuthProvider, useAuth } from './context/AuthContext';

// In App.tsx
<AuthProvider>
    <App />
</AuthProvider>

// In components
const { user, isAuthenticated, login, logout } = useAuth();
```

---

## Icons

We use **Lucide React** for icons.

**Common Icons Used:**
```tsx
import { 
    ArrowRight, ArrowLeft,
    Heart, MessageCircle, Share2, Bookmark,
    Search, SlidersHorizontal, X,
    Sun, Moon,
    Bell, User, Settings,
    Plus, MoreHorizontal,
    TrendingUp, Clock, Flame,
    Briefcase, Users, Shield, Globe, Zap, BarChart2
} from 'lucide-react';
```

**Usage:**
```tsx
<Heart size={18} />
<Sun size={20} fill="currentColor" />
```

---

## CSS Classes Reference

### Layout
- `.app-container` - Main app wrapper
- `.section-padding` - Standard section padding

### Cards
- `.glass-card` - Glassmorphism card
- `.post-card` - Post card styles
- `.sidebar-card` - Sidebar card

### Buttons
- `.btn` - Base button
- `.btn-primary` - Primary button
- `.btn-outline` - Outline button
- `.theme-toggle` - Theme toggle button

### Typography
- `.logo-text` - Logo styling
- `.hero-title` - Hero section title
- `.feature-title` - Feature card title

### Forms
- `.form-group` - Form field wrapper
- `.form-input` - Text input
- `.form-textarea` - Textarea

---

*Last Updated: January 2026*
