"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, Droplets, Flame, Wind, Sun, TrendingUp, RefreshCw, Wifi } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface SummaryItem {
  icon: React.ElementType
  label: string
  value: string
  severity: "ok" | "warn" | "high" | "critical"
}

interface SmartSummaryBarProps {
  location?: { name: string; lat: number; lon: number }
}

const SEVERITY_CLASS = {
  ok: "text-green-400",
  warn: "text-yellow-400",
  high: "text-orange-400",
  critical: "text-red-400 animate-pulse",
}

const SEVERITY_DOT = {
  ok: "bg-green-500",
  warn: "bg-yellow-400",
  high: "bg-orange-400",
  critical: "bg-red-500",
}

export function SmartSummaryBar({ location }: SmartSummaryBarProps) {
  const [items, setItems] = useState<SummaryItem[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [secondsAgo, setSecondsAgo] = useState(0)
  const [isLive, setIsLive] = useState(true)

  const fetchSummary = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const lat = location?.lat ?? 40.7128
      const lon = location?.lon ?? -74.006

      const [predictRes, disasterRes] = await Promise.allSettled([
        fetch("/api/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latitude: lat, longitude: lon }),
        }).then(r => r.json()),
        fetch("/api/disasters").then(r => r.json()),
      ])

      const predict = predictRes.status === "fulfilled" ? predictRes.value : null
      const disaster = disasterRes.status === "fulfilled" ? disasterRes.value : null

      const newItems: SummaryItem[] = []

      // Critical alerts count
      const criticalCount = disaster?.criticalAlerts ?? 0
      const totalAlerts = disaster?.totalAlerts ?? 0
      newItems.push({
        icon: AlertTriangle,
        label: "Alerts",
        value: criticalCount > 0 ? `${criticalCount} critical` : totalAlerts > 0 ? `${totalAlerts} active` : "All clear",
        severity: criticalCount > 0 ? "critical" : totalAlerts > 0 ? "warn" : "ok",
      })

      // Flood risk
      if (predict?.flood_risk !== undefined) {
        const v = Math.round(predict.flood_risk)
        newItems.push({
          icon: Droplets,
          label: "Flood",
          value: `${v}%`,
          severity: v > 70 ? "critical" : v > 50 ? "high" : v > 30 ? "warn" : "ok",
        })
      }

      // Heatwave risk
      if (predict?.heatwave_risk !== undefined) {
        const v = Math.round(predict.heatwave_risk)
        newItems.push({
          icon: Flame,
          label: "Heat",
          value: `${v}%`,
          severity: v > 70 ? "critical" : v > 50 ? "high" : v > 30 ? "warn" : "ok",
        })
      }

      // Drought risk
      if (predict?.drought_risk !== undefined) {
        const v = Math.round(predict.drought_risk)
        newItems.push({
          icon: Sun,
          label: "Drought",
          value: `${v}%`,
          severity: v > 70 ? "critical" : v > 50 ? "high" : v > 30 ? "warn" : "ok",
        })
      }

      // Storm risk
      if (predict?.storm_risk !== undefined) {
        const v = Math.round(predict.storm_risk)
        newItems.push({
          icon: Wind,
          label: "Storm",
          value: `${v}%`,
          severity: v > 70 ? "critical" : v > 50 ? "high" : v > 30 ? "warn" : "ok",
        })
      }

      // Overall risk trend — detect highest severity
      const maxSev = [...newItems].sort((a, b) => {
        const order = { critical: 3, high: 2, warn: 1, ok: 0 }
        return order[b.severity] - order[a.severity]
      })[0]?.severity ?? "ok"

      newItems.push({
        icon: TrendingUp,
        label: "Overall",
        value: maxSev === "ok" ? "Low risk" : maxSev === "warn" ? "Moderate" : maxSev === "high" ? "Elevated" : "⚠ High risk",
        severity: maxSev,
      })

      if (newItems.length > 1) {
        setItems(newItems)
        setLastUpdated(new Date())
        setSecondsAgo(0)
        setIsLive(true)
      }
    } catch {
      setIsLive(false)
    } finally {
      setIsRefreshing(false)
    }
  }, [location])

  // Initial fetch + auto-refresh every 30 seconds
  useEffect(() => {
    fetchSummary()
    const interval = setInterval(fetchSummary, 30_000)
    return () => clearInterval(interval)
  }, [fetchSummary])

  // Tick the "X sec ago" counter
  useEffect(() => {
    const tick = setInterval(() => {
      if (lastUpdated) {
        setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000))
      }
    }, 5000)
    return () => clearInterval(tick)
  }, [lastUpdated])

  if (items.length === 0) return null

  const hasCritical = items.some(i => i.severity === "critical")

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full rounded-xl border px-4 py-2.5 flex items-center gap-3 overflow-x-auto mb-4 ${
        hasCritical
          ? "bg-red-500/5 border-red-500/30"
          : "bg-card/60 border-border"
      }`}
    >
      {/* Live indicator */}
      <div className="flex items-center gap-1.5 flex-shrink-0 pr-3 border-r border-border">
        <span className={`w-2 h-2 rounded-full ${hasCritical ? "bg-red-500 animate-ping" : isLive ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
        <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
          {isLive ? (secondsAgo < 60 ? "Live" : `${Math.floor(secondsAgo / 60)}m ago`) : "Offline"}
        </span>
      </div>

      {/* Summary items */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <AnimatePresence>
          {items.map((item) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1.5 flex-shrink-0"
              >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${SEVERITY_DOT[item.severity]}`} />
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${SEVERITY_CLASS[item.severity]}`} />
                <span className="text-xs text-muted-foreground whitespace-nowrap">{item.label}</span>
                <span className={`text-xs font-semibold whitespace-nowrap ${SEVERITY_CLASS[item.severity]}`}>
                  {item.value}
                </span>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Refresh button */}
      <Button
        size="sm"
        variant="ghost"
        onClick={fetchSummary}
        disabled={isRefreshing}
        className="h-7 w-7 p-0 flex-shrink-0 rounded-full ml-auto"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
      </Button>
    </motion.div>
  )
}
