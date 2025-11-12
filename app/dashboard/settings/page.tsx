"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Bell, Lock, Users, Palette, Sun, Moon } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "@/components/theme-provider"

export default function SettingsPage() {
  const { user, userProfile } = useAuth()
  const { toast } = useToast()
  const { theme, toggleTheme } = useTheme()
  const [email, setEmail] = useState("")
  const [userName, setUserName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && userProfile) {
      setEmail(user.email || "")
      setUserName(userProfile.displayName || user.displayName || "")
      setCompanyName(userProfile.companyName || "")
    }
  }, [user, userProfile])

  const handleSaveChanges = async () => {
    if (!user || !userProfile) return
    
    setLoading(true)
    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName: userName,
        companyName,
        updatedAt: new Date().toISOString(),
      })
      
      toast({
        title: "Success",
        description: "Your settings have been updated.",
      })
      
      // Refresh the page after a short delay to show the toast
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error("Error updating settings:", error)
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Account Settings */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Account Settings
          </CardTitle>
          <CardDescription>Update your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userName">Your Name</Label>
            <Input
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="bg-input border-border"
              placeholder="Enter your name"
            />
            <p className="text-xs text-muted-foreground">Your display name (initially from Google account)</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company Name</Label>
            <Input
              id="company"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="bg-input border-border"
              placeholder="Enter your company name"
            />
            <p className="text-xs text-muted-foreground">This will appear in the top bar</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              className="bg-input border-border"
              disabled
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
          <Button 
            onClick={handleSaveChanges}
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          <CardDescription>Manage your notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Display Alerts</p>
              <p className="text-sm text-muted-foreground">Get notified when displays go offline</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Performance Reports</p>
              <p className="text-sm text-muted-foreground">Weekly performance summaries</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">System Updates</p>
              <p className="text-sm text-muted-foreground">Notifications about system updates</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Security
          </CardTitle>
          <CardDescription>Manage your security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full border-border bg-transparent">
            Change Password
          </Button>
          <Button variant="outline" className="w-full border-border bg-transparent">
            Enable Two-Factor Authentication
          </Button>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Appearance
          </CardTitle>
          <CardDescription>Customize your dashboard appearance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Theme</Label>
              <p className="text-sm text-muted-foreground">
                {theme === "dark" ? "Dark mode" : "Light mode"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch 
                checked={theme === "dark"} 
                onCheckedChange={toggleTheme}
              />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
