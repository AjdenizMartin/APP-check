# Manual Smoke Test

Environment: ____
Tester: ____
Date: ____

## Preconditions
- Seeded admin/supervisor/employee users exist.
- `/api/health` returns 200.
- Storage configured and reachable.

## Core flows
1. Login
- Open `/login`
- Sign in with admin user
- Expected: redirect to `/dashboard`

2. Create customer
- Go to `/dashboard/customers`
- Fill required fields and create customer
- Expected: customer appears in search list

3. Upload ID photo
- Open customer profile panel
- Upload ID photo
- Expected: upload success and image visible

4. Upload face photo
- Upload face photo
- Expected: upload success and image visible

5. Check-in
- From customer table/search click `Check in`
- Expected: customer status shows `IN` / appears in active visits

6. Verify customer in search
- Search by name/phone/code in customers page
- Expected: correct customer returned with active status

7. Edit customer
- Update address/notes and save
- Expected: values persist after refresh

8. Check-out
- Go to `/dashboard/visits`
- Search active customer and perform check-out (`WIN`/`LOSS`)
- Expected: removed from active list

9. Force checkout global
- Ensure there is at least one active visit
- Run force checkout with confirmation prompts
- Expected: all active visits closed as `FORCED_OUT`

10. Daily history
- Go to `/dashboard/history`
- Filter by today/status/customer
- Expected: check-in/check-out records visible

11. Financial result validation
- Confirm result type and amount visible in history
- Confirm corrections (if applied) show as corrected

## Pass/Fail summary
- [ ] PASS
- [ ] FAIL (describe below)

Notes:
- ____
