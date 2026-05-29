// Backfill Firebase Auth users into Firestore 'users' collection
// Usage: set environment variable GOOGLE_APPLICATION_CREDENTIALS to service account JSON
// then run: node scripts/backfillUsers.js

const admin = require('firebase-admin');

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Please set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON file path.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

async function backfill() {
  console.log('Starting backfill of auth users to Firestore users collection...');
  let nextPageToken = undefined;
  let total = 0;

  do {
    const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
    const users = listUsersResult.users || [];

    for (const userRecord of users) {
      const uid = userRecord.uid;
      const displayName = userRecord.displayName || '';
      const email = userRecord.email || '';

      let firstName = '';
      let lastName = '';
      if (displayName) {
        const parts = displayName.trim().split(/\s+/);
        if (parts.length === 1) firstName = parts[0];
        else {
          firstName = parts[0];
          lastName = parts.slice(1).join(' ');
        }
      }

      const docRef = db.collection('users').doc(uid);
      try {
        await docRef.set({
          firstName,
          lastName,
          displayName: displayName || null,
          email: email || null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        console.log(`Upserted user ${uid} -> ${displayName || email}`);
        total++;
      } catch (err) {
        console.error(`Failed to upsert user ${uid}:`, err.message || err);
      }
    }

    nextPageToken = listUsersResult.pageToken;
  } while (nextPageToken);

  console.log(`Backfill complete. Processed ${total} users.`);
}

backfill().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
