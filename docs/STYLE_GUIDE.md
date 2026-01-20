# SKUL MOGULZ Style Guide

This document defines the design system and CSS conventions for SKUL MOGULZ.

---

## Design Principles

1. **Modern & Clean** - Minimalist design with purposeful elements
2. **Accessible** - WCAG 2.1 AA compliant
3. **Consistent** - Uniform patterns across all pages
4. **Responsive** - Mobile-first approach

---

## Color System

### Brand Colors

```css
/* Primary - Coral/Salmon */
--primary: #ff6b4a;
--primary-hover: #e85a3a;
--primary-light: rgba(255, 107, 74, 0.1);

/* Secondary - Green (Success) */
--secondary: #10b981;
```

### Light Theme

```css
:root {
    --bg-main: #ffffff;
    --bg-card: #f8f9fb;
    --bg-nav: rgba(255, 255, 255, 0.92);
    --bg-elevated: #ffffff;
    
    --text-main: #1a1a2e;
    --text-muted: #64748b;
    --text-light: #94a3b8;
    
    --border: rgba(0, 0, 0, 0.08);
    --border-strong: rgba(0, 0, 0, 0.12);
}
```

### Dark Theme

```css
[data-theme="dark"] {
    --bg-main: #0c0c14;
    --bg-card: #141422;
    --bg-nav: rgba(12, 12, 20, 0.92);
    --bg-elevated: #1a1a2e;
    
    --text-main: #f4f4f5;
    --text-muted: #a1a1aa;
    --text-light: #71717a;
    
    --border: rgba(255, 255, 255, 0.06);
    --border-strong: rgba(255, 255, 255, 0.12);
}
```

### Stage Colors

| Stage | Color | Usage |
|-------|-------|-------|
| Idea | `#8b5cf6` (Purple) | Early concept |
| Prototype | `#3b82f6` (Blue) | Working demo |
| MVP | `#10b981` (Green) | Minimum viable |
| Growth | `#f59e0b` (Amber) | Scaling up |
| Scaling | `#ef4444` (Red) | Full scale |

---

## Typography

### Font Family

```css
--font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
```

### Font Sizes

| Name | Size | Usage |
|------|------|-------|
| xs | 0.75rem (12px) | Labels, hints |
| sm | 0.8rem (13px) | Secondary text |
| base | 0.9rem (14px) | Body text |
| md | 1rem (16px) | Standard text |
| lg | 1.1rem (18px) | Large text |
| xl | 1.25rem (20px) | Section titles |
| 2xl | 1.5rem (24px) | Card titles |
| 3xl | 1.75rem (28px) | Page titles |
| 4xl | 2.5rem (40px) | Hero subtitles |
| 5xl | 4rem+ | Hero titles |

### Font Weights

| Name | Weight | Usage |
|------|--------|-------|
| Normal | 400 | Body text |
| Medium | 500 | UI elements |
| Semibold | 600 | Buttons, labels |
| Bold | 700 | Titles |
| Extrabold | 800 | Hero, emphasis |

---

## Spacing

### Base Unit

8px grid system

### Spacing Scale

| Name | Size | CSS Variable |
|------|------|--------------|
| 0.5 | 4px | - |
| 1 | 8px | - |
| 1.5 | 12px | - |
| 2 | 16px | - |
| 2.5 | 20px | - |
| 3 | 24px | - |
| 4 | 32px | - |
| 5 | 40px | - |
| 6 | 48px | - |
| 8 | 64px | - |

### Common Patterns

```css
/* Section padding */
.section-padding {
    padding: 6rem 5%;
}

/* Card padding */
.glass-card {
    padding: 2rem;
}

/* Component gaps */
gap: 1rem;    /* 16px - tight */
gap: 1.5rem;  /* 24px - normal */
gap: 2rem;    /* 32px - loose */
```

---

## Border Radius

```css
--radius-sm: 8px;   /* Small elements */
--radius-md: 12px;  /* Buttons, inputs */
--radius-lg: 16px;  /* Cards */
--radius-xl: 24px;  /* Large cards */
```

### Usage

| Element | Radius |
|---------|--------|
| Buttons | `--radius-md` |
| Inputs | `--radius-md` |
| Cards | `--radius-xl` |
| Avatars | 50% |
| Tags/Badges | 100px |

---

## Shadows

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 20px 40px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 25px 50px rgba(0, 0, 0, 0.15);
```

### Dark Theme Shadows

In dark mode, shadows are more pronounced:
```css
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.3);
--shadow-lg: 0 20px 40px rgba(0, 0, 0, 0.4);
```

---

## Transitions

```css
--transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

### Common Animations

```css
/* Hover lift */
.element:hover {
    transform: translateY(-4px);
}

/* Fade in up */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(16px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Float animation (badges) */
@keyframes floatBadge {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-12px); }
}
```

---

## Components

### Buttons

```css
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.7rem 1.5rem;
    border-radius: var(--radius-md);
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: var(--transition);
    border: none;
    gap: 8px;
}

.btn-primary {
    background: var(--primary);
    color: white;
    box-shadow: 0 4px 14px rgba(255, 107, 74, 0.25);
}

.btn-primary:hover {
    background: var(--primary-hover);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 107, 74, 0.35);
}

.btn-outline {
    background: transparent;
    color: var(--text-main);
    border: 1px solid var(--border-strong);
}

.btn-outline:hover {
    background: var(--primary-light);
    border-color: var(--primary);
    color: var(--primary);
}
```

### Cards

```css
.glass-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    padding: 2rem;
    transition: var(--transition);
}

.glass-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--border-strong);
}
```

### Form Inputs

```css
.form-input {
    width: 100%;
    padding: 0.85rem 1rem;
    background: var(--bg-main);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    color: var(--text-main);
    font-size: 1rem;
    font-family: inherit;
    transition: var(--transition);
}

.form-input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-light);
}
```

### Tags/Badges

```css
/* Category badge */
.category-badge {
    padding: 0.3rem 0.75rem;
    background: var(--primary-light);
    color: var(--primary);
    border-radius: 100px;
    font-size: 0.8rem;
    font-weight: 600;
}

/* Stage badge */
.stage-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 100px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
}
```

---

## Responsive Breakpoints

```css
/* Mobile first approach */
@media (max-width: 768px) { /* Tablets and below */ }
@media (max-width: 900px) { /* Small laptops */ }
@media (max-width: 1100px) { /* Laptops */ }
@media (max-width: 1200px) { /* Large screens */ }
```

### Layout Patterns

```css
/* Desktop: 3 columns */
grid-template-columns: 280px 1fr 300px;

/* Tablet: 2 columns */
@media (max-width: 1200px) {
    grid-template-columns: 1fr 300px;
}

/* Mobile: 1 column */
@media (max-width: 900px) {
    grid-template-columns: 1fr;
}
```

---

## Icon Usage

We use **Lucide React** icons at these sizes:

| Context | Size |
|---------|------|
| Inline with text | 14-16px |
| Buttons | 18-20px |
| Feature icons | 24-28px |
| Large icons | 48-56px |

Example:
```tsx
import { Heart } from 'lucide-react';

<Heart size={18} />
<Heart size={18} fill="currentColor" /> // Filled variant
```

---

## Accessibility

### Focus States

```css
.element:focus {
    outline: none;
    box-shadow: 0 0 0 3px var(--primary-light);
}
```

### Color Contrast

- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: 3:1 minimum

### Keyboard Navigation

All interactive elements must be keyboard accessible.

---

## CSS Naming Convention

We use a modified **BEM** (Block Element Modifier) convention:

```css
/* Block */
.post-card { }

/* Element */
.post-card__header { }
.post-card__title { }
.post-card__footer { }

/* Modifier */
.post-card--compact { }
.post-card--featured { }

/* State */
.post-card__action-btn.liked { }
```

---

## File Organization

```
styles/
├── index.css          # Main stylesheet with all styles
└── (future)
    ├── variables.css  # CSS custom properties
    ├── reset.css      # CSS reset/normalize
    ├── typography.css # Font styles
    ├── utilities.css  # Utility classes
    └── animations.css # Keyframe animations
```

---

*Last Updated: January 2026*
