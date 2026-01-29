import { Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import type {
  Alert,
  Certification,
  MaterialPrice,
  Participant,
  ProductionRecord,
  ReadinessAssessment,
  ReportResult,
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
    .count()
    .get();
  return snapshot.data().count;
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
  isMock: typeof data.isMock === "boolean" ? data.isMock : false,
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
  tags: Array.isArray(data.tags) ? data.tags : [],
  workDate: normalizeTimestamp(data.workDate),
  isMock: typeof data.isMock === "boolean" ? data.isMock : false,
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
  unit: data.unit === "each" ? "each" : "lb",
  pricePerUnit: typeof data.pricePerUnit === "number" ? data.pricePerUnit : Number(data.price ?? 0),
  role: typeof data.role === "string" ? data.role : undefined,
  customer: typeof data.customer === "string" ? data.customer : null,
  containerType: typeof data.containerType === "string" ? data.containerType : null,
  isMock: typeof data.isMock === "boolean" ? data.isMock : false,
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
  pricePerUnit: typeof data.pricePerUnit === "number" ? data.pricePerUnit : Number(data.price ?? 0),
  unit: data.unit === "each" ? "each" : "lb",
  role: typeof data.role === "string" ? data.role : "processing",
  isActive: typeof data.isActive === "boolean" ? data.isActive : true,
  effectiveDate: normalizeTimestamp(data.effectiveDate),
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

export const mapReport = (id: string, data: FirebaseFirestore.DocumentData): ReportResult => ({
  id,
  title: typeof data.title === "string" ? data.title : "Report",
  generatedAt: normalizeTimestamp(data.generatedAt) || new Date().toISOString(),
  stats: typeof data.stats === "object" && data.stats !== null ? data.stats : {},
  narrative: typeof data.narrative === "string" ? data.narrative : null,
  stories: typeof data.stories === "string" ? data.stories : null,
  charts: typeof data.charts === "string" ? data.charts : null,
  chartConfigurations: Array.isArray(data.chartConfigurations) ? data.chartConfigurations : null,
  visualizationSpecs: Array.isArray(data.visualizationSpecs) ? data.visualizationSpecs : null,
  reportType: (data.reportType ?? "comprehensive") as ReportResult["reportType"],
  startDate: typeof data.startDate === "string" ? data.startDate : new Date().toISOString(),
  endDate: typeof data.endDate === "string" ? data.endDate : new Date().toISOString(),
  includeNarrative: typeof data.includeNarrative === "boolean" ? data.includeNarrative : false,
  includeStories: typeof data.includeStories === "boolean" ? data.includeStories : false,
  includeCharts: typeof data.includeCharts === "boolean" ? data.includeCharts : false,
  createdBy: typeof data.createdBy === "string" ? data.createdBy : null,
  pdfNarrative: typeof data.pdfNarrative === "string" ? data.pdfNarrative : null,
});
