import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

import { getPublicEnv } from "@/lib/env/public";

let cachedApp: ReturnType<typeof initializeApp> | null = null;

const getFirebaseApp = () => {
  if (cachedApp) return cachedApp;

  if (getApps().length > 0) {
    cachedApp = getApps()[0]!;
    return cachedApp;
  }

  const publicEnv = getPublicEnv();
  cachedApp = initializeApp({
    apiKey: publicEnv.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: publicEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: publicEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: publicEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: publicEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: publicEnv.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
  return cachedApp;
};

export const getFirebaseAuth = () => getAuth(getFirebaseApp());
export const getFirestoreDb = () => getFirestore(getFirebaseApp());
export const getFirebaseStorage = () => getStorage(getFirebaseApp());

