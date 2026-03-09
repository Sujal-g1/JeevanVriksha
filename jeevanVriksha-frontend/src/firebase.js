import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCP-npsHZTBUXF8TwnkFfSZkKOykq_T-Ek",
  authDomain: "jeevanvriksha.firebaseapp.com",
  projectId: "jeevanvriksha",
  storageBucket: "jeevanvriksha.firebasestorage.app",
  messagingSenderId: "836696013954",
  appId: "1:836696013954:web:9eea503ff4f589d1bbc89b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();


