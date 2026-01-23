/**
 * Debug script to validate Firebase Admin env vars.
 * Run with: npx tsx scripts/validate-env.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

console.log("🔍 Validating Firebase Admin environment variables...\n");

if (!process.env.FIREBASE_ADMIN_PROJECT_ID) {
  console.error("❌ FIREBASE_ADMIN_PROJECT_ID is missing");
} else {
  console.log("✅ FIREBASE_ADMIN_PROJECT_ID:", process.env.FIREBASE_ADMIN_PROJECT_ID);
}

if (!process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
  console.error("❌ FIREBASE_ADMIN_CLIENT_EMAIL is missing");
} else {
  console.log("✅ FIREBASE_ADMIN_CLIENT_EMAIL:", process.env.FIREBASE_ADMIN_CLIENT_EMAIL);
}

if (!privateKey) {
  console.error("❌ FIREBASE_ADMIN_PRIVATE_KEY is missing");
  process.exit(1);
}

console.log("\n🔑 Checking FIREBASE_ADMIN_PRIVATE_KEY format...");

// Check if it starts and ends correctly
if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
  console.error("❌ Private key missing '-----BEGIN PRIVATE KEY-----'");
  process.exit(1);
}

if (!privateKey.includes("-----END PRIVATE KEY-----")) {
  console.error("❌ Private key missing '-----END PRIVATE KEY-----'");
  process.exit(1);
}

// Check if it has \n sequences (should be on one line)
const hasNewlineSequences = privateKey.includes("\\n");
const hasActualNewlines = privateKey.includes("\n") && !privateKey.match(/[^\n]\n[^\n]/);

if (hasActualNewlines && !hasNewlineSequences) {
  console.warn("⚠️  Private key has actual newlines instead of \\n sequences");
  console.warn("   This might work, but it's better to use \\n sequences on one line");
} else if (hasNewlineSequences) {
  console.log("✅ Private key uses \\n sequences (correct format)");
} else {
  console.warn("⚠️  Private key appears to be on one line without \\n sequences");
  console.warn("   This might not work - the key should have \\n sequences");
}

// Show first/last 50 chars
console.log("\n📄 First 50 characters:", privateKey.substring(0, 50));
console.log("📄 Last 50 characters:", privateKey.substring(privateKey.length - 50));

// Try to parse it
console.log("\n🧪 Testing key parsing...");
try {
  const normalized = privateKey.replace(/\\n/g, "\n");
  
  if (!normalized.includes("\n")) {
    console.error("❌ After replacing \\n, key still has no newlines");
    console.error("   Make sure your .env.local has: FIREBASE_ADMIN_PRIVATE_KEY=\"-----BEGIN...\\n...\\n-----END...\\n\"");
    process.exit(1);
  }
  
  // Check if it looks like valid PEM
  const lines = normalized.split("\n");
  if (lines.length < 3) {
    console.error("❌ Key has too few lines after parsing (expected at least 3)");
    process.exit(1);
  }
  
  console.log("✅ Key format looks valid!");
  console.log(`   Parsed into ${lines.length} lines`);
  
} catch (err) {
  console.error("❌ Error parsing key:", err);
  process.exit(1);
}

console.log("\n✅ All checks passed! Your env vars should work.");
