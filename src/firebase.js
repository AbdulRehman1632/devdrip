import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBg-sskX_B1Dz_ndtZMsBrsGbznqpYRYW0",
  authDomain: "attendance-7d34d.firebaseapp.com",
  projectId: "attendance-7d34d",
  storageBucket: "attendance-7d34d.firebasestorage.app",
  messagingSenderId: "385732681271",
  appId: "1:385732681271:web:cef073e8d452080e04e9b2",
  measurementId: "G-D8RF2DLJ80"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

