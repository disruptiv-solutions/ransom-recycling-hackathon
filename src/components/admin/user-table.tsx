"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditUserModal } from "./edit-user-modal";
import type { AppRole } from "@/lib/auth/roles";

type User = {
  id: string;
  displayName?: string | null;
  email?: string | null;
  role: AppRole;
};

export function UserTable({
  initialUsers,
  currentUserUid,
}: {
  initialUsers: User[];
  currentUserUid: string;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const handleDeleteUser = (deletedUserId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== deletedUserId));
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin": return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 rounded-full px-4">Admin</Badge>;
      case "case_manager": return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 rounded-full px-4">Case Manager</Badge>;
      case "supervisor": return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 rounded-full px-4">Supervisor</Badge>;
      case "participant": return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 rounded-full px-4">Participant</Badge>;
      default: return <Badge variant="outline" className="rounded-full px-4">{role}</Badge>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="border-none">
            <TableHead className="px-8 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Name</TableHead>
            <TableHead className="py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest text-center">Role</TableHead>
            <TableHead className="py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest text-center">Status</TableHead>
            <TableHead className="px-8 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
              <TableCell className="px-8 py-6">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-700">{user.displayName || "No Name"}</span>
                  <span className="text-xs text-slate-400">{user.email || "No email available"}</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                {getRoleBadge(user.role)}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" className="border-green-200 bg-green-50 text-green-600 rounded-full px-4 font-bold text-[10px]">
                  Active
                </Badge>
              </TableCell>
              <TableCell className="px-8 text-right">
                <Button 
                  variant="ghost" 
                  className="font-bold text-slate-700 hover:bg-slate-100 rounded-xl"
                  onClick={() => setEditingUser(user)}
                >
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <EditUserModal 
        user={editingUser} 
        isOpen={!!editingUser} 
        onClose={() => setEditingUser(null)} 
        onUpdate={handleUpdateUser}
        onDelete={handleDeleteUser}
        currentUserUid={currentUserUid}
      />
    </div>
  );
}
