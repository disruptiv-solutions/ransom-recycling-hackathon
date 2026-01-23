import { doc, serverTimestamp, setDoc } from "firebase/firestore";

import type { AppRole } from "@/lib/auth/roles";
import { getFirestoreDb } from "@/lib/firebase/client";

export type ProfileDoc = {
  role: AppRole;
  email: string;
  displayName?: string | null;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export const upsertProfile = async (params: {
  uid: string;
  role: AppRole;
  email: string;
  displayName?: string | null;
}) => {
  const db = getFirestoreDb();
  const ref = doc(db, "profiles", params.uid);
  const payload: ProfileDoc = {
    role: params.role,
    email: params.email,
    displayName: params.displayName ?? null,
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  };
  await setDoc(ref, payload, { merge: true });
};

