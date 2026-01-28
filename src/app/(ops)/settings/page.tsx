import { redirect } from "next/navigation";

import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { mapMaterialPrice } from "@/lib/ops/firestore";
import { SettingsPanel } from "@/components/ops/settings/settings-panel";
import { getSessionProfile } from "@/lib/auth/session";

export const runtime = "nodejs";

export default async function SettingsPage() {
  const profile = await getSessionProfile();
  if (!profile || profile.originalRole !== "admin") redirect("/operations");

  const [pricesSnap, usersSnap] = await Promise.all([
    getFirebaseAdminDb().collection("material_prices").orderBy("category").get(),
    getFirebaseAdminDb().collection("profiles").orderBy("displayName").get(),
  ]);

  const materialPrices = pricesSnap.docs.map((doc) => mapMaterialPrice(doc.id, doc.data()));
  const users = usersSnap.docs.map((doc) => ({ uid: doc.id, ...(doc.data() ?? {}) }));

  return <SettingsPanel materialPrices={materialPrices} users={users} />;
}
