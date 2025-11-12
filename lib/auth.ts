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

    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      companyName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await setDoc(doc(db, 'users', user.uid), userProfile)

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

    // Get user profile from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    const userProfile = userDoc.data() as UserProfile

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

    // Check if user profile exists
    const userDoc = await getDoc(doc(db, 'users', user.uid))

    let userProfile: UserProfile

    if (!userDoc.exists()) {
      // Create new user profile if doesn't exist
      userProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || undefined,
        companyName: 'My Company', // Default company name
        photoURL: user.photoURL || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      await setDoc(doc(db, 'users', user.uid), userProfile)
    } else {
      userProfile = userDoc.data() as UserProfile
      // Update photo URL and display name if they have changed
      const needsUpdate = 
        (user.photoURL && user.photoURL !== userProfile.photoURL) ||
        (user.displayName && user.displayName !== userProfile.displayName)
      
      if (needsUpdate) {
        userProfile.photoURL = user.photoURL || userProfile.photoURL
        userProfile.displayName = user.displayName || userProfile.displayName
        await updateDoc(doc(db, 'users', user.uid), {
          photoURL: user.photoURL,
          displayName: user.displayName,
          updatedAt: new Date().toISOString(),
        })
      }
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
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile
    }
    return null
  } catch (error) {
    console.error('Error getting user profile:', error)
    throw error
  }
}

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}
