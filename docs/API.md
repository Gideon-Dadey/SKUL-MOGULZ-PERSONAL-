# SKUL MOGULZ API Reference

This document describes the API endpoints for the SKUL MOGULZ backend.

> **Note:** The backend is currently in development. This document serves as the API specification.

---

## Base URL

```
Development: http://localhost:5000/api
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
    "role": "student"
}
```

**Response (201):**
```json
{
    "_id": "usr_123abc",
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "role": "student",
    "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

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
    "_id": "usr_123abc",
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "role": "student",
    "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Get Current User

Get the authenticated user's profile.

```http
GET /api/auth/me
```

**Headers:**
```
Authorization: Bearer <token>
```

---

### Projects (Feed/Posts)

#### List Projects / Feed

Get a list of projects/posts with optional filters.

```http
GET /api/projects
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category |
| `stage` | string | Filter by project stage |
| `search` | string | Search in title/content |

**Response (200):**
```json
[
    {
        "_id": "pst_456def",
        "author": {
            "_id": "usr_123abc",
            "firstName": "John",
            "lastName": "Doe",
            "role": "student",
            "headline": "Student Founder"
        },
        "title": "Introducing My New Project",
        "content": "...",
        "category": "Technology",
        "projectStage": "mvp",
        "likes": [],
        "comments": [],
        "createdAt": "2026-01-20T10:00:00Z"
    }
]
```

#### Create Project Post

Create a new project update/post.

```http
POST /api/projects
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
    "title": "Introducing My New Project",
    "content": "Detailed description...",
    "category": "Technology",
    "tags": ["startup", "ai"],
    "projectStage": "mvp",
    "fundingGoal": 100000,
    "currentFunding": 0
}
```

#### Like Project

Toggle like on a project.

```http
PUT /api/projects/:id/like
```

#### Comment on Project

Add a comment.

```http
POST /api/projects/:id/comment
```

**Request Body:**
```json
{
    "content": "Great work!"
}
```

---

## Error Response Format

```json
{
    "message": "Error description"
}
```
