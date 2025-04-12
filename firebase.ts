import { initializeApp } from "firebase/app";

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
// const db = getFirestore(app);


export { app };