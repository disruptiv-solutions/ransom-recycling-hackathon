"use client";

import { useEffect, useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Key, Loader2, Save, Trash2 } from "lucide-react";
import type { AppRole } from "@/lib/auth/roles";

type User = {
  id: string;
  displayName?: string | null;
  email?: string | null;
  role: AppRole;
};

interface EditUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedUser: User) => void;
  onDelete: (deletedUserId: string) => void;
  currentUserUid: string;
}

export function EditUserModal({
  user,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  currentUserUid,
}: EditUserModalProps) {
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState<AppRole>(user?.role || "case_manager");
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync state when user changes
  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName || "");
    setEmail(user.email || "");
    setRole(user.role);
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/updateUser", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          targetUid: user.id,
          displayName,
          email,
          role
        }),
      });

      if (res.ok) {
        onUpdate({ ...user, displayName, email, role });
        onClose();
      } else {
        alert("Failed to update user");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    setIsResetting(true);
    try {
      const res = await fetch("/api/admin/resetPassword", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Password reset link generated: ${data.link}\n\nIn a production environment, this would be sent via email.`);
      } else {
        alert("Failed to trigger password reset");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setIsResetting(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    if (user.id === currentUserUid) {
      alert("You can't delete your own Super Admin account.");
      return;
    }

    const label = user.displayName || user.email || "this user";
    const confirmed = window.confirm(`Delete ${label}? This permanently removes their account and access.`);
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch("/api/admin/deleteUsers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ uids: [user.id] }),
      });

      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to delete user.");
      }

      onDelete(user.id);
      onClose();
    } catch (err: any) {
      alert(typeof err?.message === "string" ? err.message : "Failed to delete user.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;
  const isSelf = user.id === currentUserUid;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit User Profile</DialogTitle>
          <DialogDescription>
            Update account details and permissions for {user.displayName || "this user"}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">Display Name</Label>
            <Input 
              id="name" 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)}
              className="rounded-xl border-slate-100 h-12"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email" className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">Email Address</Label>
            <Input 
              id="email" 
              type="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border-slate-100 h-12"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role" className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">User Role</Label>
            <Select value={role} onValueChange={(val) => setRole(val as AppRole)}>
              <SelectTrigger className="rounded-xl border-slate-100 h-12 font-medium">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="case_manager">Case Manager</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Button 
            variant="outline" 
            className="w-full h-12 rounded-xl border-slate-100 text-slate-600 font-bold hover:bg-slate-50"
            onClick={handleResetPassword}
            disabled={isResetting}
          >
            {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Key className="mr-2 h-4 w-4" />}
            Send Reset Password Link
          </Button>
          <DialogFooter className="sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold">
                Cancel
              </Button>
              {!isSelf ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting || isSaving || isResetting}
                  className="rounded-xl h-12 px-4 font-bold"
                  aria-label="Delete user"
                >
                  {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                  Delete
                </Button>
              ) : null}
            </div>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || isDeleting}
              className="rounded-xl bg-primary h-12 px-8 font-bold"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </DialogFooter>
          {isSelf ? (
            <p className="text-[11px] font-medium text-muted-foreground">
              You can’t delete your own Super Admin account.
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
