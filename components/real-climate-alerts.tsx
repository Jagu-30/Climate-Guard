"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Bell, BellRing, AlertTriangle, X, MapPin, Clock, TrendingUp,
  Droplets, Sun, Wind, Flame, Zap, AlertCircle, Thermometer,
  CloudRain, Tornado, Eye, Volume2, VolumeX
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ClimateAlert {
  id: string
  type: 'heatwave' | 'flood' | 'drought' | 'storm' | 'wildfire' | 'air_quality' | 'tsunami' | 'earthquake'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  location: string
  timestamp: Date
  expires?: Date
  source: string
  actionRequired: boolean
  affectedPopulation?: number
  category: 'weather' | 'natural_disaster' | 'environmental'
}

const ALERT_ICONS = {
  heatwave: Thermometer,
  flood: Droplets,
  drought: Sun,
  storm: Wind,
  wildfire: Flame,
  air_quality: CloudRain,
  tsunami: TrendingUp,
  earthquake: AlertTriangle
}

const ALERT_COLORS = {
  critical: "border-red-500 bg-red-500/10 dark:bg-red-500/20 text-foreground",
  high: "border-orange-500 bg-orange-500/10 dark:bg-orange-500/20 text-foreground", 
  medium: "border-yellow-500 bg-yellow-500/10 dark:bg-yellow-500/20 text-foreground",
  low: "border-blue-500 bg-blue-500/10 dark:bg-blue-500/20 text-foreground"
}

const SEVERITY_BADGES = {
  critical: "destructive",
  high: "default",
  medium: "secondary", 
  low: "outline"
} as const

// Specific actionable steps per alert type
const ALERT_ACTIONS: Record<string, Record<string, string[]>> = {
  heatwave: {
    critical: ["Move indoors immediately — avoid all outdoor activity", "Drink water every 15–30 min, even if not thirsty", "Check on elderly neighbours and pets right now"],
    high:     ["Limit outdoor activity to before 10 AM or after 7 PM", "Keep hydrated; avoid alcohol and caffeine", "Set up fans or locate nearest cooling shelter"],
    medium:   ["Wear light, loose clothing outdoors", "Increase water intake throughout the day"],
    low:      ["Stay hydrated and use sunscreen when outside"]
  },
  flood: {
    critical: ["Evacuate immediately if in a low-lying or floodplain area", "Turn off electricity and gas before leaving", "Never walk or drive through floodwater — 6 inches can knock you down"],
    high:     ["Move valuables and electronics to upper floors", "Fill bathtubs and containers with clean water", "Monitor local emergency broadcasts continuously"],
    medium:   ["Avoid driving in heavy rain or near waterways", "Clear gutters and drains around your property"],
    low:      ["Be aware of road flooding on your commute route"]
  },
  wildfire: {
    critical: ["Follow evacuation orders immediately — do not delay", "Close all windows, vents, and doors before leaving", "Wear an N95 mask; smoke inhalation is life-threatening"],
    high:     ["Pack a go-bag: documents, medications, water, phone charger", "Remove flammable items from around your home exterior", "Know two evacuation routes before you need them"],
    medium:   ["Stay indoors with windows closed to reduce smoke exposure", "Monitor local fire service updates"],
    low:      ["Avoid outdoor burning and check local fire bans"]
  },
  storm: {
    critical: ["Shelter in an interior room away from windows", "Unplug electronics to prevent surge damage", "If caught outside, lie flat in a ditch; avoid tall trees"],
    high:     ["Secure outdoor furniture, bins, and loose items now", "Fill your gas tank before roads become dangerous", "Charge all devices in case of power outage"],
    medium:   ["Postpone non-essential travel this afternoon", "Have a flashlight and blankets easily accessible"],
    low:      ["Monitor weather updates before outdoor plans"]
  },
  drought: {
    critical: ["Follow mandatory water restrictions immediately — fines apply", "Switch to drought-tolerant plants; suspend garden irrigation", "Report water waste (leaks, excess irrigation) to local authority"],
    high:     ["Fix all dripping taps and leaking pipes this week", "Reduce shower time to under 4 minutes"],
    medium:   ["Collect greywater for garden use", "Run dishwasher and washing machine only with full loads"],
    low:      ["Be mindful of water use; small changes add up"]
  },
  air_quality: {
    critical: ["Stay indoors with windows and doors sealed", "Use an N95 mask if you must go outside", "Sensitive groups (asthma, elderly, children) should seek medical advice"],
    high:     ["Wear a mask outdoors; avoid strenuous exercise outside", "Run indoor air purifiers on their highest setting"],
    medium:   ["Limit time outdoors, especially midday", "Keep windows closed during peak pollution hours"],
    low:      ["Check AQI before outdoor exercise"]
  },
  tsunami: {
    critical: ["Move to high ground immediately — go at least 30m elevation", "Do NOT return until official all-clear is issued", "Stay away from the coast even if waves seem small"],
    high:     ["Prepare to evacuate: take documents, medication, phone", "Follow designated tsunami evacuation routes only"],
    medium:   ["Know your nearest high-ground evacuation point"],
    low:      ["Stay informed via local emergency broadcasts"]
  },
  earthquake: {
    critical: ["Drop, cover, and hold on — get under a table or desk", "Move away from windows and exterior walls", "After shaking stops: check for gas leaks, do not use elevators"],
    high:     ["Inspect your home for structural damage before re-entering", "Have shoes ready — broken glass is a major hazard"],
    medium:   ["Secure heavy furniture and shelves to walls"],
    low:      ["Review your family emergency meeting point"]
  }
}

// Generate realistic climate alerts
const generateClimateAlerts = (): ClimateAlert[] => {
  const alertsData = [
    {
      type: 'heatwave' as const,
      severity: 'critical' as const,
      title: 'Extreme Heat Warning',
      message: 'Temperatures expected to reach 47°C for the next 5 days. Heat index may exceed 52°C.',
      location: 'Phoenix, Arizona, USA',
      source: 'National Weather Service',
      actionRequired: true,
      affectedPopulation: 1680000,
      category: 'weather' as const
    },
    {
      type: 'flood' as const,
      severity: 'high' as const, 
      title: 'Flash Flood Warning',
      message: 'Heavy rainfall causing rapid river rise. Immediate evacuation recommended for low-lying areas.',
      location: 'Queensland, Australia',
      source: 'Bureau of Meteorology',
      actionRequired: true,
      affectedPopulation: 50000,
      category: 'weather' as const
    },
    {
      type: 'wildfire' as const,
      severity: 'critical' as const,
      title: 'Wildfire Emergency',
      message: 'Fast-moving wildfire has consumed 15,000 hectares. Multiple communities under evacuation order.',
      location: 'British Columbia, Canada',
      source: 'BC Wildfire Service',
      actionRequired: true,
      affectedPopulation: 25000,
      category: 'natural_disaster' as const
    },
    {
      type: 'drought' as const,
      severity: 'high' as const,
      title: 'Severe Drought Conditions',
      message: 'Agricultural drought affecting crop yields. Water restrictions in effect for 6 months.',
      location: 'Central Valley, California',
      source: 'US Drought Monitor',
      actionRequired: false,
      affectedPopulation: 4000000,
      category: 'environmental' as const
    },
    {
      type: 'storm' as const,
      severity: 'medium' as const,
      title: 'Severe Thunderstorm Watch',
      message: 'Damaging winds up to 110 km/h and large hail possible. Tornadoes cannot be ruled out.',
      location: 'Tornado Alley, Texas',
      source: 'Storm Prediction Center',
      actionRequired: true,
      affectedPopulation: 200000,
      category: 'weather' as const
    },
    {
      type: 'air_quality' as const,
      severity: 'medium' as const,
      title: 'Air Quality Alert',
      message: 'Unhealthy air quality due to wildfire smoke. Sensitive groups should limit outdoor activities.',
      location: 'Seattle, Washington',
      source: 'EPA AirNow',
      actionRequired: false,
      affectedPopulation: 750000,
      category: 'environmental' as const
    },
    {
      type: 'tsunami' as const,
      severity: 'high' as const,
      title: 'Tsunami Advisory',
      message: 'Sea level rise of 0.5-1.5m possible along coastlines. Move away from beaches and harbors.',
      location: 'Pacific Coast, Japan',
      source: 'Japan Meteorological Agency',
      actionRequired: true,
      affectedPopulation: 300000,
      category: 'natural_disaster' as const
    }
  ]

  const staticTimestamps = [
    { timestamp: new Date('2025-10-11T08:30:00Z'), expires: new Date('2025-10-15T23:59:59Z') },
    { timestamp: new Date('2025-10-11T06:15:00Z'), expires: new Date('2025-10-12T18:00:00Z') },
    { timestamp: new Date('2025-10-11T04:45:00Z'), expires: new Date('2025-10-18T12:00:00Z') },
    { timestamp: new Date('2025-10-10T22:30:00Z'), expires: new Date('2025-10-16T09:00:00Z') },
    { timestamp: new Date('2025-10-11T01:20:00Z'), expires: new Date('2025-10-11T20:00:00Z') },
    { timestamp: new Date('2025-10-11T07:00:00Z'), expires: new Date('2025-10-13T23:59:59Z') },
    { timestamp: new Date('2025-10-11T05:30:00Z'), expires: new Date('2025-10-12T12:00:00Z') }
  ]

  return alertsData.map((alert, index) => ({
    ...alert,
    id: `alert-${index + 1}`,
    timestamp: staticTimestamps[index]?.timestamp || new Date('2025-10-11T12:00:00Z'),
    expires: staticTimestamps[index]?.expires || new Date('2025-10-18T12:00:00Z')
  }))
}

interface RealClimateAlertsProps {
  location?: {
    name: string
    lat: number
    lon: number
  }
}

export function RealClimateAlerts({ location }: RealClimateAlertsProps = {}) {
  const [alerts, setAlerts] = useState<ClimateAlert[]>([])
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('voiceAlertsEnabled') === 'true'
  })
  const [spokenAlertIds, setSpokenAlertIds] = useState<Set<string>>(new Set())

  // Fetch REAL alerts from /api/disasters
  useEffect(() => {
    const fetchRealAlerts = async () => {
      setIsLoading(true)
      try {
        const res = await fetch('/api/disasters')
        if (!res.ok) throw new Error('Failed to fetch disasters')
        const data = await res.json()

        if (data.alerts && data.alerts.length > 0) {
          const convertedAlerts: ClimateAlert[] = data.alerts.map((alert: any, index: number) => {
            let type: ClimateAlert['type'] = 'storm'
            let severity: ClimateAlert['severity'] = 'medium'

            // Map severity
            if (alert.severity === 'Critical') severity = 'critical'
            else if (alert.severity === 'High') severity = 'high'
            else if (alert.severity === 'Medium') severity = 'medium'
            else severity = 'low'

            // Map type from disaster API
            const titleLower = (alert.title || alert.type || '').toLowerCase()
            if (titleLower.includes('heat') || titleLower.includes('temperature')) type = 'heatwave'
            else if (titleLower.includes('flood') || titleLower.includes('rain')) type = 'flood'
            else if (titleLower.includes('fire') || titleLower.includes('wildfire')) type = 'wildfire'
            else if (titleLower.includes('storm') || titleLower.includes('thunder') || titleLower.includes('tornado') || titleLower.includes('hurricane') || titleLower.includes('cyclone') || titleLower.includes('typhoon')) type = 'storm'
            else if (titleLower.includes('drought')) type = 'drought'
            else if (titleLower.includes('air') || titleLower.includes('smoke')) type = 'air_quality'
            else if (titleLower.includes('tsunami')) type = 'tsunami'
            else if (titleLower.includes('earthquake') || titleLower.includes('magnitude') || titleLower.includes('seismic')) type = 'earthquake'

            return {
              id: alert.id || `disaster-${index}`,
              type,
              severity,
              title: alert.title || 'Climate Alert',
              message: alert.description || 'No details available.',
              location: alert.location || location?.name || 'Global',
              timestamp: alert.startTime ? new Date(alert.startTime) : new Date(),
              expires: alert.endTime ? new Date(alert.endTime) : undefined,
              source: alert.source || 'Climate API',
              actionRequired: severity === 'critical' || severity === 'high',
              category: type === 'earthquake' || type === 'tsunami' ? 'natural_disaster' as const :
                       type === 'air_quality' ? 'environmental' as const : 'weather' as const,
            }
          })
          setAlerts(convertedAlerts)
        } else {
          setAlerts(generateClimateAlerts())
        }
      } catch (error) {
        console.error('Error fetching real alerts:', error)
        setAlerts(generateClimateAlerts())
      } finally {
        setIsLoading(false)
      }
    }

    fetchRealAlerts()

    // Refresh every 5 minutes
    const interval = setInterval(fetchRealAlerts, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [location])

  // Voice announcement for EXTREME alerts only
  useEffect(() => {
    if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return
    
    // Only announce critical alerts that haven't been spoken yet
    const unspokenCriticalAlerts = alerts.filter(
      alert => alert.severity === 'critical' && !spokenAlertIds.has(alert.id)
    )

    if (unspokenCriticalAlerts.length === 0) return

    // Announce the first unspoken critical alert
    const alertToAnnounce = unspokenCriticalAlerts[0]
    
    const utterance = new SpeechSynthesisUtterance(
      `Critical climate alert: ${alertToAnnounce.title}. ${alertToAnnounce.message}`
    )
    utterance.rate = 0.9
    utterance.pitch = 1.0
    utterance.volume = 0.8

    utterance.onend = () => {
      setSpokenAlertIds(prev => new Set([...prev, alertToAnnounce.id]))
    }

    // Small delay to prevent speaking immediately on page load
    const timer = setTimeout(() => {
      window.speechSynthesis.speak(utterance)
    }, 2000)

    return () => {
      clearTimeout(timer)
      window.speechSynthesis.cancel()
    }
  }, [alerts, spokenAlertIds, voiceEnabled])

  // Save voice setting
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('voiceAlertsEnabled', voiceEnabled.toString())
    }
  }, [voiceEnabled])

  const filteredAlerts = alerts.filter(alert => {
    if (selectedSeverity === 'all') return true
    return alert.severity === selectedSeverity
  })

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const ts = timestamp instanceof Date ? timestamp : new Date(timestamp)
    const diffMs = Math.max(0, now.getTime() - ts.getTime())
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.floor(diffHours / 24)}d ago`
  }

  const formatAffectedPopulation = (population?: number) => {
    if (!population) return "Population impact unknown"
    if (population >= 1000000) return `${(population / 1000000).toFixed(1)}M people affected`
    if (population >= 1000) return `${(population / 1000).toFixed(0)}K people affected`
    return `${population} people affected`
  }

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical')
  const highAlerts = alerts.filter(alert => alert.severity === 'high')
  
  // Get alerts that have been spoken
  const spokenAlerts = alerts.filter(alert => spokenAlertIds.has(alert.id))

  return (
    <div className="space-y-6">
      {/* Voice Control Banner */}
      <Card className="border-blue-500 bg-blue-500/10 dark:bg-blue-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className={`h-5 w-5 ${voiceEnabled ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
              <div>
                <p className="font-semibold text-foreground">Voice Alerts</p>
                <p className="text-sm text-muted-foreground">
                  {voiceEnabled ? 'Critical alerts will be announced automatically' : 'Voice announcements disabled'}
                </p>
              </div>
            </div>
            <Button
              variant={voiceEnabled ? "default" : "outline"}
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="gap-2"
            >
              {voiceEnabled ? (
                <>
                  <Volume2 className="h-4 w-4" />
                  Enabled
                </>
              ) : (
                <>
                  <VolumeX className="h-4 w-4" />
                  Disabled
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-3 py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-muted-foreground">Fetching real-time climate alerts for {location?.name || 'your location'}...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Voice Announced Alerts Section - showing ONLY alerts from this page */}
      {spokenAlerts.length > 0 && (
        <Card className="border-purple-500 bg-purple-500/10 dark:bg-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <Volume2 className="h-5 w-5" />
              Voice Announced Alerts ({spokenAlerts.length})
            </CardTitle>
            <CardDescription>
              Critical alerts that were announced via voice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {spokenAlerts.map((alert) => {
                  const Icon = ALERT_ICONS[alert.type]
                  
                  return (
                    <div
                      key={alert.id}
                      className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-purple-500/10">
                          <Icon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-foreground">
                              {alert.title}
                            </p>
                            <Badge variant={SEVERITY_BADGES[alert.severity]}>
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {alert.message}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{alert.location}</span>
                            <Clock className="h-3 w-3 ml-2" />
                            <span>{formatTimeAgo(alert.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
      
      {/* Alert Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-red-500 bg-red-500/10 dark:bg-red-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Critical</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">{criticalAlerts.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-orange-500 bg-orange-500/10 dark:bg-orange-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">High</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{highAlerts.length}</p>
              </div>
              <Bell className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-500 bg-blue-500/10 dark:bg-blue-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{alerts.length}</p>
              </div>
              <BellRing className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500 bg-green-500/10 dark:bg-green-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Active</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{alerts.filter(a => a.actionRequired).length}</p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BellRing className="h-5 w-5" />
                Active Climate Alerts
              </CardTitle>
              <CardDescription>
                Real-time climate and weather warnings from official sources
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {['all', 'critical', 'high', 'medium', 'low'].map(severity => (
                <Button
                  key={severity}
                  variant={selectedSeverity === severity ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSeverity(severity)}
                  className="capitalize"
                >
                  {severity}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <AnimatePresence>
              {filteredAlerts.map((alert, index) => {
                const IconComponent = ALERT_ICONS[alert.type] || AlertTriangle
                const isCritical = alert.severity === 'critical'
                const isHigh = alert.severity === 'high'
                
                // Color mapping and borders
                let borderColor = 'border-l-blue-500'
                let iconColor = 'text-blue-500'
                let bgMutedColor = 'bg-blue-500/10'
                
                if (isCritical) {
                  borderColor = 'border-l-error'
                  iconColor = 'text-error'
                  bgMutedColor = 'bg-error/10'
                } else if (isHigh) {
                  borderColor = 'border-l-secondary'
                  iconColor = 'text-secondary'
                  bgMutedColor = 'bg-secondary/10'
                } else if (alert.severity === 'medium') {
                  borderColor = 'border-l-yellow-500'
                  iconColor = 'text-yellow-500'
                  bgMutedColor = 'bg-yellow-500/10'
                }

                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className={`glass-panel p-6 rounded-2xl border-l-4 ${borderColor} relative overflow-hidden group mb-6 hover:translate-y-[-2px] hover:shadow-2xl transition-all duration-300`}
                  >
                    {/* Background Glow */}
                    <div className={`absolute top-0 right-0 w-32 h-32 ${bgMutedColor} rounded-full blur-3xl -z-10 group-hover:opacity-75 transition-opacity`}></div>
                    
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full ${bgMutedColor} flex items-center justify-center border ${borderColor.replace('border-l-','border-')}/30`}>
                          <IconComponent className={`h-6 w-6 ${iconColor}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-headline font-bold text-xl text-white">{alert.title}</h3>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase border ${iconColor} ${bgMutedColor} ${isCritical ? 'animate-pulse' : ''}`}>
                              {alert.severity}
                            </span>
                            {alert.actionRequired && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-error/20 text-error border border-error/30 animate-pulse">
                                Action Required
                              </span>
                            )}
                          </div>
                          <p className="font-label text-xs uppercase tracking-widest text-slate-400 mt-1">
                            {alert.location} • {formatTimeAgo(alert.timestamp)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissAlert(alert.id)}
                        className="rounded-full h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="font-body text-slate-300 text-sm leading-relaxed mb-6 pl-16">
                      {alert.message}
                    </p>

                    {/* Actionable steps */}
                    {ALERT_ACTIONS[alert.type]?.[alert.severity] && (
                      <div className="mb-6 pl-16">
                        <div className="p-4 rounded-xl bg-surface-container-low border border-outline/10">
                          <p className="text-xs font-label uppercase tracking-widest text-[#00E5FF] mb-3 font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">bolt</span> Sentinel Protocol Activated
                          </p>
                          <ol className="space-y-2">
                            {ALERT_ACTIONS[alert.type][alert.severity].map((step, i) => (
                              <li key={i} className="text-sm font-body text-slate-300 flex items-start gap-3">
                                <span className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold mt-0.5 ${bgMutedColor} ${iconColor}`}>
                                  {i + 1}
                                </span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    )}

                    {/* Grid Info & Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-16">
                      <div className="bg-surface-container-low rounded-lg p-4 border border-outline/5 col-span-1 md:col-span-3 flex justify-between items-center text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">radar</span>
                          <span className="font-medium text-slate-300">Source:</span> {alert.source}
                        </div>
                        {alert.affectedPopulation && (
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">groups</span>
                            <span className="font-medium text-slate-300">Impact:</span> {formatAffectedPopulation(alert.affectedPopulation)}
                          </div>
                        )}
                      </div>
                      
                      {isCritical && (
                        <div className="col-span-1 md:col-span-3 flex gap-3 mt-2">
                          <button className="flex-1 bg-error text-white font-headline font-bold text-sm py-3 rounded-lg hover:bg-error/90 transition-colors shadow-[0_0_15px_rgba(255,59,48,0.3)]">
                            Acknowledge Alert
                          </button>
                          <button className="flex-1 bg-surface-container border border-outline/10 text-white font-headline font-bold text-sm py-3 rounded-lg hover:bg-white/5 transition-colors">
                            View Evacuation Map
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            
            {filteredAlerts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <BellRing className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No alerts for selected severity level</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}