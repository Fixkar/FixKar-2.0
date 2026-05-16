# Security Specification: FixKar

## Data Invariants
1. A service request must involve a valid customer ID and mechanic ID.
2. Only the customer who created a request or the assigned mechanic can view/update the request status.
3. Users cannot change their own roles (privilege escalation protection).
4. Mechanics can only update their own online status and location.
5. All timestamps must be server-generated.

## The Dirty Dozen Payloads (Targeted Rejected Actions)
1. User A trying to read User B's profile.
2. User trying to create a request with `status: 'completed'`.
3. User trying to update a request they don't own.
4. Mechanic trying to update customer's vehicles.
5. Random user trying to set `role: 'admin'` on their profile.
6. Updating `createdAt` field after document creation.
7. Creating a request with a 1MB string in `issueType`.
8. Updating `estimatedFare` after a request is accepted.
9. Deleting a completed request (immutability).
10. Anonymous user trying to create a request.
11. User trying to list all mechanics' private info (email).
12. Mechanic trying to set `isOnline: true` for another mechanic.

## Test Runner (Logic Verification)
(Tests would be implemented in firestore.rules.test.ts)
