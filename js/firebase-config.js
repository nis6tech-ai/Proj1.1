/**
 * Firebase Configuration for Nutpa CMS
 * Replace the dummy values below with your actual Firebase Project credentials.
 */

// Placeholder for user's Firebase config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase (Static version)
// Note: These scripts will be loaded via CDN in index.html
let db;

function initFirebase() {
    if (typeof firebase !== 'undefined' && firebaseConfig.projectId !== "YOUR_PROJECT_ID") {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        console.log("Firebase Initialized Successfully");
        return true;
    }
    console.warn("Firebase not configured. Using LocalStorage fallback.");
    return false;
}
