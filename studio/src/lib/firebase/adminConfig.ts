// src/lib/firebase/adminConfig.ts
import admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccountJsonString = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (!serviceAccountJsonString) {
    console.error("Firebase Admin SDK: Service account JSON string is missing in environment variable GOOGLE_APPLICATION_CREDENTIALS_JSON. Admin SDK will not be initialized.");
  } else {
    try {
      const serviceAccount = JSON.parse(serviceAccountJsonString);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        // Add your databaseURL if you're using Realtime Database, otherwise not strictly needed for Firestore
        // databaseURL: `https://${serviceAccount.project_id}.firebaseio.com` 
      });
      console.log("Firebase Admin SDK initialized successfully.");
    } catch (error) {
      console.error("Firebase Admin SDK: Error parsing service account JSON or initializing app:", error);
    }
  }
}

const adminAuth = admin.apps.length ? admin.auth() : null;
const adminDb = admin.apps.length ? admin.firestore() : null;

if (!adminAuth || !adminDb) {
  console.warn("Firebase Admin SDK was not initialized. adminAuth or adminDb might be null. Ensure GOOGLE_APPLICATION_CREDENTIALS_JSON is set correctly.");
}

export { adminAuth, adminDb };
