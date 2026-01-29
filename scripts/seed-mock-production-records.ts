/**
 * Seed mock production records for demo mode.
 * Updated to generate more data with neutral/positive trends and a few critical participants.
 * Run with: npx tsx scripts/seed-mock-production-records.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local explicitly
config({ path: resolve(process.cwd(), ".env.local") });

import { getFirebaseAdminDb } from "../src/lib/firebase/admin.js";

const PRODUCTION_COUNT = 5000; // Increased from 1000

// Critical participants (will have consistently lower production)
const CRITICAL_PARTICIPANT_NAMES = [
  "Marcus Thompson",
  "Jordan Smith",
  "Devon Roberts",
];

const CUSTOMERS = [
  "Donation Box",
  "Ophthalmologist in Fairhope",
  "City Recycling Drop-off",
  "Community Drive",
  "Local School",
  "Retail Partner",
  "Corporate Partner",
  "Neighborhood Collection",
  "Medical Center",
  "University Campus",
  "Business District",
  "",
  "",
  "",
];

const CONTAINER_TYPES = [
  "GAYLORD WITH PALLET (62 LBS)",
  "TRASH CAN (8 LBS)",
  "BLUE BIN (436 LBS)",
  "BLACK DONATION BIN (175 LBS)",
  "PALLET BOX (120 LBS)",
  "RECYCLING BIN (45 LBS)",
  "",
];

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomPick = <T,>(list: T[]) => list[randomInt(0, list.length - 1)];

const randomDateInRange = (daysBack: number) => {
  const now = new Date();
  const past = new Date();
  past.setDate(now.getDate() - daysBack);
  const time = randomInt(past.getTime(), now.getTime());
  return new Date(time);
};

const deleteExistingMockRecords = async (db: FirebaseFirestore.Firestore) => {
  console.log("🗑️ Deleting existing mock production records...");
  const batchSize = 500;
  const collectionRef = db.collection("production_records");
  const query = collectionRef.where("isMock", "==", true);

  return new Promise<void>((resolve, reject) => {
    deleteQueryBatch(db, query, batchSize).then(resolve).catch(reject);
  });
};

async function deleteQueryBatch(db: FirebaseFirestore.Firestore, query: FirebaseFirestore.Query, batchSize: number) {
  const snapshot = await query.limit(batchSize).get();

  if (snapshot.size === 0) {
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  process.stdout.write(".");
  await deleteQueryBatch(db, query, batchSize);
}

const seedMockProductionRecords = async () => {
  const db = getFirebaseAdminDb();

  // 1. Delete old mock data
  await deleteExistingMockRecords(db);
  console.log("\n✅ Deleted old mock production records.");

  // 2. Fetch dependencies
  const mockParticipantsSnap = await db.collection("participants").where("isMock", "==", true).get();
  if (mockParticipantsSnap.empty) {
    console.error("❌ No mock participants found. Seed mock participants first.");
    process.exit(1);
  }

  const priceSnap = await db.collection("material_prices").get();
  if (priceSnap.empty) {
    console.error("❌ No material prices found. Seed material prices first.");
    process.exit(1);
  }

  const mockParticipants = mockParticipantsSnap.docs.map((doc) => ({
    id: doc.id,
    name: String(doc.data()?.name ?? "Participant"),
  }));

  // Create a set of critical participant IDs for quick lookup
  const criticalParticipantIds = new Set(
    mockParticipants
      .filter((p) => CRITICAL_PARTICIPANT_NAMES.includes(p.name))
      .map((p) => p.id)
  );

  console.log(`📊 Found ${criticalParticipantIds.size} critical participants out of ${mockParticipants.length} total.`);

  const materialPrices = priceSnap.docs.map((doc) => {
    const data = doc.data() ?? {};
    return {
      category: String(data.category ?? "Components"),
      materialType: String(data.materialType ?? "Misc"),
      unit: data.unit === "each" ? "each" : "lb",
      pricePerUnit: typeof data.pricePerUnit === "number" ? data.pricePerUnit : Number(data.price ?? 0),
      role: typeof data.role === "string" ? data.role : "processing",
    };
  });

  // 3. Generate new records
  console.log(`🌱 Generating ${PRODUCTION_COUNT} new mock production records...`);
  const records = Array.from({ length: PRODUCTION_COUNT }).map(() => {
    const participant = randomPick(mockParticipants);
    const price = randomPick(materialPrices);
    const isCritical = criticalParticipantIds.has(participant.id);
    
    // Weight distribution based on participant type
    let weight: number;
    if (price.unit === "each") {
      if (isCritical) {
        // Critical participants: Lower production (5-25 each)
        weight = randomInt(5, 25);
      } else {
        // Regular participants: Neutral range (15-45 each)
        const rand = Math.random();
        if (rand < 0.7) weight = randomInt(15, 35); // Most common: 15-35
        else if (rand < 0.9) weight = randomInt(35, 45); // Positive: 35-45
        else weight = randomInt(10, 20); // Lower: 10-20
      }
    } else {
      // For lbs
      if (isCritical) {
        // Critical participants: Lower weights (10-100 lbs)
        const rand = Math.random();
        if (rand < 0.7) weight = Number((randomInt(10, 60) + Math.random()).toFixed(2)); // Lower weights
        else weight = Number((randomInt(60, 100) + Math.random()).toFixed(2)); // Occasional higher
      } else {
        // Regular participants: Neutral distribution (50-200 lbs)
        const rand = Math.random();
        if (rand < 0.7) weight = Number((randomInt(50, 150) + Math.random()).toFixed(2)); // Most common: 50-150
        else if (rand < 0.9) weight = Number((randomInt(150, 250) + Math.random()).toFixed(2)); // Positive: 150-250
        else weight = Number((randomInt(30, 80) + Math.random()).toFixed(2)); // Lower: 30-80
      }
    }

    const value = Number((weight * price.pricePerUnit).toFixed(2));
    const productionDate = randomDateInRange(90);
    const customer = randomPick(CUSTOMERS) || null;
    const containerType = randomPick(CONTAINER_TYPES) || null;

    return {
      participantId: participant.id,
      participantName: participant.name,
      materialCategory: price.category,
      materialType: price.materialType,
      weight,
      value,
      unit: price.unit,
      pricePerUnit: price.pricePerUnit,
      role: price.role,
      customer,
      containerType,
      productionDate,
      isMock: true,
      createdAt: productionDate,
      updatedAt: productionDate,
    };
  });

  // 4. Batch write
  const batchSize = 500;
  let written = 0;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = db.batch();
    const slice = records.slice(i, i + batchSize);
    slice.forEach((record) => {
      const ref = db.collection("production_records").doc();
      batch.set(ref, record);
    });
    await batch.commit();
    written += slice.length;
    process.stdout.write(`\r📝 Written ${written}/${PRODUCTION_COUNT} records...`);
  }

  console.log(`\n✅ Seeded ${PRODUCTION_COUNT} mock production records.`);
  console.log(`   - Critical participant records: ~${Math.round(PRODUCTION_COUNT * (criticalParticipantIds.size / mockParticipants.length))}`);
  console.log(`   - Regular participant records: ~${Math.round(PRODUCTION_COUNT * ((mockParticipants.length - criticalParticipantIds.size) / mockParticipants.length))}`);
};

seedMockProductionRecords().catch((error) => {
  console.error("❌ Failed to seed mock production records:", error);
  process.exit(1);
});
