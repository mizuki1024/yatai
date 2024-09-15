import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getAnalytics as getAnalyticsModule } from "firebase/analytics";

// Firebaseの設定
const firebaseConfig = {
  apiKey: "AIzaSyAFsyt6MbqwYxHzOaSsyhGup5qYZYKOpms",
  authDomain: "tizu-2df5d.firebaseapp.com",
  projectId: "tizu-2df5d",
  storageBucket: "tizu-2df5d.appspot.com",
  messagingSenderId: "121970837294",
  appId: "1:121970837294:web:003042ff34b80ac75edcbf",
  measurementId: "G-N88BZKCY1K"
};

// Firebaseを初期化
const app = initializeApp(firebaseConfig);

// FirestoreとStorageを初期化
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// クライアントサイドでのみ Analytics を初期化
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalyticsModule(app);
}

export { app, db, storage, auth, analytics };
