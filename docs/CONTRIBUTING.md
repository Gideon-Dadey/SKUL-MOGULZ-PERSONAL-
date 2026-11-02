# Contributing

Thanks for wanting to help. Keep changes focused and easy to review.

## Setup

1. Fork and clone the repo
2. Install dependencies in root, `client`, `server`, and `mobile` as needed
3. Copy `server/.env.example` to `server/.env` and fill in local values
4. Run `npm run dev` from the root for web + API

## Branching

Use short, clear branch names:

- `feature/feed-filters`
- `fix/login-redirect`
- `docs/api-posts`

## Commit style

Write commits like a teammate left you a note:

- `fix feed so it loads posts instead of projects`
- `add network invitation accept flow`
- `document local mobile API URL`

Avoid noisy catch-alls like `update` or `new`.

## Pull requests

- Say what changed and why
- Mention how you tested it
- Keep screenshots for UI work when you can
- Do not commit `.env`, `node_modules`, or upload dumps

## Code habits

- Match the style already in the file
- Prefer small PRs over giant rewrites
- If you touch auth or uploads, double-check that secrets stay local

Questions are welcome. Open an issue or leave a comment on the PR.
