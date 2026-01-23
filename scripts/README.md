# Admin Bootstrap Script

## Create Super-Admin Account

To create a super-admin account for a Firebase Auth user:

```bash
npx tsx scripts/bootstrap-admin.ts <firebase-auth-uid>
```

**Example:**
```bash
npx tsx scripts/bootstrap-admin.ts 7kYaZzG7KNgfvQGC2XpcC23LCVm2
```

### Prerequisites

1. Make sure `.env.local` exists with valid Firebase Admin credentials:
   - `FIREBASE_ADMIN_PROJECT_ID`
   - `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `FIREBASE_ADMIN_PRIVATE_KEY` (must be on one line with `\n` sequences)

2. The Firebase Auth user must already exist (sign them up first via the `/login` page).

### What it does

- Creates/updates `profiles/{uid}` with `role: "admin"`
- Sets `displayName: "Super Admin"`
- Uses Firebase Admin SDK (bypasses Firestore rules)

### After running

The user can now:
- Sign in and access admin features
- Use the `/api/admin/setRole` endpoint to assign roles to other users
- Update any profile (including roles) via Firestore rules
