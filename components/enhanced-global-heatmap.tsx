"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Map, Satellite, Layers, RefreshCw, Globe, Bell, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import { useAlertSubscription, useSystemAlerts } from "@/hooks/use-alerts"

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

interface RiskPoint {
  lat: number
  lon: number
  city: string
  country: string
  riskType: string
  severity: "Low" | "Medium" | "High"
  riskScore: number // 0-100
  temperature: number
  precipitation: number
  humidity: number
  windSpeed?: number
  lastUpdated: string
}

interface MapData {
  type: "FeatureCollection"
  features: Array<{
    type: "Feature"
    geometry: {
      type: "Point"
      coordinates: [number, number]
    }
    properties: RiskPoint
  }>
}

interface GlobalHeatmapProps {
  className?: string
  height?: number
  focusLocation?: { lat: number; lon: number; name: string }
}

export function GlobalHeatmap({ className, height = 500, focusLocation }: GlobalHeatmapProps) {
  const [data, setData] = useState<MapData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapStyle, setMapStyle] = useState<"terrain" | "satellite" | "street">("terrain")
  const [selectedRisk, setSelectedRisk] = useState<string>("all")
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  
  // Alert system integration
  const { alerts: mapAlerts, alertCount } = useAlertSubscription("global-heatmap", {
    typeFilter: ["extreme_heat", "flooding", "drought", "storm", "wildfire"],
    severityFilter: "high" // Only show high-severity alerts on map
  })
  const { createErrorAlert, createSuccessAlert } = useSystemAlerts("global-heatmap")

  const riskTypes = ["all", "flood", "drought", "heatwave", "storm"]

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setLoading(true)
        
        const response = await fetch("/api/global-map")
        if (!response.ok) throw new Error("Failed to fetch map data")
        const result = await response.json()
        
        setData(result)
        setLastRefresh(new Date())
        
        // Check for high-risk locations and create alerts
        if (result.features) {
          const highRiskLocations = result.features.filter((feature: any) => 
            feature.properties.severity === "High" || feature.properties.severity === "Critical"
          )
          
          if (highRiskLocations.length > 0) {
            createSuccessAlert(`Map updated: ${highRiskLocations.length} high-risk locations detected`)
          } else {
            createSuccessAlert("Map updated successfully")
          }
        }
      } catch (err) {
        console.warn("Map API failed, using mock data:", err)
        const errorMessage = err instanceof Error ? err.message : "Unknown error"
        setError(errorMessage)
        setData(generateMockMapData())
        setLastRefresh(new Date())
        createErrorAlert(new Error(errorMessage), "Map data fetch")
      } finally {
        setLoading(false)
      }
    }

    fetchMapData()
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchMapData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [createErrorAlert, createSuccessAlert])

  const generateMockMapData = (): MapData => {
    const cities = [
      { city: "New York", country: "USA", lat: 40.7128, lon: -74.0060 },
      { city: "London", country: "UK", lat: 51.5074, lon: -0.1278 },
      { city: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503 },
      { city: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093 },
      { city: "Mumbai", country: "India", lat: 19.0760, lon: 72.8777 },
      { city: "São Paulo", country: "Brazil", lat: -23.5505, lon: -46.6333 },
      { city: "Cairo", country: "Egypt", lat: 30.0444, lon: 31.2357 },
      { city: "Lagos", country: "Nigeria", lat: 6.5244, lon: 3.3792 },
      { city: "Moscow", country: "Russia", lat: 55.7558, lon: 37.6176 },
      { city: "Beijing", country: "China", lat: 39.9042, lon: 116.4074 },
    ]

    const riskTypes = ["flood", "drought", "heatwave", "storm"]
    const severities: ("Low" | "Medium" | "High")[] = ["Low", "Medium", "High"]

    const features = cities.map((city, index) => {
      const riskType = riskTypes[index % riskTypes.length]
      const severity = severities[index % severities.length]
      const riskScore = severity === "High" ? 70 + Math.random() * 30 : 
                       severity === "Medium" ? 40 + Math.random() * 30 : 
                       Math.random() * 40

      return {
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [city.lon, city.lat] as [number, number],
        },
        properties: {
          ...city,
          riskType,
          severity,
          riskScore: Math.round(riskScore),
          temperature: 15 + Math.random() * 25,
          precipitation: Math.random() * 20,
          humidity: 30 + Math.random() * 50,
          windSpeed: 5 + Math.random() * 15,
          lastUpdated: new Date().toISOString(),
        },
      }
    })

    return {
      type: "FeatureCollection",
      features,
    }
  }

  const getColor = (severity: string, riskType: string) => {
    const baseColors = {
      flood: { High: "#1e40af", Medium: "#3b82f6", Low: "#93c5fd" },
      drought: { High: "#ea580c", Medium: "#f97316", Low: "#fed7aa" },
      heatwave: { High: "#dc2626", Medium: "#ef4444", Low: "#fca5a5" },
      storm: { High: "#7c3aed", Medium: "#8b5cf6", Low: "#c4b5fd" },
      default: { High: "#6b7280", Medium: "#9ca3af", Low: "#d1d5db" },
    }
    
    return baseColors[riskType as keyof typeof baseColors]?.[severity as keyof typeof baseColors.flood] || 
           baseColors.default[severity as keyof typeof baseColors.default]
  }

  const getSizeByRisk = (riskScore: number) => {
    return Math.max(8, Math.min(25, (riskScore / 100) * 25))
  }

  const filteredData = data ? {
    ...data,
    features: selectedRisk === "all" 
      ? data.features 
      : data.features.filter(f => f.properties.riskType?.toLowerCase() === selectedRisk.toLowerCase())
  } : null

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Global Climate Risk Map
          </CardTitle>
          <CardDescription>Real-time climate risk visualization</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading global climate data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Global Climate Risk Map
          </CardTitle>
          <CardDescription>Real-time climate risk visualization</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <div className="text-red-500 mb-2">⚠️ API Error</div>
            <p className="text-sm text-muted-foreground mb-4">Using demo data: {error}</p>
            <Button onClick={() => window.location.reload()} size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!filteredData) return null

  const mapData = filteredData.features.map(f => f.properties)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`glass-panel rounded-2xl overflow-hidden relative flex flex-col border border-outline/10 ${className}`}
    >
      {/* Header HUD Overlay */}
      <div className="p-4 border-b border-outline/10 flex items-center justify-between bg-black/40 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#00E5FF]">public</span>
          <div className="flex flex-col">
            <span className="font-label uppercase tracking-widest text-sm text-white font-bold">Global Risk Radar</span>
            <span className="text-[10px] text-slate-400 font-label tracking-widest uppercase">
              Updated {lastRefresh.toLocaleTimeString()}
            </span>
          </div>
          {alertCount > 0 && (
            <div className="relative ml-2">
              <span className="material-symbols-outlined text-error text-lg animate-pulse">warning</span>
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-error rounded-full animate-pulse shadow-[0_0_10px_rgba(255,59,48,0.8)] text-[8px] text-white font-bold flex items-center justify-center">
                {alertCount > 9 ? '9+' : alertCount}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 items-center">
          <button onClick={() => window.location.reload()} className="w-8 h-8 flex items-center justify-center bg-white/5 border border-outline/10 rounded hover:bg-white/10 transition-colors text-slate-300">
            <span className="material-symbols-outlined text-sm">refresh</span>
          </button>
          <div className="h-6 w-px bg-outline/20 mx-1"></div>
          <button className="px-3 py-1.5 bg-[#00E5FF]/10 border border-[#00E5FF]/30 rounded font-label text-[10px] uppercase tracking-widest text-[#00E5FF] hover:bg-[#00E5FF]/20 transition-colors">
            Live Risks
          </button>
          <button className="px-3 py-1.5 bg-transparent border border-outline/10 rounded font-label text-[10px] uppercase tracking-widest text-slate-400 hover:bg-white/5 transition-colors">
            24h Forecast
          </button>
        </div>
      </div>

      {/* Internal Controls overlay HUD */}
      <div className="absolute top-20 left-4 z-10 flex flex-col gap-2 pointer-events-none">
        <div className="flex flex-col gap-1 pointer-events-auto">
          {riskTypes.map((risk) => (
            <button
              key={risk}
              onClick={() => setSelectedRisk(risk)}
              className={`px-3 py-2 text-xs font-label uppercase tracking-widest rounded border transition-all duration-300 ${
                selectedRisk === risk 
                  ? 'bg-white/10 border-white/20 text-white shadow-lg backdrop-blur-md' 
                  : 'bg-black/40 border-outline/10 text-slate-400 hover:bg-white/5 hover:text-slate-300 backdrop-blur-sm'
              }`}
            >
              {risk === "all" ? "All Hazards" : risk}
            </button>
          ))}
        </div>
      </div>

      {/* Map Content Container */}
      <div className="flex-1 bg-surface-container-lowest relative z-0">
        <div style={{ height }}>
          <Plot
            data={([
              {
                type: "scattermapbox",
                lat: mapData.map(d => d.lat),
                lon: mapData.map(d => d.lon),
                mode: "markers",
                marker: {
                  size: mapData.map(d => getSizeByRisk(d.riskScore)),
                  color: mapData.map(d => getColor(d.severity, d.riskType)),
                  opacity: 0.85,
                  line: { color: "rgba(255,255,255,0.2)", width: 1 },
                },
                text: mapData.map(d => 
                  `<b>${d.city}, ${d.country}</b><br>` +
                  `Risk: ${d.riskType.toUpperCase()} (${d.severity})<br>` +
                  `Score: ${d.riskScore}/100<br>` +
                  `Temp: ${d.temperature.toFixed(1)}°C<br>` +
                  `Precipitation: ${d.precipitation.toFixed(1)}mm`
                ),
                hovertemplate: "<div style='background:rgba(0,0,0,0.8);border:1px solid #334155;padding:10px;border-radius:8px;font-family:Inter,sans-serif;color:white;'>%{text}</div><extra></extra>",
                showlegend: false,
              },
              // Pulsing ring for the selected/focus location
              ...(focusLocation ? [{
                type: "scattermapbox" as const,
                lat: [focusLocation.lat],
                lon: [focusLocation.lon],
                mode: "markers" as const,
                marker: {
                  size: 32,
                  color: "rgba(0,229,255,0.15)",
                  line: { color: "#00E5FF", width: 2 },
                },
                text: [`<b>📍 ${focusLocation.name}</b><br>Selected Location`],
                hovertemplate: "%{text}<extra></extra>",
                showlegend: false,
              }, {
                type: "scattermapbox" as const,
                lat: [focusLocation.lat],
                lon: [focusLocation.lon],
                mode: "markers+text" as const,
                marker: {
                  size: 10,
                  color: "#00E5FF",
                  line: { color: "#1e293b", width: 2 },
                },
                text: [focusLocation.name],
                textposition: "top right" as const,
                textfont: { color: "#00E5FF", size: 12, family: 'Inter, sans-serif', weight: 'bold' },
                hovertemplate: `<b>📍 ${focusLocation.name}</b><extra></extra>`,
                showlegend: false,
              }] : [])
            ] as any[])}
            layout={{
              mapbox: {
                style: mapStyle === "terrain" ? "carto-darkmatter" : 
                       mapStyle === "satellite" ? "satellite" : "carto-darkmatter",
                center: focusLocation 
                  ? { lat: focusLocation.lat, lon: focusLocation.lon }
                  : { lat: 20, lon: 0 },
                zoom: focusLocation ? 5 : 1.5,
              },
              margin: { t: 0, b: 0, l: 0, r: 0 },
              paper_bgcolor: "transparent",
              plot_bgcolor: "transparent",
              font: { color: "#94a3b8", size: 12, family: 'Inter, sans-serif' },
              hovermode: "closest",
            }}
            config={{
              displayModeBar: false,
              responsive: true,
              scrollZoom: true,
              doubleClick: "reset",
            }}
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* Legend HUD Overlay Bottom Right */}
        <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md border border-outline/10 p-3 rounded-xl pointer-events-auto">
            <div className="flex flex-col gap-2 text-[10px] font-label tracking-widest text-slate-400 uppercase">
              <span className="text-slate-300 font-bold mb-1">Risk Severity</span>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-error shadow-[0_0_8px_rgba(255,59,48,0.6)]"></div>
                <span>Critical / High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(255,149,0,0.6)]"></div>
                <span>Moderate / Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(0,122,255,0.6)]"></div>
                <span>Low / Advisory</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats HUD Overlay Bottom Left */}
        <div className="absolute bottom-4 left-4 z-10 pointer-events-none flex gap-2">
          <div className="bg-black/60 backdrop-blur-md border border-outline/10 px-4 py-2 rounded-xl pointer-events-auto flex items-center gap-3">
             <span className="material-symbols-outlined text-slate-400 text-sm">my_location</span>
             <div>
               <div className="text-[10px] text-slate-400 font-label uppercase tracking-widest leading-none mb-1">Tracked Nodes</div>
               <div className="text-sm text-white font-headline font-bold leading-none">{mapData.length}</div>
             </div>
          </div>
          {mapData.filter(d => d.severity === "High").length > 0 && (
            <div className="bg-error/10 backdrop-blur-md border border-error/30 px-4 py-2 rounded-xl pointer-events-auto flex items-center gap-3">
               <span className="material-symbols-outlined text-error text-sm">warning</span>
               <div>
                 <div className="text-[10px] text-error font-label uppercase tracking-widest leading-none mb-1">High Risk</div>
                 <div className="text-sm text-white font-headline font-bold leading-none">{mapData.filter(d => d.severity === "High").length}</div>
               </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}