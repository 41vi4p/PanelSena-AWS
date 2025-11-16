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

    // Get user profile - if it doesn't exist, create it
    let userProfile = await getUserProfile(user.uid)
    if (!userProfile) {
      // Create user in Prisma database
      await createUser({
        email: user.email!,
        name: user.email!.split('@')[0], // Use email prefix as name
      })
      // Try to get profile again
      userProfile = await getUserProfile(user.uid)
    }

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

    // Get user profile - if it doesn't exist, create it
    let userProfile = await getUserProfile(user.uid)
    if (!userProfile) {
      // Create user in Prisma database
      await createUser({
        email: user.email!,
        name: user.displayName || user.email!.split('@')[0],
      })
      // Try to get profile again
      userProfile = await getUserProfile(user.uid)
    }

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
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    // Call API route instead of direct database access
    const response = await fetch(`/api/user/profile?uid=${encodeURIComponent(uid)}`)

    if (response.status === 404) {
      // User doesn't exist in database, create them
      // We need to get basic user info from Firebase Auth
      // For now, return null and let the calling code handle user creation
      return null
    }

    if (!response.ok) {
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
