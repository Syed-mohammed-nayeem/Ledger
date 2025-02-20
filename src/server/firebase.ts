import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBJQXhh1sEDwPMoVJwNAT0LpQ0C4LjeEaU",
  authDomain: "ledger-2c859.firebaseapp.com",
  projectId: "ledger-2c859",
  storageBucket: "ledger-2c859.firebasestorage.app",
  messagingSenderId: "134997655841",
  appId: "1:134997655841:web:6ae9e47c83e4223ca43e60",
  measurementId: "G-52N0RE7RJ4"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
