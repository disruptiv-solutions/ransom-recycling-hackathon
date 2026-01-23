# Firebase setup (BridgePath)

This app uses:
- **Firebase Auth** for sign-in / sign-up
- **Firestore** for data
- **Firebase Storage** for files

## Collections (top-level)

### `profiles/{uid}`
Role and identity for the signed-in user.

Suggested fields:
- `role`: `"participant" | "supervisor" | "case_manager" | "admin"`
- `displayName`: string
- `createdAt`: server timestamp
- `updatedAt`: server timestamp

### `participants/{participantId}`
Participant record (may map to a user account via `userId`).

Suggested fields:
- `userId`: string (uid) | null
- `phase`: `"intake" | "development" | "readiness" | "placement"`
- `status`: `"active" | "inactive" | "exited"`
- `lastActivityAt`: timestamp

### `participants/{participantId}/caseNotes/{noteId}`
- `authorUid`: string
- `visibility`: `"general" | "clinical" | "private"`
- `body`: string
- `createdAt`: timestamp

### `participants/{participantId}/files/{fileId}`
Metadata pointing to Firebase Storage object.
- `fileKind`: `"osha" | "forklift" | "id" | "other"`
- `storagePath`: string
- `uploadedByUid`: string
- `createdAt`: timestamp

### `workLogs/{workLogId}`
- `participantId`: string
- `supervisorUid`: string
- `workDate`: string (YYYY-MM-DD)
- `hours`: number
- `rating`: number (1-5)
- `notes`: string | null
- `createdAt`: timestamp

### `workLogs/{workLogId}/materials/{materialId}`
- `materialType`: `"copper" | "lead" | "plastic" | "circuit_boards" | "mixed"`
- `weightLbs`: number
- `createdAt`: timestamp

### `alerts/{alertId}`
- `participantId`: string
- `type`: `"inactivity_48h" | "missed_shifts" | "milestone"`
- `severity`: `"info" | "warning" | "critical"`
- `status`: `"open" | "resolved"`
- `payload`: map
- `createdAt`: timestamp
- `resolvedAt`: timestamp | null

### `helpRequests/{helpRequestId}`
- `participantId`: string
- `message`: string | null
- `status`: `"open" | "acknowledged" | "closed"`
- `createdAt`: timestamp

### `notifications/{notificationId}`
- `toUid`: string
- `kind`: string
- `payload`: map
- `createdAt`: timestamp
- `readAt`: timestamp | null

### `config/impactCoefficients`
Single doc keyed by material type or map entries.

## Notes on auditing
The PRD calls for audit trails on viewing sensitive notes. We are intentionally **skipping read-audit** for now (rules-only).

