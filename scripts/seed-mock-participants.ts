/**
 * Seed mock participants for demo mode.
 * Run with: npx tsx scripts/seed-mock-participants.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local explicitly
config({ path: resolve(process.cwd(), ".env.local") });

import { getFirebaseAdminDb } from "../src/lib/firebase/admin.js";

const MOCK_PARTICIPANTS = [
  {
    name: "Amaya Johnson",
    email: "amaya.johnson@demo.org",
    phone: "(205) 555-0142",
    entryDate: new Date("2025-09-10"),
    currentPhase: 0,
    categories: ["Homelessness", "Mental Health"],
    status: "active",
  },
  {
    name: "Elijah Brooks",
    email: "elijah.brooks@demo.org",
    phone: "(205) 555-0186",
    entryDate: new Date("2025-08-03"),
    currentPhase: 1,
    categories: ["Incarceration"],
    status: "active",
  },
  {
    name: "Sofia Martinez",
    email: "sofia.martinez@demo.org",
    phone: "(205) 555-0197",
    entryDate: new Date("2025-07-14"),
    currentPhase: 2,
    categories: ["Addiction", "Mental Health"],
    status: "staffing",
  },
  {
    name: "Noah Evans",
    email: "noah.evans@demo.org",
    phone: "(205) 555-0174",
    entryDate: new Date("2025-06-01"),
    currentPhase: 3,
    categories: ["Incarceration", "Homelessness"],
    status: "graduated",
  },
  {
    name: "Zoe Carter",
    email: "zoe.carter@demo.org",
    phone: "(205) 555-0158",
    entryDate: new Date("2025-10-05"),
    currentPhase: 0,
    categories: ["Other"],
    status: "active",
  },
  {
    name: "Aiden Wright",
    email: "aiden.wright@demo.org",
    phone: "(205) 555-0123",
    entryDate: new Date("2025-05-20"),
    currentPhase: 4,
    categories: ["Addiction"],
    status: "graduated",
  },
  {
    name: "Maya Patel",
    email: "maya.patel@demo.org",
    phone: "(205) 555-0116",
    entryDate: new Date("2025-11-09"),
    currentPhase: 1,
    categories: ["Homelessness"],
    status: "active",
  },
  {
    name: "Lucas Nguyen",
    email: "lucas.nguyen@demo.org",
    phone: "(205) 555-0169",
    entryDate: new Date("2025-04-18"),
    currentPhase: 2,
    categories: ["Mental Health"],
    status: "staffing",
  },
  {
    name: "Grace Kim",
    email: "grace.kim@demo.org",
    phone: "(205) 555-0131",
    entryDate: new Date("2025-03-12"),
    currentPhase: 3,
    categories: ["Incarceration", "Addiction"],
    status: "exited",
  },
  {
    name: "Ethan Reynolds",
    email: "ethan.reynolds@demo.org",
    phone: "(205) 555-0172",
    entryDate: new Date("2025-02-27"),
    currentPhase: 4,
    categories: ["Homelessness", "Other"],
    status: "graduated",
  },
  {
    name: "Harper Allen",
    email: "harper.allen@demo.org",
    phone: "(205) 555-0144",
    entryDate: new Date("2025-12-01"),
    currentPhase: 0,
    categories: ["Mental Health", "Other"],
    status: "active",
  },
  {
    name: "Jackson Lee",
    email: "jackson.lee@demo.org",
    phone: "(205) 555-0192",
    entryDate: new Date("2025-01-22"),
    currentPhase: 1,
    categories: ["Incarceration", "Homelessness"],
    status: "staffing",
  },
  {
    name: "Ava Thompson",
    email: "ava.thompson@demo.org",
    phone: "(205) 555-0164",
    entryDate: new Date("2024-12-15"),
    currentPhase: 2,
    categories: ["Addiction"],
    status: "active",
  },
  {
    name: "Caleb Moore",
    email: "caleb.moore@demo.org",
    phone: "(205) 555-0189",
    entryDate: new Date("2024-11-08"),
    currentPhase: 3,
    categories: ["Homelessness", "Mental Health"],
    status: "staffing",
  },
  {
    name: "Lily Baker",
    email: "lily.baker@demo.org",
    phone: "(205) 555-0139",
    entryDate: new Date("2024-10-02"),
    currentPhase: 4,
    categories: ["Other"],
    status: "graduated",
  },
  {
    name: "Gabriel Sanchez",
    email: "gabriel.sanchez@demo.org",
    phone: "(205) 555-0108",
    entryDate: new Date("2024-09-21"),
    currentPhase: 1,
    categories: ["Incarceration"],
    status: "active",
  },
  // New Participants to reach ~30 total
  {
    name: "Devon Roberts",
    email: "devon.roberts@demo.org",
    phone: "(205) 555-0201",
    entryDate: new Date("2025-11-15"),
    currentPhase: 0,
    categories: ["Homelessness"],
    status: "active",
  },
  {
    name: "Jasmine Lee",
    email: "jasmine.lee@demo.org",
    phone: "(205) 555-0202",
    entryDate: new Date("2025-10-20"),
    currentPhase: 0,
    categories: ["Mental Health"],
    status: "active",
  },
  {
    name: "Marcus Thompson",
    email: "marcus.thompson@demo.org",
    phone: "(205) 555-0203",
    entryDate: new Date("2025-09-05"),
    currentPhase: 2,
    categories: ["Incarceration"],
    status: "active",
  },
  {
    name: "Sarah Martinez",
    email: "sarah.martinez@demo.org",
    phone: "(205) 555-0204",
    entryDate: new Date("2025-08-12"),
    currentPhase: 2,
    categories: ["Addiction"],
    status: "active",
  },
  {
    name: "James Kendrick",
    email: "james.kendrick@demo.org",
    phone: "(205) 555-0205",
    entryDate: new Date("2025-12-05"),
    currentPhase: 0,
    categories: ["Other"],
    status: "active",
  },
  {
    name: "Elena Rodriguez",
    email: "elena.rodriguez@demo.org",
    phone: "(205) 555-0206",
    entryDate: new Date("2025-11-28"),
    currentPhase: 0,
    categories: ["Homelessness"],
    status: "active",
  },
  {
    name: "Jordan Smith",
    email: "jordan.smith@demo.org",
    phone: "(205) 555-0207",
    entryDate: new Date("2025-07-30"),
    currentPhase: 1,
    categories: ["Mental Health"],
    status: "active",
  },
  {
    name: "Isaac Chen",
    email: "isaac.chen@demo.org",
    phone: "(205) 555-0208",
    entryDate: new Date("2025-06-15"),
    currentPhase: 3,
    categories: ["Incarceration"],
    status: "staffing",
  },
  {
    name: "Olivia Wilson",
    email: "olivia.wilson@demo.org",
    phone: "(205) 555-0209",
    entryDate: new Date("2025-05-10"),
    currentPhase: 3,
    categories: ["Addiction"],
    status: "active",
  },
  {
    name: "Liam Brown",
    email: "liam.brown@demo.org",
    phone: "(205) 555-0210",
    entryDate: new Date("2025-04-05"),
    currentPhase: 4,
    categories: ["Homelessness"],
    status: "graduated",
  },
  {
    name: "Emma Davis",
    email: "emma.davis@demo.org",
    phone: "(205) 555-0211",
    entryDate: new Date("2025-03-20"),
    currentPhase: 4,
    categories: ["Other"],
    status: "graduated",
  },
  {
    name: "Mason Miller",
    email: "mason.miller@demo.org",
    phone: "(205) 555-0212",
    entryDate: new Date("2025-02-15"),
    currentPhase: 4,
    categories: ["Incarceration"],
    status: "graduated",
  },
  {
    name: "Sophia Anderson",
    email: "sophia.anderson@demo.org",
    phone: "(205) 555-0213",
    entryDate: new Date("2025-01-10"),
    currentPhase: 4,
    categories: ["Mental Health"],
    status: "graduated",
  }
];

const deleteExistingMockParticipants = async (db: FirebaseFirestore.Firestore) => {
  console.log("🗑️ Deleting existing mock participants...");
  const batchSize = 500;
  const collectionRef = db.collection("participants");
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

const seedMockParticipants = async () => {
  const db = getFirebaseAdminDb();
  
  // 1. Delete old mock participants
  await deleteExistingMockParticipants(db);
  console.log("\n✅ Deleted old mock participants.");

  const batch = db.batch();
  const now = new Date();

  MOCK_PARTICIPANTS.forEach((participant) => {
    const ref = db.collection("participants").doc();
    batch.set(
      ref,
      {
        ...participant,
        isMock: true,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true },
    );
  });

  await batch.commit();
  console.log(`✅ Seeded ${MOCK_PARTICIPANTS.length} mock participants.`);
};

seedMockParticipants().catch((error) => {
  console.error("❌ Failed to seed mock participants:", error);
  process.exit(1);
});
