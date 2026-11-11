# StreetWatch — Final Source Edition (SE-458)

Mobile street-hazard reporting application for NED University of Engineering and Technology. Preserves original JWT login + Expo SecureStore and adds reporting, 30 m duplicate merge, map pins, filters, issue detail/upvotes, authenticated admin panel, status stages and Expo push-notification integration.

**Important:** This ZIP contains the complete *source implementation*, **not an already-built APK**. Real Android-device end-to-end tests, a network-reachable FastAPI server, and an EAS Android build are still required. Push notification delivery requires a configured EAS project, native development/production build, device permission, reachable Expo push service, and valid push tokens. Do not claim it was tested on two Android phones unless you perform those tests.

## Quick start (Windows PowerShell)

Open project in VS Code. Use **two terminals**.

**Backend terminal** (Python 3.11+ recommended):

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
# The sample secret is for LOCAL TESTING ONLY. Replace SECRET_KEY with a long random secret.
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend terminal** (Node 22+):

```powershell
cd frontend
npm install
# Edit api/api.js: replace 192.168.10.8 with YOUR laptop's Wi-Fi IPv4 address (run ipconfig).
npx expo start --clear
```

Your phone and laptop must have network connectivity to each other. Test `http://YOUR_LAPTOP_IP:8000/` in the phone browser first. Windows Firewall may need a private-network allowance for port 8000. Camera and GPS permissions must be allowed. Expo Go can be used for much of the UI; **remote push notifications need a compatible native build**, not Expo Go on Android.

### Make one admin

1. Create a normal user using the Signup screen.
2. In the backend terminal execute `python make_admin.py registered-email@example.com`.
3. Log out and log back in. The **Admin dashboard** button appears on Home. The backend enforces admin authorization independently of the UI.

### Android APK + real push notifications

Install EAS CLI, then configure an Expo account/project:

```powershell
cd frontend
npm install -g eas-cli
eas login
eas init
eas build:configure
eas build --platform android --profile preview
```

An `eas.json` preview profile is provided for APK output. `eas init` sets the actual project ID; push registration skips safely when none is configured. EAS remote builds require internet, Expo account access, and may require extra Android configuration. **The produced APK must still reach your FastAPI backend**; a home-Wi-Fi IP will not work from arbitrary networks. Push gateway acceptance does not guarantee delivery.

### Tests

```powershell
cd backend
python -m pytest -q
```

Tests use their own in-memory database; do not touch your real SQLite file. Check `/docs` for interactive FastAPI API documentation.

## Navigation / code flow

- `frontend/App.js`: stack navigation and auth gate; adds notification registration after login.
- `frontend/context/AppContext.js`: token state, login/logout, restores SecureStore token.
- `frontend/utils/securestore.js`: secure save/get/delete token on device.
- `frontend/api/api.js`: Axios backend base URL.
- `frontend/screens/`: Login, Signup, Home, Report, Issues, Map, IssueDetail, Admin.
- `frontend/components/NotificationSetup.js`: asks notification permission and registers Expo push token after native EAS configuration.
- `backend/main.py`: register, login, `/me`, token registration and includes issues router.
- `backend/security.py` / `auth.py`: hashing and JWT verification.
- `backend/routers/issues.py`: report upload and duplicate merging, issue listing, details/upvotes, admin status/remove.
- `backend/utils.py`: Haversine and rule-based duplicate check.
- `backend/models.py` / `schemas.py`: tables and input/output validation.
- `backend/push.py`: sends messages to Expo push gateway when admin updates an issue status.
- `backend/make_admin.py`: safe local administrator assignment.

### Viva: one-sentence flow

`ReportScreen` collects photo/category/GPS → `api.js` sends multipart request with JWT → `auth.py` authenticates → `issues.py` validates and calls `utils.py` to find a nearby unresolved issue → SQLAlchemy writes `Issue` and `Report` rows into SQLite → map/issue list loads records from `/issues` → admin updates stage → backend attempts push delivery for reporters with registered tokens.

### Limitations to report accurately

- Backend uses **SQLite and local image files**; not a deployed public cloud service.
- Map relies on `react-native-maps` and requires a compatible Android installation.
- `upvote_count` increments for merged reports and manual upvotes, without one-vote-per-account protection.
- Notification success requires Expo setup and a real native build; backend logs failures rather than failing the status update.
- Existing `/me` auth startup does not automatically reject an expired token until an authenticated request is made.
- This is a student demonstration, not a hardened production city-government platform: HTTP LAN traffic is unencrypted; use HTTPS for production.
