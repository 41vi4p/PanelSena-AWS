"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProtectedRoute } from "@/components/protected-route"
import { useRouter } from "next/navigation"
import { 
  Monitor, 
  Calendar, 
  Upload, 
  BarChart3, 
  Smartphone, 
  Globe, 
  Zap, 
  Shield,
  HelpCircle,
  ExternalLink,
  Github,
  Rocket,
  Users,
  Linkedin,
  Briefcase
} from "lucide-react"

export default function AboutPage() {
  const router = useRouter()

  const teamMembers = [
    {
      name: "David Porathur",
      initials: "DP",
      role: "Developer",
      portfolio: "#",
      github: "https://github.com/davidporathur",
      linkedin: "https://linkedin.com/in/davidporathur"
    },
    {
      name: "Soham Marathe",
      initials: "SM",
      role: "Developer",
      portfolio: "#",
      github: "https://github.com/sohammarathe",
      linkedin: "https://linkedin.com/in/sohammarathe"
    },
    {
      name: "Arpith Poojary",
      initials: "AP",
      role: "Developer",
      portfolio: "#",
      github: "https://github.com/arpithpoojary",
      linkedin: "https://linkedin.com/in/arpithpoojary"
    },
    {
      name: "Anuj Naik",
      initials: "AN",
      role: "Developer",
      portfolio: "#",
      github: "https://github.com/anujnaik",
      linkedin: "https://linkedin.com/in/anujnaik"
    }
  ]

  const features = [
    {
      icon: Monitor,
      title: "Display Management",
      description: "Manage multiple digital displays from a single dashboard. Monitor status, control content, and configure settings remotely."
    },
    {
      icon: Upload,
      title: "Content Library",
      description: "Upload and organize images, videos, and documents. Manage your media assets in one centralized location."
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Schedule content to display at specific times and dates. Set up recurring schedules for automated content rotation."
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Track display performance, uptime, and engagement metrics. Make data-driven decisions for your signage."
    },
    {
      icon: Zap,
      title: "Real-time Control",
      description: "Send instant commands to your displays. Play, pause, or switch content remotely in real-time."
    },
    {
      icon: Smartphone,
      title: "Raspberry Pi Integration",
      description: "Turn any Raspberry Pi into a digital signage display. Affordable, reliable, and easy to deploy."
    },
    {
      icon: Shield,
      title: "Secure Authentication",
      description: "Device-based authentication system ensures only authorized displays can connect to your account."
    },
    {
      icon: Globe,
      title: "Cloud-Based",
      description: "Access your digital signage system from anywhere. No on-premise servers required."
    }
  ]

  const techStack = [
    { name: "Next.js 14", category: "Frontend" },
    { name: "React", category: "Frontend" },
    { name: "TypeScript", category: "Frontend" },
    { name: "Tailwind CSS", category: "Styling" },
    { name: "Firebase", category: "Backend" },
    { name: "Firestore", category: "Database" },
    { name: "Firebase Realtime DB", category: "Real-time" },
    { name: "Firebase Storage", category: "Storage" },
    { name: "Python", category: "Player" },
    { name: "VLC", category: "Media" },
    { name: "Raspberry Pi", category: "Hardware" }
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-xl">
                <Monitor className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground">PanelSena</h1>
                <p className="text-muted-foreground">Your Army of Displays</p>
              </div>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl">
              A powerful, cloud-based digital signage platform that enables you to manage and control
              multiple displays using Raspberry Pi devices. Perfect for businesses, schools, retail stores,
              and any organization needing dynamic content display.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Version</CardDescription>
                <CardTitle className="text-2xl">1.7.2</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Platform</CardDescription>
                <CardTitle className="text-2xl">Cloud</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>License</CardDescription>
                <CardTitle className="text-2xl">MIT</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Status</CardDescription>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  Active
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Key Features</h2>
              <Badge variant="outline" className="gap-1">
                <Rocket className="w-3 h-3" />
                8 Core Features
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feature, index) => (
                <Card key={index} className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="p-2 bg-muted rounded-lg w-fit mb-2">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                    <CardDescription className="text-sm">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* Technology Stack */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Technology Stack
              </CardTitle>
              <CardDescription>Built with modern, reliable technologies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {techStack.map((tech, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {tech.name}
                    <span className="text-xs text-muted-foreground">• {tech.category}</span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>Simple setup, powerful results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center font-semibold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Setup Raspberry Pi</h4>
                    <p className="text-sm text-muted-foreground">
                      Run the setup wizard on your Raspberry Pi to generate device credentials and configure the player.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center font-semibold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Link Device</h4>
                    <p className="text-sm text-muted-foreground">
                      Add a display in your dashboard and enter the device ID and key to link it to your account.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center font-semibold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Upload Content</h4>
                    <p className="text-sm text-muted-foreground">
                      Upload your images, videos, and documents to the content library. Organize them into categories.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center font-semibold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Create Schedules</h4>
                    <p className="text-sm text-muted-foreground">
                      Schedule content to display at specific times, dates, or set up recurring schedules for automation.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center font-semibold">
                    5
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Monitor & Control</h4>
                    <p className="text-sm text-muted-foreground">
                      Track display status in real-time, send instant commands, and view analytics from your dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Use Cases */}
          <Card>
            <CardHeader>
              <CardTitle>Perfect For</CardTitle>
              <CardDescription>Versatile solution for various industries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">🏢 Businesses</h4>
                  <p className="text-sm text-muted-foreground">
                    Display announcements, KPIs, and company news in office lobbies and meeting rooms.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">🛍️ Retail</h4>
                  <p className="text-sm text-muted-foreground">
                    Showcase products, promotions, and pricing in stores and shopping centers.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">🎓 Education</h4>
                  <p className="text-sm text-muted-foreground">
                    Share schedules, events, and educational content in schools and universities.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">🏥 Healthcare</h4>
                  <p className="text-sm text-muted-foreground">
                    Display wait times, directions, and health information in hospitals and clinics.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">🍽️ Restaurants</h4>
                  <p className="text-sm text-muted-foreground">
                    Show menus, daily specials, and promotional offers to customers.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">🏨 Hospitality</h4>
                  <p className="text-sm text-muted-foreground">
                    Welcome guests with information about facilities, events, and local attractions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Development Team */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Development Team
              </CardTitle>
              <CardDescription>Meet the team behind PanelSena</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {teamMembers.map((member, index) => (
                  <div 
                    key={index}
                    className="text-center space-y-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className={`w-16 h-16 ${index % 2 === 0 ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'} rounded-full flex items-center justify-center mx-auto text-2xl font-bold`}>
                      {member.initials}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{member.name}</h4>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => window.open(member.portfolio, '_blank')}
                        title="Portfolio"
                      >
                        <Briefcase className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => window.open(member.github, '_blank')}
                        title="GitHub"
                      >
                        <Github className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => window.open(member.linkedin, '_blank')}
                        title="LinkedIn"
                      >
                        <Linkedin className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              className="flex-1"
              onClick={() => router.push('/dashboard/help')}
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Help & Support
            </Button>
            <Button 
              variant="outline"
              className="flex-1 border-2 hover:border-cyan-500 hover:bg-transparent hover:text-foreground transition-all duration-200 hover:shadow-md hover:shadow-cyan-500/50"
              onClick={() => router.push('/dashboard')}
            >
              <Monitor className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground pt-8 border-t">
            <p>© 2025 PanelSena. Built with ❤️ for digital signage management.</p>
            <p className="mt-2">Open source project licensed under MIT.</p>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
