// firebase server-side only support
import admin, { ServiceAccount } from "firebase-admin"

if (
    !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    !process.env.FIREBASE_CLIENT_EMAIL ||
    !process.env.FIREBASE_PRIVATE_KEY ||
    !process.env.FIREBASE_DB_URL
) {
    throw new Error("[ENV ERR]: Invalid .env configuration for firebase admin")
}
const serviceAccount: ServiceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
}

const dbUrl = process.env.FIREBASE_DB_URL

export function getFirebaseAdmin() {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: dbUrl,
        })
    }

    return admin
}

const firebaseAdmin = getFirebaseAdmin()

const db = firebaseAdmin.firestore()
const auth = firebaseAdmin.auth()
const serverTimestamp = firebaseAdmin.firestore.FieldValue.serverTimestamp

export { firebaseAdmin, db, auth, serverTimestamp  }
