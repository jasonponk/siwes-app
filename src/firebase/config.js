// Firebase Configuration
// Replace these values with your actual Firebase project config from https://console.firebase.google.com
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyD3kN_nLzV16uh-iI_hx16GIUxCW01D_H8",
  authDomain: "siwes-portal.firebaseapp.com",
  databaseURL: "https://siwes-portal-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "siwes-portal",
  storageBucket: "siwes-portal.firebasestorage.app",
  messagingSenderId: "909189034140",
  appId: "1:909189034140:web:8a4f7e2ecde962026cbd59",
  measurementId: "G-7QYHPX422V"
};

const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
export const auth = getAuth(app)
export const db = getDatabase(app)
export default app
