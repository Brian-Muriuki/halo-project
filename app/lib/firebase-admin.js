import admin from 'firebase-admin';

// Check if the SDK has already been initialized
if (!admin.apps.length) {
  try {
    const serviceAccountJsonString = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;
    
    if (!serviceAccountJsonString) {
      throw new Error('FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON environment variable is not set.');
    }
    
    // Parse the JSON string into an object
    const serviceAccount = JSON.parse(serviceAccountJsonString);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error.message);
    // Depending on your error handling strategy, you might want to re-throw the error
    // or handle it differently (e.g., prevent app startup).
    // For now, we'll just log it. In production, ensure this is handled robustly.
  }
}

const adminAuth = admin.auth();
const adminDb = admin.firestore();

export { adminAuth, adminDb }; 