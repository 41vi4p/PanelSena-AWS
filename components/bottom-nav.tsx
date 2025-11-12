"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Monitor, FileText, Clock, BarChart3, MoreHorizontal, Settings, HelpCircle, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useState } from "react"

const mainMenuItems = [
  { href: "/dashboard", label: "Dashboard", icon: Monitor },
  { href: "/dashboard/content", label: "Content", icon: FileText },
  { href: "/dashboard/schedule", label: "Schedule", icon: Clock },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
]

const moreMenuItems = [
  { href: "/dashboard/displays", label: "Displays", icon: BarChart3 },
  { href: "/dashboard/logs", label: "Logs", icon: Activity },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/help", label: "Help & Support", icon: HelpCircle },
]

export default function BottomNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href
    }
    return pathname === href || pathname.startsWith(href + "/")
  }

  const isMoreActive = moreMenuItems.some((item) => isActive(item.href))

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border/50 backdrop-blur-md lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {mainMenuItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <Button
                variant="ghost"
                className={`w-full h-full flex flex-col items-center justify-center gap-1 ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "fill-primary" : ""}`} />
                <span className="text-xs">{item.label}</span>
              </Button>
            </Link>
          )
        })}

        {/* More Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className={`flex-1 h-full flex flex-col items-center justify-center gap-1 ${
                isMoreActive
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <MoreHorizontal className={`w-5 h-5 ${isMoreActive ? "fill-primary" : ""}`} />
              <span className="text-xs">More</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto max-h-[80vh]">
            <SheetHeader>
              <SheetTitle>More Options</SheetTitle>
            </SheetHeader>
            <div className="grid gap-2 py-4">
              {moreMenuItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                    <Button
                      variant={active ? "default" : "ghost"}
                      className={`w-full justify-start gap-3 ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
