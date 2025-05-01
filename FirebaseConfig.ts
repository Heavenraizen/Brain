import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB1EGLntDOafAhBg8lWn0N1rj7quSTQWz4",
  authDomain: "brain-marks.firebaseapp.com",
  projectId: "brain-marks",
  storageBucket: "brain-marks.firebasestorage.app",
  messagingSenderId: "674136772333",
  appId: "1:674136772333:web:2ff627606028e6fcbbc6e4"
};

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_STORAGE = getStorage(FIREBASE_APP);
