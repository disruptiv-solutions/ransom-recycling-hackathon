"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, UserPlus } from "lucide-react";
import type { AppRole } from "@/lib/auth/roles";

interface CreateCaseFormProps {
  caseManagers: { id: string; displayName: string }[];
  supervisors: { id: string; displayName: string }[];
}

export function CreateCaseForm({ caseManagers, supervisors }: CreateCaseFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    caseManagerId: "",
    supervisorId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setInviteLink(null);
    setErrorMessage(null);
    
    try {
      const res = await fetch("/api/admin/createUser", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          role: "participant" satisfies AppRole,
          displayName: formData.displayName,
          email: formData.email,
          caseManagerId: formData.caseManagerId,
          supervisorId: formData.supervisorId,
        }),
      });

      const data = (await res.json().catch(() => null)) as { ok?: boolean; resetLink?: string; error?: string } | null;
      if (!res.ok || !data?.ok || !data.resetLink) {
        setErrorMessage(data?.error || "Failed to create participant.");
        return;
      }

      setInviteLink(data.resetLink);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to create participant. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="rounded-[2.5rem] border-none bg-white shadow-sm overflow-hidden">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label className="font-bold text-slate-500 uppercase text-[10px] tracking-widest px-1">Full Name</Label>
              <Input 
                required
                placeholder="e.g. Marcus Thompson"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="rounded-xl border-slate-100 h-14 px-6 text-lg focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid gap-2">
              <Label className="font-bold text-slate-500 uppercase text-[10px] tracking-widest px-1">Email Address</Label>
              <Input 
                required
                type="email"
                placeholder="marcus@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="rounded-xl border-slate-100 h-14 px-6 text-lg focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="grid gap-2">
                <Label className="font-bold text-slate-500 uppercase text-[10px] tracking-widest px-1">Assigned Case Manager</Label>
                <Select 
                  required
                  value={formData.caseManagerId} 
                  onValueChange={(val) => setFormData({ ...formData, caseManagerId: val })}
                >
                  <SelectTrigger className="rounded-xl border-slate-100 h-14 px-6 font-medium text-slate-700 focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder="Select Manager" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100">
                    {caseManagers.length > 0 ? (
                      caseManagers.map((cm) => (
                        <SelectItem
                          key={cm.id}
                          value={cm.id}
                          className="mx-1 my-0.5 rounded-xl focus:bg-[#E8FBF4] focus:text-[#1F292E] data-[state=checked]:bg-[#E8FBF4] data-[state=checked]:text-[#1F292E]"
                        >
                          {cm.displayName}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled className="mx-1 my-0.5 rounded-xl">
                        No Case Managers found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="font-bold text-slate-500 uppercase text-[10px] tracking-widest px-1">Site Supervisor</Label>
                <Select 
                  required
                  value={formData.supervisorId} 
                  onValueChange={(val) => setFormData({ ...formData, supervisorId: val })}
                >
                  <SelectTrigger className="rounded-xl border-slate-100 h-14 px-6 font-medium text-slate-700 focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder="Select Supervisor" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100">
                    {supervisors.length > 0 ? (
                      supervisors.map((s) => (
                        <SelectItem
                          key={s.id}
                          value={s.id}
                          className="mx-1 my-0.5 rounded-xl focus:bg-[#E8FBF4] focus:text-[#1F292E] data-[state=checked]:bg-[#E8FBF4] data-[state=checked]:text-[#1F292E]"
                        >
                          {s.displayName}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled className="mx-1 my-0.5 rounded-xl">
                        No Supervisors found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <Button 
              type="button" 
              variant="ghost" 
              className="h-14 flex-1 rounded-2xl font-bold text-slate-500"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="h-14 flex-[2] rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-6 w-6" />
                  Initialize Case
                </>
              )}
            </Button>
          </div>

          {errorMessage ? (
            <p className="text-sm font-medium text-destructive">{errorMessage}</p>
          ) : null}

          {inviteLink ? (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Invite Link</p>
              <p className="mt-2 break-all text-xs text-slate-700">{inviteLink}</p>
              <div className="mt-4 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl border-slate-200 font-bold"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(inviteLink);
                    } catch {
                      // ignore
                    }
                  }}
                >
                  Copy link
                </Button>
                <Button
                  type="button"
                  className="h-10 rounded-xl bg-primary font-bold hover:bg-primary/90"
                  onClick={() => {
                    router.push("/admin");
                    router.refresh();
                  }}
                >
                  Back to Admin
                </Button>
              </div>
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
