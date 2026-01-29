"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, FileText } from "lucide-react";

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
  const router = useRouter();
  const [reportType, setReportType] = useState("comprehensive");
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [includeNarrative, setIncludeNarrative] = useState(true);
  const [includeStories, setIncludeStories] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<ReportResult[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      const res = await fetch("/api/reports");
      const data = await res.json();
      if (res.ok && data.ok) {
        setReports(data.reports || []);
      }
      setLoadingReports(false);
    };
    fetchReports();
  }, []);

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
    if (res.ok && data.ok && data.reportId) {
      router.push(`/reports/${data.reportId}`);
    }
    setLoading(false);
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;

    const res = await fetch(`/api/reports/${reportId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    }
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

        <Card className="border-slate-200 flex flex-col h-[calc(100vh-220px)]">
          <CardHeader className="shrink-0">
            <CardTitle className="text-lg">Past Reports</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto min-h-0 pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {loadingReports ? (
              <p className="text-sm text-slate-500">Loading reports...</p>
            ) : reports.length === 0 ? (
              <p className="text-sm text-slate-500">No reports generated yet. Generate your first report to get started.</p>
            ) : (
              <div className="space-y-3 pb-4">
                {reports.map((report) => {
                  const generatedAt = report.generatedAt || new Date().toISOString();
                  const reportTypeLabel =
                    report.reportType === "production"
                      ? "Production"
                      : report.reportType === "outcomes"
                        ? "Outcomes"
                        : report.reportType === "environmental"
                          ? "Environmental"
                          : "Comprehensive";
                  return (
                    <div
                      key={report.id}
                      className="group flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <FileText className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => report.id && router.push(`/reports/${report.id}`)}
                            className="text-left w-full"
                          >
                            <p className="font-semibold text-slate-900 truncate">{report.title}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {formatDisplayDate(generatedAt)} • {reportTypeLabel}
                            </p>
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => report.id && handleDelete(report.id)}
                        className="ml-3 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors shrink-0"
                        aria-label="Delete report"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
