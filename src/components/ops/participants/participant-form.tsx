"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const categories = [
  { label: "Incarceration", value: "incarceration" },
  { label: "Addiction", value: "addiction" },
  { label: "Homelessness", value: "homelessness" },
  { label: "Mental Health", value: "mental_health" },
  { label: "Other", value: "other" },
];

export const ParticipantForm = ({
  initialValues,
  participantId,
  onSuccess,
  redirectPath = "/participants",
}: {
  initialValues?: {
    name: string;
    email?: string | null;
    phone?: string | null;
    entryDate?: string | null;
    currentPhase: number;
    categories: string[];
    status: string;
  };
  participantId?: string;
  onSuccess?: () => void;
  redirectPath?: string;
}) => {
  const router = useRouter();
  const [name, setName] = useState(initialValues?.name ?? "");
  const [email, setEmail] = useState(initialValues?.email ?? "");
  const [phone, setPhone] = useState(initialValues?.phone ?? "");
  const [entryDate, setEntryDate] = useState(
    initialValues?.entryDate ? initialValues.entryDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
  );
  const [currentPhase, setCurrentPhase] = useState(initialValues?.currentPhase ?? 0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialValues?.categories ?? []);
  const [status, setStatus] = useState(initialValues?.status ?? "active");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleCategory = (value: string) => {
    setSelectedCategories((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const payload = {
      name,
      email: email || null,
      phone: phone || null,
      entryDate: new Date(entryDate).toISOString(),
      currentPhase,
      categories: selectedCategories,
      status,
    };

    const res = await fetch(participantId ? `/api/participants/${participantId}` : "/api/participants", {
      method: participantId ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setErrorMessage(data.error ?? "Failed to save participant.");
      setIsSubmitting(false);
      return;
    }

    onSuccess?.();
    router.push(redirectPath);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          {participantId ? "Edit Participant" : "Add New Participant"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          {participantId ? "Update Participant Profile" : "Create Participant Profile"}
        </h1>
        {errorMessage ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Participant Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Full Name *</label>
              <Input className="mt-2" value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Email (optional)</label>
              <Input className="mt-2" value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Phone (optional)</label>
              <Input className="mt-2" value={phone} onChange={(event) => setPhone(event.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Entry Date *</label>
              <Input
                className="mt-2"
                type="date"
                value={entryDate}
                onChange={(event) => setEntryDate(event.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Current Phase *</label>
            <div className="mt-2 grid gap-2 sm:grid-cols-5">
              {[0, 1, 2, 3, 4].map((phaseValue) => (
                <label
                  key={phaseValue}
                  className={`flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium ${
                    currentPhase === phaseValue ? "border-slate-900 bg-slate-100" : "border-slate-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="phase"
                    className="sr-only"
                    checked={currentPhase === phaseValue}
                    onChange={() => setCurrentPhase(phaseValue)}
                  />
                  Phase {phaseValue}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Categories *</label>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {categories.map((category) => (
                <label
                  key={category.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                    selectedCategories.includes(category.value) ? "border-slate-900 bg-slate-100" : "border-slate-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.value)}
                    onChange={() => handleToggleCategory(category.value)}
                  />
                  {category.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Status *</label>
            <div className="mt-2 grid gap-2 sm:grid-cols-4">
              {["active", "staffing", "graduated", "exited"].map((statusValue) => (
                <label
                  key={statusValue}
                  className={`flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium ${
                    status === statusValue ? "border-slate-900 bg-slate-100" : "border-slate-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    className="sr-only"
                    checked={status === statusValue}
                    onChange={() => setStatus(statusValue)}
                  />
                  {statusValue}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => router.push("/participants")}>
              Cancel
            </Button>
            <Button className="w-full sm:w-auto" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Participant"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
