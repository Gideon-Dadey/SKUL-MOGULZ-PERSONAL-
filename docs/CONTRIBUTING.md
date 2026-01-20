# Contributing to SKUL MOGULZ

Thank you for your interest in contributing to SKUL MOGULZ! This guide will help you get started.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Pull Request Process](#pull-request-process)

---

## Code of Conduct

We are committed to providing a welcoming and respectful environment for all contributors.

### Our Standards

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the project
- Show empathy towards other community members

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **Git**
- **VS Code** (recommended)

### Development Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR-USERNAME/SKUL-MOGULZ-PERSONAL-.git
   cd SKUL-MOGULZ-PERSONAL-
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/Gideon-Dadey/SKUL-MOGULZ-PERSONAL-.git
   ```

3. **Install dependencies**
   ```bash
   npm install
   cd client && npm install
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## Development Workflow

### Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/description` | `feature/add-notifications` |
| Bug Fix | `bugfix/description` | `bugfix/fix-login-error` |
| Hotfix | `hotfix/description` | `hotfix/security-patch` |
| Refactor | `refactor/description` | `refactor/optimize-queries` |

### Commit Messages

We follow **Conventional Commits**:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting (no code change)
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance tasks

**Examples:**
```
feat(posts): add comment functionality
fix(auth): resolve token expiration issue
docs(readme): update installation instructions
refactor(feed): optimize post filtering logic
```

### Keeping Your Branch Updated

```bash
# Fetch latest changes
git fetch upstream

# Rebase your branch
git rebase upstream/main

# Push to your fork
git push origin feature/your-feature-name --force-with-lease
```

---

## Code Standards

### TypeScript

- Use TypeScript for all new code
- Define explicit types (avoid `any`)
- Use interfaces for object shapes
- Export types from `src/types/index.ts`

```typescript
// ✅ Good
interface User {
    id: string;
    name: string;
}

const getUser = (id: string): User => { ... }

// ❌ Bad
const getUser = (id: any): any => { ... }
```

### React Components

- Use functional components with hooks
- Use React.FC for component types
- Props interface should be named `ComponentNameProps`

```tsx
// ✅ Good
interface PostCardProps {
    post: Post;
    onLike?: (id: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike }) => {
    return (
        <div className="post-card">
            {/* ... */}
        </div>
    );
};

export default PostCard;
```

### CSS

- Use CSS custom properties (variables)
- Follow BEM naming convention
- Mobile-first responsive design
- Put component styles in separate CSS files

```css
/* ✅ Good */
.post-card {
    background: var(--bg-card);
}

.post-card__title {
    font-size: 1.25rem;
}

.post-card--compact {
    padding: 1rem;
}
```

### File Organization

```
component/
├── ComponentName.tsx    # Component code
└── ComponentName.css    # Component styles
```

### Imports Order

1. React and external libraries
2. Internal modules (context, types)
3. Components
4. Styles

```typescript
// 1. External
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle } from 'lucide-react';

// 2. Internal
import { useAuth } from '../../context/AuthContext';
import { Post } from '../../types';

// 3. Components
import PostCard from '../../components/PostCard/PostCard';

// 4. Styles
import './FeedPage.css';
```

---

## Pull Request Process

### Before Submitting

1. **Test your changes locally**
   - Verify the feature works as expected
   - Check for console errors
   - Test on different screen sizes

2. **Run linters** (when available)
   ```bash
   npm run lint
   ```

3. **Update documentation**
   - Add/update component documentation
   - Update API docs if applicable

4. **Write meaningful commit messages**

### Creating a Pull Request

1. Push your branch to your fork
   ```bash
   git push origin feature/your-feature-name
   ```

2. Open a Pull Request on GitHub

3. Fill out the PR template:

   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## How Has This Been Tested?
   Describe testing approach

   ## Screenshots (if applicable)
   Add screenshots for UI changes

   ## Checklist
   - [ ] My code follows the style guidelines
   - [ ] I have performed a self-review
   - [ ] I have added tests (if applicable)
   - [ ] I have updated documentation
   ```

### Review Process

1. **Automated checks** - CI must pass
2. **Code review** - At least 1 approval required
3. **Testing** - Reviewer may test locally
4. **Merge** - Maintainer merges when ready

---

## Development Tips

### VS Code Extensions

Recommended extensions:
- ESLint
- Prettier
- TypeScript Hero
- ES7 React Snippets
- CSS Peek

### Debug React

Use React Developer Tools browser extension.

### Hot Reloading

Vite provides instant hot reloading. Changes appear immediately.

---

## Questions?

- Open a GitHub Issue for bugs/features
- Contact the development team for guidance

---

## Recognition

All contributors will be recognized in our README and release notes.

Thank you for contributing! 🚀

---

*Last Updated: January 2026*
