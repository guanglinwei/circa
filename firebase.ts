import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    //@ts-ignore
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    //@ts-ignore
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    //@ts-ignore
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    //@ts-ignore
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    //@ts-ignore
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    //@ts-ignore
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    //@ts-ignore
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const login = () => {
    signInWithPopup(auth, provider).then((user) => {
        console.log(user.user.email);
    }).catch((err) => {
        console.error(err);
    })
};

export const logout = () => {
    signOut(auth).catch((err) => console.error(err));
};

// TODO: Database-related functions to have:
//  - for a given user, write energy graph
//      - (x, y) points
//      - date
//  - for a given user, read all previous writes
// Firebase structure
//  users/{user_id}/graphs/{graph_id}: list
//      - points: array<string: "{x}_{y}"> 
//      - timestamp: timestamp

export { auth, db };