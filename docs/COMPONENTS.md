# Components

A quick map of the shared UI in the web app. Paths are under `client/src`.

## Navbar

`components/Navbar/Navbar.tsx`

Top navigation for Home, Network, Projects, Messaging, Notifications, create post, and profile menu. Search sits in the bar and can route into projects.

## PostCard

`components/PostCard/PostCard.tsx`

Renders a feed item: author, content, optional media, likes, comments, bookmark, and author actions (edit / delete). Works for text-only posts and posts with images or video.

## SearchFilter

`components/SearchFilter/SearchFilter.tsx`

Search box plus category and stage filters used on the feed and related discovery views.

## Modal

`components/Modal/Modal.tsx`

Simple dialog wrapper for confirmations and overlays.

## Logo

`components/Logo.tsx`

Brand mark and default avatar fallback.

## Context providers

- `context/AuthContext.tsx` — session, login, register, profile refresh
- `context/ThemeContext.tsx` — light / dark
- `context/SocketContext.tsx` — realtime connection
- `context/CallContext.tsx` — call session helpers

## Pages worth knowing

| Page | Path | Role |
| --- | --- | --- |
| Feed | `pages/FeedPage` | Main home timeline |
| Create post | `pages/CreatePostPage` | Composer with media upload |
| Profile | `pages/ProfilePage` | Public / own profile |
| Network | `pages/NetworkPage` | Connections and invites |
| Projects | `pages/ProjectsPage` | Project discovery grid |
| Messages | `pages/MessagesPage` | Conversations |
| Auth | login / register pages | Account entry |

When you add a component, keep props small and put page-specific logic in the page, not in the shared component.
