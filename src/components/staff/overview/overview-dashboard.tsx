"use client";

import { useState, useEffect } from "react";
import { DailyBrief } from "./daily-brief";
import { QuickStat } from "./quick-stats";
import { TodaySchedule } from "./today-schedule";
import { AtRiskList } from "./at-risk-list";
import { WeeklyTrends } from "./weekly-trends";
import { QuickActions } from "./quick-actions";
import type { DailyBriefData } from "@/lib/ops/daily-brief";

interface DashboardData {
  brief: string;
  metrics: {
    programHealth: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'CONCERNING';
    criticalAlerts: number;
    totalParticipants: number;
    weekRevenue: number;
    weeklyTarget: number;
    onTrackForTarget: boolean;
  };
  generatedAt: string;
  data: DailyBriefData;
}

export function OverviewDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBrief = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/daily-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: new Date().toISOString() }),
      });
      
      if (!response.ok) throw new Error("Failed to fetch");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let buffer = "";

      // Reset brief but keep data if we are regenerating? 
      // Actually, we should reset brief to show it's generating.
      // But we might want to keep the old data until new data arrives.
      // For now, let's just update as we go.
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.type === "data") {
              setData(prev => ({
                ...parsed,
                brief: prev?.brief || "" // Keep existing brief or empty if first load
              }));
              setLoading(false); // Data is loaded, now streaming text
            } else if (parsed.type === "chunk") {
              setData(prev => {
                if (!prev) return null;
                return {
                  ...prev,
                  brief: (prev.brief || "") + parsed.content
                };
              });
            }
          } catch (e) {
            console.error("Error parsing stream line", e);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch daily brief:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrief();
  }, []);

  const getHealthSubtext = (health: string) => {
    switch (health) {
      case 'EXCELLENT': return 'Above targets';
      case 'GOOD': return 'On track';
      case 'FAIR': return 'Needs attention';
      case 'CONCERNING': return 'Critical issues';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Section: Brief + Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Daily Brief */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="flex-1">
            <DailyBrief 
              brief={data?.brief || ""} 
              generatedAt={data?.generatedAt || new Date().toISOString()} 
              programHealth={data?.metrics.programHealth || "GOOD"} 
              loading={loading}
              onRegenerate={fetchBrief}
            />
          </div>
        </div>
        
        {/* Right: At Risk Only (to match height) */}
        <div className="flex flex-col">
          {data ? (
            <div className="flex-1">
              <AtRiskList participants={data.data.participants.atRisk} />
            </div>
          ) : (
            <div className="h-full rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickStat
            label="Participants"
            value={data.metrics.totalParticipants}
            sublabel="Active"
            link="/staff/participants"
          />
          <QuickStat
            label="Operations"
            value={data.metrics.programHealth}
            sublabel={getHealthSubtext(data.metrics.programHealth)}
            link="/staff/operations"
          />
          <QuickStat
            label="Revenue"
            value={`$${data.metrics.weekRevenue.toLocaleString()}`}
            sublabel={`${data.metrics.weeklyTarget ? 
              Math.round((data.metrics.weekRevenue / data.metrics.weeklyTarget) * 100) 
              : 0}% of target`}
            link="/staff/production"
          />
          <QuickStat
            label="Alerts"
            value={data.metrics.criticalAlerts}
            sublabel="Requiring attention"
            link="/staff/alerts"
            alert={data.metrics.criticalAlerts > 0}
          />
        </div>
      )}

      {/* Bottom Section: Trends & Actions & Schedule */}
      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Schedule */}
            <div className="lg:col-span-2">
              <TodaySchedule data={data.data.schedule} className="h-full" />
            </div>

            {/* Right Column: Quick Actions */}
            <div className="flex flex-col justify-center h-full">
               <QuickActions />
            </div>
          </div>
          
          {/* Weekly Trends (Full Width) */}
          <WeeklyTrends 
            revenueData={data.data.production.dailyBreakdown} 
            phaseData={data.data.participants.byPhase} 
          />
        </div>
      )}
    </div>
  );
}
