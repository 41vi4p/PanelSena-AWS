"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/sidebar"
import TopBar from "@/components/top-bar"
import BottomNav from "@/components/bottom-nav"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { useAuth } from "@/hooks/use-auth"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, userProfile, initializing } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    if (!initializing && !user) {
      router.push("/")
    }
  }, [user, initializing, router])

  if (initializing || !user) return null

  // Merge user and userProfile to include all necessary data
  const mergedUser = {
    ...userProfile,
    photoURL: user.photoURL,
    displayName: userProfile?.displayName || user.displayName,
    email: user.email,
  }

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-background">
        {/* Sidebar - Hidden on mobile (below lg breakpoint) */}
        <div className="hidden lg:block">
          <Sidebar 
            open={sidebarOpen} 
            onToggle={() => setSidebarOpen(!sidebarOpen)} 
            collapsed={sidebarCollapsed}
            onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar 
            user={mergedUser} 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
            onSidebarCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            sidebarCollapsed={sidebarCollapsed}
          />
          <main className="flex-1 overflow-auto bg-linear-to-br from-background via-background to-muted/30 pb-16 lg:pb-0">
            {children}
          </main>
          <BottomNav />
        </div>
      </div>
      <Toaster />
    </ThemeProvider>
  )
}
