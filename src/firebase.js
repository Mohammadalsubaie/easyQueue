// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";

// const firebaseConfig = {
//     apiKey: "AIzaSyB58fVIIVbhByw1PZfN0LrdKqx-AEM1vUg",
//     authDomain: "easy-queue-sp.firebaseapp.com",
//     projectId: "easy-queue-sp",
//     storageBucket: "easy-queue-sp.firebasestorage.app",
//     messagingSenderId: "951767414440",
//     appId: "1:951767414440:web:59aebe0913fb10eba6b49d"
// };

// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
// export default app;


import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage"
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";


const firebaseConfig = {
  apiKey: "AIzaSyB58fVIIVbhByw1PZfN0LrdKqx-AEM1vUg",
  authDomain: "easy-queue-sp.firebaseapp.com",
  projectId: "easy-queue-sp",
  storageBucket: "easy-queue-sp.firebasestorage.app",
  messagingSenderId: "951767414440",
  appId: "1:951767414440:web:59aebe0913fb10eba6b49d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase Auth
export const auth = getAuth(app);

// Export Firestore
export const db = getFirestore(app);

// Export Firebase Functions
export const functions = getFunctions(app);

// Export Firebase Storage
export const storage = getStorage(app);

// Export default Firebase app
export default app;