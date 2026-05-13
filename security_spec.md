# Security Spec for DhakaMetro Fare

## Data Invariants
1. A Route must have `stops` and `distances` arrays of equal length.
2. `farePerKm` and `minFare` must be positive numbers.
3. Only authenticated admins can create, update, or delete routes.
4. Anyone (authenticated) can read routes.

## The "Dirty Dozen" Payloads

1. **Unauthenticated Write**: Attempting to create a route without being logged in.
2. **Non-Admin Write**: Attempting to create a route as a regular user.
3. **Invalid ID**: Using a very long or malformed string as a route document ID.
4. **Missing Required Fields**: Leaving out `farePerKm` or `stops`.
5. **Type Mismatch**: Sending `farePerKm` as a string instead of a number.
6. **Negative Fare**: Sending a negative `minFare`.
7. **Array Length Mismatch**: Sending `stops` and `distances` with different lengths.
8. **Malicious ID Injection**: Injecting a massive string into `adminCode`.
9. **Identity Spoofing**: Setting `userId` to a different user's UID.
10. **Admin Privilege Escalation**: Attempting to create a document in `/admins/` to make oneself an admin.
11. **Shadow Field Injection**: Adding an `isVerified: true` field to a route which isn't in the schema.
12. **Blanket Read Attack**: Attempting to list all routes without proper auth (if restricted).

## Test Runner (Conceptual)
The `firestore.rules.test.ts` will verify these payloads are rejected.
