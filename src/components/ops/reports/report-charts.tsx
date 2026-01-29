"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import type { ChartConfiguration } from "@/lib/ops/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ReportChartsProps = {
  chartConfigurations: ChartConfiguration[];
};

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

export const ReportCharts = ({ chartConfigurations }: ReportChartsProps) => {
  const renderChart = (config: ChartConfiguration, index: number) => {
    const colors = config.colors || COLORS;

    switch (config.type) {
      case "bar":
        return (
          <Card key={index} className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">{config.title}</CardTitle>
              <p className="mt-1 text-sm text-slate-600">{config.description}</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={config.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={config.xAxisKey || "name"} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={config.yAxisKey || "value"} fill={colors[0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );

      case "line":
        return (
          <Card key={index} className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">{config.title}</CardTitle>
              <p className="mt-1 text-sm text-slate-600">{config.description}</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={config.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={config.xAxisKey || "name"} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey={config.yAxisKey || "value"} stroke={colors[0]} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );

      case "pie":
        // Filter out zero values and calculate total for percentage
        const pieData = config.data.filter((item) => {
          const value = typeof item.value === "number" ? item.value : Number(item.value) || 0;
          return value > 0;
        });
        const totalValue = pieData.reduce((sum, item) => {
          const value = typeof item.value === "number" ? item.value : Number(item.value) || 0;
          return sum + value;
        }, 0);

        return (
          <Card key={index} className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">{config.title}</CardTitle>
              <p className="mt-1 text-sm text-slate-600">{config.description}</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, value }) => {
                      const percent = totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : "0";
                      // Only show label if slice is > 5% to avoid overlap
                      return Number(percent) > 5 ? `${name}: ${percent}%` : "";
                    }}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey={config.yAxisKey || "value"}
                  >
                    {pieData.map((_entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => {
                      const percent = totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : "0";
                      return [`${value} (${percent}%)`, "Value"];
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value, entry) => {
                      const dataItem = pieData.find((d) => d.name === value);
                      if (dataItem) {
                        const itemValue = typeof dataItem.value === "number" ? dataItem.value : Number(dataItem.value) || 0;
                        const percent = totalValue > 0 ? ((itemValue / totalValue) * 100).toFixed(1) : "0";
                        return `${value}: ${percent}%`;
                      }
                      return value;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );

      case "donut":
        // Filter out zero values and calculate total for percentage
        const donutData = config.data.filter((item) => {
          const value = typeof item.value === "number" ? item.value : Number(item.value) || 0;
          return value > 0;
        });
        const donutTotalValue = donutData.reduce((sum, item) => {
          const value = typeof item.value === "number" ? item.value : Number(item.value) || 0;
          return sum + value;
        }, 0);

        return (
          <Card key={index} className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">{config.title}</CardTitle>
              <p className="mt-1 text-sm text-slate-600">{config.description}</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, value }) => {
                      const percent = donutTotalValue > 0 ? ((value / donutTotalValue) * 100).toFixed(1) : "0";
                      // Only show label if slice is > 5% to avoid overlap
                      return Number(percent) > 5 ? `${name}: ${percent}%` : "";
                    }}
                    outerRadius={100}
                    innerRadius={50}
                    fill="#8884d8"
                    dataKey={config.yAxisKey || "value"}
                  >
                    {donutData.map((_entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => {
                      const percent = donutTotalValue > 0 ? ((value / donutTotalValue) * 100).toFixed(1) : "0";
                      return [`${value} (${percent}%)`, "Value"];
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value, entry) => {
                      const dataItem = donutData.find((d) => d.name === value);
                      if (dataItem) {
                        const itemValue = typeof dataItem.value === "number" ? dataItem.value : Number(dataItem.value) || 0;
                        const percent = donutTotalValue > 0 ? ((itemValue / donutTotalValue) * 100).toFixed(1) : "0";
                        return `${value}: ${percent}%`;
                      }
                      return value;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );

      case "area":
        return (
          <Card key={index} className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">{config.title}</CardTitle>
              <p className="mt-1 text-sm text-slate-600">{config.description}</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={config.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={config.xAxisKey || "name"} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey={config.yAxisKey || "value"}
                    stroke={colors[0]}
                    fill={colors[0]}
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  if (!chartConfigurations || chartConfigurations.length === 0) {
    return (
      <Card className="border-slate-200">
        <CardContent className="py-12 text-center">
          <p className="text-sm text-slate-500">No charts available for this report.</p>
        </CardContent>
      </Card>
    );
  }

  return <div className="space-y-6">{chartConfigurations.map((config, index) => renderChart(config, index))}</div>;
};
