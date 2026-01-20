# SKUL MOGULZ API Reference

This document describes the API endpoints for the SKUL MOGULZ backend.

> **Note:** The backend is currently in development. This document serves as the API specification.

---

## Base URL

```
Development: http://localhost:3000/api
Production:  https://api.skulmogulz.com/api
```

---

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

---

## Endpoints

### Authentication

#### Register

Create a new user account.

```http
POST /api/auth/register
```

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "securePassword123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student",
    "interests": ["technology", "education"]
}
```

**Response (201):**
```json
{
    "success": true,
    "data": {
        "user": {
            "id": "usr_123abc",
            "email": "user@example.com",
            "firstName": "John",
            "lastName": "Doe",
            "username": "johnd",
            "role": "student",
            "interests": ["technology", "education"],
            "createdAt": "2026-01-20T10:00:00Z"
        },
        "token": "eyJhbGciOiJIUzI1NiIs..."
    }
}
```

**Errors:**
- `400` - Invalid input data
- `409` - Email already exists

---

#### Login

Authenticate and receive a JWT token.

```http
POST /api/auth/login
```

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "securePassword123"
}
```

**Response (200):**
```json
{
    "success": true,
    "data": {
        "user": {
            "id": "usr_123abc",
            "email": "user@example.com",
            "firstName": "John",
            "lastName": "Doe"
        },
        "token": "eyJhbGciOiJIUzI1NiIs..."
    }
}
```

**Errors:**
- `401` - Invalid credentials

---

#### Get Current User

Get the authenticated user's profile.

```http
GET /api/auth/me
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
    "success": true,
    "data": {
        "id": "usr_123abc",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "username": "johnd",
        "avatar": "https://...",
        "bio": "Building the future...",
        "role": "student",
        "interests": ["technology", "education"],
        "createdAt": "2026-01-20T10:00:00Z"
    }
}
```

---

### Users

#### List Users

Get a paginated list of users.

```http
GET /api/users
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `role` | string | - | Filter by role (student/investor) |
| `search` | string | - | Search by name or username |

**Response (200):**
```json
{
    "success": true,
    "data": {
        "users": [...],
        "pagination": {
            "page": 1,
            "limit": 20,
            "total": 150,
            "pages": 8
        }
    }
}
```

---

#### Get User by ID

```http
GET /api/users/:id
```

**Response (200):**
```json
{
    "success": true,
    "data": {
        "id": "usr_123abc",
        "firstName": "John",
        "lastName": "Doe",
        "username": "johnd",
        "avatar": "https://...",
        "bio": "...",
        "role": "student",
        "interests": ["technology"],
        "stats": {
            "posts": 12,
            "followers": 150,
            "following": 45,
            "likes": 234
        },
        "createdAt": "2026-01-20T10:00:00Z"
    }
}
```

---

#### Update User

Update the current user's profile.

```http
PUT /api/users/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Updated bio...",
    "interests": ["technology", "ai-ml"]
}
```

**Response (200):**
```json
{
    "success": true,
    "data": {
        "id": "usr_123abc",
        "firstName": "John",
        "lastName": "Doe",
        "bio": "Updated bio..."
    }
}
```

---

### Posts

#### List Posts

Get a paginated list of posts with filters.

```http
GET /api/posts
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `category` | string | - | Filter by category |
| `stage` | string | - | Filter by project stage |
| `search` | string | - | Search in title/content |
| `author` | string | - | Filter by author ID |
| `sort` | string | recent | Sort: recent, trending, popular |

**Response (200):**
```json
{
    "success": true,
    "data": {
        "posts": [
            {
                "id": "pst_456def",
                "author": {
                    "id": "usr_123abc",
                    "firstName": "John",
                    "lastName": "Doe",
                    "username": "johnd",
                    "avatar": "https://..."
                },
                "title": "Introducing My New Project",
                "content": "...",
                "category": "technology",
                "tags": ["startup", "ai"],
                "projectStage": "mvp",
                "likes": 42,
                "commentsCount": 5,
                "fundingGoal": 100000,
                "currentFunding": 25000,
                "createdAt": "2026-01-20T10:00:00Z"
            }
        ],
        "pagination": {
            "page": 1,
            "limit": 20,
            "total": 45,
            "pages": 3
        }
    }
}
```

---

#### Create Post

Create a new post.

```http
POST /api/posts
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
    "title": "Introducing My New Project",
    "content": "Detailed description of the project...",
    "category": "technology",
    "tags": ["startup", "ai"],
    "projectStage": "mvp",
    "fundingGoal": 100000,
    "currentFunding": 0
}
```

**Response (201):**
```json
{
    "success": true,
    "data": {
        "id": "pst_456def",
        "title": "Introducing My New Project",
        "createdAt": "2026-01-20T10:00:00Z"
    }
}
```

---

#### Get Post by ID

```http
GET /api/posts/:id
```

**Response (200):**
```json
{
    "success": true,
    "data": {
        "id": "pst_456def",
        "author": {...},
        "title": "Introducing My New Project",
        "content": "...",
        "category": "technology",
        "tags": ["startup", "ai"],
        "projectStage": "mvp",
        "likes": 42,
        "likedBy": ["usr_789ghi", ...],
        "comments": [
            {
                "id": "cmt_abc123",
                "author": {...},
                "content": "Great project!",
                "likes": 5,
                "createdAt": "2026-01-20T11:00:00Z"
            }
        ],
        "fundingGoal": 100000,
        "currentFunding": 25000,
        "createdAt": "2026-01-20T10:00:00Z",
        "updatedAt": "2026-01-20T10:00:00Z"
    }
}
```

---

#### Update Post

```http
PUT /api/posts/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
    "title": "Updated Title",
    "content": "Updated content..."
}
```

**Response (200):**
```json
{
    "success": true,
    "data": {
        "id": "pst_456def",
        "title": "Updated Title",
        "updatedAt": "2026-01-20T12:00:00Z"
    }
}
```

---

#### Delete Post

```http
DELETE /api/posts/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
    "success": true,
    "message": "Post deleted successfully"
}
```

---

#### Like Post

```http
POST /api/posts/:id/like
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
    "success": true,
    "data": {
        "likes": 43,
        "liked": true
    }
}
```

---

#### Unlike Post

```http
DELETE /api/posts/:id/like
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
    "success": true,
    "data": {
        "likes": 42,
        "liked": false
    }
}
```

---

#### Add Comment

```http
POST /api/posts/:id/comments
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
    "content": "This is a great project!"
}
```

**Response (201):**
```json
{
    "success": true,
    "data": {
        "id": "cmt_xyz789",
        "content": "This is a great project!",
        "author": {...},
        "createdAt": "2026-01-20T12:00:00Z"
    }
}
```

---

### Notifications

#### Get Notifications

```http
GET /api/notifications
```

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `unreadOnly` | boolean | false | Only return unread |

**Response (200):**
```json
{
    "success": true,
    "data": {
        "notifications": [
            {
                "id": "ntf_123",
                "type": "like",
                "message": "John Doe liked your post",
                "read": false,
                "relatedPostId": "pst_456def",
                "fromUser": {...},
                "createdAt": "2026-01-20T12:00:00Z"
            }
        ],
        "unreadCount": 5
    }
}
```

---

#### Mark Notification as Read

```http
PUT /api/notifications/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
    "success": true,
    "data": {
        "id": "ntf_123",
        "read": true
    }
}
```

---

## Error Response Format

All errors follow this format:

```json
{
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Invalid input data",
        "details": [
            {
                "field": "email",
                "message": "Email is required"
            }
        ]
    }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Not authorized |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

API requests are rate limited:

- **Anonymous:** 60 requests/minute
- **Authenticated:** 300 requests/minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 299
X-RateLimit-Reset: 1704067200
```

---

*Last Updated: January 2026*
