import { AuthUser } from "#/users"
import { auth } from "@/lib/firebase/firebase.browser"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"

async function loginWithEmailAndPassword(user: AuthUser) {
    const userDetails = await signInWithEmailAndPassword(auth, user.email, user.password)
    return userDetails.user
}

async function signUpWithEmailAndPassword(user: AuthUser) {
    const userCredentials = await createUserWithEmailAndPassword(auth, user.email, user.password)
    return userCredentials
}

async function logout() {}

export { loginWithEmailAndPassword, signUpWithEmailAndPassword, logout }
