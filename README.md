# StreetWatch - Street Hazard Reporter

A mobile app for reporting and tracking road and street hazards.

Course project: Mobile Application Development (SE-458), NED University of Engineering and Technology, Karachi.

**Team:** Bisma Ahmed (SE-23010), Alishba (SE-23032)

**Status:** In development (Week 1)

## Problem

Open manholes, potholes, broken streetlights and similar hazards are a daily danger on our streets. People report them in WhatsApp groups or on social media, where reports get lost, the same hazard is reported many times, and nobody can see whether it was ever fixed.

## Solution

A user takes a photo, picks a category, and the app attaches the GPS location automatically. If an unresolved hazard of the same category already exists within about 30 metres, the new report is merged into it and its upvote count increases. All issues appear as pins on a map and move through four stages: Reported, Verified, In Progress, Resolved.

## Main Features

- Report a hazard with photo, category, note and automatic GPS location
- Duplicate merging within about 30 m (rule-based, no machine learning)
- Map view with pins, filterable by category and status
- Status tracking with push notifications to the reporter
- Admin panel to review issues, change status and remove spam

## Tech Stack

- **App:** React Native (Expo), React Navigation, react-native-maps, expo-camera / expo-image-picker, expo-location, expo-notifications, Axios
- **Backend:** Python, FastAPI, SQLAlchemy, JWT authentication
- **Database:** SQLite
- **Testing:** React Native Testing Library, pytest, Postman
- **Tools:** GitHub, Figma, EAS Build (Android APK)

## Team Roles

- **Alishba:** Frontend Developer and UI/UX Designer (screens, navigation, camera, location, map, wireframes)
- **Bisma:** Backend Developer and QA Engineer (API, database, authentication, duplicate merging, notifications, testing)

## Project Structure

- `/app` - React Native app
- `/backend` - FastAPI server
- `/docs` - proposal, report, wireframes

## Timeline

| Week | Planned tasks |
|---|---|
| 1 | Finalize scope, wireframes, repository setup, database schema |
| 2 | Signup and login, basic navigation, API skeleton |
| 3 | Report screen with camera, GPS and image upload |
| 4 | Map view with pins and issue detail screen |
| 5 | Duplicate merging, upvotes, first APK build |
| 6 | Status workflow, admin screens, push notifications |
| 7 | Testing, bug fixing, UI polish, real-device testing |
| 8 | Final APK, final report, demo preparation |

## Setup

Setup instructions will be added as the app and backend are built.

## Build

Android APK: to be added after the final build.

## License

For academic use.
