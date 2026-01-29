/**
 * Seed mock work logs for demo mode.
 * Run with: npx tsx scripts/seed-mock-work-logs.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local explicitly
config({ path: resolve(process.cwd(), ".env.local") });

import { getFirebaseAdminDb } from "../src/lib/firebase/admin.js";

const WORK_LOG_COUNT = 1000;
const ROLES = ["Processing", "Sorting", "Hammermill", "Truck"] as const;

const TAGS = {
  positive: ["Great Attitude", "High Productivity", "Mentored Others", "Punctual", "Took Initiative"],
  neutral: ["Standard Performance", "Task Completed", "Followed Instructions"],
  negative: ["Late", "Distracted", "Low Output", "Safety Violation", "Left Early"],
};

const NOTES = {
  positive: [
    "Focused and on time.",
    "Great teamwork today.",
    "Completed tasks ahead of schedule.",
    "Asked good questions during training.",
    "Worked independently.",
    "Strong attention to detail.",
    "Helped new team members.",
    "Exceeded production targets.",
  ],
  neutral: [
    "Completed assigned tasks.",
    "Standard shift.",
    "Followed safety protocols.",
    "Routine work day.",
  ],
  negative: [
    "Needed extra support with sorting.",
    "Arrived late.",
    "Struggled with focus today.",
    "Left work station early.",
    "Needs reminders on safety gear.",
  ],
};

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomPick = <T,>(list: T[]) => list[randomInt(0, list.length - 1)];

const randomDateInRange = (daysBack: number) => {
  const now = new Date();
  const past = new Date();
  past.setDate(now.getDate() - daysBack);
  const time = randomInt(past.getTime(), now.getTime());
  return new Date(time);
};

const generateTagsAndNotes = () => {
  const rand = Math.random();
  let category: "positive" | "neutral" | "negative";
  
  // 60% Positive, 30% Neutral, 10% Negative
  if (rand < 0.6) category = "positive";
  else if (rand < 0.9) category = "neutral";
  else category = "negative";

  const tags = [];
  // Pick 1-2 tags from the category
  const numTags = randomInt(1, 2);
  const availableTags = [...TAGS[category]];
  for (let i = 0; i < numTags; i++) {
    if (availableTags.length === 0) break;
    const tagIndex = randomInt(0, availableTags.length - 1);
    tags.push(availableTags[tagIndex]);
    availableTags.splice(tagIndex, 1);
  }

  // 70% chance of having a note
  let note = null;
  if (Math.random() < 0.7) {
    note = randomPick(NOTES[category]);
  }

  return { tags, note };
};

const deleteExistingMockLogs = async (db: FirebaseFirestore.Firestore) => {
  console.log("🗑️ Deleting existing mock work logs...");
  const batchSize = 500;
  const collectionRef = db.collection("work_logs");
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

const seedMockWorkLogs = async () => {
  const db = getFirebaseAdminDb();

  // 1. Delete old mock data
  await deleteExistingMockLogs(db);
  console.log("\n✅ Deleted old mock logs.");

  // 2. Fetch mock participants
  const mockParticipantsSnap = await db.collection("participants").where("isMock", "==", true).get();
  if (mockParticipantsSnap.empty) {
    console.error("❌ No mock participants found. Seed mock participants first.");
    process.exit(1);
  }

  const mockParticipants = mockParticipantsSnap.docs.map((doc) => ({
    id: doc.id,
    name: String(doc.data()?.name ?? "Participant"),
  }));

  // 3. Generate new logs
  console.log(`🌱 Generating ${WORK_LOG_COUNT} new mock work logs...`);
  const logs = Array.from({ length: WORK_LOG_COUNT }).map(() => {
    const participant = randomPick(mockParticipants);
    const role = randomPick([...ROLES]);
    
    // Skew hours positively: Mostly 6-8 hours
    let hours;
    const hourRand = Math.random();
    if (hourRand < 0.7) hours = Number((randomInt(6, 8) + randomInt(0, 3) * 0.25).toFixed(2)); // 6-8.75
    else hours = Number((randomInt(4, 6) + randomInt(0, 3) * 0.25).toFixed(2)); // 4-6.75

    const { tags, note } = generateTagsAndNotes();
    const workDate = randomDateInRange(90);

    return {
      participantId: participant.id,
      participantName: participant.name,
      role,
      hours,
      notes: note,
      tags,
      workDate,
      isMock: true,
      createdAt: workDate,
      updatedAt: workDate,
    };
  });

  // 4. Batch write
  const batchSize = 500;
  for (let i = 0; i < logs.length; i += batchSize) {
    const batch = db.batch();
    const slice = logs.slice(i, i + batchSize);
    slice.forEach((log) => {
      const ref = db.collection("work_logs").doc();
      batch.set(ref, log);
    });
    await batch.commit();
    process.stdout.write(".");
  }

  console.log(`\n✅ Seeded ${WORK_LOG_COUNT} mock work logs.`);
};

seedMockWorkLogs().catch((error) => {
  console.error("❌ Failed to seed mock work logs:", error);
  process.exit(1);
});
