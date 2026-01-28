"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import type { Certification, Participant, ReadinessAssessment, WorkLog } from "@/lib/ops/types";
import { formatDisplayDate, formatShortDate } from "@/lib/ops/date";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ParticipantForm } from "@/components/ops/participants/participant-form";

type ParticipantProfileProps = {
  participant: Participant;
  metrics: {
    totalHours: number;
    attendanceRate: number;
    totalRevenue: number;
    revenuePerHour: number;
    daysInPhase: number;
  };
  breakdownRows: { label: string; weight: number; value: number }[];
  workLogs: WorkLog[];
  certifications: Certification[];
  assessment: ReadinessAssessment | null;
};

const statusColors: Record<string, string> = {
  ready: "bg-green-100 text-green-700",
  watch: "bg-yellow-100 text-yellow-700",
  not_ready: "bg-red-100 text-red-700",
};

export const ParticipantProfile = ({
  participant,
  metrics,
  breakdownRows,
  workLogs,
  certifications,
  assessment: initialAssessment,
}: ParticipantProfileProps) => {
  const [assessment, setAssessment] = useState<ReadinessAssessment | null>(initialAssessment);
  const [certs, setCerts] = useState<Certification[]>(certifications);
  const [loadingAssessment, setLoadingAssessment] = useState(false);
  const [certForm, setCertForm] = useState({
    certType: "",
    earnedDate: new Date().toISOString().slice(0, 10),
    expirationDate: "",
  });

  const progressPercent = useMemo(() => Math.min(100, Math.round((metrics.daysInPhase / 90) * 100)), [metrics.daysInPhase]);

  const handleGenerateAssessment = async () => {
    setLoadingAssessment(true);
    const res = await fetch("/api/readiness", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ participantId: participant.id, metrics }),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      setAssessment(data.assessment);
    }
    setLoadingAssessment(false);
  };

  const handleAddCertification = async () => {
    const res = await fetch("/api/certifications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        participantId: participant.id,
        certType: certForm.certType,
        earnedDate: new Date(certForm.earnedDate).toISOString(),
        expirationDate: certForm.expirationDate ? new Date(certForm.expirationDate).toISOString() : null,
      }),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      setCerts((prev) => [
        {
          id: data.id,
          participantId: participant.id,
          certType: certForm.certType,
          earnedDate: certForm.earnedDate,
          expirationDate: certForm.expirationDate || null,
        },
        ...prev,
      ]);
      setCertForm({ certType: "", earnedDate: new Date().toISOString().slice(0, 10), expirationDate: "" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Link href="/participants" className="text-sm font-semibold text-slate-500 hover:text-slate-700">
            ← Back to Participants
          </Link>
          <h1 className="text-3xl font-semibold text-slate-900">{participant.name}</h1>
          <p className="text-sm text-slate-500">
            Phase {participant.currentPhase} • Day {metrics.daysInPhase}/90 • Entry{" "}
            {participant.entryDate ? formatShortDate(participant.entryDate) : "—"}
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Edit Participant</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Edit Participant</DialogTitle>
            </DialogHeader>
            <ParticipantForm
              participantId={participant.id}
              initialValues={{
                name: participant.name,
                email: participant.email ?? "",
                phone: participant.phone ?? "",
                entryDate: participant.entryDate,
                currentPhase: participant.currentPhase,
                categories: participant.categories,
                status: participant.status,
              }}
              onSuccess={() => window.location.reload()}
              redirectPath={`/participants/${participant.id}`}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-slate-200">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Phase Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-slate-900" style={{ width: `${progressPercent}%` }} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total Hours" value={metrics.totalHours.toFixed(0)} helper="Last 30 days" />
        <MetricCard label="Attendance" value={`${metrics.attendanceRate}%`} helper="Expected days" />
        <MetricCard label="Revenue" value={`$${metrics.totalRevenue.toFixed(0)}`} helper={`$${metrics.revenuePerHour}/hr`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Production Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">Material Type</th>
                  <th className="py-2">Weight</th>
                  <th className="py-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {breakdownRows.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-sm text-slate-500">
                      No production data available.
                    </td>
                  </tr>
                ) : (
                  breakdownRows.map((row) => (
                    <tr key={row.label} className="border-t border-slate-100">
                      <td className="py-3">{row.label}</td>
                      <td className="py-3">{row.weight.toFixed(1)} lbs</td>
                      <td className="py-3">${row.value.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Certifications</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">+ Add</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Certification</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Certification</label>
                    <Input
                      className="mt-2"
                      value={certForm.certType}
                      onChange={(event) => setCertForm((prev) => ({ ...prev, certType: event.target.value }))}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Earned Date</label>
                      <Input
                        className="mt-2"
                        type="date"
                        value={certForm.earnedDate}
                        onChange={(event) => setCertForm((prev) => ({ ...prev, earnedDate: event.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Expiration Date</label>
                      <Input
                        className="mt-2"
                        type="date"
                        value={certForm.expirationDate}
                        onChange={(event) => setCertForm((prev) => ({ ...prev, expirationDate: event.target.value }))}
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddCertification}>Save Certification</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-3">
            {certs.length === 0 ? (
              <p className="text-sm text-slate-500">No certifications yet.</p>
            ) : (
              certs.map((cert) => (
                <div key={cert.id} className="rounded-xl border border-slate-100 p-3">
                  <p className="text-sm font-semibold text-slate-900">{cert.certType}</p>
                  <p className="text-xs text-slate-500">
                    Earned {cert.earnedDate ? formatDisplayDate(cert.earnedDate) : "—"}
                    {cert.expirationDate ? ` • Expires ${formatDisplayDate(cert.expirationDate)}` : ""}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">AI Readiness Assessment</CardTitle>
          <Button variant="outline" size="sm" onClick={handleGenerateAssessment} disabled={loadingAssessment}>
            {loadingAssessment ? "Generating..." : "Regenerate"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {assessment ? (
            <>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  statusColors[assessment.status] ?? "bg-slate-100 text-slate-600"
                }`}
              >
                {assessment.status.replace("_", " ").toUpperCase()}
              </span>
              <p className="text-sm text-slate-700">{assessment.assessment}</p>
              <p className="text-xs text-slate-500">{assessment.recommendation}</p>
              <p className="text-xs text-slate-400">
                Generated {assessment.generatedAt ? formatDisplayDate(assessment.generatedAt) : "—"}
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-500">No assessment yet. Generate one to get started.</p>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Work History</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="pt-4">
          <Card className="border-slate-200">
            <CardContent className="p-6 text-sm text-slate-600">
              Participant status: <span className="font-semibold text-slate-900 capitalize">{participant.status}</span>.
              Categories: {participant.categories.length > 0 ? participant.categories.join(", ") : "None listed"}.
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history" className="pt-4">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Work History (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-2">Date</th>
                    <th className="py-2">Role</th>
                    <th className="py-2">Hours</th>
                    <th className="py-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {workLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-sm text-slate-500">
                        No work logs in the last 30 days.
                      </td>
                    </tr>
                  ) : (
                    workLogs.map((log) => (
                      <tr key={log.id} className="border-t border-slate-100">
                        <td className="py-3">{log.workDate ? formatShortDate(log.workDate) : "—"}</td>
                        <td className="py-3">{log.role}</td>
                        <td className="py-3">{log.hours}</td>
                        <td className="py-3 text-slate-500">{log.notes ?? "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="timeline" className="pt-4">
          <Card className="border-slate-200">
            <CardContent className="p-6 text-sm text-slate-600">
              Timeline view will surface certifications, attendance milestones, and key events.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
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
