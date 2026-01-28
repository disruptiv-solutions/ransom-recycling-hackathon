"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import type { Alert } from "@/lib/ops/types";
import { formatDisplayDate } from "@/lib/ops/date";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AlertsInboxProps = {
  initialAlerts: Alert[];
};

const priorityOrder = ["high", "medium", "low"] as const;

export const AlertsInbox = ({ initialAlerts }: AlertsInboxProps) => {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [readFilter, setReadFilter] = useState("all");

  const filtered = useMemo(() => {
    return alerts.filter((alert) => {
      if (alert.isDismissed) return false;
      if (priorityFilter !== "all" && alert.priority !== priorityFilter) return false;
      if (readFilter === "read" && !alert.isRead) return false;
      if (readFilter === "unread" && alert.isRead) return false;
      return true;
    });
  }, [alerts, priorityFilter, readFilter]);

  const grouped = useMemo(() => {
    return priorityOrder.reduce<Record<string, Alert[]>>((acc, priority) => {
      acc[priority] = filtered.filter((alert) => alert.priority === priority);
      return acc;
    }, {});
  }, [filtered]);

  const unreadCount = alerts.filter((alert) => !alert.isRead).length;

  const handleUpdateAlert = async (id: string, updates: Partial<Alert>) => {
    const res = await fetch(`/api/alerts/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) return;

    setAlerts((prev) => prev.map((alert) => (alert.id === id ? { ...alert, ...updates } : alert)));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Alerts</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Alerts Inbox</h1>
          <p className="mt-1 text-sm text-slate-500">{unreadCount} unread</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            aria-label="Filter by priority"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={readFilter}
            onChange={(event) => setReadFilter(event.target.value)}
            aria-label="Filter by read status"
          >
            <option value="all">All Statuses</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
      </div>

      {priorityOrder.map((priority) => (
        <Card key={priority} className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg capitalize">{priority} Priority</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {grouped[priority]?.length ? (
              grouped[priority].map((alert) => (
                <div key={alert.id} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {alert.participantName ?? "Participant"} - {alert.message}
                      </p>
                      <p className="text-xs text-slate-500">
                        {alert.createdAt ? formatDisplayDate(alert.createdAt) : "—"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={alert.participantId ? `/participants/${alert.participantId}` : "/participants"}>
                          View Profile
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateAlert(alert.id, { isRead: true })}
                      >
                        Mark Read
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateAlert(alert.id, { isDismissed: true })}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No {priority} priority alerts.</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
