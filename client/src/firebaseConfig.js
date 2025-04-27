// client/src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your Firebase app configuration
const firebaseConfig = {
  apiKey: "AIzaSyBs2ZN-p-miZWZvsHzOx64kKPFh0n7UW9w",
  authDomain: "easyqueue-810fb.firebaseapp.com",
  projectId: "easyqueue-810fb",
  storageBucket: "easyqueue-810fb.firebasestorage.app",
  messagingSenderId: "89524857190",
  appId: "1:89524857190:web:c6fc46cbef4a7b1b2d80a7",
  measurementId: "G-108ZHD4WLW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
