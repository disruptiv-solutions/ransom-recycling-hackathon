"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type CaseManagerParticipantRow = {
  id: string;
  displayName: string | null;
  email: string | null;
  supervisorId: string | null;
  supervisorName: string | null;
  intakeStatus: "incomplete" | "in_progress" | "complete";
  createdAtLabel: string | null;
};

type SupervisorOption = { id: string; displayName: string };

const UNASSIGNED_VALUE = "__unassigned__";

const getIntakeBadge = (status: CaseManagerParticipantRow["intakeStatus"]) => {
  if (status === "complete") {
    return (
      <Badge className="rounded-full border-none bg-green-500/15 px-4 text-green-700 hover:bg-green-500/15 dark:text-green-300">
        Complete
      </Badge>
    );
  }
  if (status === "in_progress") {
    return (
      <Badge className="rounded-full border-none bg-blue-500/15 px-4 text-blue-700 hover:bg-blue-500/15 dark:text-blue-300">
        In progress
      </Badge>
    );
  }
  return (
    <Badge className="rounded-full border-none bg-muted px-4 text-foreground/80 hover:bg-muted">
      Incomplete
    </Badge>
  );
};

export function CaseManagerParticipantsTable({
  rows,
  supervisors,
}: {
  rows: CaseManagerParticipantRow[];
  supervisors: SupervisorOption[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [tableRows, setTableRows] = useState<CaseManagerParticipantRow[]>(rows);
  const [expandedParticipantId, setExpandedParticipantId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isSavingSupervisor, setIsSavingSupervisor] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tableRows;
    return tableRows.filter((r) => {
      const haystack = [r.displayName ?? "", r.email ?? "", r.supervisorName ?? ""].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [query, tableRows]);

  const shouldIgnoreRowNav = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    return Boolean(target.closest("a,button,input,select,textarea,[data-row-nav-ignore='true']"));
  };

  const handleRowNavigate = (id: string, target: EventTarget | null) => {
    if (shouldIgnoreRowNav(target)) return;
    router.push(`/case-manager/participants/${id}`);
  };

  const handleToggleExpanded = (id: string) => {
    setExpandedParticipantId((prev) => (prev === id ? null : id));
  };

  const handleSaveSupervisor = async (participantId: string, supervisorId: string | null) => {
    setErrorMessage(null);
    setIsSavingSupervisor(participantId);

    const prevRow = tableRows.find((r) => r.id === participantId) || null;
    if (!prevRow) {
      setIsSavingSupervisor(null);
      return;
    }

    const nextSupervisorName = supervisorId ? supervisors.find((s) => s.id === supervisorId)?.displayName || null : null;

    // Optimistic update
    setTableRows((prev) =>
      prev.map((r) =>
        r.id === participantId
          ? {
              ...r,
              supervisorId,
              supervisorName: nextSupervisorName,
            }
          : r,
      ),
    );

    try {
      const res = await fetch("/api/case-manager/updateParticipantSupervisor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          participantId,
          supervisorId,
        }),
      });

      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to update supervisor.");
      }
    } catch (e: any) {
      setTableRows((prev) => prev.map((r) => (r.id === participantId ? prevRow : r)));
      setErrorMessage(typeof e?.message === "string" ? e.message : "Failed to update supervisor.");
    } finally {
      setIsSavingSupervisor(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search participants or supervisors..."
          className="h-12 rounded-xl bg-card pl-10 shadow-sm"
          aria-label="Search participants"
        />
      </div>

      {errorMessage ? <p className="text-sm font-medium text-destructive">{errorMessage}</p> : null}

      <Card className="rounded-[2rem] overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-none">
                  <TableHead className="px-8 py-4 font-bold text-muted-foreground uppercase text-[10px] tracking-widest">
                    Participant
                  </TableHead>
                  <TableHead className="py-4 font-bold text-muted-foreground uppercase text-[10px] tracking-widest text-center">
                    Supervisor
                  </TableHead>
                  <TableHead className="py-4 font-bold text-muted-foreground uppercase text-[10px] tracking-widest text-center">
                    Intake
                  </TableHead>
                  <TableHead className="px-8 py-4 font-bold text-muted-foreground uppercase text-[10px] tracking-widest text-right">
                    Created
                  </TableHead>
                  <TableHead className="px-4 py-4 font-bold text-muted-foreground uppercase text-[10px] tracking-widest text-right w-12">
                    <span className="sr-only">Details</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => {
                  const isExpanded = expandedParticipantId === r.id;
                  const isSavingThis = isSavingSupervisor === r.id;
                  return (
                    <Fragment key={r.id}>
                      <TableRow
                        className="border-border transition-colors hover:bg-muted/60 cursor-pointer"
                        role="link"
                        tabIndex={0}
                        aria-label={`Open ${r.displayName || "participant"} overview`}
                        onClick={(e) => handleRowNavigate(r.id, e.target)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleRowNavigate(r.id, e.target);
                          }
                        }}
                      >
                        <TableCell className="px-8 py-6">
                          <div className="flex flex-col">
                            <Link
                              href={`/case-manager/participants/${r.id}`}
                              className="font-bold text-foreground hover:underline underline-offset-4"
                              aria-label={`Open ${r.displayName || "participant"} overview`}
                            >
                              {r.displayName || "Unnamed Participant"}
                            </Link>
                            <span className="text-xs text-muted-foreground">{r.email || "No email"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="inline-flex min-w-[180px] justify-center">
                            {isMounted ? (
                              <Select
                                value={r.supervisorId ?? UNASSIGNED_VALUE}
                                onValueChange={(val) => handleSaveSupervisor(r.id, val === UNASSIGNED_VALUE ? null : val)}
                                disabled={isSavingThis}
                              >
                                <SelectTrigger
                                  className="h-10 w-full max-w-[220px] justify-between rounded-xl bg-card px-4 text-sm font-semibold shadow-sm"
                                  data-row-nav-ignore="true"
                                >
                                  <SelectValue placeholder="Assign..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl">
                                  <SelectItem
                                    value={UNASSIGNED_VALUE}
                                    className="mx-1 my-0.5 rounded-xl focus:bg-primary/10 focus:text-foreground data-[state=checked]:bg-primary/10 data-[state=checked]:text-foreground"
                                  >
                                    — Unassigned —
                                  </SelectItem>
                                  {supervisors.map((s) => (
                                    <SelectItem
                                      key={s.id}
                                      value={s.id}
                                      className="mx-1 my-0.5 rounded-xl focus:bg-primary/10 focus:text-foreground data-[state=checked]:bg-primary/10 data-[state=checked]:text-foreground"
                                    >
                                      {s.displayName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div
                                className="flex h-10 w-full max-w-[220px] items-center justify-between rounded-xl border border-border bg-card px-4 text-sm font-semibold text-muted-foreground shadow-sm"
                                aria-label="Loading supervisor selector"
                                data-row-nav-ignore="true"
                              >
                                <span>{r.supervisorName || "Assign..."}</span>
                                <span className="text-xs">…</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{getIntakeBadge(r.intakeStatus)}</TableCell>
                        <TableCell className="px-8 text-right">
                          <span className="text-xs font-bold text-muted-foreground">{r.createdAtLabel || "—"}</span>
                        </TableCell>
                        <TableCell className="px-4 py-6 align-middle text-right">
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                            aria-label={
                              isExpanded
                                ? `Collapse details for ${r.displayName || "participant"}`
                                : `Expand details for ${r.displayName || "participant"}`
                            }
                            aria-expanded={isExpanded}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleToggleExpanded(r.id);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                e.stopPropagation();
                                handleToggleExpanded(r.id);
                              }
                            }}
                            data-row-nav-ignore="true"
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                        </TableCell>
                      </TableRow>

                      {isExpanded ? (
                        <TableRow className="border-border bg-muted/30">
                          <TableCell colSpan={5} className="px-6 pb-8 pt-0">
                            <div
                              className="mt-2 rounded-2xl border border-border bg-card p-5 shadow-sm"
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                              data-row-nav-ignore="true"
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Participant details</p>
                                  <p className="mt-1 truncate text-lg font-bold text-foreground">
                                    {r.displayName || "Unnamed Participant"}
                                  </p>
                                  <p className="truncate text-sm text-muted-foreground">{r.email || "No email on file"}</p>
                                </div>
                              </div>

                              <Tabs defaultValue="docs" className="mt-4 w-full">
                                <TabsList className="h-11 rounded-2xl bg-muted p-1">
                                  <TabsTrigger value="docs" className="rounded-xl px-4 text-sm font-bold">
                                    Docs
                                  </TabsTrigger>
                                  <TabsTrigger value="info" className="rounded-xl px-4 text-sm font-bold">
                                    Info
                                  </TabsTrigger>
                                </TabsList>

                                <TabsContent value="docs" className="mt-4">
                                  <div className="rounded-2xl border border-border bg-card p-6">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                      <div>
                                        <p className="text-sm font-bold text-foreground">Documents</p>
                                        <p className="mt-1 text-sm text-muted-foreground">Open and complete documents for this participant.</p>
                                      </div>

                                      <Link
                                        href={`/case-manager/participants/${r.id}/intake`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-black text-white shadow-sm shadow-primary/20 hover:bg-primary/90"
                                        aria-label={`Open intake form for ${r.displayName || "participant"} in a new tab`}
                                        data-row-nav-ignore="true"
                                      >
                                        Open intake form
                                      </Link>
                                    </div>

                                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                      <div className="rounded-2xl border border-border bg-card p-4">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Intake status</p>
                                        <div className="mt-2">{getIntakeBadge(r.intakeStatus)}</div>
                                      </div>
                                      <div className="rounded-2xl border border-border bg-card p-4">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Supervisor</p>
                                        <p className="mt-2 text-sm font-semibold text-foreground">{r.supervisorName || "Unassigned"}</p>
                                      </div>
                                    </div>
                                  </div>
                                </TabsContent>

                                <TabsContent value="info" className="mt-4">
                                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="rounded-2xl border border-border bg-card p-4">
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">User ID</p>
                                      <p className="mt-2 font-mono text-xs font-semibold text-foreground">{r.id}</p>
                                    </div>
                                    <div className="rounded-2xl border border-border bg-card p-4">
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Created</p>
                                      <p className="mt-2 text-sm font-bold text-foreground">{r.createdAtLabel || "—"}</p>
                                    </div>
                                  </div>
                                </TabsContent>
                              </Tabs>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filtered.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-bold text-foreground">No assigned participants found.</p>
              <p className="mt-1 text-sm text-muted-foreground">If you were just assigned cases, refresh in a moment.</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

