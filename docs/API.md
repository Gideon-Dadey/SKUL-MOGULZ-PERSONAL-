# API notes

Base URL in local development:

```
http://localhost:5000/api
```

Protected routes expect:

```
Authorization: Bearer <jwt>
```

## Auth

### Register

```http
POST /api/auth/register
```

```json
{
  "firstName": "Gideon",
  "lastName": "Dadey",
  "email": "you@school.edu",
  "password": "your-password",
  "username": "gideondadey",
  "role": "student"
}
```

`role` can be `student`, `investor`, or `admin`. Defaults to `student`.

### Login

```http
POST /api/auth/login
```

Body accepts email or username in the `email` field, plus `password`.

### Current user

```http
GET /api/auth/me
```

### Profile

```http
GET /api/auth/profile/:username
PUT /api/auth/profile
```

Profile updates cover name, headline, bio, location, skills, and related fields.

## Posts

These power the main feed.

```http
GET    /api/posts
POST   /api/posts
GET    /api/posts/:id
PUT    /api/posts/:id
DELETE /api/posts/:id
PUT    /api/posts/:id/like
PUT    /api/posts/:id/bookmark
POST   /api/posts/:id/comment
```

Create posts as `multipart/form-data` when attaching media. Field name for files is `media` (up to 4). Text-only posts can be JSON with `content` and optional `location`.

## Projects

Project discovery still lives under `/api/projects` for listing, create, like, comment, and related actions. Useful when you want startup cards with stage, category, and funding fields.

## Network

```http
GET  /api/network/suggestions
GET  /api/network/invitations
POST /api/network/request/:userId
```

## Messages

```http
GET  /api/messages/conversations
GET  /api/messages/:userId
POST /api/messages
```

Realtime delivery also goes through Socket.io on the same server.

## Errors

Most failures return:

```json
{
  "message": "Short explanation"
}
```
