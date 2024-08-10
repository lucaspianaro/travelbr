import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDYHnfCQRNbyTU6c_u-jtLPuLOLAkcdfVU",
  authDomain: "travelbr-9d9f1.firebaseapp.com",
  projectId: "travelbr-9d9f1",
  storageBucket: "travelbr-9d9f1.appspot.com",
  messagingSenderId: "470779608002",
  appId: "1:470779608002:web:cc0a2d96f017c6c3ecb45b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
export default app;
