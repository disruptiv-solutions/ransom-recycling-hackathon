/**
 * One-time script to bootstrap the super-admin account.
 * Run with: npx tsx scripts/bootstrap-admin.ts <uid>
 *
 * This uses Firebase Admin SDK (server-side) to bypass Firestore rules.
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local explicitly
config({ path: resolve(process.cwd(), ".env.local") });

import { getFirebaseAdminDb, getFirebaseAdminAuth } from "../src/lib/firebase/admin.js";

const TARGET_UID = process.argv[2];

if (!TARGET_UID) {
  console.error("Usage: npx tsx scripts/bootstrap-admin.ts <firebase-auth-uid>");
  console.error("\nExample:");
  console.error("  npx tsx scripts/bootstrap-admin.ts 7kYaZzG7KNgfvQGC2XpcC23LCVm2");
  process.exit(1);
}

const bootstrapAdmin = async () => {
  try {
    console.log(`Setting up admin profile for UID: ${TARGET_UID}...`);

    const db = getFirebaseAdminDb();
    const auth = getFirebaseAdminAuth();
    
    // Get user from Auth to get their email
    const userAuth = await auth.getUser(TARGET_UID);
    console.log(`Found user: ${userAuth.email}`);

    const profileRef = db.doc(`profiles/${TARGET_UID}`);

    // Check if profile already exists
    const existing = await profileRef.get();
    if (existing.exists) {
      const data = existing.data();
      console.log(`⚠️  Profile already exists with role: ${data?.role ?? "unknown"}`);
      console.log(`   Updating to admin role...`);
    }

    await profileRef.set(
      {
        role: "admin",
        email: userAuth.email,
        displayName: userAuth.displayName || "Super Admin",
        createdAt: existing.exists ? existing.data()?.createdAt : new Date(),
        updatedAt: new Date(),
      },
      { merge: true },
    );

    console.log(`\n✅ Successfully set admin profile for UID: ${TARGET_UID}`);
    console.log(`   Role: admin`);
    console.log(`   Display Name: Super Admin`);
    console.log(`\n   You can now sign in with this account and manage other users via the admin API.`);
  } catch (err) {
    console.error("\n❌ Failed to bootstrap admin:", err);
    if (err instanceof Error) {
      console.error(`   Error: ${err.message}`);
    }
    process.exit(1);
  }
};

bootstrapAdmin();
