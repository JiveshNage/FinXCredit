import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBgtFnpEd7444SQJrddFtVholB1QZDKB9U",
  authDomain: "finx-6563d.firebaseapp.com",
  projectId: "finx-6563d",
  storageBucket: "finx-6563d.firebasestorage.app",
  messagingSenderId: "159394654561",
  appId: "1:159394654561:web:939376b6cbf94bbf9bbd20",
  measurementId: "G-GEMSGNH7R8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
