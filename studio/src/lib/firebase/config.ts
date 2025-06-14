
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore'; // Added for Firestore

// Log the API key to help debug initialization issues
const apiKeyFromEnv = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomainFromEnv = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectIdFromEnv = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// Reduced initial logging for brevity during startup
// console.log('Firebase Config - Reading from environment:');
// console.log('NEXT_PUBLIC_FIREBASE_API_KEY:', apiKeyFromEnv ? `Loaded (value: ${apiKeyFromEnv.substring(0,5)}...)` : 'MISSING or undefined');
// console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', authDomainFromEnv ? `Loaded (value: ${authDomainFromEnv})` : 'MISSING or undefined');
// console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', projectIdFromEnv ? `Loaded (value: ${projectIdFromEnv})` : 'MISSING or undefined');
// console.log('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'Loaded' : 'Optional, not loaded');
// console.log('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:', process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'Loaded' : 'Optional, not loaded');
// console.log('NEXT_PUBLIC_FIREBASE_APP_ID:', process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'Loaded' : 'Optional, not loaded');
// console.log('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:', process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ? 'Loaded' : 'Optional, not loaded');


if (!apiKeyFromEnv) {
  console.error("CRITICAL: NEXT_PUBLIC_FIREBASE_API_KEY is missing or undefined in your environment variables. Authentication will likely fail. Please check your .env or environment configuration.");
}
if (!authDomainFromEnv) {
  console.error("CRITICAL: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is missing or undefined in your environment variables. Authentication, especially with third-party providers, will likely fail due to unauthorized domain errors. Please check your .env or environment configuration.");
}
if (!projectIdFromEnv) {
  console.error("CRITICAL: NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing or undefined in your environment variables. Firestore and other project-specific services will not work. Please check your .env or environment configuration.");
}

const firebaseConfig = {
  apiKey: apiKeyFromEnv,
  authDomain: authDomainFromEnv,
  projectId: projectIdFromEnv,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;

if (!getApps().length) {
  const essentialConfigs = {
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
  };

  const missingConfigs = Object.entries(essentialConfigs)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingConfigs.length > 0) {
    console.error(`Firebase initialization error: The following essential environment variables were not found or are empty: ${missingConfigs.join(', ')}. Please check your .env file or environment setup and ensure all required NEXT_PUBLIC_FIREBASE_ variables are set correctly. App will NOT be initialized correctly.`);
    // We intentionally don't initialize if critical configs are missing to prevent further confusing errors.
    // However, to satisfy type constraints for app, auth, db, we'll assign them potentially problematic values
    // that would error out if used, which is better than a build failure.
    // @ts-ignore // Allow faulty assignment for error case
    app = null; 
  } else {
    // console.log('All essential Firebase config keys appear present from environment. Attempting to initialize Firebase with effective config:', 
    //   JSON.stringify({
    //     apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0,5)}...` : 'MISSING',
    //     authDomain: firebaseConfig.authDomain || 'MISSING',
    //     projectId: firebaseConfig.projectId || 'MISSING',
    //     storageBucket: firebaseConfig.storageBucket || 'Not Set',
    //     messagingSenderId: firebaseConfig.messagingSenderId || 'Not Set',
    //     appId: firebaseConfig.appId || 'Not Set',
    //     measurementId: firebaseConfig.measurementId || 'Not Set',
    //   }, null, 2)
    // );
    app = initializeApp(firebaseConfig);
    console.log("Firebase app initialized successfully.");
  }
} else {
  app = getApps()[0]!;
  console.log("Firebase app already initialized. Using existing instance.");
}

// Conditionally get Auth and Firestore to prevent errors if app is null due to config issues
const auth: Auth = app ? getAuth(app) : (null as unknown as Auth); // Type assertion for problematic case
const db: Firestore = app ? getFirestore(app) : (null as unknown as Firestore); // Type assertion

if (!app) {
  console.error("Firebase app object is null. Firebase services (Auth, Firestore) will not be available. This is typically due to missing critical configuration variables (API_KEY, AUTH_DOMAIN, PROJECT_ID).");
}


export { app, auth, db }; // Export db
