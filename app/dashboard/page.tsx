"use client"

import { MetricsCards } from "@/components/metrics-cards"
import { DisplayGrid } from "@/components/display-grid"
import { ActivityFeed } from "@/components/activity-feed"
import { ProtectedRoute } from "@/components/protected-route"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">
          <MetricsCards />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2">
              <DisplayGrid />
            </div>
            <div>
              <ActivityFeed />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
