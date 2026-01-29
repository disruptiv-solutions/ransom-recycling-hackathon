"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell 
} from "recharts";

interface TrendsProps {
  revenueData: { date: string; revenue: number }[];
  phaseData: Record<number, number>;
}

const COLORS = ["#94a3b8", "#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8"];

export function WeeklyTrends({ revenueData, phaseData }: TrendsProps) {
  const pieData = Object.entries(phaseData).map(([phase, count]) => ({
    name: `Phase ${phase}`,
    value: count
  }));

  // Format date for chart
  const formattedRevenueData = revenueData.map(d => ({
    ...d,
    day: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Trend */}
      <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Weekly Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedRevenueData}>
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#94a3b8' }} 
                dy={10}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => [`$${value || 0}`, 'Revenue']}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Phase Distribution */}
      <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Phase Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                 contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 ml-4">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-slate-600 dark:text-slate-400">{entry.name}: <span className="font-bold text-slate-900 dark:text-slate-100">{entry.value}</span></span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
