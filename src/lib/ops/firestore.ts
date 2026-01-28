import { Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import type {
  Alert,
  Certification,
  MaterialPrice,
  Participant,
  ProductionRecord,
  ReadinessAssessment,
  WorkLog,
} from "@/lib/ops/types";

const normalizeTimestamp = (value: unknown): string | null => {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return null;
};

export const getUnreadAlertCount = async () => {
  const snapshot = await getFirebaseAdminDb()
    .collection("alerts")
    .where("isRead", "==", false)
    .get();
  return snapshot.size;
};

export const mapParticipant = (id: string, data: FirebaseFirestore.DocumentData): Participant => ({
  id,
  name: typeof data.name === "string" ? data.name : "Unknown",
  email: typeof data.email === "string" ? data.email : null,
  phone: typeof data.phone === "string" ? data.phone : null,
  entryDate: normalizeTimestamp(data.entryDate),
  currentPhase: Number(data.currentPhase ?? 0) as Participant["currentPhase"],
  categories: Array.isArray(data.categories) ? data.categories : [],
  status: (data.status ?? "active") as Participant["status"],
  createdAt: normalizeTimestamp(data.createdAt),
  updatedAt: normalizeTimestamp(data.updatedAt),
});

export const mapWorkLog = (id: string, data: FirebaseFirestore.DocumentData): WorkLog => ({
  id,
  participantId: typeof data.participantId === "string" ? data.participantId : "",
  participantName: typeof data.participantName === "string" ? data.participantName : "Unknown",
  role: typeof data.role === "string" ? data.role : "Processing",
  hours: Number(data.hours ?? 0),
  notes: typeof data.notes === "string" ? data.notes : null,
  workDate: normalizeTimestamp(data.workDate),
  createdAt: normalizeTimestamp(data.createdAt),
  updatedAt: normalizeTimestamp(data.updatedAt),
});

export const mapProductionRecord = (
  id: string,
  data: FirebaseFirestore.DocumentData,
): ProductionRecord => ({
  id,
  participantId: typeof data.participantId === "string" ? data.participantId : "",
  participantName: typeof data.participantName === "string" ? data.participantName : "Unknown",
  materialCategory: typeof data.materialCategory === "string" ? data.materialCategory : "Components",
  materialType: typeof data.materialType === "string" ? data.materialType : "Misc",
  weight: Number(data.weight ?? 0),
  value: Number(data.value ?? 0),
  productionDate: normalizeTimestamp(data.productionDate),
  createdAt: normalizeTimestamp(data.createdAt),
  updatedAt: normalizeTimestamp(data.updatedAt),
});

export const mapMaterialPrice = (
  id: string,
  data: FirebaseFirestore.DocumentData,
): MaterialPrice => ({
  id,
  category: typeof data.category === "string" ? data.category : "Components",
  materialType: typeof data.materialType === "string" ? data.materialType : "Misc",
  price: Number(data.price ?? 0),
  unit: "lb",
  createdAt: normalizeTimestamp(data.createdAt),
  updatedAt: normalizeTimestamp(data.updatedAt),
});

export const mapAlert = (id: string, data: FirebaseFirestore.DocumentData): Alert => ({
  id,
  participantId: typeof data.participantId === "string" ? data.participantId : null,
  participantName: typeof data.participantName === "string" ? data.participantName : null,
  type: (data.type ?? "milestone") as Alert["type"],
  priority: (data.priority ?? "low") as Alert["priority"],
  message: typeof data.message === "string" ? data.message : "",
  isRead: Boolean(data.isRead),
  isDismissed: Boolean(data.isDismissed),
  createdAt: normalizeTimestamp(data.createdAt),
});

export const mapCertification = (
  id: string,
  data: FirebaseFirestore.DocumentData,
): Certification => ({
  id,
  participantId: typeof data.participantId === "string" ? data.participantId : "",
  certType: typeof data.certType === "string" ? data.certType : "Certification",
  earnedDate: normalizeTimestamp(data.earnedDate),
  expirationDate: normalizeTimestamp(data.expirationDate),
});

export const mapAssessment = (
  id: string,
  data: FirebaseFirestore.DocumentData,
): ReadinessAssessment => ({
  id,
  participantId: typeof data.participantId === "string" ? data.participantId : "",
  status: (data.status ?? "watch") as ReadinessAssessment["status"],
  assessment: typeof data.assessment === "string" ? data.assessment : "",
  recommendation: typeof data.recommendation === "string" ? data.recommendation : "",
  generatedAt: normalizeTimestamp(data.generatedAt),
});
