BridgePath is a unified participant + social enterprise tracker (Next.js + Firebase).

## Getting Started

### 1) Configure environment variables

Create `.env.local` (local only) using `env.example` as a reference:

- `NEXT_PUBLIC_FIREBASE_*`: from Firebase Web App config
- `FIREBASE_ADMIN_*`: from a Firebase Service Account (used to create/verify session cookies)

Important: `FIREBASE_ADMIN_PRIVATE_KEY` must keep newlines as `\\n` in env.

### 2) Run the development server

First, install deps and start dev:

```bash
npm i
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Auth + Roles

Roles are stored in Firestore at `profiles/{uid}.role`:
- `participant`
- `supervisor`
- `case_manager`
- `admin`

Only admins should be able to change `role` (enforced in `firestore.rules`, added in a later step).
