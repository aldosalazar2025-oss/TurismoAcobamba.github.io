// TurismoAcobamba - Firebase V2
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAe0r55RWZTMVGDjAv8WK6pTjHXsp3vZYY",
  authDomain: "turismoacobamba-d12e8.firebaseapp.com",
  projectId: "turismoacobamba-d12e8",
  storageBucket: "turismoacobamba-d12e8.firebasestorage.app",
  messagingSenderId: "568579714286",
  appId: "1:568579714286:web:5f525b94f930c0270297ff"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
