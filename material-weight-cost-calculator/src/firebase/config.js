import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBUKMsPtkdUo_9Ur7Jb9Pg-1JSKlUP0nqc",
  authDomain: "material-weight-calculat-2d11a.firebaseapp.com",
  projectId: "material-weight-calculat-2d11a",
  storageBucket: "material-weight-calculat-2d11a.firebasestorage.app",
  messagingSenderId: "784058006930",
  appId: "1:784058006930:web:9311c622e5313fbd3e954b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
