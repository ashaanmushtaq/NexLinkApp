import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // 👈 Add this
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCmzeCAOUZMU4rrW61J9XT0UDb1KWErkOQ",
  authDomain: "nexlink-a7dfd.firebaseapp.com",
  projectId: "nexlink-a7dfd",
  storageBucket: "nexlink-a7dfd.firebasestorage.app",
  messagingSenderId: "714639581586",
  appId: "1:714639581586:web:735ced91d7ec86faa4a14b",
  measurementId: "G-EQ8L1XXEPY"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app); // 👈 Add this
export const storage = getStorage(app);
