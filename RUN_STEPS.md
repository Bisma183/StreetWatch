# StreetWatch implementation (Phase 2)

## Added
- Authenticated hazard submission (category, photo, note, automatic GPS)
- SQLite records for `Issue` and `Report`
- 30 m same-category unresolved-issue merging; duplicate adds another report + upvote
- Community issues list, filters, details, and upvote
- Admin status and remove-spam endpoints (backend only; no admin UI yet)

## Setup
1. Copy these files into your EXISTING StreetWatch folder. Preserve your real `backend/.env`, `backend/streetwatch.db`, and frontend API network address.
2. In `frontend`: run `npx expo install expo-image-picker expo-location` and `npx expo start --clear`.
3. In `backend`: use your existing virtual environment; install `python-multipart` if missing: `python -m pip install python-multipart`.
4. In `backend`: start `python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload`.
5. Phone and laptop must communicate over the same accessible network; update `frontend/api/api.js` IP if your laptop IP changed.
6. Log in, tap Report an issue, select a category and photo, permit GPS, submit; use View community issues to inspect results.

## Important
- Existing authentication, JWT SecureStore and SQLite database are retained.
- This release has **list view**, not the proposed map view, and no push notifications or admin UI yet.
- `POST /issues` requires Authorization Bearer JWT; uploads max 8 MB; photo saved under backend/uploads.
- Admin API status progression is restricted to next stage.
- Test on a real phone before claiming success.
- Do not use an unencrypted HTTP connection or commit JWT secret/DB/user photos for production.
