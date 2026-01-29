"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type { Participant } from "@/lib/ops/types";
import { formatShortDate } from "@/lib/ops/date";
import { useDemoMode } from "@/lib/demo-mode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ParticipantsDirectoryProps = {
  participants: Participant[];
};

export const ParticipantsDirectory = ({ participants }: ParticipantsDirectoryProps) => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [phase, setPhase] = useState("all");
  const [page, setPage] = useState(1);
  const { isDemoMode } = useDemoMode();

  const pageSize = 50;

  const filtered = useMemo(() => {
    const visibleParticipants = isDemoMode 
      ? participants.filter(p => p.name !== "Unknown") // Filter out Unknown in demo mode
      : participants.filter((participant) => !participant.isMock && participant.name !== "Unknown"); // Filter out mock and Unknown in real mode
    return visibleParticipants.filter((participant) => {
      const matchesSearch = participant.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "all" || participant.status === status;
      const matchesPhase = phase === "all" || participant.currentPhase === Number(phase);
      return matchesSearch && matchesStatus && matchesPhase;
    });
  }, [participants, isDemoMode, search, status, phase]);

  useEffect(() => {
    setPage(1);
  }, [search, status, phase, isDemoMode, participants]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    if (page <= totalPages) return;
    setPage(totalPages);
  }, [page, totalPages]);

  const startIndex = (page - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);
  const startLabel = filtered.length === 0 ? 0 : startIndex + 1;
  const endLabel = startIndex + paginated.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Participants</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Participant Directory</h1>
        </div>
        <Button asChild className="w-full lg:w-auto">
          <Link href="/participants/new" aria-label="Add participant">
            + Add Participant
          </Link>
        </Button>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="space-y-4">
          <CardTitle className="text-lg">Search and Filters</CardTitle>
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search participants"
            />
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={phase}
              onChange={(event) => setPhase(event.target.value)}
              aria-label="Filter by phase"
            >
              <option value="all">All Phases</option>
              {[0, 1, 2, 3, 4].map((value) => (
                <option key={value} value={value}>
                  Phase {value}
                </option>
              ))}
            </select>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              aria-label="Filter by status"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="staffing">Staffing</option>
              <option value="graduated">Graduated</option>
              <option value="exited">Exited</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Name</th>
                <th className="py-2">Phase</th>
                <th className="py-2">Entry Date</th>
                <th className="py-2">Status</th>
                <th className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-slate-500">
                    No participants found.
                  </td>
                </tr>
              ) : (
                paginated.map((participant) => (
                  <tr key={participant.id} className="border-t border-slate-100">
                    <td className="py-3 font-medium text-slate-900">{participant.name}</td>
                    <td className="py-3">Phase {participant.currentPhase}</td>
                    <td className="py-3">{participant.entryDate ? formatShortDate(participant.entryDate) : "—"}</td>
                    <td className="py-3 capitalize">{participant.status}</td>
                    <td className="py-3 text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/participants/${participant.id}`} aria-label={`View ${participant.name}`}>
                          View
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Showing {startLabel}-{endLabel} of {filtered.length} participants
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
