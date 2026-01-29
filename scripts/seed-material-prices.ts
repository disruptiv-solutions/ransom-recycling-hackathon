/**
 * Seed material prices from the spreadsheet mapping.
 * Run with: npx tsx scripts/seed-material-prices.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local explicitly
config({ path: resolve(process.cwd(), ".env.local") });

import { getFirebaseAdminDb } from "../src/lib/firebase/admin.js";

const MATERIAL_PRICES = [
  // ============================================
  // PROCESSING ROLE (17 materials)
  // ============================================
  
  // Circuit Boards
  { category: "Circuit Boards", materialType: "Low Grade", pricePerUnit: 0.75, unit: "lb", role: "processing", isActive: true },
  { category: "Circuit Boards", materialType: "Mid Grade", pricePerUnit: 2.33, unit: "lb", role: "processing", isActive: true },
  { category: "Circuit Boards", materialType: "High Grade/Server", pricePerUnit: 3.25, unit: "lb", role: "processing", isActive: true },
  { category: "Circuit Boards", materialType: "Mother Boards", pricePerUnit: 2.4, unit: "lb", role: "processing", isActive: true },
  { category: "Circuit Boards", materialType: "Expansion Boards", pricePerUnit: 5.0, unit: "lb", role: "processing", isActive: true },
  { category: "Circuit Boards", materialType: "RAM", pricePerUnit: 0.85, unit: "each", role: "processing", isActive: true },
  { category: "Circuit Boards", materialType: "Pinless Processors", pricePerUnit: 0.75, unit: "each", role: "processing", isActive: true },
  { category: "Circuit Boards", materialType: "Processors with Pins", pricePerUnit: 0.75, unit: "each", role: "processing", isActive: true },
  
  // Metals & Wire (Processing)
  { category: "Metals & Wire", materialType: "Clean Aluminum", pricePerUnit: 0.6, unit: "lb", role: "processing", isActive: true },
  { category: "Metals & Wire", materialType: "Dirty Aluminum", pricePerUnit: 0.2, unit: "lb", role: "processing", isActive: true },
  { category: "Metals & Wire", materialType: "Aluminum Heat Sinks", pricePerUnit: 0.7, unit: "lb", role: "processing", isActive: true },
  { category: "Metals & Wire", materialType: "Copper+Aluminum Heat Sinks", pricePerUnit: 0.9, unit: "lb", role: "processing", isActive: true },
  { category: "Metals & Wire", materialType: "Wire", pricePerUnit: 1.47, unit: "lb", role: "processing", isActive: true },
  { category: "Metals & Wire", materialType: "Clean Copper", pricePerUnit: 3.0, unit: "lb", role: "processing", isActive: true },
  
  // Components (Processing)
  { category: "Components", materialType: "Power Supplies", pricePerUnit: 0.34, unit: "lb", role: "processing", isActive: true },
  { category: "Components", materialType: "CD and DVD Drives", pricePerUnit: 0.3, unit: "lb", role: "processing", isActive: true },
  { category: "Components", materialType: "Lead Acid Batteries", pricePerUnit: 0.25, unit: "lb", role: "processing", isActive: true },
  
  // ============================================
  // SORTING ROLE (14 materials)
  // ============================================
  
  // Metals & Wire (Sorting)
  { category: "Metals & Wire", materialType: "Clean Aluminum", pricePerUnit: 0.6, unit: "lb", role: "sorting", isActive: true },
  { category: "Metals & Wire", materialType: "Dirty Aluminum", pricePerUnit: 0.2, unit: "lb", role: "sorting", isActive: true },
  { category: "Metals & Wire", materialType: "Clean Copper", pricePerUnit: 3.0, unit: "lb", role: "sorting", isActive: true },
  
  // Wire & Cable (Sorting)
  { category: "Wire & Cable", materialType: "Copper Wire", pricePerUnit: 1.47, unit: "lb", role: "sorting", isActive: true },
  { category: "Wire & Cable", materialType: "Christmas Light Wire", pricePerUnit: 0.65, unit: "lb", role: "sorting", isActive: true },
  { category: "Wire & Cable", materialType: "Ethernet Cable", pricePerUnit: 1.4, unit: "lb", role: "sorting", isActive: true },
  
  // Components (Sorting)
  { category: "Components", materialType: "Adapters", pricePerUnit: 0.3, unit: "lb", role: "sorting", isActive: true },
  { category: "Components", materialType: "Batteries (laptop & cellphone)", pricePerUnit: 0.9, unit: "lb", role: "sorting", isActive: true },
  { category: "Components", materialType: "Pin Connectors (VGA)", pricePerUnit: 0.93, unit: "lb", role: "sorting", isActive: true },
  
  // Electronics (Sorting)
  { category: "Electronics", materialType: "Laptops", pricePerUnit: 1.0, unit: "each", role: "sorting", isActive: true },
  { category: "Electronics", materialType: "Tablets & Cellphones", pricePerUnit: 1.0, unit: "each", role: "sorting", isActive: true },
  { category: "Electronics", materialType: "Cellphones (no battery)", pricePerUnit: 5.1, unit: "each", role: "sorting", isActive: true },
  { category: "Electronics", materialType: "Cellphones with Battery", pricePerUnit: 3.6, unit: "each", role: "sorting", isActive: true },
  { category: "Electronics", materialType: "Monitors", pricePerUnit: 1.0, unit: "each", role: "sorting", isActive: true },
  
  // ============================================
  // HAMMERMILL ROLE (7 materials)
  // ============================================
  
  { category: "Hammermill", materialType: "Steel", pricePerUnit: 0.155, unit: "lb", role: "hammermill", isActive: true },
  { category: "Hammermill", materialType: "Stainless Steel", pricePerUnit: 0.25, unit: "lb", role: "hammermill", isActive: true },
  { category: "Hammermill", materialType: "Hammermill Copper", pricePerUnit: 3.0, unit: "lb", role: "hammermill", isActive: true },
  { category: "Hammermill", materialType: "Dirty Aluminum (MRP)", pricePerUnit: 0.35, unit: "lb", role: "hammermill", isActive: true },
  { category: "Hammermill", materialType: "Clean Aluminum", pricePerUnit: 0.6, unit: "lb", role: "hammermill", isActive: true },
  { category: "Hammermill", materialType: "Hammermill Wire", pricePerUnit: 0.9, unit: "lb", role: "hammermill", isActive: true },
  { category: "Hammermill", materialType: "Shred Board", pricePerUnit: 0.7, unit: "lb", role: "hammermill", isActive: true },
  
  // ============================================
  // OTHER ROLE (3 materials)
  // ============================================
  
  { category: "Other", materialType: "SHRED (from Deans)", pricePerUnit: 0.09, unit: "lb", role: "other", isActive: true },
  { category: "Other", materialType: "Flat TVs (from RENEW)", pricePerUnit: 0.06, unit: "lb", role: "other", isActive: true },
  { category: "Other", materialType: "Cardboard", pricePerUnit: 0.02, unit: "lb", role: "other", isActive: true },
] as const;

const deleteAllMaterialPrices = async () => {
  const db = getFirebaseAdminDb();
  const collectionRef = db.collection("material_prices");
  
  console.log("🗑️  Deleting existing material prices...");
  
  let deletedCount = 0;
  const BATCH_SIZE = 500; // Firestore batch limit
  
  while (true) {
    const snapshot = await collectionRef.limit(BATCH_SIZE).get();
    
    if (snapshot.empty) {
      break;
    }
    
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    deletedCount += snapshot.size;
    
    // If we got fewer than BATCH_SIZE, we're done
    if (snapshot.size < BATCH_SIZE) {
      break;
    }
  }
  
  console.log(`✅ Deleted ${deletedCount} existing material prices.`);
  return deletedCount;
};

const seedMaterialPrices = async () => {
  const db = getFirebaseAdminDb();
  const now = new Date();

  // Delete all existing material prices first
  await deleteAllMaterialPrices();

  // Seed new material prices
  console.log("\n🌱 Seeding new material prices...");
  const batch = db.batch();

  MATERIAL_PRICES.forEach((material) => {
    const ref = db.collection("material_prices").doc();
    batch.set(
      ref,
      {
        ...material,
        effectiveDate: now,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true },
    );
  });

  await batch.commit();
  console.log(`✅ Seeded ${MATERIAL_PRICES.length} material prices.`);
  console.log("\nBreakdown:");
  console.log(`- Processing: ${MATERIAL_PRICES.filter((m) => m.role === "processing").length}`);
  console.log(`- Sorting: ${MATERIAL_PRICES.filter((m) => m.role === "sorting").length}`);
  console.log(`- Hammermill: ${MATERIAL_PRICES.filter((m) => m.role === "hammermill").length}`);
  console.log(`- Other: ${MATERIAL_PRICES.filter((m) => m.role === "other").length}`);
};

seedMaterialPrices().catch((error) => {
  console.error("❌ Failed to seed material prices:", error);
  process.exit(1);
});
