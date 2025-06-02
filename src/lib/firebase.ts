
// Import the functions you need from the SDKs you need
import { initializeApp, type FirebaseApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For a real production app, consider using environment variables for these values.
const firebaseConfig = {
  apiKey: "AIzaSyDjdepGlm1aYly0n6MuxRkbJeyLVkY20Q4",
  authDomain: "ballotbox-cxs9h.firebaseapp.com",
  projectId: "ballotbox-cxs9h",
  storageBucket: "ballotbox-cxs9h.appspot.com", // Corrected storageBucket domain
  messagingSenderId: "731874866757",
  appId: "1:731874866757:web:f2764b35dfb82d10a8152c"
};

// Initialize Firebase
let app: FirebaseApp;

// Prevent re-initialization in development (HMR)
if (typeof window !== 'undefined' && !(window as any)._firebaseAppInitialized) {
  app = initializeApp(firebaseConfig);
  (window as any)._firebaseAppInitialized = true;
} else if (typeof window !== 'undefined' && (window as any)._firebaseAppInitialized) {
  // If already initialized, use the existing instance.
  // This might require a slightly different approach if you use getApps() later.
  // For now, this assumes a single app instance.
  // A more robust way in Next.js might involve checking getApps().length.
  // However, for basic client-side init, this handles HMR.
  // For server components, Firebase Admin SDK would be used differently.
  // This setup is primarily for client-side Firebase SDK usage.
  app = initializeApp(firebaseConfig); // Re-init to get the app instance if needed, Firebase handles multiple calls gracefully.
} else {
    // For environments without window (e.g. during build for server components if not handled correctly)
    // or if you need a single app instance globally.
    // This might need to be getApps().length ? getApp() : initializeApp(firebaseConfig);
    // For now, simpler init, assuming client-side context where this file is imported.
    app = initializeApp(firebaseConfig);
}


export { app };
