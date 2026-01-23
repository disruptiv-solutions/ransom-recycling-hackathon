import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

import { getServerEnv } from "@/lib/env/server";

let cachedAdminApp: ReturnType<typeof initializeApp> | null = null;

const getFirebaseAdminApp = () => {
  if (cachedAdminApp) return cachedAdminApp;

  if (getApps().length > 0) {
    cachedAdminApp = getApps()[0]!;
    return cachedAdminApp;
  }

  const env = getServerEnv();
  
  // Handle private key: if it has \n sequences, replace them; if it already has newlines, use as-is
  let privateKey = env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (privateKey.includes("\\n")) {
    // Has \n sequences - replace with actual newlines
    privateKey = privateKey.replace(/\\n/g, "\n");
  } else if (!privateKey.includes("\n")) {
    // No newlines at all - this is invalid
    throw new Error(
      "FIREBASE_ADMIN_PRIVATE_KEY must have newlines (either actual newlines or \\n sequences)"
    );
  }
  // If it already has newlines, use it as-is (trim any extra whitespace)
  privateKey = privateKey.trim();
  
  cachedAdminApp = initializeApp({
    credential: cert({
      projectId: env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
  });
  return cachedAdminApp;
};

export const getFirebaseAdminAuth = () => getAuth(getFirebaseAdminApp());
export const getFirebaseAdminDb = () => getFirestore(getFirebaseAdminApp());

