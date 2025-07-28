// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // ✅ FIXED HERE

const firebaseConfig = {
  apiKey: "AIzaSyAqa5DYTI6dSpM73uiLr0b-18q-m3QSxu4",
  authDomain: "zinc-e2fd9.firebaseapp.com",
  projectId: "zinc-e2fd9",
  storageBucket: "zinc-e2fd9.appspot.com",
  messagingSenderId: "648420485990",
  appId: "1:648420485990:web:02d3c35a776d69736b36a7",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app); // ✅ works now

export { auth, provider, db, storage };
