/**
 * Seed mock work logs for demo mode.
 * Updated to generate more data with neutral/positive trends and a few critical participants.
 * Run with: npx tsx scripts/seed-mock-work-logs.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local explicitly
config({ path: resolve(process.cwd(), ".env.local") });

import { getFirebaseAdminDb } from "../src/lib/firebase/admin.js";

const WORK_LOG_COUNT = 5000; // Increased from 1000
const ROLES = ["Processing", "Sorting", "Hammermill", "Truck"] as const;

// Critical participants (will have consistently negative performance)
const CRITICAL_PARTICIPANT_NAMES = [
  "Marcus Thompson",
  "Jordan Smith",
  "Devon Roberts",
];

const TAGS = {
  positive: [
    "Great Attitude",
    "High Productivity",
    "Mentored Others",
    "Punctual",
    "Took Initiative",
    "Excellent Work",
    "Team Player",
    "Consistent Performance",
  ],
  neutral: [
    "Standard Performance",
    "Task Completed",
    "Followed Instructions",
    "On Time",
    "Met Expectations",
    "Routine Work",
    "Completed Shift",
    "Normal Operations",
  ],
  negative: [
    "Late",
    "Distracted",
    "Low Output",
    "Safety Violation",
    "Left Early",
    "Needs Improvement",
    "Inconsistent",
    "Required Supervision",
  ],
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
    "Consistent performance throughout shift.",
    "Proactive in identifying issues.",
    "Excellent communication with team.",
    "Maintained high quality standards.",
  ],
  neutral: [
    "Completed assigned tasks.",
    "Standard shift.",
    "Followed safety protocols.",
    "Routine work day.",
    "Met daily production goals.",
    "Attended all required meetings.",
    "Standard performance metrics.",
    "Completed shift as scheduled.",
    "No issues reported.",
    "Normal operations.",
  ],
  negative: [
    "Needed extra support with sorting.",
    "Arrived late.",
    "Struggled with focus today.",
    "Left work station early.",
    "Needs reminders on safety gear.",
    "Required multiple corrections.",
    "Lower than expected output.",
    "Had difficulty following instructions.",
    "Needs additional training.",
    "Performance below standard.",
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

const generateTagsAndNotes = (isCritical: boolean) => {
  let category: "positive" | "neutral" | "negative";
  
  if (isCritical) {
    // Critical participants: 70% negative, 25% neutral, 5% positive
    const rand = Math.random();
    if (rand < 0.7) category = "negative";
    else if (rand < 0.95) category = "neutral";
    else category = "positive";
  } else {
    // Regular participants: 70% neutral, 20% positive, 10% negative
    const rand = Math.random();
    if (rand < 0.7) category = "neutral";
    else if (rand < 0.9) category = "positive";
    else category = "negative";
  }

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

  // Create a set of critical participant IDs for quick lookup
  const criticalParticipantIds = new Set(
    mockParticipants
      .filter((p) => CRITICAL_PARTICIPANT_NAMES.includes(p.name))
      .map((p) => p.id)
  );

  console.log(`📊 Found ${criticalParticipantIds.size} critical participants out of ${mockParticipants.length} total.`);

  // 3. Generate new logs
  console.log(`🌱 Generating ${WORK_LOG_COUNT} new mock work logs...`);
  const logs = Array.from({ length: WORK_LOG_COUNT }).map(() => {
    const participant = randomPick(mockParticipants);
    const role = randomPick([...ROLES]);
    const isCritical = criticalParticipantIds.has(participant.id);
    
    // Hours distribution based on participant type
    let hours: number;
    if (isCritical) {
      // Critical participants: Lower hours, more variance
      const hourRand = Math.random();
      if (hourRand < 0.6) hours = Number((randomInt(4, 5.5) + randomInt(0, 2) * 0.25).toFixed(2)); // 4-6 hours
      else if (hourRand < 0.85) hours = Number((randomInt(5.5, 6.5) + randomInt(0, 2) * 0.25).toFixed(2)); // 5.5-7 hours
      else hours = Number((randomInt(6.5, 7.5) + randomInt(0, 1) * 0.25).toFixed(2)); // 6.5-7.75 hours
    } else {
      // Regular participants: Mostly neutral hours (6-8 hours)
      const hourRand = Math.random();
      if (hourRand < 0.75) hours = Number((randomInt(6, 8) + randomInt(0, 3) * 0.25).toFixed(2)); // 6-8.75 hours
      else if (hourRand < 0.9) hours = Number((randomInt(5, 6) + randomInt(0, 3) * 0.25).toFixed(2)); // 5-6.75 hours
      else hours = Number((randomInt(8, 8.5) + randomInt(0, 1) * 0.25).toFixed(2)); // 8-8.75 hours (positive)
    }

    const { tags, note } = generateTagsAndNotes(isCritical);
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
  let written = 0;
  for (let i = 0; i < logs.length; i += batchSize) {
    const batch = db.batch();
    const slice = logs.slice(i, i + batchSize);
    slice.forEach((log) => {
      const ref = db.collection("work_logs").doc();
      batch.set(ref, log);
    });
    await batch.commit();
    written += slice.length;
    process.stdout.write(`\r📝 Written ${written}/${WORK_LOG_COUNT} logs...`);
  }

  console.log(`\n✅ Seeded ${WORK_LOG_COUNT} mock work logs.`);
  console.log(`   - Critical participant logs: ~${Math.round(WORK_LOG_COUNT * (criticalParticipantIds.size / mockParticipants.length))}`);
  console.log(`   - Regular participant logs: ~${Math.round(WORK_LOG_COUNT * ((mockParticipants.length - criticalParticipantIds.size) / mockParticipants.length))}`);
};

seedMockWorkLogs().catch((error) => {
  console.error("❌ Failed to seed mock work logs:", error);
  process.exit(1);
});
