import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import { createUser, getUserById } from './database'

const googleProvider = new GoogleAuthProvider()

export interface UserProfile {
  uid: string
  email: string
  displayName?: string
  companyName: string
  photoURL?: string
  createdAt: string
  updatedAt: string
}

// Sign up with email and password
export const signUp = async (email: string, password: string, companyName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update user profile
    await updateProfile(user, {
      displayName: companyName,
    })

    // Create user in Prisma database
    await createUser({
      email: user.email!,
      name: companyName,
    })

    // Get the created user profile
    const userProfile = await getUserProfile(user.uid)

    return { user, userProfile }
  } catch (error) {
    console.error('Error signing up:', error)
    throw error
  }
}

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Get user profile (will create user if they don't exist)
    const userProfile = await getUserProfile(user.uid, user.email!, user.displayName || user.email!.split('@')[0])

    return { user, userProfile }
  } catch (error) {
    console.error('Error signing in:', error)
    throw error
  }
}

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user

    // Get user profile (will create user if they don't exist)
    const userProfile = await getUserProfile(user.uid, user.email!, user.displayName || user.email!.split('@')[0])

    return { user, userProfile }
  } catch (error) {
    console.error('Error signing in with Google:', error)
    throw error
  }
}

// Sign out
export const signOut = async () => {
  try {
    await firebaseSignOut(auth)
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

// Get user profile
export const getUserProfile = async (uid: string, email?: string, name?: string): Promise<UserProfile | null> => {
  try {
    // Call API route instead of direct database access
    const params = new URLSearchParams({ uid })
    if (email) params.append('email', email)
    if (name) params.append('name', name)

    const response = await fetch(`/api/user/profile?${params.toString()}`)

    if (!response.ok) {
      if (response.status === 404) {
        console.log('User profile not found for uid:', uid)
        return null
      }
      throw new Error(`Failed to fetch user profile: ${response.statusText}`)
    }

    const userProfile = await response.json()
    return userProfile
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}
