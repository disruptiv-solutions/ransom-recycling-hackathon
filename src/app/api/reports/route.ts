import { NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { getSessionProfile } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/auth/roles";
import { getServerEnv } from "@/lib/env/server";
import { mapReport } from "@/lib/ops/firestore";
import type { VisualizationSpec } from "@/lib/ops/types";
import { getServerDemoMode } from "@/lib/demo-mode-server";

const reportSchema = z.object({
  reportType: z.enum(["production", "outcomes", "environmental", "comprehensive"]),
  startDate: z.string(),
  endDate: z.string(),
  includeNarrative: z.boolean(),
  includeStories: z.boolean(),
  includeCharts: z.boolean(),
});

export const runtime = "nodejs";

export const GET = async () => {
  const profile = await getSessionProfile();
  if (!profile || !isStaffRole(profile.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const db = getFirebaseAdminDb();
  const reportsSnap = await db.collection("reports").orderBy("generatedAt", "desc").get();
  const reports = reportsSnap.docs.map((doc) => mapReport(doc.id, doc.data()));

  return NextResponse.json({ ok: true, reports });
};

export const POST = async (req: Request) => {
  const profile = await getSessionProfile();
  if (!profile || !isStaffRole(profile.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const isDemoMode = await getServerDemoMode();
  const json = await req.json().catch(() => null);
  const parsed = reportSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
  }

  const db = getFirebaseAdminDb();
  const start = Timestamp.fromDate(new Date(parsed.data.startDate));
  const end = Timestamp.fromDate(new Date(parsed.data.endDate));

  const [participantsSnap, workLogsSnap, productionSnap, certsSnap] = await Promise.all([
    db.collection("participants").get(),
    db
      .collection("work_logs")
      .where("workDate", ">=", start)
      .where("workDate", "<=", end)
      .get(),
    db
      .collection("production_records")
      .where("productionDate", ">=", start)
      .where("productionDate", "<=", end)
      .get(),
    db
      .collection("certifications")
      .where("earnedDate", ">=", start)
      .where("earnedDate", "<=", end)
      .get(),
  ]);

  const participants = participantsSnap.docs.map((doc) => doc.data() ?? {});
  const workLogs = workLogsSnap.docs.map((doc) => doc.data() ?? {});
  const productionRecords = productionSnap.docs.map((doc) => doc.data() ?? {});

  const filteredParticipants = isDemoMode ? participants : participants.filter((p) => !p.isMock);
  const filteredWorkLogs = isDemoMode ? workLogs : workLogs.filter((log) => !log.isMock);
  const filteredProductionRecords = isDemoMode
    ? productionRecords
    : productionRecords.filter((record) => !record.isMock);

  const participantCount = filteredParticipants.length;
  const phaseBreakdown = filteredParticipants.reduce<Record<string, number>>((acc, participant) => {
    const phase = String(participant.currentPhase ?? "0");
    acc[phase] = (acc[phase] ?? 0) + 1;
    return acc;
  }, {});

  const totalWeight = filteredProductionRecords.reduce((sum, record) => sum + Number(record.weight ?? 0), 0);
  const revenue = filteredProductionRecords.reduce((sum, record) => sum + Number(record.value ?? 0), 0);
  const hours = filteredWorkLogs.reduce((sum, log) => sum + Number(log.hours ?? 0), 0);
  const laborCost = hours * 10; // $10/hr wage assumption
  const netValue = revenue - laborCost;
  const lbsDiverted = totalWeight;
  const certifications = certsSnap.size;
  const placements = filteredParticipants.filter((p) => p.status === "graduated").length;
  const retention = participantCount > 0 ? Math.round((placements / participantCount) * 100) : 0;

  const revenueByParticipant = filteredProductionRecords.reduce<Record<string, number>>((acc, record) => {
    const name = String(record.participantName ?? "Participant");
    acc[name] = (acc[name] ?? 0) + Number(record.value ?? 0);
    return acc;
  }, {});

  const stats = {
    participantCount,
    phaseBreakdown,
    totalWeight: Number(totalWeight.toFixed(2)),
    revenue: Number(revenue.toFixed(2)),
    hours: Number(hours.toFixed(2)),
    laborCost: Number(laborCost.toFixed(2)),
    netValue: Number(netValue.toFixed(2)),
    lbsDiverted: Number(lbsDiverted.toFixed(2)),
    certifications,
    placements,
    retention,
  };

  // Prepare data for AI generation
  const topPerformers = Object.entries(revenueByParticipant)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, revenue]) => ({ name, revenue }));

  // Generate AI content using OpenRouter
  let narrative: string | null = null;
  let pdfNarrative: string | null = null;
  let stories: string | null = null;
  let charts: string | null = null;
  let chartConfigurations: Array<{
    type: "bar" | "line" | "pie" | "area" | "donut";
    title: string;
    description: string;
    data: Array<{ name: string; value: number; [key: string]: string | number }>;
    xAxisKey?: string;
    yAxisKey?: string;
    colors?: string[];
  }> | null = null;
  let visualizationSpecs: VisualizationSpec[] | null = null;

  const env = getServerEnv();
  const openRouterApiKey = env.OPENROUTER_API_KEY;

  const buildFallbackVisualizationSpecs = () => {
    const participantCount = Number(stats.participantCount || 0);
    const placements = Number(stats.placements || 0);
    const retentionRate = Number(stats.retention || 0);
    const retained = participantCount > 0 ? Math.max(0, Math.round((retentionRate / 100) * participantCount)) : 0;
    const targetRevenue = Number(stats.revenue || 0) * 1.25;

    const specs: VisualizationSpec[] = [
      {
        type: "icon_progression",
        title: "Participant Journey",
        subtitle: "From enrollment to placement milestones",
        annotations: [
          `${retentionRate}% retention rate`,
          `${placements} placements to date`,
        ],
        data: {
          started: participantCount,
          retained,
          placements,
        },
      },
      {
        type: "impact_equivalence",
        title: "Environmental Impact Translated",
        subtitle: "Real-world equivalents of material processed",
        annotations: ["Diverted e-waste from landfills", "Community-scale impact"],
        data: {
          weightProcessed: Number(stats.totalWeight || 0),
          revenue: Number(stats.revenue || 0),
        },
      },
      {
        type: "revenue_progress",
        title: "Revenue Progress Toward Sustainability",
        subtitle: "Program economics and momentum",
        annotations: ["Revenue supports wages and operations"],
        data: {
          revenue: Number(stats.revenue || 0),
          targetRevenue,
          participantCount,
        },
      },
    ];

    return specs;
  };

  const normalizeVisualizationSpecs = (input: unknown) => {
    if (!Array.isArray(input)) return null;
    const allowedTypes = new Set(["icon_progression", "impact_equivalence", "revenue_progress", "custom_infographic"]);
    const normalized = input
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const raw = item as Record<string, unknown>;
        if (typeof raw.type !== "string" || !allowedTypes.has(raw.type)) return null;
        if (typeof raw.title !== "string") return null;
        const data = typeof raw.data === "object" && raw.data !== null ? raw.data : {};
        return {
          type: raw.type as VisualizationSpec["type"],
          title: raw.title,
          subtitle: typeof raw.subtitle === "string" ? raw.subtitle : null,
          annotations: Array.isArray(raw.annotations)
            ? raw.annotations.filter((entry) => typeof entry === "string")
            : [],
          data: Object.entries(data as Record<string, unknown>).reduce<Record<string, number | string>>((acc, [key, value]) => {
            if (typeof value === "number" || typeof value === "string") acc[key] = value;
            return acc;
          }, {}),
        } satisfies VisualizationSpec;
      })
      .filter(Boolean) as VisualizationSpec[];

    return normalized.length > 0 ? normalized : null;
  };

  if (openRouterApiKey) {
    try {
      // Generate narrative if requested
      if (parsed.data.includeNarrative) {
        const narrativePrompt = `You are generating a grant-ready impact report narrative for Ransom Solutions Recycling Operations.

Report Type: ${parsed.data.reportType}
Date Range: ${parsed.data.startDate} to ${parsed.data.endDate}

Key Statistics:
- ${stats.participantCount} participants served
- ${stats.hours.toFixed(0)} hours of workforce training logged
- ${stats.totalWeight.toFixed(0)} lbs of materials processed
- $${stats.revenue.toFixed(0)} in revenue generated
- $${stats.laborCost.toFixed(0)} in wages paid (labor cost)
- $${stats.netValue.toFixed(0)} net program value
- ${stats.certifications} certifications earned
- ${stats.placements} participants reached placement/graduation milestones
- ${stats.retention}% retention rate

Top Performers: ${topPerformers.map((p) => `${p.name} ($${p.revenue.toFixed(2)})`).join(", ")}

Generate a compelling, professional narrative (3-4 paragraphs) that:
1. Highlights the connection between workforce development and environmental impact
2. Emphasizes measurable outcomes and program effectiveness
3. Demonstrates value to funders and stakeholders
4. Uses data-driven language while remaining accessible

Write only the narrative text, no markdown formatting.`;

        const narrativeResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openRouterApiKey}`,
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "Ransom Solutions Reports",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [{ role: "user", content: narrativePrompt }],
            temperature: 0.7,
          }),
        });

        if (narrativeResponse.ok) {
          const narrativeData = await narrativeResponse.json();
          narrative = narrativeData.choices?.[0]?.message?.content || null;
        }

        // Generate PDF-specific narrative
        const pdfNarrativePrompt = `You are generating a formal, document-ready version of an impact report for Ransom Solutions.
        
Report Data: ${JSON.stringify(stats)}

Your task is to rewrite the executive summary specifically for a formal PDF document. 
1. Use formal, professional language suitable for board members and major funders.
2. Structure it with clear headings if appropriate.
3. Focus on long-term sustainability and strategic impact.
4. Ensure it fits well on a printed page (concise but comprehensive).

Write only the text for the formal PDF version.`;

        const pdfResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openRouterApiKey}`,
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "Ransom Solutions Reports",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [{ role: "user", content: pdfNarrativePrompt }],
            temperature: 0.5,
          }),
        });

        if (pdfResponse.ok) {
          const pdfData = await pdfResponse.json();
          pdfNarrative = pdfData.choices?.[0]?.message?.content || null;
        }
      }

      // Generate participant stories if requested
      if (parsed.data.includeStories && topPerformers.length > 0) {
        const storiesPrompt = `Generate 2-3 brief participant success stories (2-3 sentences each) based on these top performers:

${topPerformers.map((p, i) => `${i + 1}. ${p.name} - Generated $${p.revenue.toFixed(2)} in revenue`).join("\n")}

Write engaging, human-centered stories that highlight individual achievements and growth. Use only the names provided. Write in a professional but warm tone suitable for grant reports.`;

        const storiesResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openRouterApiKey}`,
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "Ransom Solutions Reports",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [{ role: "user", content: storiesPrompt }],
            temperature: 0.8,
          }),
        });

        if (storiesResponse.ok) {
          const storiesData = await storiesResponse.json();
          stories = storiesData.choices?.[0]?.message?.content || null;
        }
      }

      if (parsed.data.includeCharts) {
        const visualizationPrompt = `You are a data visualization designer creating grant-ready impact report visuals.

REPORT DATA:
${JSON.stringify({
  reportType: parsed.data.reportType,
  stats,
  topPerformers,
})}

TASK:
Design a set of 3-4 visualizations that tell the story of impact.

Return ONLY valid JSON array. Each item must include:
- type: one of "icon_progression", "impact_equivalence", "revenue_progress", "custom_infographic"
- title: short headline
- subtitle: short supporting line
- annotations: array of short callouts
- data: key/value pairs needed to render (numbers where possible)

Focus on: participant journey, environmental impact, and financial sustainability.`;

        const visualizationResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openRouterApiKey}`,
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "Ransom Solutions Reports",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [{ role: "user", content: visualizationPrompt }],
            temperature: 0.4,
            response_format: { type: "json_object" },
          }),
        });

        if (visualizationResponse.ok) {
          const visualizationData = await visualizationResponse.json();
          const visualizationContent = visualizationData.choices?.[0]?.message?.content || null;
          if (visualizationContent) {
            try {
              const parsedVisuals = JSON.parse(visualizationContent);
              const rawArray = Array.isArray(parsedVisuals)
                ? parsedVisuals
                : Array.isArray(parsedVisuals.visualizations)
                  ? parsedVisuals.visualizations
                  : Array.isArray(parsedVisuals.data)
                    ? parsedVisuals.data
                    : null;
              visualizationSpecs = normalizeVisualizationSpecs(rawArray);
            } catch (parseError) {
              console.error("Error parsing visualization specs:", parseError);
            }
          }
        }

        if (!visualizationSpecs) {
          visualizationSpecs = buildFallbackVisualizationSpecs();
        }

        const chartsPrompt = `Generate chart configurations for a grant report. Create 3-4 optimized visualizations.

Data Available:
- Participant count: ${stats.participantCount}
- Phase breakdown: ${JSON.stringify(phaseBreakdown)}
- Total revenue: $${stats.revenue.toFixed(2)}
- Total hours: ${stats.hours.toFixed(0)}
- Materials processed: ${stats.totalWeight.toFixed(0)} lbs
- Certifications: ${stats.certifications}
- Placements: ${stats.placements}
- Retention rate: ${stats.retention}%
- Top performers: ${JSON.stringify(topPerformers)}

Return a JSON object with a "charts" array containing chart configurations. Each chart must have:
- type: "bar", "line", "pie", "area", or "donut"
- title: descriptive title
- description: brief explanation
- data: array of objects with "name" and "value" (numbers only, exclude zero values for pie/donut charts)
- xAxisKey: "name" (for bar/line/area)
- yAxisKey: "value" (for bar/line/area)

IMPORTANT RULES:
- For pie/donut charts: ONLY include data points with value > 0 to avoid visual issues
- Ensure all values in data arrays are positive numbers
- Use bar charts instead of pie charts when you have many categories or zero values
- For outcome/achievement charts, calculate percentages properly and only show meaningful segments

Example:
{
  "charts": [
    {
      "type": "bar",
      "title": "Participant Phase Distribution",
      "description": "Distribution across program phases",
      "data": [{"name": "Phase 0", "value": 10}, {"name": "Phase 1", "value": 8}],
      "xAxisKey": "name",
      "yAxisKey": "value"
    }
  ]
}

Create impactful visualizations. Return ONLY valid JSON.`;

        const chartsResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openRouterApiKey}`,
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "Ransom Solutions Reports",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [{ role: "user", content: chartsPrompt }],
            temperature: 0.6,
            response_format: { type: "json_object" },
          }),
        });

        if (chartsResponse.ok) {
          const chartsData = await chartsResponse.json();
          const chartsContent = chartsData.choices?.[0]?.message?.content || null;
          
          if (chartsContent) {
            try {
              // Try to parse as JSON object first (if wrapped)
              const parsedCharts = JSON.parse(chartsContent);
              // Handle if it's wrapped in a property
              if (parsedCharts.charts && Array.isArray(parsedCharts.charts)) {
                chartConfigurations = parsedCharts.charts;
              } else if (Array.isArray(parsedCharts)) {
                chartConfigurations = parsedCharts;
              } else if (parsedCharts.data && Array.isArray(parsedCharts.data)) {
                chartConfigurations = parsedCharts.data;
              } else {
                // Fallback: try to extract array from text
                const arrayMatch = chartsContent.match(/\[[\s\S]*\]/);
                if (arrayMatch) {
                  chartConfigurations = JSON.parse(arrayMatch[0]);
                }
              }
            } catch (parseError) {
              console.error("Error parsing chart configurations:", parseError);
              // Keep charts as text description if parsing fails
              charts = chartsContent;
            }
          }
        }
      }
    } catch (error) {
      console.error("Error generating AI content:", error);
      // Continue without AI content if generation fails
    }
  }

  if (parsed.data.includeCharts && !visualizationSpecs) {
    visualizationSpecs = buildFallbackVisualizationSpecs();
  }

  // Determine report title based on type
  const reportTitles: Record<string, string> = {
    production: "Production Summary Report",
    outcomes: "Participant Outcomes Report",
    environmental: "Environmental Impact Report",
    comprehensive: "Comprehensive Impact Report",
  };

  const title = `${reportTitles[parsed.data.reportType]} - ${new Date(parsed.data.startDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })} to ${new Date(parsed.data.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  // Save report to Firestore
  const reportRef = db.collection("reports").doc();
  const reportDataToSave = {
    title,
    reportType: parsed.data.reportType,
    startDate: parsed.data.startDate,
    endDate: parsed.data.endDate,
    stats,
    narrative: narrative || null,
    pdfNarrative: pdfNarrative || null,
    stories: stories || null,
    charts: charts || null,
    chartConfigurations: chartConfigurations || null,
    visualizationSpecs: visualizationSpecs || null,
    includeNarrative: parsed.data.includeNarrative,
    includeStories: parsed.data.includeStories,
    includeCharts: parsed.data.includeCharts,
    createdBy: profile.uid || null,
    generatedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await reportRef.set(reportDataToSave);

  return NextResponse.json({
    ok: true,
    reportId: reportRef.id,
    report: {
      id: reportRef.id,
      title,
      generatedAt: new Date().toISOString(),
      stats,
      narrative,
      pdfNarrative,
      stories,
      charts,
      chartConfigurations,
      visualizationSpecs,
      reportType: parsed.data.reportType,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      includeNarrative: parsed.data.includeNarrative,
      includeStories: parsed.data.includeStories,
      includeCharts: parsed.data.includeCharts,
    },
  });
};
