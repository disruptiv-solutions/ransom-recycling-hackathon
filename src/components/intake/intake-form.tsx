"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export type IntakeStatus = "incomplete" | "in_progress" | "complete";

export type IntakePayload = {
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  goals?: string;
  barriers?: string;
  notes?: string;
};

const getIntakeBadge = (status: IntakeStatus) => {
  if (status === "complete") {
    return <Badge className="rounded-full border-none bg-green-100 px-4 text-green-700 hover:bg-green-100">Complete</Badge>;
  }
  if (status === "in_progress") {
    return <Badge className="rounded-full border-none bg-blue-100 px-4 text-blue-700 hover:bg-blue-100">In progress</Badge>;
  }
  return <Badge className="rounded-full border-none bg-slate-100 px-4 text-slate-700 hover:bg-slate-100">Incomplete</Badge>;
};

export function IntakeForm({
  participantId,
  participantName,
  participantEmail,
  initialStatus,
  initialPayload,
}: {
  participantId: string;
  participantName: string | null;
  participantEmail: string | null;
  initialStatus: IntakeStatus;
  initialPayload: IntakePayload;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<IntakeStatus>(initialStatus);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [form, setForm] = useState<IntakePayload>(() => ({
    phone: initialPayload.phone ?? "",
    addressLine1: initialPayload.addressLine1 ?? "",
    addressLine2: initialPayload.addressLine2 ?? "",
    city: initialPayload.city ?? "",
    state: initialPayload.state ?? "",
    postalCode: initialPayload.postalCode ?? "",
    emergencyContactName: initialPayload.emergencyContactName ?? "",
    emergencyContactPhone: initialPayload.emergencyContactPhone ?? "",
    goals: initialPayload.goals ?? "",
    barriers: initialPayload.barriers ?? "",
    notes: initialPayload.notes ?? "",
  }));

  const safeName = useMemo(() => participantName || "Unnamed Participant", [participantName]);

  const isRequiredComplete = useMemo(() => {
    const isNonEmpty = (v: unknown) => typeof v === "string" && v.trim().length > 0;

    return (
      isNonEmpty(form.phone) &&
      isNonEmpty(form.addressLine1) &&
      isNonEmpty(form.city) &&
      isNonEmpty(form.state) &&
      isNonEmpty(form.postalCode) &&
      isNonEmpty(form.emergencyContactName) &&
      isNonEmpty(form.emergencyContactPhone) &&
      isNonEmpty(form.goals) &&
      isNonEmpty(form.barriers)
    );
  }, [
    form.addressLine1,
    form.barriers,
    form.city,
    form.emergencyContactName,
    form.emergencyContactPhone,
    form.goals,
    form.phone,
    form.postalCode,
    form.state,
  ]);

  const saveButtonLabel = isSaving ? "Saving..." : isRequiredComplete ? "Save" : "Save draft";

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/participants/${participantId}/intake`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ intake: form }),
      });

      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; intakeStatus?: IntakeStatus } | null;
      if (!res.ok || !data?.ok || !data.intakeStatus) {
        throw new Error(data?.error || "Failed to save intake form.");
      }

      setStatus(data.intakeStatus);
      router.refresh();
    } catch (e: any) {
      setErrorMessage(typeof e?.message === "string" ? e.message : "Failed to save intake form.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkComplete = async () => {
    setIsCompleting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/participants/${participantId}/intake`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
      });

      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; intakeStatus?: IntakeStatus } | null;
      if (!res.ok || !data?.ok || data.intakeStatus !== "complete") {
        throw new Error(data?.error || "Failed to mark complete.");
      }

      setStatus("complete");
      router.refresh();
    } catch (e: any) {
      setErrorMessage(typeof e?.message === "string" ? e.message : "Failed to mark complete.");
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="rounded-[2rem] border-none bg-white shadow-sm">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Participant intake form</p>
              <h1 className="mt-2 truncate text-2xl font-black tracking-tight text-slate-900">{safeName}</h1>
              <p className="mt-1 truncate text-sm text-slate-500">{participantEmail || "No email on file"}</p>
            </div>

            <div className="flex flex-col items-start gap-3 sm:items-end">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Status</span>
                {getIntakeBadge(status)}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-xl border-slate-200 font-bold"
                  onClick={() => window.close()}
                  aria-label="Close intake form tab"
                >
                  Close tab
                </Button>
                <Button
                  type="button"
                  className="h-11 rounded-xl bg-primary px-6 font-black text-white hover:bg-primary/90"
                  onClick={handleSave}
                  disabled={isSaving || isCompleting}
                  aria-label={isRequiredComplete ? "Save intake form" : "Save intake form draft"}
                >
                  {saveButtonLabel}
                </Button>
                <Button
                  type="button"
                  className="h-11 rounded-xl bg-slate-900 px-6 font-black text-white hover:bg-slate-900/90"
                  onClick={handleMarkComplete}
                  disabled={status === "complete" || isSaving || isCompleting}
                  aria-label="Mark intake form complete"
                >
                  {isCompleting ? "Completing..." : "Mark complete"}
                </Button>
              </div>
            </div>
          </div>

          {errorMessage ? <p className="mt-4 text-sm font-medium text-destructive">{errorMessage}</p> : null}
        </CardContent>
      </Card>

      <Card className="rounded-[2rem] border-none bg-white shadow-sm">
        <CardContent className="p-6 sm:p-8">
          <div className="grid gap-8">
            <div className="grid gap-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Phone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className="h-12 rounded-xl border-slate-100 px-5 text-base focus:ring-2 focus:ring-primary/20"
                    placeholder="(555) 555-5555"
                    aria-label="Phone"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Address</p>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid gap-2">
                  <Label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Address line 1</Label>
                  <Input
                    value={form.addressLine1}
                    onChange={(e) => setForm((prev) => ({ ...prev, addressLine1: e.target.value }))}
                    className="h-12 rounded-xl border-slate-100 px-5 text-base focus:ring-2 focus:ring-primary/20"
                    placeholder="123 Main St"
                    aria-label="Address line 1"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Address line 2</Label>
                  <Input
                    value={form.addressLine2}
                    onChange={(e) => setForm((prev) => ({ ...prev, addressLine2: e.target.value }))}
                    className="h-12 rounded-xl border-slate-100 px-5 text-base focus:ring-2 focus:ring-primary/20"
                    placeholder="Apt / Unit"
                    aria-label="Address line 2"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="grid gap-2">
                    <Label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">City</Label>
                    <Input
                      value={form.city}
                      onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                      className="h-12 rounded-xl border-slate-100 px-5 text-base focus:ring-2 focus:ring-primary/20"
                      placeholder="City"
                      aria-label="City"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">State</Label>
                    <Input
                      value={form.state}
                      onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
                      className="h-12 rounded-xl border-slate-100 px-5 text-base focus:ring-2 focus:ring-primary/20"
                      placeholder="State"
                      aria-label="State"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Postal code</Label>
                    <Input
                      value={form.postalCode}
                      onChange={(e) => setForm((prev) => ({ ...prev, postalCode: e.target.value }))}
                      className="h-12 rounded-xl border-slate-100 px-5 text-base focus:ring-2 focus:ring-primary/20"
                      placeholder="ZIP"
                      aria-label="Postal code"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Emergency contact</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Name</Label>
                  <Input
                    value={form.emergencyContactName}
                    onChange={(e) => setForm((prev) => ({ ...prev, emergencyContactName: e.target.value }))}
                    className="h-12 rounded-xl border-slate-100 px-5 text-base focus:ring-2 focus:ring-primary/20"
                    placeholder="Contact name"
                    aria-label="Emergency contact name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Phone</Label>
                  <Input
                    value={form.emergencyContactPhone}
                    onChange={(e) => setForm((prev) => ({ ...prev, emergencyContactPhone: e.target.value }))}
                    className="h-12 rounded-xl border-slate-100 px-5 text-base focus:ring-2 focus:ring-primary/20"
                    placeholder="(555) 555-5555"
                    aria-label="Emergency contact phone"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Program</p>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="grid gap-2">
                  <Label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Goals</Label>
                  <Textarea
                    value={form.goals}
                    onChange={(e) => setForm((prev) => ({ ...prev, goals: e.target.value }))}
                    className="min-h-[140px] rounded-xl border-slate-100 p-5 text-base focus:ring-2 focus:ring-primary/20"
                    placeholder="What does success look like?"
                    aria-label="Goals"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Barriers</Label>
                  <Textarea
                    value={form.barriers}
                    onChange={(e) => setForm((prev) => ({ ...prev, barriers: e.target.value }))}
                    className="min-h-[140px] rounded-xl border-slate-100 p-5 text-base focus:ring-2 focus:ring-primary/20"
                    placeholder="What challenges should we plan for?"
                    aria-label="Barriers"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Notes</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                  className="min-h-[160px] rounded-xl border-slate-100 p-5 text-base focus:ring-2 focus:ring-primary/20"
                  placeholder="Anything else to capture?"
                  aria-label="Notes"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

