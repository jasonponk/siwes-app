// Firebase Configuration
// Replace these values with your actual Firebase project config from https://console.firebase.google.com
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyAlryK37814aGGnGSn4gP3eaN6zOHvM7fI",
  authDomain: "cyber-sme-8aee0.firebaseapp.com",
  databaseURL: "https://cyber-sme-8aee0-default-rtdb.firebaseio.com",
  projectId: "cyber-sme-8aee0",
  storageBucket: "cyber-sme-8aee0.firebasestorage.app",
  messagingSenderId: "315767750143",
  appId: "1:315767750143:web:bcdc3c2dd955385a88fbca"
};

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getDatabase(app)
export default app
