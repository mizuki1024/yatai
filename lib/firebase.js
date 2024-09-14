// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Firebase Authenticationのインポート
import { getFirestore } from "firebase/firestore"; // Firestoreのインポート

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAFsyt6MbqwYxHzOaSsyhGup5qYZYKOpms",
  authDomain: "tizu-2df5d.firebaseapp.com",
  projectId: "tizu-2df5d",
  storageBucket: "tizu-2df5d.appspot.com",
  messagingSenderId: "121970837294",
  appId: "1:121970837294:web:003042ff34b80ac75edcbf",
  measurementId: "G-N88BZKCY1K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Firestore and get a reference to the service
const db = getFirestore(app);

export { app, auth, db };
