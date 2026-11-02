# Integration status

Short status of the main product loops.

## Auth

Working. Registration and login write real users to MongoDB and return JWT tokens used by web and mobile.

## Feed

Working against `/api/posts`. Text and media posts both show in the home feed.

## Projects

Working against `/api/projects` for discovery-style views and project records.

## Create / edit content

Working. The create flow submits to the posts API and supports file uploads.

## Social actions

Likes, comments, and bookmarks are wired for posts. Network invitations and suggestions are live.

## Messaging

Conversations load from the API and realtime updates go through Socket.io.

## Mobile

Expo app is connected to the same backend. Confirm the device can reach the API host before testing login on a phone.

## Still rough

- Some older screens still mix project and post assumptions
- Analytics and deeper funding flows are incomplete
- Suggestion quality is basic until there are more users in the graph
