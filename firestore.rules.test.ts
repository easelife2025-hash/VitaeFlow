/**
 * Firestore Security Rules Verification Suite (Phase 0 TDD Specification)
 * Verifies that all 12 "Dirty Dozen" adversarial payloads in security_spec.md
 * return PERMISSION_DENIED while legitimate owner operations succeed.
 */

export interface SecurityTestCase {
  id: number;
  name: string;
  collection: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: {
    uid: string;
    email: string;
    email_verified: boolean;
  } | null;
  docId?: string;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED' | 'ALLOWED';
}

export const DIRTY_DOZEN_SECURITY_TESTS: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Payload 1: Identity Spoofing on Resume Create (ownerId != auth.uid)',
    collection: 'resumes',
    operation: 'create',
    docId: 'resume-spoof-1',
    auth: { uid: 'attacker-1', email: 'attacker@example.com', email_verified: true },
    payload: {
      id: 'resume-spoof-1',
      ownerId: 'victim-user-uid-999',
      title: 'Spoofed Resume',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Payload 2: Unverified Email Write Attempt (email_verified == false)',
    collection: 'users',
    operation: 'create',
    docId: 'user-1',
    auth: { uid: 'user-1', email: 'user1@example.com', email_verified: false },
    payload: {
      uid: 'user-1',
      displayName: 'Unverified',
      email: 'user1@example.com',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Payload 3: Shadow / Ghost Field Injection (isAdmin: true)',
    collection: 'users',
    operation: 'create',
    docId: 'user-1',
    auth: { uid: 'user-1', email: 'user1@example.com', email_verified: true },
    payload: {
      uid: 'user-1',
      displayName: 'Alice',
      email: 'user1@example.com',
      isAdmin: true,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Payload 4: Cross-User PII Read on /users/victim-uid',
    collection: 'users',
    operation: 'get',
    docId: 'victim-uid',
    auth: { uid: 'attacker-1', email: 'attacker@example.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Payload 5: Blanket List Scraping on /users',
    collection: 'users',
    operation: 'list',
    auth: { uid: 'attacker-1', email: 'attacker@example.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Payload 6: Cross-User Unfiltered List Query on /resumes',
    collection: 'resumes',
    operation: 'list',
    auth: { uid: 'attacker-1', email: 'attacker@example.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Payload 7: Orphaned Resume Creation Without Parent /users/{ownerId}',
    collection: 'resumes',
    operation: 'create',
    docId: 'res-orphan-1',
    auth: { uid: 'no-profile-uid', email: 'np@example.com', email_verified: true },
    payload: {
      id: 'res-orphan-1',
      ownerId: 'no-profile-uid',
      title: 'Orphan Resume',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Payload 8: Immutable Field Tampering (ownerId / createdAt Mutation)',
    collection: 'resumes',
    operation: 'update',
    docId: 'res-1',
    auth: { uid: 'user-1', email: 'user1@example.com', email_verified: true },
    payload: {
      ownerId: 'user-2',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Payload 9: Forged Client Timestamp (updatedAt != request.time)',
    collection: 'resumes',
    operation: 'update',
    docId: 'res-1',
    auth: { uid: 'user-1', email: 'user1@example.com', email_verified: true },
    payload: {
      updatedAt: '2099-01-01T00:00:00Z',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Payload 10: Volumetric String Overflow (title > 200 chars)',
    collection: 'resumes',
    operation: 'update',
    docId: 'res-1',
    auth: { uid: 'user-1', email: 'user1@example.com', email_verified: true },
    payload: {
      title: 'A'.repeat(1000),
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Payload 11: Array Size Overflow & Element Type Poisoning',
    collection: 'resumes',
    operation: 'update',
    docId: 'res-1',
    auth: { uid: 'user-1', email: 'user1@example.com', email_verified: true },
    payload: {
      skills: [12345],
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Payload 12: Invalid Enum Value on templateId',
    collection: 'resumes',
    operation: 'update',
    docId: 'res-1',
    auth: { uid: 'user-1', email: 'user1@example.com', email_verified: true },
    payload: {
      templateId: 'unauthorized-template',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
];
