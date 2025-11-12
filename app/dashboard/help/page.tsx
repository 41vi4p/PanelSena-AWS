"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown, Search, Mail, MessageSquare, BookOpen, Info } from "lucide-react"
import { useRouter } from "next/navigation"

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

const faqs: FAQItem[] = [
  {
    id: "1",
    category: "Getting Started",
    question: "How do I add a new display?",
    answer:
      "To add a new display, navigate to the Displays section and click 'Add Display'. Enter the display details including name, location, and type. The system will generate a unique ID that you can use to configure your Raspberry Pi.",
  },
  {
    id: "2",
    category: "Getting Started",
    question: "What are the system requirements?",
    answer:
      "PanelSena requires a Raspberry Pi 3 or higher with at least 1GB RAM. You'll also need a stable internet connection and a compatible display (HDMI or similar). The system supports most modern digital displays and signage.",
  },
  {
    id: "3",
    category: "Content Management",
    question: "What file formats are supported?",
    answer:
      "We support images (JPG, PNG, GIF), videos (MP4, WebM), and documents (PDF). Maximum file size is 500MB per file. For best performance, we recommend optimizing images to 1920x1080 resolution.",
  },
  {
    id: "4",
    category: "Content Management",
    question: "How do I schedule content?",
    answer:
      "Go to the Schedule section and click 'Create Schedule'. Select your content, choose the displays, set the time window, and configure recurrence if needed. Schedules can be one-time or recurring (daily, weekly, monthly).",
  },
  {
    id: "5",
    category: "Troubleshooting",
    question: "Why is my display showing offline?",
    answer:
      "Check that your Raspberry Pi has a stable internet connection. Verify the device is powered on and the PanelSena service is running. You can restart the service from the display controls panel.",
  },
  {
    id: "6",
    category: "Troubleshooting",
    question: "How do I reset a display?",
    answer:
      "Navigate to the Displays section, find your display, and click the settings icon. Select 'Reset Display' to restore factory settings. This will clear all local data but won't affect your cloud content.",
  },
  {
    id: "7",
    category: "Analytics",
    question: "What metrics are tracked?",
    answer:
      "We track display uptime, content views, engagement metrics, and performance data. Analytics are updated in real-time and can be filtered by date range and display group.",
  },
  {
    id: "8",
    category: "Account",
    question: "How do I manage team members?",
    answer:
      "Go to Settings > Team Management to invite team members. You can assign different roles (Admin, Editor, Viewer) with specific permissions for each role.",
  },
]

const categories = ["All", ...new Set(faqs.map((faq) => faq.category))]

export default function HelpPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Help & Support</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Find answers and get support for PanelSena</p>
      </div>

      {/* Support Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card 
          className="border-border/50 hover:border-border transition-colors cursor-pointer"
          onClick={() => router.push('/dashboard/about')}
        >
          <CardContent className="pt-6 text-center space-y-3">
            <div className="flex justify-center">
              <Info className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">About</h3>
            <p className="text-sm text-muted-foreground">Learn more about PanelSena</p>
            <Button variant="outline" className="w-full border-border bg-transparent">
              View About
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:border-border transition-colors cursor-pointer">
          <CardContent className="pt-6 text-center space-y-3">
            <div className="flex justify-center">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Documentation</h3>
            <p className="text-sm text-muted-foreground">Read our comprehensive guides and tutorials</p>
            <Button variant="outline" className="w-full border-border bg-transparent">
              View Docs
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:border-border transition-colors cursor-pointer">
          <CardContent className="pt-6 text-center space-y-3">
            <div className="flex justify-center">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Email Support</h3>
            <p className="text-sm text-muted-foreground">Contact our support team directly</p>
            <Button variant="outline" className="w-full border-border bg-transparent">
              support@smartdisplay.com
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:border-border transition-colors cursor-pointer">
          <CardContent className="pt-6 text-center space-y-3">
            <div className="flex justify-center">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Live Chat</h3>
            <p className="text-sm text-muted-foreground">Chat with our support team in real-time</p>
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Start Chat</Button>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Search and browse common questions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input border-border"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "border-border bg-transparent text-foreground hover:bg-accent"
                }
              >
                {category}
              </Button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="space-y-2 mt-6">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => (
                <div key={faq.id} className="border border-border/50 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors text-left"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{faq.question}</p>
                      <p className="text-xs text-muted-foreground mt-1">{faq.category}</p>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground transition-transform ${
                        expandedId === faq.id ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedId === faq.id && (
                    <div className="px-4 py-3 bg-accent/30 border-t border-border/50">
                      <p className="text-sm text-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No FAQs found matching your search.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Resources */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Additional Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 hover:bg-accent/50 rounded-lg transition-colors cursor-pointer">
            <div>
              <p className="font-medium text-foreground">API Documentation</p>
              <p className="text-sm text-muted-foreground">Integrate PanelSena with your systems</p>
            </div>
            <Button variant="ghost" size="sm" className="text-primary">
              View
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 hover:bg-accent/50 rounded-lg transition-colors cursor-pointer">
            <div>
              <p className="font-medium text-foreground">Video Tutorials</p>
              <p className="text-sm text-muted-foreground">Learn through step-by-step video guides</p>
            </div>
            <Button variant="ghost" size="sm" className="text-primary">
              Watch
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 hover:bg-accent/50 rounded-lg transition-colors cursor-pointer">
            <div>
              <p className="font-medium text-foreground">Community Forum</p>
              <p className="text-sm text-muted-foreground">Connect with other PanelSena users</p>
            </div>
            <Button variant="ghost" size="sm" className="text-primary">
              Join
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
