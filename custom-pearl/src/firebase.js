import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Firebase Console wali keys yahan paste karein
const firebaseConfig = {
  apiKey: "AIzaSyBdl09aS_5vGkdh8TNnX0WyyHc1HSCoR10",
  authDomain: "custom-pearl.firebaseapp.com",
  projectId: "custom-pearl",
  storageBucket: "custom-pearl.firebasestorage.app",
  messagingSenderId: "841136762707",
  appId: "1:841136762707:web:dfa3a6a387a320115a3ba6"
};

// Firebase Initialize ho raha hai
const app = initializeApp(firebaseConfig);

// Database, Storage aur Auth ke variables export kar rahe hain
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);