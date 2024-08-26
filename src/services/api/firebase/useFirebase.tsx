import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { getFamilyMember } from "./api";

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
export const db = getFirestore(app);

export class AccountModel {
    email: string;
    displayname: string;
    photo: string;
    uid: string;
    providerId: string;
    system: string;
}

export const onSignInWithGoogle = async () => {

    return new Promise<any>(async (resolve, reject) => {
        try {
            const googleProvider = new GoogleAuthProvider();
            const auth = getAuth(app);
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            resolve(user);
        } catch (error) {
            console.error("onSignInWithGoogle")
            console.error(error)
            reject("KO");
        }
    });
};
export const onSignOutWithGoogle = async () => {

    return new Promise<void>(async (resolve, reject) => {
        try {
            const auth = getAuth();
            await signOut(auth);
            resolve()
        } catch (error) {
            console.error("onSignOutWithGoogle")
            console.error(error)
            reject("KO");
        }
    });
};

export const useStateChangeWithGoogle = () => {

    const [user, setUser] = useState<AccountModel>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setIsLoading(false);
            if (user != null)
                getFamilyMember(user.email)
                    .then(sy => {

                        let accountModel = new AccountModel();
                        accountModel.displayname = user.displayName
                        accountModel.email = user.email
                        accountModel.photo = user.providerData[0].photoURL
                        accountModel.providerId = user.providerData[0].providerId
                        accountModel.uid = user.providerData[0].uid
                        accountModel.system = sy;
                        setUser(accountModel);
                    })
            else
                setUser(null);
        });

        return () => unsubscribe();
    }, []);

    return { user, isLoading };
};