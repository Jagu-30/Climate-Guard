"use client"

import { Suspense, lazy, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { LocationSelector, type Location, POPULAR_LOCATIONS } from "@/components/location-selector"
import { SmartSummaryBar } from "@/components/smart-summary-bar"
import { FloatingAIButton } from "@/components/floating-ai-button"
import Link from "next/link"

// Lazy load components
const GlobalHeatmap = lazy(() => import("@/components/enhanced-global-heatmap").then(module => ({ default: module.GlobalHeatmap })))
const RiskCards = lazy(() => import("@/components/risk-cards").then(module => ({ default: module.RiskCards })))
const ActionList = lazy(() => import("@/components/action-list").then(module => ({ default: module.ActionList })))
const VoiceQA = lazy(() => import('@/components/voice-qa').then(module => ({ default: module.VoiceQA })))
import { RealClimateAlerts } from '@/components/real-climate-alerts'
const LocationIntelligencePanel = lazy(() => import('@/components/location-intelligence-panel').then(module => ({ default: module.LocationIntelligencePanel })))
const EconomicIntelligenceDashboard = lazy(() => import('@/components/economic-intelligence-dashboard').then(module => ({ default: module.EconomicIntelligenceDashboard })))
const ActionRecommendationsDashboard = lazy(() => import('@/components/action-recommendations-dashboard').then(module => ({ default: module.ActionRecommendationsDashboard })))
const RiskForecast = lazy(() => import('@/components/risk-forecast').then(module => ({ default: module.RiskForecast })))
const AdaptationDashboard = lazy(() => import('@/components/adaptation-dashboard').then(module => ({ default: module.AdaptationDashboard })))
const DisasterPredictor = lazy(() => import('@/components/disaster-predictor').then(module => ({ default: module.DisasterPredictor })))

const MapSkeleton = () => <div className="w-full h-[600px] bg-surface-container-low rounded-xl border border-outline/5 animate-pulse" />
const CardSkeleton = () => <div className="space-y-3"><Skeleton className="h-32 w-full bg-surface-container-low" /><Skeleton className="h-32 w-full bg-surface-container-low" /></div>
const ChartSkeleton = () => <div className="space-y-3"><Skeleton className="h-96 w-full bg-surface-container-low" /></div>

export default function Dashboard() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') || 'overview'
  const [activeTab, setActiveTab] = useState(initialTab)
  const [selectedLocation, setSelectedLocation] = useState<Location>(
    POPULAR_LOCATIONS.find(loc => loc.id === "new-york") || POPULAR_LOCATIONS[0]
  )

  // Sync tab with URL query param
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) setActiveTab(tab)
  }, [searchParams])

  const navItemClass = "flex justify-start items-center gap-3 px-4 py-3 w-full border-l-4 border-transparent text-slate-500 hover:text-slate-200 hover:bg-[#0f141a] font-label text-sm uppercase tracking-widest transition-all duration-200 data-[state=active]:bg-[#1b2028] data-[state=active]:text-[#00E5FF] data-[state=active]:border-[#00E5FF] data-[state=active]:shadow-[inset_0_0_15px_rgba(0,229,255,0.1)] data-[state=active]:hover:translate-x-1 cursor-pointer"

  return (
    <div className="min-h-screen bg-background text-on-background font-body selection:bg-primary/30">
      
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0e14]/80 backdrop-blur-xl shadow-[0_0_20px_rgba(0,229,255,0.05)] flex justify-between items-center px-8 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-black text-[#00E5FF] tracking-tighter font-headline">
            ClimateGuard
          </Link>
          <div className="hidden md:flex gap-6">
            <span className="font-headline font-bold tracking-tight text-[#00E5FF] border-b-2 border-[#00E5FF] pb-1 cursor-default">Dashboard</span>
            <button onClick={() => setActiveTab('alerts')} className="font-headline font-bold tracking-tight text-slate-400 hover:text-white transition-colors">Alerts</button>
            <button onClick={() => setActiveTab('predictor')} className="font-headline font-bold tracking-tight text-slate-400 hover:text-white transition-colors">Insights</button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <LocationSelector 
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
          />
          <span className="material-symbols-outlined text-slate-400 cursor-pointer hover:bg-white/5 p-2 rounded-full transition-all">dark_mode</span>
        </div>
      </nav>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* SideNavBar */}
        <aside className="h-screen w-64 fixed left-0 top-0 z-40 bg-[#0a0e14] border-r border-[#72757d]/10 flex flex-col py-20 px-0 space-y-2">
          <div className="mb-8 px-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center border border-primary/20">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
            </div>
            <div>
              <div className="font-label text-sm uppercase tracking-widest text-on-background">Sentinel-1</div>
              <div className="text-[10px] text-primary/70 font-label tracking-tighter">AI Active</div>
            </div>
          </div>
          
          <nav className="flex-1 flex flex-col gap-1 w-full relative">
            <TabsList className="flex flex-col h-auto bg-transparent items-stretch p-0 space-y-1 w-full relative after:hidden">
              <TabsTrigger value="overview" className={navItemClass}>
                <span className="material-symbols-outlined">dashboard</span> Overview
              </TabsTrigger>
              <TabsTrigger value="alerts" className={navItemClass}>
                <span className="material-symbols-outlined">warning</span> Alerts
              </TabsTrigger>
              <TabsTrigger value="predictor" className={navItemClass}>
                <span className="material-symbols-outlined">wb_sunny</span> Forecast
              </TabsTrigger>
              <TabsTrigger value="actions" className={navItemClass}>
                <span className="material-symbols-outlined">auto_awesome</span> Actions
              </TabsTrigger>
              <TabsTrigger value="adaptation" className={navItemClass}>
                <span className="material-symbols-outlined">shield</span> Plan
              </TabsTrigger>
              <TabsTrigger value="economic" className={navItemClass}>
                <span className="material-symbols-outlined">monitoring</span> Economics
              </TabsTrigger>
              <TabsTrigger value="location" className={navItemClass}>
                <span className="material-symbols-outlined">location_city</span> Location
              </TabsTrigger>
            </TabsList>
          </nav>

          <div className="mt-auto border-t border-outline/10 pt-4 w-full">
            <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-200 font-label text-sm uppercase tracking-widest transition-all w-full" href="#">
              <span className="material-symbols-outlined">help</span> Support
            </a>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 pt-24 min-h-screen p-8">
          <div className="mb-6">
            <SmartSummaryBar location={selectedLocation} />
          </div>

          <TabsContent value="overview" className="space-y-6 mt-0">
            {/* Split layout exactly like Stitch redesign */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Center Column: Risk Map & Forecast */}
              <div className="md:col-span-12 lg:col-span-8 space-y-6">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <h1 className="text-3xl font-headline font-extrabold tracking-tighter">Atmospheric Analysis</h1>
                    <p className="text-on-surface-variant font-body text-sm">Real-time telemetry and predictive risk mapping for {selectedLocation.name}.</p>
                  </div>
                </div>

                {/* Map */}
                <div className="relative h-[500px] w-full bg-surface-container-low rounded-xl border border-outline/5 overflow-hidden shadow-2xl">
                  <Suspense fallback={<MapSkeleton />}>
                    <GlobalHeatmap focusLocation={{ lat: selectedLocation.lat, lon: selectedLocation.lon, name: selectedLocation.name }} />
                  </Suspense>
                </div>

                {/* 10-Day Forecast Bento */}
                <Suspense fallback={<ChartSkeleton />}>
                   <RiskForecast location={selectedLocation} />
                </Suspense>

              </div>

              {/* Right Column: Risk Cards & Location Intelligence */}
              <div className="md:col-span-12 lg:col-span-4 space-y-6">
                <Suspense fallback={<CardSkeleton />}>
                  <RiskCards location={selectedLocation} />
                </Suspense>

                {/* Mini Summary Card from design */}
                <div className="relative overflow-hidden group rounded-xl">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0MX-HQUxgcLsB_GAJOE3oZNZ1p4Bvfgj-ukmPElSUXovV1SW2C8aPIxNnkLa6dbE7DUV4ZTsdG1G-PJEOspT9uo4IMmURiRYLThiNXlA2TSO5Nu4H2PIctxhP63G8QCaOtadoORXoFpcjvCaN5EzisoDR8SXaPuSFN3CrKw2Yu3VN8inPLgFCi23zBJ0qpOYCc1utI1U6D-RUDt7tWdWFUpXWnSd3yTRqKwwgYbITQD-d5TWjfqPQ5P5X1sdiPt2a7yA6hX-Kj7k" 
                       alt="Atmosphere" className="w-full h-32 object-cover grayscale brightness-50" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <div className="text-[10px] font-label uppercase tracking-widest text-primary font-bold">Satellite Status</div>
                    <div className="text-sm font-headline font-bold">EOS-4 SYNCHRONIZED</div>
                  </div>
                </div>
              </div>
              
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="mt-0">
            <RealClimateAlerts location={{ name: selectedLocation.name, lat: selectedLocation.lat, lon: selectedLocation.lon }} />
          </TabsContent>

          <TabsContent value="predictor" className="mt-0">
            <div className="glass-panel p-6 rounded-2xl">
              <Suspense fallback={<ChartSkeleton />}><DisasterPredictor location={{ name: selectedLocation.name, lat: selectedLocation.lat, lon: selectedLocation.lon }} /></Suspense>
            </div>
          </TabsContent>

          <TabsContent value="actions" className="mt-0">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="glass-panel p-6 rounded-2xl"><Suspense fallback={<ChartSkeleton />}><ActionList /></Suspense></div>
              <div className="glass-panel p-6 rounded-2xl"><Suspense fallback={<ChartSkeleton />}><ActionRecommendationsDashboard /></Suspense></div>
            </div>
          </TabsContent>

          <TabsContent value="adaptation" className="mt-0">
            <div className="glass-panel p-6 rounded-2xl">
              <Suspense fallback={<ChartSkeleton />}><AdaptationDashboard location={selectedLocation} /></Suspense>
            </div>
          </TabsContent>
          
          <TabsContent value="economic" className="mt-0">
            <div className="glass-panel p-6 rounded-2xl">
              <Suspense fallback={<ChartSkeleton />}><EconomicIntelligenceDashboard /></Suspense>
            </div>
          </TabsContent>

          <TabsContent value="location" className="mt-0">
            <div className="glass-panel p-6 rounded-2xl">
              <Suspense fallback={<ChartSkeleton />}><LocationIntelligencePanel /></Suspense>
            </div>
          </TabsContent>

        </main>
      </Tabs>

      <FloatingAIButton location={selectedLocation} />
    </div>
  )
}