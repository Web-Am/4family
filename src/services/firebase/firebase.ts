import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBk2c0KicP26jE7YfUm8R7HUfXUQqaFXZQ",
    authDomain: "family-72d51.firebaseapp.com",
    databaseURL: "https://family-72d51-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "family-72d51",
    storageBucket: "family-72d51.appspot.com",
    messagingSenderId: "360443974791",
    appId: "1:360443974791:web:246d0854ccd35e11b11422",
    measurementId: "G-F8D75E9MNT"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
