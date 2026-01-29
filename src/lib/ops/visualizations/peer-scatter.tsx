"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from "recharts";

type PeerData = {
  name: string;
  attendance: number;
  productivity: number;
  isCurrent?: boolean;
};

type PeerScatterPlotProps = {
  data: PeerData[];
  currentParticipantName: string;
};

export const PeerScatterPlot = ({ data, currentParticipantName }: PeerScatterPlotProps) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            type="number" 
            dataKey="attendance" 
            name="Attendance" 
            unit="%" 
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }}
            axisLine={{ stroke: '#e2e8f0' }}
          />
          <YAxis 
            type="number" 
            dataKey="productivity" 
            name="Productivity" 
            unit="/hr" 
            domain={[0, 'auto']}
            tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }}
            axisLine={{ stroke: '#e2e8f0' }}
          />
          <ZAxis type="number" range={[100, 100]} />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                    <p className="text-sm font-bold text-slate-900">{data.name}</p>
                    <p className="text-xs font-semibold text-slate-500">Attendance: {data.attendance}%</p>
                    <p className="text-xs font-semibold text-slate-500">Productivity: ${data.productivity.toFixed(2)}/hr</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <ReferenceLine x={85} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'Goal', position: 'insideTopRight', fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
          <ReferenceLine y={8} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: '$8/hr', position: 'insideBottomLeft', fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
          <Scatter name="Cohort" data={data}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.isCurrent ? "#ef4444" : "#3b82f6"} 
                stroke={entry.isCurrent ? "#ffffff" : "none"}
                strokeWidth={2}
                r={entry.isCurrent ? 8 : 6}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
