"use client";

import { signOut } from "firebase/auth";

import { Button } from "@/components/ui/button";
import { getFirebaseAuth } from "@/lib/firebase/client";

export function LogoutButton() {
  const handleLogout = async () => {
    await fetch("/api/auth/sessionLogout", { method: "POST" });
    await signOut(getFirebaseAuth());
    window.location.href = "/login";
  };

  return (
    <Button
      type="button"
      variant="secondary"
      aria-label="Log out"
      onClick={handleLogout}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleLogout();
      }}
    >
      Log out
    </Button>
  );
}

