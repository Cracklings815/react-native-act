// firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyA_m56ESlsZfCIG-gZjCpFORg3wPAIG1Tk",
    authDomain: "fir-66e51.firebaseapp.com",
    databaseURL: "https://fir-66e51-default-rtdb.firebaseio.com",
    projectId: "fir-66e51",
    storageBucket: "fir-66e51.firebasestorage.app",
    messagingSenderId: "119792176235",
    appId: "1:119792176235:android:7b61c48c3385585c48f52e",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
