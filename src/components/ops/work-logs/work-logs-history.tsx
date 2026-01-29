"use client";

import { useEffect, useMemo, useState } from "react";
import { AIOverview } from "@/components/ops/ai-overview";
import { Pencil, Trash2 } from "lucide-react";

import type { Participant, WorkLog } from "@/lib/ops/types";
import { formatShortDate } from "@/lib/ops/date";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type WorkLogsHistoryProps = {
  initialLogs: WorkLog[];
  participants: Participant[];
  isAdmin: boolean;
};

export const WorkLogsHistory = ({ initialLogs, participants, isAdmin }: WorkLogsHistoryProps) => {
  const [logs, setLogs] = useState<WorkLog[]>(initialLogs);
  const [search, setSearch] = useState("");
  const [participantId, setParticipantId] = useState("all");
  const [role, setRole] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [aiOverview, setAiOverview] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);

  const fetchAIOverview = async () => {
    setAiLoading(true);
    try {
      const response = await fetch("/api/work-logs-overview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filters: {
            search,
            participantId,
            role,
            dateRange: {
              start: startDate || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
              end: endDate || new Date().toISOString(),
            },
          },
        }),
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
  useEffect(() => {
    fetchAIOverview();
  }, [search, participantId, role, startDate, endDate]);

  const pageSize = 50;

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = log.participantName.toLowerCase().includes(search.toLowerCase());
      const matchesParticipant = participantId === "all" || log.participantId === participantId;
      const matchesRole = role === "all" || log.role === role;

      const logDate = log.workDate ? new Date(log.workDate) : null;
      const matchesStart = startDate ? (logDate ? logDate >= new Date(startDate) : false) : true;
      const matchesEnd = endDate ? (logDate ? logDate <= new Date(endDate) : false) : true;

      return matchesSearch && matchesParticipant && matchesRole && matchesStart && matchesEnd;
    });
  }, [logs, search, participantId, role, startDate, endDate]);

  useEffect(() => {
    setPage(1);
  }, [search, participantId, role, startDate, endDate, logs]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    if (page <= totalPages) return;
    setPage(totalPages);
  }, [page, totalPages]);

  const startIndex = (page - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);
  const startLabel = filtered.length === 0 ? 0 : startIndex + 1;
  const endLabel = startIndex + paginated.length;

  const handleUpdate = async (id: string, updates: Partial<WorkLog>) => {
    const res = await fetch(`/api/work-logs/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) return;
    setLogs((prev) => prev.map((log) => (log.id === id ? { ...log, ...updates } : log)));
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/work-logs/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok || !data.ok) return;
    setLogs((prev) => prev.filter((log) => log.id !== id));
  };

  const roles = Array.from(new Set(logs.map((log) => log.role)));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Work Logs</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Work Logs History</h1>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <Input
            placeholder="Search participant..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search by participant name"
          />
          <select
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={participantId}
            onChange={(event) => setParticipantId(event.target.value)}
            aria-label="Filter by participant"
          >
            <option value="all">All Participants</option>
            {participants.map((participant) => (
              <option key={participant.id} value={participant.id}>
                {participant.name}
              </option>
            ))}
          </select>
          <select
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            aria-label="Filter by role"
          >
            <option value="all">All Roles</option>
            {roles.map((roleName) => (
              <option key={roleName} value={roleName}>
                {roleName}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </div>
        </CardContent>
      </Card>

      <AIOverview 
        overview={aiOverview} 
        loading={aiLoading} 
        onRegenerate={fetchAIOverview} 
        title="AI Insights - Staffing & Attendance"
      />

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">{filtered.length} Entries Found</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Date</th>
                <th className="py-2">Name</th>
                <th className="py-2">Role</th>
                <th className="py-2">Hours</th>
                <th className="py-2">Notes</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm text-slate-500">
                    No work logs found.
                  </td>
                </tr>
              ) : (
                paginated.map((log) => (
                  <tr key={log.id} className="border-t border-slate-100">
                    <td className="py-3">{log.workDate ? formatShortDate(log.workDate) : "—"}</td>
                    <td className="py-3">{log.participantName}</td>
                    <td className="py-3">{log.role}</td>
                    <td className="py-3">{log.hours}</td>
                    <td className="py-3 text-slate-500">{log.notes ?? "—"}</td>
                    <td className="py-3 text-right">
                      <EditLogDialog log={log} onSave={handleUpdate} />
                      {isAdmin ? (
                        <button
                          className="ml-2 inline-flex items-center text-xs font-semibold text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(log.id)}
                          aria-label="Delete work log"
                        >
                          <Trash2 className="mr-1 h-3 w-3" aria-hidden="true" />
                          Delete
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Showing {startLabel}-{endLabel} of {filtered.length} entries
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1}
                aria-label="Previous page"
              >
                Previous
              </Button>
              <span className="text-xs font-semibold text-slate-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages}
                aria-label="Next page"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const EditLogDialog = ({ log, onSave }: { log: WorkLog; onSave: (id: string, updates: Partial<WorkLog>) => void }) => {
  const [role, setRole] = useState(log.role);
  const [hours, setHours] = useState(String(log.hours));
  const [notes, setNotes] = useState(log.notes ?? "");

  const handleSave = () => {
    onSave(log.id, { role, hours: Number(hours), notes });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-800">
          <Pencil className="mr-1 h-3 w-3" aria-hidden="true" />
          Edit
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Work Log</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Role</label>
            <select
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              aria-label="Role"
            >
              {["Processing", "Sorting", "Hammermill", "Truck"].map(
                (option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ),
              )}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Hours</label>
            <Input
              className="mt-2"
              type="number"
              min="0"
              step="0.25"
              value={hours}
              onChange={(event) => setHours(event.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Notes</label>
            <Textarea className="mt-2" value={notes} onChange={(event) => setNotes(event.target.value)} />
          </div>
          <Button onClick={handleSave}>Save changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
