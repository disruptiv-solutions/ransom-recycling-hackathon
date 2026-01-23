/**
 * Helper script to extract the private key from Firebase service account JSON.
 * 
 * Usage:
 *   1. Download service account JSON from Firebase Console
 *   2. Run: npx tsx scripts/extract-key-from-json.ts path/to/serviceAccountKey.json
 *   3. Copy the output and paste into .env.local
 */

import { readFileSync } from "fs";
import { resolve } from "path";

const jsonPath = process.argv[2];

if (!jsonPath) {
  console.error("Usage: npx tsx scripts/extract-key-from-json.ts <path-to-service-account-json>");
  console.error("\nExample:");
  console.error('  npx tsx scripts/extract-key-from-json.ts ./firebase-service-account.json');
  process.exit(1);
}

try {
  const fullPath = resolve(process.cwd(), jsonPath);
  const jsonContent = readFileSync(fullPath, "utf-8");
  const serviceAccount = JSON.parse(jsonContent);

  if (!serviceAccount.private_key) {
    console.error("❌ JSON file doesn't contain 'private_key' field");
    process.exit(1);
  }

  const privateKey = serviceAccount.private_key;

  console.log("✅ Extracted private key from JSON file\n");
  console.log("Copy this into your .env.local file:\n");
  console.log("FIREBASE_ADMIN_PRIVATE_KEY=" + JSON.stringify(privateKey));
  console.log("\n");
  console.log("Or if your .env.local already has quotes, use just the value:");
  console.log(JSON.stringify(privateKey));
  
} catch (err) {
  if (err instanceof Error) {
    if (err.message.includes("ENOENT")) {
      console.error(`❌ File not found: ${jsonPath}`);
    } else if (err.message.includes("Unexpected token")) {
      console.error(`❌ Invalid JSON file: ${jsonPath}`);
    } else {
      console.error(`❌ Error: ${err.message}`);
    }
  } else {
    console.error("❌ Unknown error:", err);
  }
  process.exit(1);
}
