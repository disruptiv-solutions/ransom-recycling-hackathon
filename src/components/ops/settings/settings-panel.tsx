"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import type { MaterialPrice } from "@/lib/ops/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type SettingsPanelProps = {
  materialPrices: MaterialPrice[];
  users: Array<{ uid: string; displayName?: string; email?: string; role?: string }>;
};

export const SettingsPanel = ({ materialPrices, users }: SettingsPanelProps) => {
  const [prices, setPrices] = useState(materialPrices);
  const [userList, setUserList] = useState(users);
  const [newPrice, setNewPrice] = useState({
    category: "",
    materialType: "",
    pricePerUnit: "",
    unit: "lb",
    role: "processing",
  });
  const [newUser, setNewUser] = useState({
    role: "supervisor",
    email: "",
    displayName: "",
    caseManagerId: "",
    supervisorId: "",
  });

  const handleAddPrice = async () => {
    const res = await fetch("/api/material-prices", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        category: newPrice.category,
        materialType: newPrice.materialType,
        pricePerUnit: Number(newPrice.pricePerUnit),
        unit: newPrice.unit,
        role: newPrice.role,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) return;
    setPrices((prev) => [
      {
        id: data.id,
        category: newPrice.category,
        materialType: newPrice.materialType,
        pricePerUnit: Number(newPrice.pricePerUnit),
        unit: newPrice.unit as "lb" | "each",
        role: newPrice.role,
      },
      ...prev,
    ]);
    setNewPrice({ category: "", materialType: "", pricePerUnit: "", unit: "lb", role: "processing" });
  };

  const handleUpdatePrice = async (id: string, updates: Partial<MaterialPrice>) => {
    const res = await fetch(`/api/material-prices/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) return;
    setPrices((prev) => prev.map((price) => (price.id === id ? { ...price, ...updates } : price)));
  };

  const handleDeletePrice = async (id: string) => {
    const res = await fetch(`/api/material-prices/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok || !data.ok) return;
    setPrices((prev) => prev.filter((price) => price.id !== id));
  };

  const handleAddUser = async () => {
    const payload = {
      role: newUser.role,
      email: newUser.email,
      displayName: newUser.displayName,
      caseManagerId: newUser.role === "participant" ? newUser.caseManagerId : undefined,
      supervisorId: newUser.role === "participant" ? newUser.supervisorId : undefined,
    };

    const res = await fetch("/api/admin/createUser", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) return;

    setUserList((prev) => [
      {
        uid: data.uid,
        displayName: newUser.displayName,
        email: newUser.email,
        role: newUser.role,
      },
      ...prev,
    ]);
    setNewUser({ role: "supervisor", email: "", displayName: "", caseManagerId: "", supervisorId: "" });
  };

  const handleUpdateUser = async (uid: string, updates: { role?: string; displayName?: string; email?: string }) => {
    const res = await fetch("/api/admin/updateUser", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ targetUid: uid, ...updates }),
    });
    const data = await res.json();
    if (!res.ok || data.error) return;
    setUserList((prev) => prev.map((user) => (user.uid === uid ? { ...user, ...updates } : user)));
  };

  const handleDeleteUser = async (uid: string) => {
    const res = await fetch("/api/admin/deleteUsers", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ uids: [uid] }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) return;
    setUserList((prev) => prev.filter((user) => user.uid !== uid));
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Configs</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">System Configuration</h1>
      </div>

      <Tabs defaultValue="materials">
        <TabsList>
          <TabsTrigger value="materials">Material Prices</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="materials" className="pt-4">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Material Prices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-5">
                <Input
                  placeholder="Category"
                  value={newPrice.category}
                  onChange={(event) => setNewPrice((prev) => ({ ...prev, category: event.target.value }))}
                />
                <Input
                  placeholder="Material Type"
                  value={newPrice.materialType}
                  onChange={(event) => setNewPrice((prev) => ({ ...prev, materialType: event.target.value }))}
                />
                <Input
                  placeholder="Price per unit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newPrice.pricePerUnit}
                  onChange={(event) => setNewPrice((prev) => ({ ...prev, pricePerUnit: event.target.value }))}
                />
                <select
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={newPrice.unit}
                  onChange={(event) => setNewPrice((prev) => ({ ...prev, unit: event.target.value }))}
                >
                  <option value="lb">lb</option>
                  <option value="each">each</option>
                </select>
                <select
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={newPrice.role}
                  onChange={(event) => setNewPrice((prev) => ({ ...prev, role: event.target.value }))}
                >
                  <option value="processing">Processing</option>
                  <option value="sorting">Sorting</option>
                  <option value="hammermill">Hammermill</option>
                  <option value="truck">Truck</option>
                </select>
                <Button onClick={handleAddPrice}>Add Material</Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase text-slate-500">
                    <tr>
                      <th className="py-2">Category</th>
                      <th className="py-2">Material Type</th>
                      <th className="py-2">Price</th>
                      <th className="py-2">Unit</th>
                      <th className="py-2">Role</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prices.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-sm text-slate-500">
                          No material prices yet.
                        </td>
                      </tr>
                    ) : (
                      prices.map((price) => (
                        <tr key={price.id} className="border-t border-slate-100">
                          <td className="py-3">{price.category}</td>
                          <td className="py-3">{price.materialType}</td>
                          <td className="py-3">${price.pricePerUnit.toFixed(2)}</td>
                          <td className="py-3">{price.unit}</td>
                          <td className="py-3 capitalize">{price.role}</td>
                          <td className="py-3 text-right">
                            <EditPriceDialog price={price} onSave={handleUpdatePrice} />
                            <button
                              className="ml-2 inline-flex items-center text-xs font-semibold text-red-600 hover:text-red-700"
                              onClick={() => handleDeletePrice(price.id)}
                              aria-label="Delete material price"
                            >
                              <Trash2 className="mr-1 h-3 w-3" aria-hidden="true" />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="pt-4">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">User Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-5">
                <Input
                  placeholder="Full name"
                  value={newUser.displayName}
                  onChange={(event) => setNewUser((prev) => ({ ...prev, displayName: event.target.value }))}
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={newUser.email}
                  onChange={(event) => setNewUser((prev) => ({ ...prev, email: event.target.value }))}
                />
                <select
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={newUser.role}
                  onChange={(event) => setNewUser((prev) => ({ ...prev, role: event.target.value }))}
                >
                  <option value="supervisor">Supervisor</option>
                  <option value="case_manager">Case Manager</option>
                  <option value="participant">Participant</option>
                </select>
                <Input
                  placeholder="Case Manager ID"
                  value={newUser.caseManagerId}
                  onChange={(event) => setNewUser((prev) => ({ ...prev, caseManagerId: event.target.value }))}
                />
                <Input
                  placeholder="Supervisor ID"
                  value={newUser.supervisorId}
                  onChange={(event) => setNewUser((prev) => ({ ...prev, supervisorId: event.target.value }))}
                />
                <Button onClick={handleAddUser}>Add User</Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase text-slate-500">
                    <tr>
                      <th className="py-2">Name</th>
                      <th className="py-2">Email</th>
                      <th className="py-2">Role</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userList.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-sm text-slate-500">
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      userList.map((user) => (
                        <tr key={user.uid} className="border-t border-slate-100">
                          <td className="py-3">{user.displayName ?? "—"}</td>
                          <td className="py-3">{user.email ?? "—"}</td>
                          <td className="py-3 capitalize">{user.role ?? "—"}</td>
                          <td className="py-3 text-right">
                            <EditUserDialog user={user} onSave={handleUpdateUser} />
                            <button
                              className="ml-2 inline-flex items-center text-xs font-semibold text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteUser(user.uid)}
                              aria-label="Delete user"
                            >
                              <Trash2 className="mr-1 h-3 w-3" aria-hidden="true" />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const EditPriceDialog = ({
  price,
  onSave,
}: {
  price: MaterialPrice;
  onSave: (id: string, updates: Partial<MaterialPrice>) => void;
}) => {
  const [category, setCategory] = useState(price.category);
  const [materialType, setMaterialType] = useState(price.materialType);
  const [priceValue, setPriceValue] = useState(String(price.pricePerUnit));
  const [unit, setUnit] = useState(price.unit);
  const [role, setRole] = useState(price.role);

  const handleSave = () => {
    onSave(price.id, { category, materialType, pricePerUnit: Number(priceValue), unit, role });
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
          <DialogTitle>Edit Material Price</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input value={category} onChange={(event) => setCategory(event.target.value)} />
          <Input value={materialType} onChange={(event) => setMaterialType(event.target.value)} />
          <Input type="number" value={priceValue} onChange={(event) => setPriceValue(event.target.value)} />
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={unit}
            onChange={(event) => setUnit(event.target.value as "lb" | "each")}
          >
            <option value="lb">lb</option>
            <option value="each">each</option>
          </select>
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="processing">Processing</option>
            <option value="sorting">Sorting</option>
            <option value="hammermill">Hammermill</option>
            <option value="truck">Truck</option>
          </select>
          <Button onClick={handleSave}>Save changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const EditUserDialog = ({
  user,
  onSave,
}: {
  user: { uid: string; displayName?: string; email?: string; role?: string };
  onSave: (uid: string, updates: { role?: string; displayName?: string; email?: string }) => void;
}) => {
  const [displayName, setDisplayName] = useState(user.displayName ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [role, setRole] = useState(user.role ?? "supervisor");

  const handleSave = () => {
    onSave(user.uid, { displayName, email, role });
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
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
          <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="supervisor">Supervisor</option>
            <option value="case_manager">Case Manager</option>
            <option value="participant">Participant</option>
            <option value="admin">Admin</option>
          </select>
          <Button onClick={handleSave}>Save changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
