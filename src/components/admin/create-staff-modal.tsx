"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Copy, Check } from "lucide-react";
import type { AppRole } from "@/lib/auth/roles";

type StaffRole = Extract<AppRole, "case_manager" | "supervisor">;

interface CreateStaffModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  presetRole: StaffRole;
}

type CreateUserResponse =
  | { ok: true; uid: string; email: string; role: AppRole; resetLink: string }
  | { ok: false; error: string; details?: unknown };

export function CreateStaffModal({ isOpen, onOpenChange, presetRole }: CreateStaffModalProps) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [didCopy, setDidCopy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const title = useMemo(() => (presetRole === "case_manager" ? "Add Case Manager" : "Add Supervisor"), [presetRole]);
  const helperText = useMemo(
    () =>
      presetRole === "case_manager"
        ? "Creates a Case Manager account and generates an invite link."
        : "Creates a Supervisor account and generates an invite link.",
    [presetRole],
  );

  const handleClose = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setIsSaving(false);
      setErrorMessage(null);
      setDidCopy(false);
      setResetLink(null);
      setDisplayName("");
      setEmail("");
    }
  };

  const handleCopy = async () => {
    if (!resetLink) return;
    try {
      await navigator.clipboard.writeText(resetLink);
      setDidCopy(true);
      window.setTimeout(() => setDidCopy(false), 1500);
    } catch {
      setDidCopy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setResetLink(null);

    try {
      const res = await fetch("/api/admin/createUser", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          role: presetRole,
          displayName,
          email,
        }),
      });

      const data = (await res.json().catch(() => null)) as CreateUserResponse | null;
      if (!res.ok || !data) {
        setErrorMessage("Failed to create user. Please try again.");
        return;
      }

      if (!data.ok) {
        setErrorMessage(typeof data.error === "string" ? data.error : "Failed to create user.");
        return;
      }

      setResetLink(data.resetLink);
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to create user. Please check your connection and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          <DialogDescription>{helperText}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-2">
            <Label className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">Full Name</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="h-12 rounded-xl border-slate-100"
              placeholder={presetRole === "case_manager" ? "e.g. Sarah Miller" : "e.g. John Doe"}
            />
          </div>

          <div className="grid gap-2">
            <Label className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              className="h-12 rounded-xl border-slate-100"
              placeholder="name@org.org"
            />
          </div>

          {errorMessage ? <p className="text-sm font-medium text-destructive">{errorMessage}</p> : null}

          {resetLink ? (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Invite Link</p>
              <p className="mt-2 break-all text-xs text-slate-700">{resetLink}</p>
              <Button
                type="button"
                variant="outline"
                className="mt-4 h-10 rounded-xl border-slate-200 font-bold"
                onClick={handleCopy}
                aria-label="Copy invite link"
              >
                {didCopy ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {didCopy ? "Copied" : "Copy link"}
              </Button>
            </div>
          ) : null}

          <DialogFooter className="gap-2 sm:justify-between">
            <Button type="button" variant="ghost" className="rounded-xl font-bold" onClick={() => handleClose(false)}>
              Close
            </Button>
            <Button type="submit" disabled={isSaving} className="h-12 rounded-xl bg-primary px-8 font-bold hover:bg-primary/90">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create {presetRole === "case_manager" ? "Manager" : "Supervisor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

