"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Monitor, Lock, Mail, AlertCircle } from "lucide-react"
import { ThemeProvider } from "@/components/theme-provider"
import { signIn, signUp, signInWithGoogle } from "@/lib/auth"
import { useAuth } from "@/hooks/use-auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()
  const { user, initializing } = useAuth()
  const [redirectAttempted, setRedirectAttempted] = useState(false)

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!initializing && user && !redirectAttempted) {
      setRedirectAttempted(true)
      router.replace("/dashboard")
    }
  }, [user, initializing, redirectAttempted, router])

  // Clear any stuck sessionStorage flags
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('redirecting')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (isSignUp) {
        if (!companyName.trim()) {
          setError("Company name is required")
          setLoading(false)
          return
        }
        await signUp(email, password, companyName)
      } else {
        await signIn(email, password)
      }
      // Auth state change will trigger redirect automatically
    } catch (err: any) {
      console.error("Auth error:", err)

      // Handle Firebase auth errors
      const errorMessage = err.code ? getFirebaseErrorMessage(err.code) : "An error occurred. Please try again."
      setError(errorMessage)
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError("")

    try {
      await signInWithGoogle()
      // Auth state change will trigger redirect automatically
    } catch (err: any) {
      console.error("Google sign-in error:", err)
      setError("Failed to sign in with Google. Please try again.")
      setLoading(false)
    }
  }

  const getFirebaseErrorMessage = (code: string): string => {
    switch (code) {
      case "auth/email-already-in-use":
        return "This email is already registered"
      case "auth/invalid-email":
        return "Invalid email address"
      case "auth/weak-password":
        return "Password should be at least 6 characters"
      case "auth/user-not-found":
        return "No account found with this email"
      case "auth/wrong-password":
        return "Incorrect password"
      case "auth/invalid-credential":
        return "Invalid email or password"
      default:
        return "Authentication failed. Please try again."
    }
  }

  // Show loading during initial auth check
  if (initializing) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    )
  }

  // Show redirecting if user exists
  if (user) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Redirecting to dashboard...</p>
          </div>
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg shadow-lg">
                <Monitor className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                PanelSena
              </span>
            </div>
          </div>

          {/* Auth Card */}
          <Card className="border-border/50 shadow-2xl backdrop-blur-sm bg-card/80">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl">{isSignUp ? "Create Account" : "Welcome Back"}</CardTitle>
              <CardDescription>
                {isSignUp
                  ? "Set up your PanelSena account to manage your displays"
                  : "Sign in to your PanelSena dashboard"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      placeholder="Your Company"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="bg-input border-border/50 backdrop-blur-sm"
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-input border-border/50 backdrop-blur-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-input border-border/50 backdrop-blur-sm"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold shadow-lg"
                  disabled={loading}
                >
                  {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
                </Button>
              </form>

              <div className="relative my-6">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  OR
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.6)] hover:bg-transparent hover:text-current transition-all duration-300"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                  <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-primary hover:underline font-medium">
                    {isSignUp ? "Sign In" : "Sign Up"}
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-6">Secure cloud-based display management system</p>
        </div>
      </div>
    </ThemeProvider>
  )
}
