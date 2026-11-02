# Style guide

The product should feel calm and usable. Green for action, plenty of white space, and type that stays readable on a laptop or phone.

## Color

Primary green sits around `#A5D6B7`, with a slightly darker hover state. Surfaces are white or soft gray in light mode. Dark mode flips the backgrounds and keeps the same accent.

Useful variables live in `client/src/styles/index.css`:

```css
--primary
--primary-hover
--bg-main
--bg-card
--text-main
--text-muted
--border
--radius-sm
--radius-md
--radius-lg
```

## Type

Body and UI copy use Plus Jakarta Sans. Keep headings short. Avoid stacking too many font weights on one screen.

## Layout

- Three-column feed on desktop, single column on mobile
- Cards without heavy shadows
- Consistent 8 / 12 / 16 / 24 spacing rhythm
- Rounded corners via the shared radius tokens

## Components

Reuse existing pieces before inventing new ones. `PostCard`, `Navbar`, and the auth forms already carry most of the visual language.

## Writing in the product

Sound like a person:

- “Share a project update…”
- “People you may know”
- “Welcome back.”

Skip slogans that feel generic or overproduced.
