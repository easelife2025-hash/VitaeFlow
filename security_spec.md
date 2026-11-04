# VitaeFlow Firestore Security Specification (`security_spec.md`)

## 1. Data Invariants & Master Source of Truth

1. **Default-Deny Catch-All**: Every path not explicitly matched is denied (`allow read, write: if false;`).
2. **Verified Identity Invariant**: All write operations (`create`, `update`, `delete`) require an authenticated user (`request.auth != null`) with a verified email (`request.auth.token.email_verified == true`).
3. **PII Isolation (`/users/{userId}`)**:
   - `userId` path parameter must match `isValidId(userId)` and equal `request.auth.uid`.
   - `list` queries on `/users` are strictly forbidden (`allow list: if false;`) to prevent enumeration or PII scraping of user emails.
   - `incoming().uid` must equal `request.auth.uid` and `userId`.
   - `createdAt` is immutable on update (`incoming().createdAt == existing().createdAt`), and `updatedAt` must equal `request.time`.
4. **Owner-Scoped Resumes (`/resumes/{resumeId}`)**:
   - A resume document cannot be created unless its parent owner profile `/users/$(incoming().ownerId)` exists (`exists(/databases/$(database)/documents/users/$(incoming().ownerId))`) and `incoming().ownerId == request.auth.uid`.
   - `incoming().id == resumeId` and `isValidId(resumeId)` must hold on all single-document writes.
   - `allow get, delete` is permitted only when `existing().ownerId == request.auth.uid`.
   - `allow list` is permitted only when `isSignedIn() && existing().ownerId == request.auth.uid` (no blanket `isSignedIn()` reads, zero `get()` calls inside `list`).
   - During `update`, `ownerId`, `id`, and `createdAt` are strictly immutable (`incoming().ownerId == existing().ownerId && incoming().id == existing().id && incoming().createdAt == existing().createdAt`), `updatedAt == request.time`, and only allowlisted fields in `affectedKeys().hasOnly(...)` may change while `isValidResumeRecord(incoming())` wraps the entire update rule.
5. **Volumetric & Array Guards ("Denial of Wallet" Protection)**:
   - Every string field enforces `.size() <= maxLength` from `firebase-blueprint.json`.
   - Every list field (`experience`, `education`, `skills`, `projects`, `certifications`, `languages`) enforces `.size() <= MAX` and validates the first element's type when non-empty (`list.size() == 0 || list[0] is ...`).

---

## 2. The "Dirty Dozen" Adversarial Payloads

### Payload 1 — Identity Spoofing on Resume Create
```json
{
  "id": "resume-spoof-1",
  "ownerId": "victim-user-uid-999",
  "title": "Spoofed Resume",
  "targetRole": "Engineer",
  "templateId": "modern-violet",
  "accentColor": "#6D5CE8",
  "compactMode": false,
  "fontFamily": "inter",
  "decorativeHeading": false,
  "customColors": { "primary": "#6D5CE8", "accent": "#18B89A", "heading": "#18181B" },
  "personalInfo": { "fullName": "Attacker", "jobTitle": "Eng", "email": "a@b.com", "phone": "", "location": "", "website": "", "linkedin": "", "summary": "" },
  "experience": [],
  "education": [],
  "skills": [],
  "projects": [],
  "certifications": [],
  "languages": [],
  "jobDescriptionDraft": "",
  "createdAt": "SERVER_TIMESTAMP",
  "updatedAt": "SERVER_TIMESTAMP"
}
```
*Expected*: `PERMISSION_DENIED` (`incoming().ownerId != request.auth.uid`).

### Payload 2 — Unverified Email Write Attempt
Authenticated as `uid: "user-1"` with `email_verified: false` attempting to create `/users/user-1`.
```json
{
  "uid": "user-1",
  "displayName": "Unverified",
  "email": "user1@example.com",
  "defaultTemplateId": "modern-violet",
  "defaultAccentColor": "#6D5CE8",
  "defaultCompactMode": false,
  "defaultFontFamily": "inter",
  "createdAt": "SERVER_TIMESTAMP",
  "updatedAt": "SERVER_TIMESTAMP"
}
```
*Expected*: `PERMISSION_DENIED` (`request.auth.token.email_verified != true`).

### Payload 3 — Shadow / Ghost Field Injection on User Profile
```json
{
  "uid": "user-1",
  "displayName": "Alice",
  "email": "alice@example.com",
  "defaultTemplateId": "modern-violet",
  "defaultAccentColor": "#6D5CE8",
  "defaultCompactMode": false,
  "defaultFontFamily": "inter",
  "isAdmin": true,
  "createdAt": "SERVER_TIMESTAMP",
  "updatedAt": "SERVER_TIMESTAMP"
}
```
*Expected*: `PERMISSION_DENIED` (`hasOnly` rejects `isAdmin`).

### Payload 4 — Cross-User PII Read on `/users/victim-uid`
Authenticated as `uid: "attacker-uid"` performing `get(/users/victim-uid)`.
*Expected*: `PERMISSION_DENIED` (`request.auth.uid != userId`).

### Payload 5 — Blanket List Scraping on `/users`
Authenticated as `uid: "attacker-uid"` performing `list(/users)`.
*Expected*: `PERMISSION_DENIED` (`allow list: if false` on `/users`).

### Payload 6 — Cross-User Unfiltered List Query on `/resumes`
Authenticated as `uid: "attacker-uid"` performing `getDocs(collection(db, 'resumes'))` without `where('ownerId', '==', 'attacker-uid')`.
*Expected*: `PERMISSION_DENIED` (`existing().ownerId == request.auth.uid` enforced in `allow list`).

### Payload 7 — Orphaned Resume Creation Without Parent `/users/{ownerId}` Document
Authenticated as `uid: "no-profile-user"` creating `/resumes/res-1` when `/users/no-profile-user` does not exist.
*Expected*: `PERMISSION_DENIED` (`exists(/databases/$(database)/documents/users/$(incoming().ownerId))` fails).

### Payload 8 — Immutable Field Tampering (`ownerId` / `createdAt` Mutation on Update)
Authenticated as `uid: "user-1"` updating `/resumes/res-1` to change `ownerId` to `"user-2"` or backdate `createdAt`.
*Expected*: `PERMISSION_DENIED` (`incoming().ownerId == existing().ownerId && incoming().createdAt == existing().createdAt`).

### Payload 9 — Forged Client Timestamp (`createdAt` / `updatedAt` != `request.time`)
Authenticated as `uid: "user-1"` sending a past/future `Timestamp` instead of `serverTimestamp()`.
*Expected*: `PERMISSION_DENIED` (`incoming().updatedAt == request.time`).

### Payload 10 — Volumetric String Overflow ("Denial of Wallet" 50KB Title)
Authenticated as `uid: "user-1"` updating `title` with a 50,000-character string (`maxLength: 200`).
*Expected*: `PERMISSION_DENIED` (`data.title.size() <= 200`).

### Payload 11 — Array Size Overflow & Element Type Poisoning (`skills` with 500 items or non-strings)
Authenticated as `uid: "user-1"` sending `skills: [12345]` or 500 elements (`max: 100`).
*Expected*: `PERMISSION_DENIED` (`data.skills.size() <= 100 && (data.skills.size() == 0 || data.skills[0] is string)`).

### Payload 12 — Invalid Enum Value on `templateId` or `fontFamily`
Authenticated as `uid: "user-1"` sending `templateId: "hacked-template"`.
*Expected*: `PERMISSION_DENIED` (`templateId in [...]`).
