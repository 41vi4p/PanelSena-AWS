"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, initializing } = useAuth()
  const router = useRouter()
  const [redirectAttempted, setRedirectAttempted] = useState(false)

  // Clear any stuck sessionStorage flags
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('redirecting')
    }
  }, [])

  useEffect(() => {
    if (!initializing && !user && !redirectAttempted) {
      setRedirectAttempted(true)
      router.replace("/")
    }
  }, [user, initializing, redirectAttempted, router])

  if (initializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
