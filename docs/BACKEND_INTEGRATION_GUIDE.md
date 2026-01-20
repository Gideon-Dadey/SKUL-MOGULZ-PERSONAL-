# Backend Integration Guide

This guide details the current status of the backend integration and outlines the necessary steps to complete the connection between the frontend and the new backend API.

## 🟢 Current Status

### Completed
- **Backend API**: Node.js/Express server is built with routes for Auth and Projects.
- **Database**: MongoDB Atlas is connected. `User` and `Project` schemas are defined.
- **Authentication**:
  - Full Register/Login flow is working.
  - JWT tokens are generated and stored.
  - `AuthContext` in the frontend is using the real API via `authService.ts`.
  - Registration has been verified end-to-end.

### Pending Integration
The following features are implemented in the UI but are currently using **Mock Data**:
1. **Feed Page**: Displaying posts from the API.
2. **Projects Page**: Fetching projects with filters.
3. **Create Post**: Sending new projects/posts to the API.
4. **Interactions**: Liking and Commenting on posts.
5. **Messages**: (Frontend UI exists, but no backend socket/API logic yet).

---

## 🛠 Next Steps: Implementation Guide

To finish the integration, you need to update the page components to replace `mockData` with `api` calls.

### 1. Integrate Feed Page

**File**: `client/src/pages/FeedPage/FeedPage.tsx`

**Goal**: Replace `mockPosts` with data fetched from `GET /api/projects`.

**Steps**:
1. Import `api` from `../../services/api`.
2. Add state for `posts`, `loading`, and `error`.
3. Use `useEffect` to fetch posts.

**Code Snippet:**

```typescript
// ... imports
import api from '../../services/api';
import { Post } from '../../types';

const FeedPage: React.FC = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    // ... other state

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setIsLoading(true);
                // Construct query string based on filters
                let query = '/projects?';
                if (selectedCategory !== 'all') query += `category=${selectedCategory}&`;
                if (searchQuery) query += `search=${searchQuery}&`;
                
                const response = await api.get(query);
                setPosts(response.data); // data is the array of projects
            } catch (error) {
                console.error("Failed to fetch posts", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPosts();
    }, [searchQuery, selectedCategory, selectedStage, sortBy]); // Add dependencies

    // ... render
```

### 2. Integrate Create Post

**File**: `client/src/pages/CreatePostPage/CreatePostPage.tsx`

**Goal**: Submit the form data to `POST /api/projects`.

**Code Snippet:**

```typescript
// ... imports
import api from '../../services/api';

// Inside your submit handler:
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !editorContent) return;

    setIsSubmitting(true);

    try {
        const postData = {
            title,
            content: editorContent,
            category: selectedCategory,
            projectStage: selectedStage,
            fundingGoal: Number(fundingGoal.replace(/[^0-9.-]+/g, "")),
            tags: tags,
            // images: [] // Handle image upload logic separately
        };

        await api.post('/projects', postData);
        
        // Redirect to feed on success
        navigate('/feed');
    } catch (error) {
        console.error("Failed to create post", error);
        // Show error notification
    } finally {
        setIsSubmitting(false);
    }
};
```

### 3. Implement File Uploads (Critical TODO)

Currently, the backend expects an array of strings for `images`. You rely on mock URLs. 
To support real image uploads:

1.  **Backend**: Add `multer` to handle `multipart/form-data` uploads.
2.  **Storage**: Upload files to a service like AWS S3, Cloudinary, or local disk (for dev).
3.  **Frontend**: Update `api` to send `FormData` instead of JSON when images are included.

### 4. Deployment

When you are ready to go live:

1.  **Frontend**: Deploy the `client` folder to Vercel/Netlify.
2.  **Backend**: Deploy the `server` folder to Railway/Heroku/Render.
3.  **Env Vars**: Ensure `VITE_API_URL` in frontend points to your production backend URL.

---

## 🏃‍♂️ How to Run

**1. Start Backend (Database Connection Required in .env)**
```bash
cd server
npm run dev
```

**2. Start Frontend**
```bash
cd client
npm run dev
```

The application is now ready for full-stack development!
