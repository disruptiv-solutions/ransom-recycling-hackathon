"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import { AIOverview } from "@/components/ops/ai-overview";
import { getStartOfWeek, getEndOfWeek } from "@/lib/ops/date";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type OverviewData = {
  overview: string;
  metrics: {
    total: number;
    atRisk: number;
    onTrack: number;
    watch: number;
    advancing: number;
  };
  participants: Array<{
    id: string;
    name: string;
    phase: number;
    status: string;
    attendanceRate: number;
    revenuePerHour: number;
    attendanceTrend: number;
    productivityTrend: number;
    laborCost: number;
    netValue: number;
    totalRevenue: number;
    netValuePerHour: number;
  }>;
  generatedAt: string;
};

export const IntelligentStaffDashboard = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [filters, setFilters] = useState({
    phase: "all",
    status: "active",
    dateRange: {
      start: getStartOfWeek().toISOString(),
      end: new Date().toISOString(),
    },
  });

  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/dashboard-overview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters }),
      });
      
      if (!response.ok) throw new Error("Failed to fetch");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let buffer = "";

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
                overview: "" // Clear overview on new data
              }));
              setLoading(false);
            } else if (parsed.type === "chunk") {
              setData(prev => {
                if (!prev) return null;
                return {
                  ...prev,
                  overview: (prev.overview || "") + parsed.content
                };
              });
            }
          } catch (e) {
            console.error("Error parsing stream line", e);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch dashboard overview:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      fetchOverview();
    }
  }, [isMounted, filters.phase, filters.status, filters.dateRange.start]);

  const handleDateRangeChange = (value: string) => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (value === "this-week") {
      start = getStartOfWeek(now);
      end = now;
    } else if (value === "last-week") {
      start = getStartOfWeek(now);
      start.setDate(start.getDate() - 7);
      end = getEndOfWeek(start);
    } else if (value === "this-month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = now;
    } else if (value === "last-30-days") {
      start = new Date(now);
      start.setDate(start.getDate() - 30);
      end = now;
    }

    setFilters((prev) => ({
      ...prev,
      dateRange: { start: start.toISOString(), end: end.toISOString() },
    }));
  };

  if (!isMounted) {
    return (
      <div className="flex flex-col gap-6">
        {/* Filters Skeleton */}
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-slate-900 md:flex-row">
          <div className="h-10 w-[180px] animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" />
          <div className="h-10 w-[180px] animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" />
          <div className="h-10 w-[180px] animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" />
        </div>

        {/* AI Overview Skeleton */}
        <div className="mb-6 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm dark:border-blue-900 dark:from-slate-900 dark:to-slate-800">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-5 w-5 animate-pulse rounded-full bg-blue-200" />
            <div className="h-6 w-48 animate-pulse rounded bg-blue-100" />
          </div>
          <div className="space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-blue-100/50" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-blue-100/50" />
            <div className="h-4 w-4/6 animate-pulse rounded bg-blue-100/50" />
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-slate-900 md:flex-row">
        <Select
          value={String(filters.phase)}
          onValueChange={(val) => setFilters({ ...filters, phase: val })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Phases" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Phases</SelectItem>
            <SelectItem value="0">Phase 0</SelectItem>
            <SelectItem value="1">Phase 1</SelectItem>
            <SelectItem value="2">Phase 2</SelectItem>
            <SelectItem value="3">Phase 3</SelectItem>
            <SelectItem value="4">Phase 4</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(val) => setFilters({ ...filters, status: val })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="staffing">Staffing</SelectItem>
            <SelectItem value="graduated">Graduated</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={handleDateRangeChange} defaultValue="this-week">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this-week">This Week</SelectItem>
            <SelectItem value="last-week">Last Week</SelectItem>
            <SelectItem value="this-month">This Month</SelectItem>
            <SelectItem value="last-30-days">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* AI Overview */}
      <AIOverview overview={data?.overview} loading={loading} onRegenerate={fetchOverview} title={`AI Overview: ${filters.phase !== "all" ? `Phase ${filters.phase}` : "All Phases"}`} />

      {/* Quick Stats */}
      {data && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="At Risk" value={data.metrics.atRisk} color="red" icon="🔴" />
          <StatCard label="Watch" value={data.metrics.watch} color="amber" icon="🟡" />
          <StatCard label="On Track" value={data.metrics.onTrack} color="green" icon="🟢" />
          <StatCard label="Advancing" value={data.metrics.advancing} color="purple" icon="⭐" />
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-slate-900">
        <Button className="rounded-xl font-bold">+ Log Work</Button>
        <Button className="rounded-xl font-bold">+ Log Production</Button>
        <Button variant="outline" className="rounded-xl font-bold">View Alerts (3)</Button>
      </div>

      {/* Participant List */}
      <Card className="overflow-hidden rounded-2xl border-none shadow-sm">
        <div className="border-b border-slate-100 bg-white p-4 dark:bg-slate-900">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Participants ({data?.metrics.total ?? 0})
          </h3>
        </div>
        <div className="overflow-x-auto bg-white dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3 font-bold tracking-wider">Name</th>
                <th className="px-6 py-3 font-bold tracking-wider">Phase</th>
                <th className="px-6 py-3 font-bold tracking-wider">Attendance</th>
                <th className="px-6 py-3 font-bold tracking-wider">Wages Earned</th>
                <th className="px-6 py-3 font-bold tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data?.participants.map((p) => (
                <ParticipantRow key={p.id} participant={p} />
              ))}
              {(!data?.participants || data.participants.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    {loading ? "Loading participants..." : "No participants found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// Sub-components

function StatCard({ label, value, color, icon }: { label: string; value: number; color: "red" | "green" | "purple" | "blue" | "amber"; icon: string }) {
  const colorStyles = {
    red: "bg-red-50 border-red-100 text-red-900 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-100",
    green: "bg-emerald-50 border-emerald-100 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-900/50 dark:text-emerald-100",
    purple: "bg-purple-50 border-purple-100 text-purple-900 dark:bg-purple-900/20 dark:border-purple-900/50 dark:text-purple-100",
    blue: "bg-blue-50 border-blue-100 text-blue-900 dark:bg-blue-900/20 dark:border-blue-900/50 dark:text-blue-100",
    amber: "bg-amber-50 border-amber-100 text-amber-900 dark:bg-amber-900/20 dark:border-amber-900/50 dark:text-amber-100",
  };

  return (
    <div className={`rounded-2xl border p-4 ${colorStyles[color]}`}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xl">{icon}</span>
        <span className="text-3xl font-black">{value}</span>
      </div>
      <div className="text-xs font-bold uppercase tracking-wider opacity-80">{label}</div>
    </div>
  );
}

function ParticipantRow({ participant }: { participant: any }) {
  const router = useRouter();
  const statusColors: Record<string, string> = {
    "At Risk": "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200",
    "Watch": "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
    "On Track": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
    "Advancing": "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200",
  };

  const handleRowClick = () => {
    router.push(`/participants/${participant.id}`);
  };

  const handleRowKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    handleRowClick();
  };

  return (
    <tr
      className="cursor-pointer transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 dark:hover:bg-slate-800/50"
      onClick={handleRowClick}
      onKeyDown={handleRowKeyDown}
      role="link"
      tabIndex={0}
      aria-label={`View ${participant.name}`}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 dark:text-slate-100">{participant.name}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">Phase {participant.phase}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className={`font-bold ${participant.attendanceRate < 80 ? "text-red-600" : "text-emerald-600"}`}>
            {participant.attendanceRate}%
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 dark:text-slate-100">
            ${participant.laborCost.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400">
            Rev: ${participant.totalRevenue?.toLocaleString() ?? 0}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${statusColors[participant.status] || "bg-slate-100 text-slate-800"}`}>
          {participant.status}
        </span>
      </td>
    </tr>
  );
}
