Backfill users from Firebase Auth into Firestore

Prerequisites:
- Node.js installed
- A Firebase service account JSON file with permission to read Auth and write Firestore

Steps:
1. Save your service account JSON locally and set the environment variable:

   For PowerShell:
   $env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\serviceAccount.json"

   For cmd.exe:
   set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\serviceAccount.json

2. Install dependencies (in project root):

   npm install firebase-admin

3. Run the backfill script:

   node scripts/backfillUsers.js

Notes:
- The script will upsert a `users/{uid}` doc with `firstName`, `lastName`, `displayName`, `email`, and `createdAt` timestamp.
- It uses the Auth `displayName` to derive first/last names when available.
- Run in a trusted environment (server or local machine) — do not expose service account keys in the browser.
