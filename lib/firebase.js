// lib/firebase.js

import { initializeApp } from "firebase/app";
// 必要に応じて他のサービスもインポートします
import { getFirestore } from "firebase/firestore";
// import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAFsyt6MbqwYxHzOaSsyhGup5qYZYKOpms",
  authDomain: "tizu-2df5d.firebaseapp.com",
  projectId: "tizu-2df5d",
  storageBucket: "tizu-2df5d.appspot.com",
  messagingSenderId: "121970837294",
  appId: "1:121970837294:web:003042ff34b80ac75edcbf",
  measurementId: "G-N88BZKCY1K"
};

// Firebase の初期化
const app = initializeApp(firebaseConfig);
// 必要なサービスを初期化
const db = getFirestore(app);
// const auth = getAuth(app);

export { db };
