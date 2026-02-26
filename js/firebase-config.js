/**
 * Firebase Configuration for Nutpa CMS
 * Replace the dummy values below with your actual Firebase Project credentials.
 */

// Placeholder for user's Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCD-nF2tPRMV-CZWpmSj38zziw5NFuMXko",
    authDomain: "nutpa-cms.firebaseapp.com",
    projectId: "nutpa-cms",
    storageBucket: "nutpa-cms.firebasestorage.app",
    messagingSenderId: "121790570276",
    appId: "1:121790570276:web:692a06b2ad1f54450c9db1",
    measurementId: "G-4FDGCWV9LQ"
};

// Initialize Firebase (Compat version)
let db;
let analytics;

function initFirebase() {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        if (firebase.analytics) analytics = firebase.analytics();
        console.log("Firebase Cloud Storage Initialized.");
        return true;
    }
    console.warn("Firebase scripts not loaded.");
    return false;
}
