"use client"

import { Button } from "@/components/ui/button"
import { Bell, LogOut, Settings, PanelLeftClose, PanelLeft, Info } from "lucide-react"
import { useRouter } from "next/navigation"
import { signOut } from "@/lib/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TopBarProps {
  user: any
  onMenuClick: () => void
  onSidebarCollapse?: () => void
  sidebarCollapsed?: boolean
}

export default function TopBar({ user, onMenuClick, onSidebarCollapse, sidebarCollapsed }: TopBarProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
      // Fallback to redirect
      window.location.href = "/"
    }
  }

  const handleSettingsClick = () => {
    router.push("/dashboard/settings")
  }

  const handleAboutClick = () => {
    router.push("/dashboard/about")
  }

  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Username from Google account (displayName)
  const userName = user?.displayName || user?.email?.split("@")[0] || "User"
  // Company name set by user in settings
  const companyName = user?.companyName || "PanelSena"
  const photoURL = user?.photoURL

  return (
    <header className="h-14 sm:h-16 border-b border-border/50 bg-card/50 backdrop-blur-md flex items-center justify-between px-3 sm:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        {/* Desktop Sidebar Collapse Toggle */}
        {onSidebarCollapse && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onSidebarCollapse} 
            className="hidden lg:flex text-muted-foreground hover:text-foreground shrink-0"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </Button>
        )}

        <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground truncate">{companyName}</h2>
      </div>

      <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground transition-colors hidden sm:flex">
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleSettingsClick}
          className="text-muted-foreground hover:text-foreground transition-colors hidden sm:flex"
          title="Settings"
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>

        <div className="h-6 sm:h-8 w-px bg-border/50 hidden sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-1 sm:gap-2 h-auto py-1 sm:py-2 px-2 sm:px-3">
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                {photoURL && <AvatarImage src={photoURL} alt={userName} />}
                <AvatarFallback className="bg-primary/20 text-primary font-semibold text-xs sm:text-sm">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs sm:text-sm font-medium text-foreground hidden md:inline max-w-[100px] lg:max-w-none truncate">{userName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSettingsClick} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleAboutClick} className="cursor-pointer">
              <Info className="mr-2 h-4 w-4" />
              About
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
