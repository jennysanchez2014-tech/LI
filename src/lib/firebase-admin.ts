import admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
let db: admin.firestore.Firestore | null = null;

if (!admin.apps.length) {
  if (!serviceAccountString) {
    console.error('Firebase Admin SDK initialization failed: The FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set.');
  } else {
    try {
      const serviceAccount: ServiceAccount = JSON.parse(serviceAccountString);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase Admin SDK initialized successfully.");
      db = admin.firestore();
    } catch (error) {
      console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_JSON. Make sure it is a valid JSON string. Error:', error);
    }
  }
} else {
    db = admin.firestore();
}


if (!db) {
    console.error("Firestore is not available. The `db` object could not be initialized.");
}

export { db };
