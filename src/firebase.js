

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDcfyx5NeNgSZu1mAgawojuOiMX1ye09X8",
  authDomain: "orbitzquote.firebaseapp.com",
  projectId: "orbitzquote",
  storageBucket: "orbitzquote.firebasestorage.app",
  messagingSenderId: "157131759941",
  appId: "1:157131759941:web:7a2f235ddba85bbb859e2c"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);