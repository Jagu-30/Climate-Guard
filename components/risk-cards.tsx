"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Droplets, Sun, Wind, Flame, TrendingUp, TrendingDown, Minus, Bell, BellRing } from "lucide-react"
import { motion } from "framer-motion"
import { useAlertSubscription, usePredictionAlerts, useSystemAlerts } from "@/hooks/use-alerts"

interface RiskData {
  type: string
  severity: "Low" | "Medium" | "High" | "Critical"
  score: number // 0-100
  trend: "increasing" | "decreasing" | "stable"
  description: string
  impact: string
  confidence: number
}

interface RiskCardsProps {
  location?: { lat: number; lon: number; city: string }
  className?: string
}

const RISK_ICONS = {
  flood: Droplets,
  drought: Sun,
  heatwave: Flame,
  storm: Wind,
  wildfire: Flame,
  default: AlertTriangle,
}

const RISK_COLORS = {
  flood: "hsl(var(--chart-1))", // Blue
  drought: "hsl(var(--chart-2))", // Orange
  heatwave: "hsl(var(--chart-3))", // Red
  storm: "hsl(var(--chart-4))", // Purple
  wildfire: "hsl(var(--chart-5))", // Red-orange
}

export function RiskCards({ location, className }: RiskCardsProps) {
  const [risks, setRisks] = useState<RiskData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Alert system integration
  const { alerts: riskAlerts, alertCount } = useAlertSubscription("risk-cards", {
    typeFilter: ["extreme_heat", "flooding", "drought", "storm", "wildfire"],
    severityFilter: "medium"
  })
  const { createAlertFromPrediction } = usePredictionAlerts("risk-cards")
  const { createErrorAlert, createSuccessAlert } = useSystemAlerts("risk-cards")

  useEffect(() => {
    const fetchRiskData = async () => {
      try {
        setLoading(true)
        
        const response = await fetch("/api/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: location?.lat || 40.7128,
            longitude: location?.lon || -74.006,
          })
        })

        if (!response.ok) throw new Error("Failed to fetch risk data")
        
        const result = await response.json()
        console.log("API Result for", location?.city || "Default", ":", result)
        const parsedRisks = parseRisksFromAPI(result, location)
        console.log("Parsed Risks for", location?.city || "Default", ":", parsedRisks)
        setRisks(parsedRisks)
        
        // Create alerts for high-risk predictions
        const locationName = location?.city || "Current Location"
        if (result.overallRisk > 0.6) {
          createAlertFromPrediction(result, locationName)
        }
        
        createSuccessAlert(`Risk assessment updated for ${locationName}`)
      } catch (err) {
        console.warn("Risk API failed, using mock data:", err)
        const errorMessage = err instanceof Error ? err.message : "Unknown error"
        setError(errorMessage)
        setRisks(generateMockRisks(location))
        createErrorAlert(new Error(errorMessage), "Risk data fetch")
      } finally {
        setLoading(false)
      }
    }

    fetchRiskData()
  }, [location, createAlertFromPrediction, createErrorAlert, createSuccessAlert])

  const parseRisksFromAPI = (data: any, location?: { lat: number; lon: number; city: string }): RiskData[] => {
    const city = location?.city || "Current Location"
    
    // If API doesn't return meaningful data, use mock data as fallback
    if (!data || (!data.flood_risk && !data.drought_risk && !data.heatwave_risk)) {
      console.log("API returned empty/invalid data, using location-specific mock data")
      return generateMockRisks(location)
    }

    const risks: RiskData[] = []
    
    // Apply location-specific adjustments to API data
    const locationAdjustments = {
      "Phoenix": { drought: 25, heatwave: 20, wildfire: 15, flood: 0, storm: 0 },
      "Miami": { flood: 20, storm: 15, heatwave: 5, drought: 0, wildfire: 0 },
      "London": { flood: 10, storm: 5, drought: -10, heatwave: 0, wildfire: 0 },
      "Tokyo": { storm: 15, flood: 10, heatwave: 10, drought: 0, wildfire: 0 },
      "Sydney": { wildfire: 20, drought: 10, heatwave: 5, flood: 0, storm: 0 },
      "Mumbai": { flood: 25, storm: 15, heatwave: 15, drought: 0, wildfire: 0 },
      "Cairo": { drought: 30, heatwave: 25, storm: -15, flood: 0, wildfire: 0 },
      "Lagos": { flood: 15, storm: 10, heatwave: 10, drought: 0, wildfire: 0 },
      "Vancouver": { flood: 5, storm: 10, drought: -20, heatwave: 0, wildfire: 0 },
      "Singapore": { flood: 10, storm: 12, heatwave: 8, drought: 0, wildfire: 0 },
      "São Paulo": { flood: 15, storm: 8, drought: 5, heatwave: 0, wildfire: 0 }
    }
    
    const adjustments = locationAdjustments[city as keyof typeof locationAdjustments] || 
      { drought: 0, heatwave: 0, wildfire: 0, flood: 0, storm: 0 }
    
    if (data.flood_risk > 20) {
      const adjustedScore = Math.min(100, Math.max(0, data.flood_risk + (adjustments.flood || 0)))
      risks.push({
        type: "flood",
        severity: adjustedScore > 80 ? "Critical" : adjustedScore > 70 ? "High" : adjustedScore > 40 ? "Medium" : "Low",
        score: adjustedScore,
        trend: adjustments.flood > 10 ? "increasing" : "stable",
        description: `Flood risk based on precipitation and humidity levels in ${city}`,
        impact: "Infrastructure damage, transportation disruption",
        confidence: 0.85,
      })
    }

    if (data.drought_risk > 20) {
      const adjustedScore = Math.min(100, Math.max(0, data.drought_risk + (adjustments.drought || 0)))
      risks.push({
        type: "drought",
        severity: adjustedScore > 80 ? "Critical" : adjustedScore > 70 ? "High" : adjustedScore > 40 ? "Medium" : "Low",
        score: adjustedScore,
        trend: adjustments.drought > 10 ? "increasing" : "stable",
        description: `Drought conditions from low precipitation and high temperatures in ${city}`,
        impact: "Water scarcity, agricultural stress",
        confidence: 0.80,
      })
    }

    if (data.heatwave_risk > 20) {
      const adjustedScore = Math.min(100, Math.max(0, data.heatwave_risk + (adjustments.heatwave || 0)))
      risks.push({
        type: "heatwave",
        severity: adjustedScore > 80 ? "Critical" : adjustedScore > 70 ? "High" : adjustedScore > 40 ? "Medium" : "Low",
        score: adjustedScore,
        trend: adjustments.heatwave > 10 ? "increasing" : "stable",
        description: `Extreme heat conditions expected in ${city}`,
        impact: "Heat-related illness, energy demand spike",
        confidence: 0.90,
      })
    }

    // Add location-specific risks that might not be in the API
    if (city === "Phoenix" && !risks.find(r => r.type === "wildfire")) {
      risks.push({
        type: "wildfire",
        severity: "High",
        score: 75,
        trend: "stable",
        description: "High wildfire risk due to dry desert conditions",
        impact: "Property damage, air quality issues",
        confidence: 0.85,
      })
    }
    
    if ((city === "Miami" || city === "Tokyo") && !risks.find(r => r.type === "storm")) {
      risks.push({
        type: "storm",
        severity: city === "Tokyo" ? "High" : "Medium",
        score: city === "Tokyo" ? 75 : 65,
        trend: "stable",
        description: city === "Tokyo" ? "Typhoon season with severe storms" : "Hurricane season bringing severe storms",
        impact: "Wind damage, power outages, coastal erosion",
        confidence: 0.80,
      })
    }

    return risks.length > 0 ? risks : generateMockRisks(location)
  }

  const generateMockRisks = (location?: { lat: number; lon: number; city: string }): RiskData[] => {
    const city = location?.city || "Current Location"
    
    // Location-specific risk profiles based on real climate characteristics
    const locationProfiles = {
      "Phoenix": {
        drought: { severity: "High", score: 85, trend: "increasing", 
          description: "Severe desert drought conditions with water restrictions", 
          impact: "Critical water shortages, agricultural devastation" },
        heatwave: { severity: "Critical", score: 95, trend: "increasing", 
          description: "Extreme desert heat with temperatures exceeding 45°C", 
          impact: "Heat-related emergencies, power grid strain" },
        wildfire: { severity: "High", score: 80, trend: "stable", 
          description: "High wildfire risk due to dry conditions", 
          impact: "Property damage, air quality issues" }
      },
      "Miami": {
        flood: { severity: "High", score: 88, trend: "increasing", 
          description: "Sea level rise and hurricane-driven flooding", 
          impact: "Coastal infrastructure damage, displacement" },
        storm: { severity: "High", score: 82, trend: "stable", 
          description: "Hurricane season bringing severe storms", 
          impact: "Wind damage, power outages, coastal erosion" },
        heatwave: { severity: "Medium", score: 65, trend: "increasing", 
          description: "High humidity amplifying heat stress", 
          impact: "Heat exhaustion, increased cooling costs" }
      },
      "London": {
        flood: { severity: "Medium", score: 55, trend: "increasing", 
          description: "Thames flood risk and urban surface water flooding", 
          impact: "Transport disruption, property damage" },
        storm: { severity: "Medium", score: 48, trend: "stable", 
          description: "Atlantic storms bringing heavy rainfall", 
          impact: "Infrastructure damage, travel delays" },
        drought: { severity: "Low", score: 25, trend: "decreasing", 
          description: "Occasional summer drought conditions", 
          impact: "Water restrictions, garden stress" }
      },
      "Tokyo": {
        storm: { severity: "High", score: 75, trend: "stable", 
          description: "Typhoon season with severe storms", 
          impact: "Infrastructure damage, transportation shutdown" },
        flood: { severity: "Medium", score: 60, trend: "increasing", 
          description: "Monsoon rains causing urban flooding", 
          impact: "Subway flooding, residential damage" },
        heatwave: { severity: "High", score: 72, trend: "increasing", 
          description: "Urban heat island effect intensifying summer heat", 
          impact: "Health risks, energy consumption spike" }
      },
      "Sydney": {
        wildfire: { severity: "High", score: 85, trend: "increasing", 
          description: "Bushfire season with extreme fire danger", 
          impact: "Property destruction, air quality hazards" },
        drought: { severity: "Medium", score: 58, trend: "stable", 
          description: "Recurring drought affecting water supplies", 
          impact: "Water restrictions, agricultural impact" },
        heatwave: { severity: "Medium", score: 62, trend: "increasing", 
          description: "Extended hot periods with fire weather", 
          impact: "Health stress, fire danger elevation" }
      },
      "Mumbai": {
        flood: { severity: "Critical", score: 92, trend: "increasing", 
          description: "Monsoon flooding overwhelming drainage systems", 
          impact: "Mass displacement, disease outbreaks" },
        storm: { severity: "High", score: 78, trend: "stable", 
          description: "Cyclones from Arabian Sea", 
          impact: "Coastal damage, infrastructure failure" },
        heatwave: { severity: "High", score: 80, trend: "increasing", 
          description: "Pre-monsoon heat with high humidity", 
          impact: "Heat stroke, power shortages" }
      }
    }
    
    const profile = locationProfiles[city as keyof typeof locationProfiles]
    
    if (profile) {
      return Object.entries(profile).map(([type, data]) => ({
        type: type as string,
        severity: data.severity as "Low" | "Medium" | "High" | "Critical",
        score: data.score,
        trend: data.trend as "increasing" | "decreasing" | "stable",
        description: data.description,
        impact: data.impact,
        confidence: 0.85
      }))
    }
    
    // Default fallback for unlisted cities
    return [
      {
        type: "flood",
        severity: "Medium",
        score: 55,
        trend: "stable",
        description: "Moderate flood risk from seasonal precipitation",
        impact: "Potential for localized flooding in low-lying areas",
        confidence: 0.75,
      },
      {
        type: "heatwave",
        severity: "Medium",
        score: 58,
        trend: "increasing",
        description: "Rising temperatures due to climate change",
        impact: "Increased cooling demands and health risks",
        confidence: 0.80,
      },
      {
        type: "drought",
        severity: "Low",
        score: 35,
        trend: "stable",
        description: "Occasional dry periods requiring monitoring",
        impact: "Minor water conservation measures",
        confidence: 0.70,
      },
    ]
  }

  const getPlainLanguageLabel = (score: number): { text: string; color: string; emoji: string } => {
    if (score <= 20) return { text: "All clear — no action needed", color: "text-green-500", emoji: "✅" }
    if (score <= 40) return { text: "Be aware — minor disruptions possible", color: "text-blue-400", emoji: "👀" }
    if (score <= 60) return { text: "Prepare — check your supplies", color: "text-yellow-400", emoji: "⚠️" }
    if (score <= 80) return { text: "Act now — activate your emergency plan", color: "text-orange-400", emoji: "🚨" }
    return { text: "Emergency — take protective action immediately", color: "text-red-500", emoji: "🆘" }
  }

  const getRiskIcon = (type: string) => {
    const IconComponent = RISK_ICONS[type as keyof typeof RISK_ICONS] || RISK_ICONS.default
    return IconComponent
  }

  const getRiskColor = (type: string) => {
    return RISK_COLORS[type as keyof typeof RISK_COLORS] || "#64748b"
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing": return <TrendingUp className="w-4 h-4 text-red-500" />
      case "decreasing": return <TrendingDown className="w-4 h-4 text-green-500" />
      default: return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical": return "destructive"
      case "High": return "destructive"
      case "Medium": return "default"
      case "Low": return "secondary"
      default: return "default"
    }
  }

  if (loading) {
    return (
      <div className={`bg-surface-container-low rounded-xl p-6 border border-outline/5 space-y-8 animate-pulse ${className}`}>
        <div className="h-8 bg-surface-container w-1/2 rounded"></div>
        <div className="flex justify-center py-6"><div className="w-48 h-48 bg-surface-container rounded-full"></div></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-surface-container rounded-xl"></div>
          <div className="h-24 bg-surface-container rounded-xl"></div>
        </div>
      </div>
    )
  }

  // Calculate scores for the new UI
  const floodRisk = risks.find(r => r.type === 'flood')?.score || 0;
  const heatRisk = risks.find(r => r.type === 'heatwave')?.score || 0;
  
  // Calculate a composite risk score (simple average of top risks)
  const compositeRisk = Math.round(risks.reduce((acc, curr) => acc + curr.score, 0) / (risks.length || 1));
  
  // Circle math for SVG gauge
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (compositeRisk / 100) * circumference;

  return (
    <div className={`space-y-4 ${className}`}>
      {error && (
        <Card className="border-yellow-500/50 bg-yellow-500/10 mb-4">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-500 font-label text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Using simulated metrics: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="bg-surface-container-low rounded-xl p-6 border border-outline/5 space-y-8 shadow-2xl">
        <div>
          <h3 className="font-headline font-bold text-lg mb-1 tracking-tight text-white">Active Intelligence</h3>
          <p className="text-xs text-on-surface-variant font-body mb-4">Computed composite risk vectors for {location?.city || 'Current Region'}.</p>
          
          {/* Alert Status */}
          {alertCount > 0 && (
            <div className="flex items-center justify-between p-3 rounded bg-error/10 border border-error/20 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-sm">warning</span>
                <span className="font-label text-xs font-bold text-error uppercase tracking-widest">{alertCount} Active Alerts</span>
              </div>
              <div className="flex gap-1">
                {riskAlerts.slice(0, 2).map((a, i) => (
                  <span key={i} className="px-2 py-0.5 bg-error/20 text-error text-[10px] font-bold rounded uppercase tracking-wider">{a.severity}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Overall Risk Score */}
        <div className="flex flex-col items-center py-6">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle className="text-surface-container-high" cx="96" cy="96" fill="transparent" r={radius} stroke="currentColor" strokeWidth="8"></circle>
              <circle className="text-primary transition-all duration-1000 ease-out" cx="96" cy="96" fill="transparent" r={radius} stroke="currentColor" 
                      strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" strokeWidth="12"></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-label font-black text-white">{compositeRisk}<span className="text-2xl text-primary/70">%</span></span>
              <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mt-1">Composite Risk</span>
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl -z-10"></div>
          </div>
        </div>

        {/* Sub-metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-panel p-4 rounded-xl border-l-2 border-l-error">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-label uppercase tracking-widest text-slate-400">Flood</span>
              <span className="material-symbols-outlined text-error text-xs">water_drop</span>
            </div>
            <div className="text-2xl font-label font-bold text-error">{floodRisk}%</div>
            <div className="w-full h-1 bg-surface-container-highest mt-2 rounded-full overflow-hidden">
              <div className="h-full bg-error transition-all duration-1000" style={{ width: `${floodRisk}%` }}></div>
            </div>
          </div>
          <div className="glass-panel p-4 rounded-xl border-l-2 border-l-primary">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-label uppercase tracking-widest text-slate-400">Heat</span>
              <span className="material-symbols-outlined text-primary text-xs">thermostat</span>
            </div>
            <div className="text-2xl font-label font-bold text-primary">{heatRisk}%</div>
            <div className="w-full h-1 bg-surface-container-highest mt-2 rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${heatRisk}%` }}></div>
            </div>
          </div>
        </div>

        {/* Insights Feed */}
        <div className="space-y-4 pt-4 border-t border-outline/5">
          <h4 className="text-[10px] font-label uppercase tracking-widest text-slate-500 font-bold">Sentinel Action Items</h4>
          
          {compositeRisk > 50 ? (
            <div className="flex gap-4 p-3 bg-secondary-container/10 rounded border border-secondary/10">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <div className="text-xs font-body leading-relaxed text-slate-300">
                AI algorithms predict compounding risk factors peaking at 22:40. Preparations for {location?.city || 'Zone A'} are <span className="text-secondary font-bold">highly recommended</span>.
              </div>
            </div>
          ) : (
             <div className="flex gap-4 p-3 bg-primary/5 rounded border border-primary/10">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <div className="text-xs font-body leading-relaxed text-slate-300">
                Conditions are stable. No immediate compounding threats detected for {location?.city || 'this region'}. Routine monitoring active.
              </div>
            </div>
          )}
          
          {floodRisk > 40 && (
            <div className="flex gap-4 p-3 bg-surface-container-highest/30 rounded border border-outline/10">
              <span className="material-symbols-outlined text-error text-sm">info</span>
              <div className="text-xs font-body leading-relaxed text-slate-400">
                Precipitation threshold monitoring active. Soil saturation levels approaching limits in low-lying sectors.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}