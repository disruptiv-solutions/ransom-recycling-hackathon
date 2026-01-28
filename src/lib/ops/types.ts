export type ParticipantStatus = "active" | "staffing" | "graduated" | "exited";
export type ParticipantPhase = 0 | 1 | 2 | 3 | 4;

export type Participant = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  entryDate: string | null;
  currentPhase: ParticipantPhase;
  categories: string[];
  status: ParticipantStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type WorkLog = {
  id: string;
  participantId: string;
  participantName: string;
  role: string;
  hours: number;
  notes?: string | null;
  workDate: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type ProductionRecord = {
  id: string;
  participantId: string;
  participantName: string;
  materialCategory: string;
  materialType: string;
  weight: number;
  value: number;
  productionDate: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type MaterialPrice = {
  id: string;
  category: string;
  materialType: string;
  price: number;
  unit: "lb";
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type AlertPriority = "high" | "medium" | "low";
export type AlertType =
  | "attendance_low"
  | "productivity_drop"
  | "phase_ready"
  | "cert_expiring"
  | "milestone";

export type Alert = {
  id: string;
  participantId?: string | null;
  participantName?: string | null;
  type: AlertType;
  priority: AlertPriority;
  message: string;
  isRead: boolean;
  isDismissed?: boolean;
  createdAt?: string | null;
};

export type Certification = {
  id: string;
  participantId: string;
  certType: string;
  earnedDate: string | null;
  expirationDate?: string | null;
};

export type ReadinessAssessment = {
  id: string;
  participantId: string;
  status: "ready" | "watch" | "not_ready";
  assessment: string;
  recommendation: string;
  generatedAt: string | null;
};

export type ReportConfig = {
  reportType: "production" | "outcomes" | "environmental" | "comprehensive";
  startDate: string;
  endDate: string;
  includeNarrative: boolean;
  includeStories: boolean;
  includeCharts: boolean;
};

export type ReportResult = {
  title: string;
  generatedAt: string;
  stats: Record<string, string | number>;
  narrative?: string | null;
};
