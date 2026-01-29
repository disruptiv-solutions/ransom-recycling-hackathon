"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ChevronDown, ChevronUp, UserPlus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type AdminParticipantRow = {
  id: string;
  displayName: string | null;
  email: string | null;
  caseManagerId: string | null;
  supervisorId: string | null;
  caseManagerName: string | null;
  supervisorName: string | null;
  intakeStatus: "incomplete" | "in_progress" | "complete";
  createdAtLabel: string | null;
};

type AssigneeOption = { id: string; displayName: string };

const UNASSIGNED_VALUE = "__unassigned__";

const getIntakeBadge = (status: AdminParticipantRow["intakeStatus"]) => {
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

const Checkbox = ({
  checked,
  onChange,
  ariaLabel,
  indeterminate,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  ariaLabel: string;
  indeterminate?: boolean;
}) => {
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.indeterminate = Boolean(indeterminate);
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      aria-label={ariaLabel}
      className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
    />
  );
};

export function AdminParticipantsTable({
  rows,
  caseManagers,
  supervisors,
}: {
  rows: AdminParticipantRow[];
  caseManagers: AssigneeOption[];
  supervisors: AssigneeOption[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [tableRows, setTableRows] = useState<AdminParticipantRow[]>(rows);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedParticipantId, setExpandedParticipantId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingAssignments, setIsSavingAssignments] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const pageSize = 50;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tableRows;

    return tableRows.filter((r) => {
      const haystack = [
        r.displayName ?? "",
        r.email ?? "",
        r.caseManagerName ?? "",
        r.supervisorName ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, tableRows]);

  useEffect(() => {
    setPage(1);
  }, [query, tableRows]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    if (page <= totalPages) return;
    setPage(totalPages);
  }, [page, totalPages]);

  const startIndex = (page - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);
  const startLabel = filtered.length === 0 ? 0 : startIndex + 1;
  const endLabel = startIndex + paginated.length;

  const selectedInView = useMemo(() => {
    const set = selectedIds;
    return paginated.filter((r) => set.has(r.id)).map((r) => r.id);
  }, [paginated, selectedIds]);

  const isAllInViewSelected = paginated.length > 0 && selectedInView.length === paginated.length;
  const isSomeInViewSelected = selectedInView.length > 0 && selectedInView.length < paginated.length;

  const handleToggleAllInView = (next: boolean) => {
    setSelectedIds((prev) => {
      const nextSet = new Set(prev);
      if (!next) {
        paginated.forEach((r) => nextSet.delete(r.id));
        return nextSet;
      }
      paginated.forEach((r) => nextSet.add(r.id));
      return nextSet;
    });
  };

  const handleToggleOne = (id: string, next: boolean) => {
    setSelectedIds((prev) => {
      const nextSet = new Set(prev);
      if (next) nextSet.add(id);
      else nextSet.delete(id);
      return nextSet;
    });
  };

  const handleSaveAssignments = async (participantId: string, nextCaseManagerId: string | null, nextSupervisorId: string | null) => {
    setErrorMessage(null);
    setIsSavingAssignments(participantId);

    const prevRow = tableRows.find((r) => r.id === participantId) || null;
    if (!prevRow) {
      setIsSavingAssignments(null);
      return;
    }

    const nextCaseManagerName = nextCaseManagerId ? caseManagers.find((c) => c.id === nextCaseManagerId)?.displayName || null : null;
    const nextSupervisorName = nextSupervisorId ? supervisors.find((s) => s.id === nextSupervisorId)?.displayName || null : null;

    // Optimistic update
    setTableRows((prev) =>
      prev.map((r) =>
        r.id === participantId
          ? {
              ...r,
              caseManagerId: nextCaseManagerId,
              supervisorId: nextSupervisorId,
              caseManagerName: nextCaseManagerName,
              supervisorName: nextSupervisorName,
            }
          : r,
      ),
    );

    try {
      const res = await fetch("/api/admin/updateParticipantAssignments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          participantId,
          caseManagerId: nextCaseManagerId,
          supervisorId: nextSupervisorId,
        }),
      });

      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to update assignments.");
      }
    } catch (e: any) {
      // Revert on failure
      setTableRows((prev) => prev.map((r) => (r.id === participantId ? prevRow : r)));
      setErrorMessage(typeof e?.message === "string" ? e.message : "Failed to update assignments.");
    } finally {
      setIsSavingAssignments(null);
    }
  };

  const handleConfirmDelete = async () => {
    const uids = Array.from(selectedIds);
    if (uids.length === 0) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/deleteUsers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ uids }),
      });

      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; failed?: Array<{ uid: string; error: string }> } | null;
      if (!res.ok || !data) {
        throw new Error("Failed to delete users.");
      }

      if (!data.ok) {
        const failedCount = Array.isArray(data.failed) ? data.failed.length : 0;
        throw new Error(failedCount > 0 ? `Deleted with errors: ${failedCount} failed.` : (data.error || "Failed to delete users."));
      }

      setTableRows((prev) => prev.filter((r) => !selectedIds.has(r.id)));
      setSelectedIds(new Set());
      setIsDeleteModalOpen(false);
    } catch (e: any) {
      setErrorMessage(typeof e?.message === "string" ? e.message : "Failed to delete users.");
    } finally {
      setIsDeleting(false);
    }
  };

  const shouldIgnoreRowNav = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    return Boolean(target.closest("a,button,input,select,textarea,[data-row-nav-ignore='true']"));
  };

  const handleRowNavigate = (id: string, target: EventTarget | null) => {
    if (shouldIgnoreRowNav(target)) return;
    router.push(`/admin/participants/${id}`);
  };

  const handleToggleExpanded = (id: string) => {
    setExpandedParticipantId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search participants, case managers, supervisors..."
            className="h-12 rounded-xl bg-card pl-10 shadow-sm"
            aria-label="Search participants"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button
            asChild
            className="h-12 rounded-xl px-6 font-bold shadow-sm shadow-primary/15"
            aria-label="Create a new participant case"
          >
            <Link href="/admin/participants/create">
              <UserPlus className="h-4 w-4" />
              Create New Case
            </Link>
          </Button>

          {selectedIds.size > 0 ? (
            <Button
              type="button"
              className="h-12 rounded-xl bg-red-600 px-6 font-bold text-white hover:bg-red-700"
              onClick={() => setIsDeleteModalOpen(true)}
              aria-label="Delete selected participants"
            >
              Delete selected ({selectedIds.size})
            </Button>
          ) : null}
        </div>
      </div>

      {errorMessage ? <p className="text-sm font-medium text-destructive">{errorMessage}</p> : null}

      <Card className="rounded-[2rem] overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-none">
                  <TableHead className="px-5 py-4 font-bold text-muted-foreground uppercase text-[10px] tracking-widest w-10">
                    <Checkbox
                      checked={isAllInViewSelected}
                      indeterminate={isSomeInViewSelected}
                      onChange={handleToggleAllInView}
                      ariaLabel="Select all participants"
                    />
                  </TableHead>
                  <TableHead className="px-8 py-4 font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Participant</TableHead>
                  <TableHead className="py-4 font-bold text-muted-foreground uppercase text-[10px] tracking-widest text-center">Case Manager</TableHead>
                  <TableHead className="py-4 font-bold text-muted-foreground uppercase text-[10px] tracking-widest text-center">Supervisor</TableHead>
                  <TableHead className="py-4 font-bold text-muted-foreground uppercase text-[10px] tracking-widest text-center">Status</TableHead>
                  <TableHead className="py-4 font-bold text-muted-foreground uppercase text-[10px] tracking-widest text-center">Intake</TableHead>
                  <TableHead className="px-8 py-4 font-bold text-muted-foreground uppercase text-[10px] tracking-widest text-right">Created</TableHead>
                  <TableHead className="px-4 py-4 font-bold text-muted-foreground uppercase text-[10px] tracking-widest text-right w-12">
                    <span className="sr-only">Details</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((r) => {
                  const isAssigned = Boolean(r.caseManagerName) && Boolean(r.supervisorName);
                  const isSelected = selectedIds.has(r.id);
                  const isSavingThis = isSavingAssignments === r.id;
                  const isExpanded = expandedParticipantId === r.id;
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
                        <TableCell className="px-5 py-6 align-middle">
                          <Checkbox
                            checked={isSelected}
                            onChange={(next) => handleToggleOne(r.id, next)}
                            ariaLabel={`Select ${r.displayName || "participant"}`}
                          />
                        </TableCell>
                        <TableCell className="px-8 py-6">
                          <div className="flex flex-col">
                            <Link
                              href={`/admin/participants/${r.id}`}
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
                                value={r.caseManagerId ?? UNASSIGNED_VALUE}
                                onValueChange={(val) =>
                                  handleSaveAssignments(r.id, val === UNASSIGNED_VALUE ? null : val, r.supervisorId)
                                }
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
                                  {caseManagers.map((cm) => (
                                    <SelectItem
                                      key={cm.id}
                                      value={cm.id}
                                      className="mx-1 my-0.5 rounded-xl focus:bg-primary/10 focus:text-foreground data-[state=checked]:bg-primary/10 data-[state=checked]:text-foreground"
                                    >
                                      {cm.displayName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div
                                className="flex h-10 w-full max-w-[220px] items-center justify-between rounded-xl border border-border bg-card px-4 text-sm font-semibold text-muted-foreground shadow-sm"
                                aria-label="Loading case manager selector"
                                data-row-nav-ignore="true"
                              >
                                <span>{r.caseManagerName || "Assign..."}</span>
                                <span className="text-xs">…</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="inline-flex min-w-[180px] justify-center">
                            {isMounted ? (
                              <Select
                                value={r.supervisorId ?? UNASSIGNED_VALUE}
                                onValueChange={(val) =>
                                  handleSaveAssignments(r.id, r.caseManagerId, val === UNASSIGNED_VALUE ? null : val)
                                }
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
                        <TableCell className="text-center">
                          {isAssigned ? (
                            <Badge className="rounded-full border-none bg-green-500/15 px-4 text-green-700 hover:bg-green-500/15 dark:text-green-300">
                              Assigned
                            </Badge>
                          ) : (
                            <Badge className="rounded-full border-none bg-amber-500/15 px-4 text-amber-700 hover:bg-amber-500/15 dark:text-amber-300">
                              Needs assignment
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {getIntakeBadge(r.intakeStatus)}
                        </TableCell>
                        <TableCell className="px-8 text-right">
                          <span className="text-xs font-bold text-muted-foreground">{r.createdAtLabel || "—"}</span>
                        </TableCell>
                        <TableCell className="px-4 py-6 align-middle text-right">
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                            aria-label={isExpanded ? `Collapse details for ${r.displayName || "participant"}` : `Expand details for ${r.displayName || "participant"}`}
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
                          <TableCell colSpan={8} className="px-6 pb-8 pt-0">
                            <div
                              className="mt-2 rounded-2xl border border-border bg-card p-5 shadow-sm"
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                              data-row-nav-ignore="true"
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Participant details</p>
                                  <p className="mt-1 truncate text-lg font-bold text-foreground">{r.displayName || "Unnamed Participant"}</p>
                                  <p className="truncate text-sm text-muted-foreground">{r.email || "No email on file"}</p>
                                </div>

                                <div className="flex shrink-0 flex-wrap gap-2">
                                  <Link
                                    href={`/admin/participants/${r.id}`}
                                    className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-card px-4 text-sm font-bold text-foreground shadow-sm transition-colors hover:bg-muted"
                                    aria-label={`Open ${r.displayName || "participant"} overview`}
                                    data-row-nav-ignore="true"
                                  >
                                    Open overview
                                  </Link>
                                </div>
                              </div>

                              <Tabs defaultValue="info" className="mt-4 w-full">
                                <TabsList className="h-11 rounded-2xl bg-muted p-1">
                                  <TabsTrigger value="info" className="rounded-xl px-4 text-sm font-bold">
                                    Info
                                  </TabsTrigger>
                                  <TabsTrigger value="docs" className="rounded-xl px-4 text-sm font-bold">
                                    Docs
                                  </TabsTrigger>
                                  <TabsTrigger value="recycling" className="rounded-xl px-4 text-sm font-bold">
                                    Recycling Reports
                                  </TabsTrigger>
                                </TabsList>

                                <TabsContent value="info" className="mt-4">
                                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="rounded-2xl border border-border bg-card p-4">
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">User ID</p>
                                      <p className="mt-2 font-mono text-xs font-semibold text-foreground">{r.id}</p>
                                    </div>
                                    <div className="rounded-2xl border border-border bg-card p-4">
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Case manager</p>
                                      <p className="mt-2 text-sm font-bold text-foreground">{r.caseManagerName || "Unassigned"}</p>
                                    </div>
                                    <div className="rounded-2xl border border-border bg-card p-4">
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Supervisor</p>
                                      <p className="mt-2 text-sm font-bold text-foreground">{r.supervisorName || "Unassigned"}</p>
                                    </div>
                                    <div className="rounded-2xl border border-border bg-card p-4">
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Assignment status</p>
                                      <p className="mt-2 text-sm font-bold text-foreground">{isAssigned ? "Assigned" : "Needs assignment"}</p>
                                    </div>
                                    <div className="rounded-2xl border border-border bg-card p-4">
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Created</p>
                                      <p className="mt-2 text-sm font-bold text-foreground">{r.createdAtLabel || "—"}</p>
                                    </div>
                                  </div>
                                </TabsContent>

                                <TabsContent value="docs" className="mt-4">
                                  <div className="rounded-2xl border border-border bg-card p-6">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                      <div>
                                        <p className="text-sm font-bold text-foreground">Documents</p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                          Open and complete documents associated with this participant.
                                        </p>
                                      </div>

                                      <Link
                                        href={`/admin/participants/${r.id}/intake`}
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
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Uploads</p>
                                        <p className="mt-2 text-sm font-semibold text-foreground/80">No uploads yet</p>
                                      </div>
                                      <div className="rounded-2xl border border-border bg-card p-4">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Other docs</p>
                                        <p className="mt-2 text-sm font-semibold text-foreground/80">Coming soon</p>
                                      </div>
                                    </div>
                                  </div>
                                </TabsContent>

                                <TabsContent value="recycling" className="mt-4">
                                  <div className="rounded-2xl border border-border bg-card p-6">
                                    <p className="text-sm font-bold text-foreground">Recycling reports</p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                      No recycling reports are available for this participant yet.
                                    </p>
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

          <div className="flex flex-col gap-4 border-t border-border px-8 py-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Showing {startLabel}-{endLabel} of {filtered.length} participants
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl font-bold"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1 px-2">
                <span className="text-xs font-bold text-foreground">Page {page}</span>
                <span className="text-xs font-bold text-muted-foreground">of {totalPages}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl font-bold"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-bold text-foreground">No participants found.</p>
              <p className="mt-1 text-sm text-muted-foreground">Try a different search.</p>
              <Button
                asChild
                className="mt-6 h-12 rounded-xl px-8 font-bold shadow-sm shadow-primary/15"
                aria-label="Create a new participant case"
              >
                <Link href="/admin/participants/create">
                  <UserPlus className="h-4 w-4" />
                  Create New Case
                </Link>
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Delete participants?</DialogTitle>
            <DialogDescription>
              This will permanently delete {selectedIds.size} participant{selectedIds.size === 1 ? "" : "s"} from Auth and Firestore.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-2xl border border-border bg-muted p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Selected</p>
            <div className="mt-2 space-y-1">
              {Array.from(selectedIds)
                .slice(0, 6)
                .map((id) => {
                  const r = tableRows.find((x) => x.id === id);
                  return (
                    <p key={id} className="text-sm font-semibold text-foreground/80">
                      {r?.displayName || "Unnamed Participant"}
                    </p>
                  );
                })}
              {selectedIds.size > 6 ? (
                <p className="text-sm font-semibold text-muted-foreground">…and {selectedIds.size - 6} more</p>
              ) : null}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button type="button" variant="ghost" className="rounded-xl font-bold" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              type="button"
              className="h-12 rounded-xl bg-red-600 px-8 font-bold text-white hover:bg-red-700"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : `Delete ${selectedIds.size}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
