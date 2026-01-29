import { cookies } from "next/headers";

const DEMO_MODE_KEY = "demo-mode";

export const getServerDemoMode = async () => {
  const store = await cookies();
  return store.get(DEMO_MODE_KEY)?.value === "true";
};
