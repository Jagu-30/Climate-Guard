export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const latitude = searchParams.get("latitude") || "40.7128"
  const longitude = searchParams.get("longitude") || "-74.006"
  const riskType = searchParams.get("risk_type")
  const severity = searchParams.get("severity")

  // Fetch current weather to determine which actions are most relevant
  let currentRisks = { flood: 0, drought: 0, heatwave: 0, storm: 0 }
  try {
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation,relative_humidity_2m,wind_speed_10m&timezone=auto`
    )
    if (weatherRes.ok) {
      const data = await weatherRes.json()
      const c = data.current
      // Simple risk scoring based on live weather
      if (c.precipitation > 20) currentRisks.flood = 90
      else if (c.precipitation > 10) currentRisks.flood = 60
      else if (c.precipitation > 5) currentRisks.flood = 30

      if (c.temperature_2m > 40) currentRisks.heatwave = 95
      else if (c.temperature_2m > 35) currentRisks.heatwave = 70
      else if (c.temperature_2m > 30) currentRisks.heatwave = 40

      if (c.precipitation < 0.1 && c.temperature_2m > 28) currentRisks.drought = 70
      else if (c.precipitation < 1 && c.temperature_2m > 25) currentRisks.drought = 40

      if (c.wind_speed_10m > 25) currentRisks.storm = 80
      else if (c.wind_speed_10m > 15) currentRisks.storm = 50
    }
  } catch (e) {
    console.warn("Weather API failed for actions, using defaults")
  }

  const allActions = [
    {
      id: 1,
      title: "Activate Emergency Cooling Centers",
      description: "Open public cooling centers for vulnerable populations during extreme heat events",
      priority: currentRisks.heatwave > 60 ? "Critical" : "High",
      timeline: "Immediate",
      resources_required: "Staff, facilities, transportation",
      status: currentRisks.heatwave > 60 ? "Active" : "Ready",
      risk_types: ["heatwave"],
      severity_levels: ["High", "Medium"],
      relevance_score: currentRisks.heatwave,
    },
    {
      id: 2,
      title: "Issue Flood Warning Alert",
      description: "Send emergency alerts to residents in flood-prone areas",
      priority: currentRisks.flood > 50 ? "Critical" : "High",
      timeline: "Immediate",
      resources_required: "Emergency broadcast system",
      status: currentRisks.flood > 60 ? "Active" : "Ready",
      risk_types: ["flood"],
      severity_levels: ["High", "Medium"],
      relevance_score: currentRisks.flood,
    },
    {
      id: 3,
      title: "Implement Water Conservation Measures",
      description: "Restrict non-essential water use and promote conservation practices",
      priority: currentRisks.drought > 60 ? "Critical" : "High",
      timeline: "1-3 days",
      resources_required: "Public communication, enforcement",
      status: currentRisks.drought > 50 ? "Active" : "Planning",
      risk_types: ["drought"],
      severity_levels: ["High", "Medium"],
      relevance_score: currentRisks.drought,
    },
    {
      id: 4,
      title: "Deploy Mobile Medical Units",
      description: "Position medical units in high-risk areas for heat-related emergencies",
      priority: currentRisks.heatwave > 70 ? "Critical" : "High",
      timeline: "2-6 hours",
      resources_required: "Medical staff, vehicles, supplies",
      status: currentRisks.heatwave > 70 ? "Active" : "Standby",
      risk_types: ["heatwave"],
      severity_levels: ["High"],
      relevance_score: currentRisks.heatwave,
    },
    {
      id: 5,
      title: "Sandbag Distribution",
      description: "Distribute sandbags to residents in flood-prone areas",
      priority: currentRisks.flood > 50 ? "High" : "Medium",
      timeline: "4-12 hours",
      resources_required: "Sandbags, volunteers, distribution points",
      status: currentRisks.flood > 50 ? "Active" : "Ready",
      risk_types: ["flood"],
      severity_levels: ["High", "Medium"],
      relevance_score: currentRisks.flood,
    },
    {
      id: 6,
      title: "Agricultural Drought Support",
      description: "Provide emergency water supplies and financial assistance to farmers",
      priority: currentRisks.drought > 50 ? "High" : "Medium",
      timeline: "1-7 days",
      resources_required: "Water trucks, funding, coordination",
      status: currentRisks.drought > 50 ? "Active" : "Planning",
      risk_types: ["drought"],
      severity_levels: ["High", "Medium"],
      relevance_score: currentRisks.drought,
    },
    {
      id: 7,
      title: "Secure Outdoor Infrastructure",
      description: "Ensure signage, scaffolding, and loose structures are secured against high winds",
      priority: currentRisks.storm > 60 ? "Critical" : "Medium",
      timeline: "2-4 hours",
      resources_required: "Maintenance crews, equipment",
      status: currentRisks.storm > 50 ? "Active" : "Standby",
      risk_types: ["storm"],
      severity_levels: ["High", "Medium"],
      relevance_score: currentRisks.storm,
    },
    {
      id: 8,
      title: "Activate Emergency Shelters",
      description: "Open storm shelters and ensure supplies are stocked for displaced residents",
      priority: currentRisks.storm > 70 ? "Critical" : "High",
      timeline: "Immediate",
      resources_required: "Shelter facilities, cots, supplies, volunteers",
      status: currentRisks.storm > 70 ? "Active" : "Standby",
      risk_types: ["storm"],
      severity_levels: ["High"],
      relevance_score: currentRisks.storm,
    },
  ]

  let filteredActions = allActions

  if (riskType) {
    filteredActions = filteredActions.filter((action) => action.risk_types.includes(riskType.toLowerCase()))
  }

  if (severity) {
    filteredActions = filteredActions.filter((action) => action.severity_levels.includes(severity))
  }

  // Sort by relevance score (highest current risk first)
  filteredActions.sort((a, b) => b.relevance_score - a.relevance_score)

  return Response.json({
    actions: filteredActions,
    total: filteredActions.length,
    currentRisks,
    filters_applied: {
      risk_type: riskType,
      severity: severity,
      latitude,
      longitude,
    },
    dataSource: "Open-Meteo Live + Rule-based Prioritization",
  })
}
