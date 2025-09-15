import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAuth } from "firebase/auth"

if (
    !process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    !process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
) {
    throw new Error("[ENV ERR]: Invalid .env configuration for firebase client sdk")
}

const clientCredentials = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(clientCredentials)
const db = getFirestore(app)
const auth = getAuth(app)
const storage = getStorage(app)

export { auth, db, storage }
