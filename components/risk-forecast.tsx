"use client"

import { useEffect, useState } from "react"

interface ForecastDay {
  date: string
  day: string
  overallRisk: 'Low' | 'Medium' | 'High' | 'Critical'
  temperature: { min: number; max: number }
  precipitation: number
  windSpeed: number
  risks: {
    flood: number
    drought: number
    heatwave: number
    storm: number
  }
}

interface RiskForecastProps {
  location?: { lat: number; lon: number; city: string }
}

export function RiskForecast({ location }: RiskForecastProps = {}) {
  const [forecastData, setForecastData] = useState<ForecastDay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true)
      setError(null)
      try {
        const lat = location?.lat ?? 40.7128
        const lon = location?.lon ?? -74.006
        const res = await fetch(`/api/forecast?latitude=${lat}&longitude=${lon}`)
        if (!res.ok) throw new Error("Failed to fetch forecast")
        const data = await res.json()

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

        const parsed: ForecastDay[] = (data.forecast || []).map((item: any) => {
          const d = new Date(item.date)
          const floodPct = Math.round((item.floodRisk ?? 0) * 100)
          const droughtPct = Math.round((item.droughtRisk ?? 0) * 100)
          const heatPct = Math.round((item.heatwaveRisk ?? 0) * 100)
          const stormPct = Math.round((item.stormRisk ?? 0) * 100)
          const highest = Math.max(floodPct, droughtPct, heatPct, stormPct)

          let overallRisk: ForecastDay['overallRisk'] = 'Low'
          if (highest > 70) overallRisk = 'Critical'
          else if (highest > 50) overallRisk = 'High'
          else if (highest > 30) overallRisk = 'Medium'

          return {
            date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            day: days[d.getDay()],
            overallRisk,
            temperature: {
              min: Math.round(item.temperatureMin ?? item.temperature ?? 0),
              max: Math.round(item.temperatureMax ?? item.temperature ?? 0),
            },
            precipitation: Math.round(item.precipitation ?? 0),
            windSpeed: Math.round(item.windSpeed ?? 0),
            risks: { flood: floodPct, drought: droughtPct, heatwave: heatPct, storm: stormPct }
          }
        })

        setForecastData(parsed)
        if (data.error) setError(data.error)
      } catch (err) {
        console.error("Forecast fetch failed:", err)
        setError("Could not load forecast")
        setForecastData([])
      } finally {
        setLoading(false)
      }
    }

    fetchForecast()
  }, [location])

  const daysToDisplay = forecastData.slice(0, 6)

  const getWeatherIcon = (riskType: string, precip: number) => {
    if (riskType === 'Critical' || riskType === 'High') {
      if (precip > 50) return { icon: "thunderstorm", color: "text-error" }
      return { icon: "local_fire_department", color: "text-error" }
    }
    if (precip > 30) return { icon: "rainy", color: "text-primary" }
    if (precip > 10) return { icon: "partly_cloudy_day", color: "text-slate-300" }
    return { icon: "sunny", color: "text-tertiary" }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="font-label text-sm uppercase tracking-widest text-slate-400 font-bold">10-Day Climate Trajectory</h3>
          <span className="text-[10px] font-label px-2 py-1 rounded bg-surface-container border border-outline/10 text-slate-400">Loading live data…</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-panel p-4 rounded-xl h-36 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (daysToDisplay.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-xl text-center">
        <p className="text-on-surface-variant text-sm">No forecast data available{error ? `: ${error}` : ''}.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-2">
        <h3 className="font-label text-sm uppercase tracking-widest text-slate-400 font-bold">10-Day Climate Trajectory</h3>
        <span className="text-[10px] font-label px-2 py-1 rounded bg-surface-container border border-outline/10 text-slate-400">
          {error ? '⚠ Fallback Data' : '✓ Open-Meteo Live'}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {daysToDisplay.map((day, index) => {
          const { icon, color } = getWeatherIcon(day.overallRisk, day.precipitation)
          const highestRiskVal = Math.max(...Object.values(day.risks))

          return (
            <div
              key={index}
              className="glass-panel p-4 rounded-xl flex flex-col items-center justify-between group hover:-translate-y-1 transition-all duration-300"
            >
              <div className="text-[10px] font-label uppercase tracking-widest text-slate-400 mb-2">{day.day}</div>

              <span className={`material-symbols-outlined text-3xl mb-2 ${color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {icon}
              </span>

              <div className="text-xl font-label font-bold text-white mb-1">
                {day.temperature.max}°
              </div>

              <div className="text-[10px] text-on-surface-variant font-label mt-1">
                Risk: {highestRiskVal}%
              </div>

              <div className="w-full h-1 bg-surface-container-highest mt-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    highestRiskVal > 70 ? 'bg-error' :
                    highestRiskVal > 40 ? 'bg-secondary' : 'bg-primary'
                  }`}
                  style={{ width: `${highestRiskVal}%` }}
                ></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}