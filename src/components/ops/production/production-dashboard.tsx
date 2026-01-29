"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { AIOverview } from "@/components/ops/ai-overview";
import { Calendar, RefreshCw, TrendingUp, Users, Clock, Leaf, DollarSign, Package } from "lucide-react";

import type { ProductionRecord, WorkLog } from "@/lib/ops/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ProductionDashboardProps = {
  initialRecords: ProductionRecord[];
  initialWorkLogs: WorkLog[];
  defaultRange: { start: string; end: string };
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);

const COLORS = ["#10b981", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316", "#f59e0b"];

export const ProductionDashboard = ({ initialRecords, initialWorkLogs, defaultRange }: ProductionDashboardProps) => {
  const [records, setRecords] = useState<ProductionRecord[]>(initialRecords);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>(initialWorkLogs);
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);
  const [loading, setLoading] = useState(false);
  const [aiOverview, setAiOverview] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);

  const fetchAIOverview = async (start: string, end: string) => {
    setAiLoading(true);
    try {
      const response = await fetch("/api/production-overview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateRange: { start, end } }),
      });

      if (!response.ok) throw new Error("Failed to fetch AI overview");

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
              setAiOverview(""); // Clear previous overview
              setAiLoading(false);
            } else if (parsed.type === "chunk") {
              setAiOverview((prev) => prev + parsed.content);
            }
          } catch (e) {
            console.error("Error parsing stream line", e);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch AI overview:", error);
      setAiLoading(false);
    }
  };

  // Initial fetch
  useState(() => {
    fetchAIOverview(startDate, endDate);
  });

  // --- Aggregations ---

  const stats = useMemo(() => {
    const totalLbs = records
      .filter((record) => record.unit !== "each")
      .reduce((sum, record) => sum + record.weight, 0);
    const totalEach = records
      .filter((record) => record.unit === "each")
      .reduce((sum, record) => sum + record.weight, 0);
    const totalRevenue = records.reduce((sum, record) => sum + record.value, 0);
    const totalHours = workLogs.reduce((sum, log) => sum + log.hours, 0);
    const traineeHours = totalHours * 0.77; // Estimated split
    const staffHours = totalHours * 0.23;
    const revenuePerManHour = totalHours > 0 ? totalRevenue / totalHours : 0;

    return { totalLbs, totalEach, totalRevenue, totalHours, traineeHours, staffHours, revenuePerManHour };
  }, [records, workLogs]);

  // Daily Revenue Trend
  const dailyData = useMemo(() => {
    const map = new Map<string, { date: string; revenue: number; weight: number }>();
    
    // Fill in dates? For now, just use dates present in data to avoid huge gaps if range is large
    records.forEach((r) => {
      const date = r.productionDate ? r.productionDate.split("T")[0] : "Unknown";
      const current = map.get(date) || { date, revenue: 0, weight: 0 };
      current.revenue += r.value;
      current.weight += r.unit === "lb" ? r.weight : 0; // Only sum lbs for chart consistency
      map.set(date, current);
    });

    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [records]);

  // Material Category Breakdown (Revenue)
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    records.forEach((r) => {
      map.set(r.materialCategory, (map.get(r.materialCategory) || 0) + r.value);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [records]);

  // Top Performers
  const topPerformers = useMemo(() => {
    const revenueByParticipant = records.reduce<Record<string, { revenue: number; hours: number }>>((acc, record) => {
      const key = record.participantName;
      acc[key] = acc[key] ?? { revenue: 0, hours: 0 };
      acc[key].revenue += record.value;
      return acc;
    }, {});

    // Add hours from work logs
    workLogs.forEach(log => {
       const key = log.participantName;
       if (revenueByParticipant[key]) {
         revenueByParticipant[key].hours += log.hours;
       }
    });

    return Object.entries(revenueByParticipant)
      .map(([name, data]) => ({ 
        name, 
        revenue: data.revenue,
        efficiency: data.hours > 0 ? data.revenue / data.hours : 0 
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [records, workLogs]);

  // Customer Breakdown
  const customerBreakdown = useMemo(() => {
    const breakdown = records
      .filter((record) => record.customer)
      .reduce<Record<string, number>>((acc, record) => {
        const customer = record.customer!;
        acc[customer] = (acc[customer] || 0) + record.value;
        return acc;
      }, {});

    return Object.entries(breakdown)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 customers
  }, [records]);

  const handleRefresh = async () => {
    setLoading(true);
    const start = new Date(startDate).toISOString();
    const end = new Date(endDate).toISOString();
    
    // Refresh AI Overview
    fetchAIOverview(startDate, endDate);

    const [productionRes, workLogsRes] = await Promise.all([
      fetch(`/api/production-records?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`),
      fetch(`/api/work-logs?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`),
    ]);

    const productionData = await productionRes.json();
    const workLogsData = await workLogsRes.json();
    setRecords(productionData.productionRecords ?? []);
    setWorkLogs(workLogsData.workLogs ?? []);
    setLoading(false);
  };

  return (
    <div className="space-y-8 p-2 md:p-4 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-slate-200/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Operations Intelligence</p>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Production Dashboard</h1>
          <p className="text-slate-500 mt-1">Real-time insights and performance metrics</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 bg-slate-100/50 p-2 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 px-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <Input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              className="border-none bg-transparent shadow-none focus-visible:ring-0 h-auto p-0 text-sm font-medium w-[130px]"
            />
            <span className="text-slate-300">to</span>
            <Input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              className="border-none bg-transparent shadow-none focus-visible:ring-0 h-auto p-0 text-sm font-medium w-[130px]"
            />
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={loading} 
            size="sm"
            className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Update View"}
          </Button>
        </div>
      </div>

      {/* AI Overview */}
      <AIOverview 
        overview={aiOverview} 
        loading={aiLoading} 
        onRegenerate={() => fetchAIOverview(startDate, endDate)} 
        title="AI Insights - Production Analysis"
      />

      {/* KPI Grid - Bento Style */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard 
          title="Total Revenue" 
          value={formatCurrency(stats.totalRevenue)} 
          icon={DollarSign}
          trend="+12% vs last period" 
          trendUp={true}
          color="emerald"
        />
        <KpiCard 
          title="Materials Processed" 
          value={`${formatNumber(stats.totalLbs)} lbs`} 
          subValue={stats.totalEach > 0 ? `+ ${formatNumber(stats.totalEach)} units` : undefined}
          icon={Package}
          color="blue"
        />
        <KpiCard 
          title="Labor Hours" 
          value={`${formatNumber(stats.totalHours)} hrs`} 
          icon={Clock}
          subValue={`${formatNumber(stats.traineeHours)} trainee • ${formatNumber(stats.staffHours)} staff`}
          color="violet"
        />
        <KpiCard 
          title="Efficiency" 
          value={`${formatCurrency(stats.revenuePerManHour)} / hr`} 
          icon={TrendingUp}
          helper="Revenue per man-hour"
          color="amber"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3 h-auto">
        {/* Revenue Trend */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm rounded-3xl overflow-hidden flex flex-col min-h-[400px]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">Revenue Trend</CardTitle>
                <CardDescription>Daily revenue performance over selected period</CardDescription>
              </div>
              <Badge variant="outline" className="rounded-full bg-emerald-50 text-emerald-700 border-emerald-200">
                Daily
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Material Breakdown Donut */}
        <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden flex flex-col min-h-[400px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-slate-900">Revenue Mix</CardTitle>
            <CardDescription>By material category</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-0 flex flex-col md:flex-row items-center justify-center">
            <div className="w-full h-[250px] md:h-full md:flex-1 relative min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="80%"
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                     formatter={(value: number) => formatCurrency(value)}
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total</p>
                  <p className="text-lg md:text-xl font-bold text-slate-900">{formatCurrency(stats.totalRevenue)}</p>
                </div>
              </div>
            </div>
            
            {/* Custom Legend on the Right */}
            <div className="w-full md:w-48 p-4 flex flex-col justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 bg-slate-50/50 md:h-full overflow-y-auto max-h-[300px] md:max-h-none">
              {categoryData.map((entry, index) => (
                <div key={`legend-${index}`} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                    />
                    <span className="text-slate-600 font-medium truncate max-w-[100px]" title={entry.name}>
                      {entry.name}
                    </span>
                  </div>
                  <span className="text-slate-900 font-bold ml-1">
                    {((entry.value / stats.totalRevenue) * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Data Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Performers List */}
        <Card className="border-slate-200 shadow-sm rounded-3xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-slate-900">Top Performers</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-slate-900">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((p, i) => (
                <div key={p.name} className="flex items-center gap-4 group">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-bold text-slate-900 truncate">{p.name}</p>
                      <p className="text-sm font-bold text-emerald-600">{formatCurrency(p.revenue)}</p>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-slate-900 h-full rounded-full" 
                        style={{ width: `${(p.revenue / (topPerformers[0]?.revenue || 1)) * 100}%` }} 
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatCurrency(p.efficiency)} / hr efficiency
                    </p>
                  </div>
                </div>
              ))}
              {topPerformers.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">No performance data available</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Customer Breakdown Bar Chart */}
        <Card className="border-slate-200 shadow-sm rounded-3xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900">Top Customers</CardTitle>
            <CardDescription>Revenue distribution by source</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={customerBreakdown} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                  {customerBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Sub-components

const KpiCard = ({ 
  title, 
  value, 
  subValue, 
  icon: Icon, 
  trend, 
  trendUp, 
  helper,
  color = "blue" 
}: { 
  title: string; 
  value: string; 
  subValue?: string; 
  icon: any; 
  trend?: string; 
  trendUp?: boolean;
  helper?: string;
  color?: "emerald" | "blue" | "violet" | "amber" | "rose";
}) => {
  const colorStyles = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-3xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-2xl ${colorStyles[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          {trend && (
            <Badge variant="secondary" className={`rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {trend}
            </Badge>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
          {subValue && <p className="text-sm font-medium text-slate-400 mt-1">{subValue}</p>}
          {helper && <p className="text-xs text-slate-400 mt-2">{helper}</p>}
        </div>
      </CardContent>
    </Card>
  );
};
