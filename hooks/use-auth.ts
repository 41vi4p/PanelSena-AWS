import { useState, useEffect, useRef } from 'react'
import { User } from 'firebase/auth'
import { onAuthStateChange, getUserProfile, UserProfile } from '@/lib/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(true)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    let isFirstLoad = true

    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (!mounted.current) return

      setUser(firebaseUser)

      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid)
          if (mounted.current) {
            setUserProfile(profile)
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
        }
      } else {
        if (mounted.current) {
          setUserProfile(null)
        }
      }

      if (mounted.current) {
        setLoading(false)
        if (isFirstLoad) {
          setInitializing(false)
          isFirstLoad = false
        }
      }
    })

    return () => {
      mounted.current = false
      unsubscribe()
    }
  }, [])

  return { user, userProfile, loading, initializing }
}
