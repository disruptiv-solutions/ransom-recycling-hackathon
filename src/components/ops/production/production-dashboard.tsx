"use client";

import { useMemo, useState } from "react";

import type { ProductionRecord, WorkLog } from "@/lib/ops/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ProductionDashboardProps = {
  initialRecords: ProductionRecord[];
  initialWorkLogs: WorkLog[];
  defaultRange: { start: string; end: string };
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export const ProductionDashboard = ({ initialRecords, initialWorkLogs, defaultRange }: ProductionDashboardProps) => {
  const [records, setRecords] = useState<ProductionRecord[]>(initialRecords);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>(initialWorkLogs);
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);
  const [loading, setLoading] = useState(false);

  const stats = useMemo(() => {
    const totalWeight = records.reduce((sum, record) => sum + record.weight, 0);
    const totalRevenue = records.reduce((sum, record) => sum + record.value, 0);
    const totalHours = workLogs.reduce((sum, log) => sum + log.hours, 0);
    const traineeHours = totalHours * 0.77;
    const staffHours = totalHours * 0.23;
    return { totalWeight, totalRevenue, totalHours, traineeHours, staffHours };
  }, [records, workLogs]);

  const materialBreakdown = useMemo(() => {
    return records.reduce<Record<string, { weight: number; value: number }>>((acc, record) => {
      const key = `${record.materialCategory} - ${record.materialType}`;
      acc[key] = acc[key] ?? { weight: 0, value: 0 };
      acc[key].weight += record.weight;
      acc[key].value += record.value;
      return acc;
    }, {});
  }, [records]);

  const topPerformers = useMemo(() => {
    const revenueByParticipant = records.reduce<Record<string, number>>((acc, record) => {
      const key = record.participantName;
      acc[key] = (acc[key] ?? 0) + record.value;
      return acc;
    }, {});

    return Object.entries(revenueByParticipant)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [records]);

  const handleRefresh = async () => {
    setLoading(true);
    const start = new Date(startDate).toISOString();
    const end = new Date(endDate).toISOString();
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Production Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Recycling Output Overview</h1>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">Start</label>
            <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">End</label>
            <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </div>
          <Button onClick={handleRefresh} disabled={loading} aria-label="Update date range">
            {loading ? "Loading..." : "Update"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Materials Processed" value={`${stats.totalWeight.toFixed(0)} lbs`} helper="Total weight" />
        <MetricCard label="Revenue Generated" value={formatCurrency(stats.totalRevenue)} helper="Total revenue" />
        <MetricCard label="Env. Impact" value={`${stats.totalWeight.toFixed(0)} lbs`} helper="Lbs diverted" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Labor Hours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-3xl font-semibold text-slate-900">{stats.totalHours.toFixed(0)} hours</p>
            <div className="text-sm text-slate-500">
              Trainee: {stats.traineeHours.toFixed(0)} • Staff: {stats.staffHours.toFixed(0)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Material Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(materialBreakdown).length === 0 ? (
              <p className="text-sm text-slate-500">No materials logged in this range.</p>
            ) : (
              Object.entries(materialBreakdown).map(([label, values]) => (
                <div key={label} className="flex items-center justify-between text-sm text-slate-600">
                  <span>{label}</span>
                  <span>
                    {values.weight.toFixed(0)} lbs • {formatCurrency(values.value)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Top Performers (Revenue)</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">Participant</th>
                  <th className="py-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topPerformers.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-6 text-center text-sm text-slate-500">
                      No production recorded.
                    </td>
                  </tr>
                ) : (
                  topPerformers.map((performer) => (
                    <tr key={performer.name} className="border-t border-slate-100">
                      <td className="py-3">{performer.name}</td>
                      <td className="py-3 text-right">{formatCurrency(performer.revenue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Material Breakdown Table</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(materialBreakdown).length === 0 ? (
              <p className="text-sm text-slate-500">No materials logged.</p>
            ) : (
              Object.entries(materialBreakdown).map(([label, values]) => (
                <div key={label} className="rounded-lg border border-slate-100 p-3 text-sm">
                  <p className="font-semibold text-slate-900">{label}</p>
                  <p className="text-slate-500">
                    {values.weight.toFixed(0)} lbs • {formatCurrency(values.value)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, helper }: { label: string; value: string; helper: string }) => (
  <Card className="border-slate-200">
    <CardContent className="p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </CardContent>
  </Card>
);
