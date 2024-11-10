// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';  // Import Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA_WNYGZiuovpyGyBSbdsbTYiFewWBc0B4",
    authDomain: "samudera-ee2f8.firebaseapp.com",
    projectId: "samudera-ee2f8",
    storageBucket: "samudera-ee2f8.firebasestorage.app",
    messagingSenderId: "917072991133",
    appId: "1:917072991133:web:ed74344feeb775f9f89574"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Mendapatkan instance Auth dan Firestore
const auth = getAuth(app);
const db = getFirestore(app);  // Inisialisasi Firestore

// Initialize Firebase Authentication and export it
export default app;

export { auth, db };  // Ekspor auth dan db
