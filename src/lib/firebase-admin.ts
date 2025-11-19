import admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (!admin.apps.length) {
  if (!serviceAccountString) {
    console.warn('Firebase Admin SDK not initialized. FIREBASE_SERVICE_ACCOUNT_JSON is not set. API routes using Firebase will fail.');
  } else {
    try {
      const serviceAccount: ServiceAccount = JSON.parse(serviceAccountString);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error) {
      console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_JSON:', (error as Error).message);
      console.error('Error initializing Firebase Admin SDK:', error);
    }
  }
}

const db = admin.apps.length ? admin.firestore() : null;

if (!db) {
    console.error("Firestore is not initialized. Check your Firebase Admin SDK configuration.");
}

export { db };
