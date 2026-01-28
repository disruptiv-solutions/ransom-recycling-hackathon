"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import type { MaterialPrice, Participant, ProductionRecord, WorkLog } from "@/lib/ops/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type OperationsDashboardProps = {
  dateLabel: string;
  participants: Participant[];
  workLogs: WorkLog[];
  productionRecords: ProductionRecord[];
  materialPrices: MaterialPrice[];
  isAdmin: boolean;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export const OperationsDashboard = ({
  dateLabel,
  participants,
  workLogs: initialWorkLogs,
  productionRecords: initialProductionRecords,
  materialPrices,
  isAdmin,
}: OperationsDashboardProps) => {
  const [workLogs, setWorkLogs] = useState<WorkLog[]>(initialWorkLogs);
  const [productionRecords, setProductionRecords] = useState<ProductionRecord[]>(initialProductionRecords);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const participantOptions = useMemo(
    () => participants.map((participant) => ({ id: participant.id, name: participant.name })),
    [participants],
  );

  const stats = useMemo(() => {
    const totalHours = workLogs.reduce((sum, log) => sum + log.hours, 0);
    const totalRevenue = productionRecords.reduce((sum, record) => sum + record.value, 0);
    const uniqueParticipants = new Set(workLogs.map((log) => log.participantId)).size;
    return { totalHours, totalRevenue, uniqueParticipants };
  }, [workLogs, productionRecords]);

  const handleCreateWorkLog = async (payload: {
    participantId: string;
    role: string;
    hours: number;
    notes: string;
    workDate: string;
  }) => {
    setErrorMessage(null);
    const res = await fetch("/api/work-logs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setErrorMessage(data.error ?? "Failed to log work.");
      return;
    }

    setWorkLogs((prev) => [
      {
        id: data.id,
        participantId: payload.participantId,
        participantName: participantOptions.find((p) => p.id === payload.participantId)?.name ?? "Unknown",
        role: payload.role,
        hours: payload.hours,
        notes: payload.notes,
        workDate: payload.workDate,
      },
      ...prev,
    ]);
  };

  const handleUpdateWorkLog = async (id: string, updates: Partial<WorkLog>) => {
    setErrorMessage(null);
    const res = await fetch(`/api/work-logs/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setErrorMessage(data.error ?? "Failed to update work log.");
      return;
    }
    setWorkLogs((prev) => prev.map((log) => (log.id === id ? { ...log, ...updates } : log)));
  };

  const handleDeleteWorkLog = async (id: string) => {
    setErrorMessage(null);
    const res = await fetch(`/api/work-logs/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setErrorMessage(data.error ?? "Failed to delete work log.");
      return;
    }
    setWorkLogs((prev) => prev.filter((log) => log.id !== id));
  };

  const handleCreateProduction = async (payload: {
    participantId: string;
    materialCategory: string;
    materialType: string;
    weight: number;
    productionDate: string;
  }) => {
    setErrorMessage(null);
    const res = await fetch("/api/production-records", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setErrorMessage(data.error ?? "Failed to log production.");
      return;
    }

    setProductionRecords((prev) => [
      {
        id: data.id,
        participantId: payload.participantId,
        participantName: participantOptions.find((p) => p.id === payload.participantId)?.name ?? "Unknown",
        materialCategory: payload.materialCategory,
        materialType: payload.materialType,
        weight: payload.weight,
        value: data.value ?? 0,
        productionDate: payload.productionDate,
      },
      ...prev,
    ]);
  };

  const handleUpdateProduction = async (id: string, updates: Partial<ProductionRecord>) => {
    setErrorMessage(null);
    const res = await fetch(`/api/production-records/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setErrorMessage(data.error ?? "Failed to update production.");
      return;
    }
    setProductionRecords((prev) => prev.map((record) => (record.id === id ? { ...record, ...updates } : record)));
  };

  const handleDeleteProduction = async (id: string) => {
    setErrorMessage(null);
    const res = await fetch(`/api/production-records/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setErrorMessage(data.error ?? "Failed to delete production.");
      return;
    }
    setProductionRecords((prev) => prev.filter((record) => record.id !== id));
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Daily Operations</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">{dateLabel}</h1>
        {errorMessage ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <WorkLogForm
          participants={participantOptions}
          onSubmit={handleCreateWorkLog}
          isDisabled={participantOptions.length === 0}
        />
        <ProductionForm
          participants={participantOptions}
          materialPrices={materialPrices}
          onSubmit={handleCreateProduction}
          isDisabled={participantOptions.length === 0 || materialPrices.length === 0}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="People Logged" value={stats.uniqueParticipants} />
        <StatCard label="Hours Logged" value={stats.totalHours.toFixed(1)} />
        <StatCard label="Revenue Generated" value={formatCurrency(stats.totalRevenue)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <WorkLogTable
          items={workLogs}
          isAdmin={isAdmin}
          onUpdate={handleUpdateWorkLog}
          onDelete={handleDeleteWorkLog}
        />
        <ProductionTable
          items={productionRecords}
          isAdmin={isAdmin}
          onUpdate={handleUpdateProduction}
          onDelete={handleDeleteProduction}
        />
      </div>
    </div>
  );
};

const StatCard = ({ label, value }: { label: string; value: string | number }) => (
  <Card className="border-slate-200">
    <CardContent className="p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
    </CardContent>
  </Card>
);

const WorkLogForm = ({
  participants,
  onSubmit,
  isDisabled,
}: {
  participants: { id: string; name: string }[];
  onSubmit: (payload: {
    participantId: string;
    role: string;
    hours: number;
    notes: string;
    workDate: string;
  }) => Promise<void> | void;
  isDisabled?: boolean;
}) => {
  const [participantId, setParticipantId] = useState(participants[0]?.id ?? "");
  const [role, setRole] = useState("Processing");
  const [hours, setHours] = useState("8");
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    if (!participantId || isDisabled) return;
    await onSubmit({
      participantId,
      role,
      hours: Number(hours),
      notes,
      workDate: new Date().toISOString(),
    });
    setNotes("");
  };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg">Log Work Entry</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isDisabled ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            Add participants to enable work logging.
          </p>
        ) : null}
        <div>
          <label className="text-sm font-medium text-slate-700">Participant</label>
          <select
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={participantId}
            onChange={(event) => setParticipantId(event.target.value)}
            aria-label="Select participant"
            disabled={isDisabled}
          >
            {participants.map((participant) => (
              <option key={participant.id} value={participant.id}>
                {participant.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Role</label>
            <select
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              aria-label="Role"
              disabled={isDisabled}
            >
              {["Processing", "Sorting", "Truck", "Quality Check", "Warehouse", "Shipping", "Refurb", "Admin Support"].map(
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
              aria-label="Hours"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Notes</label>
          <Textarea
            className="mt-2"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            aria-label="Notes"
          />
        </div>
        <Button className="w-full" onClick={handleSubmit} aria-label="Submit work log" disabled={isDisabled}>
          Submit
        </Button>
      </CardContent>
    </Card>
  );
};

const ProductionForm = ({
  participants,
  materialPrices,
  onSubmit,
  isDisabled,
}: {
  participants: { id: string; name: string }[];
  materialPrices: MaterialPrice[];
  onSubmit: (payload: {
    participantId: string;
    materialCategory: string;
    materialType: string;
    weight: number;
    productionDate: string;
  }) => Promise<void> | void;
  isDisabled?: boolean;
}) => {
  const [participantId, setParticipantId] = useState(participants[0]?.id ?? "");
  const [materialCategory, setMaterialCategory] = useState(materialPrices[0]?.category ?? "Circuit Boards");
  const [materialType, setMaterialType] = useState(materialPrices[0]?.materialType ?? "Mid Grade");
  const [weight, setWeight] = useState("12");

  const selectedPrice = materialPrices.find(
    (price) => price.category === materialCategory && price.materialType === materialType,
  );
  const value = selectedPrice ? Number((selectedPrice.price * Number(weight)).toFixed(2)) : 0;

  const handleSubmit = async () => {
    if (!participantId || isDisabled) return;
    await onSubmit({
      participantId,
      materialCategory,
      materialType,
      weight: Number(weight),
      productionDate: new Date().toISOString(),
    });
  };

  const categories = Array.from(new Set(materialPrices.map((price) => price.category)));
  const types = materialPrices.filter((price) => price.category === materialCategory).map((price) => price.materialType);

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg">Log Production</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isDisabled ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            Add participants and material prices to enable production logging.
          </p>
        ) : null}
        <div>
          <label className="text-sm font-medium text-slate-700">Participant</label>
          <select
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={participantId}
            onChange={(event) => setParticipantId(event.target.value)}
            aria-label="Select participant"
            disabled={isDisabled}
          >
            {participants.map((participant) => (
              <option key={participant.id} value={participant.id}>
                {participant.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Material Category</label>
            <select
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={materialCategory}
              onChange={(event) => setMaterialCategory(event.target.value)}
              aria-label="Material category"
              disabled={isDisabled}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Material Type</label>
            <select
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={materialType}
              onChange={(event) => setMaterialType(event.target.value)}
              aria-label="Material type"
              disabled={isDisabled}
            >
              {types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Weight (lbs)</label>
            <Input
              className="mt-2"
              type="number"
              min="0"
              step="0.1"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              aria-label="Weight"
              disabled={isDisabled}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Value</label>
            <Input className="mt-2" value={formatCurrency(value)} disabled aria-label="Value" />
          </div>
        </div>
        <Button className="w-full" onClick={handleSubmit} aria-label="Submit production log" disabled={isDisabled}>
          Submit
        </Button>
      </CardContent>
    </Card>
  );
};

const WorkLogTable = ({
  items,
  isAdmin,
  onUpdate,
  onDelete,
}: {
  items: WorkLog[];
  isAdmin: boolean;
  onUpdate: (id: string, updates: Partial<WorkLog>) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
}) => (
  <Card className="border-slate-200">
    <CardHeader>
      <CardTitle className="text-lg">Today&apos;s Work Logs</CardTitle>
    </CardHeader>
    <CardContent className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase text-slate-500">
          <tr>
            <th className="py-2">Name</th>
            <th className="py-2">Role</th>
            <th className="py-2">Hours</th>
            <th className="py-2">Notes</th>
            <th className="py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-6 text-center text-sm text-slate-500">
                No work logs yet.
              </td>
            </tr>
          ) : (
            items.map((log) => (
              <tr key={log.id} className="border-t border-slate-100">
                <td className="py-3">{log.participantName}</td>
                <td className="py-3">{log.role}</td>
                <td className="py-3">{log.hours}</td>
                <td className="py-3 text-slate-500">{log.notes ?? "—"}</td>
                <td className="py-3 text-right">
                  <EditWorkLogDialog log={log} onSave={onUpdate} />
                  {isAdmin ? (
                    <button
                      className="ml-2 inline-flex items-center text-xs font-semibold text-red-600 hover:text-red-700"
                      onClick={() => onDelete(log.id)}
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
    </CardContent>
  </Card>
);

const ProductionTable = ({
  items,
  isAdmin,
  onUpdate,
  onDelete,
}: {
  items: ProductionRecord[];
  isAdmin: boolean;
  onUpdate: (id: string, updates: Partial<ProductionRecord>) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
}) => (
  <Card className="border-slate-200">
    <CardHeader>
      <CardTitle className="text-lg">Today&apos;s Production</CardTitle>
    </CardHeader>
    <CardContent className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase text-slate-500">
          <tr>
            <th className="py-2">Name</th>
            <th className="py-2">Material</th>
            <th className="py-2">Weight</th>
            <th className="py-2">Value</th>
            <th className="py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-6 text-center text-sm text-slate-500">
                No production entries yet.
              </td>
            </tr>
          ) : (
            items.map((record) => (
              <tr key={record.id} className="border-t border-slate-100">
                <td className="py-3">{record.participantName}</td>
                <td className="py-3">
                  {record.materialCategory} - {record.materialType}
                </td>
                <td className="py-3">{record.weight} lbs</td>
                <td className="py-3">{formatCurrency(record.value)}</td>
                <td className="py-3 text-right">
                  <EditProductionDialog record={record} onSave={onUpdate} />
                  {isAdmin ? (
                    <button
                      className="ml-2 inline-flex items-center text-xs font-semibold text-red-600 hover:text-red-700"
                      onClick={() => onDelete(record.id)}
                      aria-label="Delete production record"
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
    </CardContent>
  </Card>
);

const EditWorkLogDialog = ({ log, onSave }: { log: WorkLog; onSave: (id: string, updates: Partial<WorkLog>) => void }) => {
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
            <Input className="mt-2" value={role} onChange={(event) => setRole(event.target.value)} />
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
          <Button onClick={handleSave} aria-label="Save work log">
            Save changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const EditProductionDialog = ({
  record,
  onSave,
}: {
  record: ProductionRecord;
  onSave: (id: string, updates: Partial<ProductionRecord>) => void;
}) => {
  const [materialCategory, setMaterialCategory] = useState(record.materialCategory);
  const [materialType, setMaterialType] = useState(record.materialType);
  const [weight, setWeight] = useState(String(record.weight));

  const handleSave = () => {
    onSave(record.id, { materialCategory, materialType, weight: Number(weight) });
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
          <DialogTitle>Edit Production</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Category</label>
            <Input className="mt-2" value={materialCategory} onChange={(event) => setMaterialCategory(event.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Material Type</label>
            <Input className="mt-2" value={materialType} onChange={(event) => setMaterialType(event.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Weight (lbs)</label>
            <Input
              className="mt-2"
              type="number"
              min="0"
              step="0.1"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
          <Button onClick={handleSave} aria-label="Save production record">
            Save changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
