import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth"

import { AuthUser } from "#/users"
import { auth } from "@/lib/firebase/firebase.browser"

async function loginWithEmailAndPassword(user: AuthUser) {
    const userDetails = await signInWithEmailAndPassword(auth, user.email, user.password)
    return userDetails.user
}

async function signUpWithEmailAndPassword(user: AuthUser) {
    const userCredentials = await createUserWithEmailAndPassword(auth, user.email, user.password)
    return userCredentials.user
}

async function logout() {
    await signOut(auth)
}

async function verifyEmailAction() {
    if (auth.currentUser) await sendEmailVerification(auth.currentUser)
}

export { loginWithEmailAndPassword, logout, signUpWithEmailAndPassword, verifyEmailAction }
