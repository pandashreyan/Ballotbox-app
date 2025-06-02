
// Import the functions you need from the SDKs you need
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore"; // Added

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
let db: Firestore; // Added

// Prevent re-initialization in development (HMR)
if (typeof window !== 'undefined' && !(window as any)._firebaseAppInitialized) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app); // Added
  (window as any)._firebaseAppInitialized = true;
} else if (typeof window !== 'undefined' && (window as any)._firebaseAppInitialized) {
  // If already initialized, use the existing instance.
  app = initializeApp(firebaseConfig); // Firebase handles multiple init calls gracefully
  db = getFirestore(app); // Added
} else {
    // For environments without window (e.g. during build for server components if not handled correctly)
    app = initializeApp(firebaseConfig);
    db = getFirestore(app); // Added
}


export { app, db }; // Added db to exports

