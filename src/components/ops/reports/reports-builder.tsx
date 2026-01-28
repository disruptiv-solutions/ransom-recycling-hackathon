"use client";

import { useState } from "react";

import type { ReportResult } from "@/lib/ops/types";
import { formatDisplayDate } from "@/lib/ops/date";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const reportTypes = [
  { value: "production", label: "Production Summary" },
  { value: "outcomes", label: "Participant Outcomes" },
  { value: "environmental", label: "Environmental Impact" },
  { value: "comprehensive", label: "Comprehensive Impact Report" },
];

export const ReportsBuilder = () => {
  const [reportType, setReportType] = useState("comprehensive");
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [includeNarrative, setIncludeNarrative] = useState(true);
  const [includeStories, setIncludeStories] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ReportResult | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        reportType,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        includeNarrative,
        includeStories,
        includeCharts,
      }),
    });

    const data = await res.json();
    if (res.ok && data.ok) {
      setReport(data.report);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Reports & Export</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Grant-Ready Impact Reports</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Report Builder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Report Type</label>
              <div className="mt-2 space-y-2">
                {reportTypes.map((type) => (
                  <label key={type.value} className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="radio"
                      name="reportType"
                      checked={reportType === type.value}
                      onChange={() => setReportType(type.value)}
                    />
                    {type.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">Start Date</label>
                <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">End Date</label>
                <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Options</label>
              <div className="mt-2 space-y-2 text-sm text-slate-600">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={includeNarrative} onChange={() => setIncludeNarrative(!includeNarrative)} />
                  Include AI-generated narrative
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={includeStories} onChange={() => setIncludeStories(!includeStories)} />
                  Include participant stories
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={includeCharts} onChange={() => setIncludeCharts(!includeCharts)} />
                  Include charts and graphs
                </label>
              </div>
            </div>

            <Button onClick={handleGenerate} disabled={loading} aria-label="Generate report">
              {loading ? "Generating..." : "Generate Report"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Report Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!report ? (
              <p className="text-sm text-slate-500">Generate a report to preview the output.</p>
            ) : (
              <div className="space-y-4 text-sm text-slate-700">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{report.title}</p>
                  <p className="text-xs text-slate-500">Generated {formatDisplayDate(report.generatedAt)}</p>
                </div>
                <div className="space-y-2">
                  {Object.entries(report.stats).map(([key, value]) => {
                    const displayValue =
                      typeof value === "object" && value !== null ? JSON.stringify(value) : String(value);
                    return (
                    <div key={key} className="flex items-center justify-between border-b border-slate-100 py-2">
                      <span className="capitalize">{key.replace(/_/g, " ")}</span>
                      <span className="font-semibold text-slate-900">{displayValue}</span>
                    </div>
                  )})}
                </div>
                {report.narrative ? (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700 whitespace-pre-line">
                    {report.narrative}
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline">Download PDF</Button>
                  <Button variant="outline">Copy to Clipboard</Button>
                  <Button variant="outline">Email Report</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
