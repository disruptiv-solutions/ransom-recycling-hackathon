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
  isMock?: boolean;
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
  isMock?: boolean;
  tags?: string[];
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
  unit?: "lb" | "each";
  pricePerUnit?: number;
  role?: string;
  customer?: string | null;
  containerType?: string | null;
  isMock?: boolean;
  productionDate: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type MaterialPrice = {
  id: string;
  category: string;
  materialType: string;
  pricePerUnit: number;
  unit: "lb" | "each";
  role: string;
  isActive?: boolean;
  effectiveDate?: string | null;
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

export type ChartConfiguration = {
  type: "bar" | "line" | "pie" | "area" | "donut";
  title: string;
  description: string;
  data: Array<{ name: string; value: number; [key: string]: string | number }>;
  xAxisKey?: string;
  yAxisKey?: string;
  colors?: string[];
};

export type VisualizationSpecType =
  | "icon_progression"
  | "impact_equivalence"
  | "revenue_progress"
  | "custom_infographic";

export type VisualizationSpec = {
  type: VisualizationSpecType;
  title: string;
  subtitle?: string | null;
  annotations?: string[];
  data: Record<string, number | string>;
};

export type ReportResult = {
  id?: string;
  title: string;
  generatedAt: string;
  stats: Record<string, string | number>;
  narrative?: string | null;
  stories?: string | null;
  charts?: string | null;
  chartConfigurations?: ChartConfiguration[];
  visualizationSpecs?: VisualizationSpec[] | null;
  reportType: "production" | "outcomes" | "environmental" | "comprehensive";
  startDate: string;
  endDate: string;
  includeNarrative: boolean;
  includeStories: boolean;
  includeCharts: boolean;
  createdBy?: string | null;
  pdfNarrative?: string | null;
};
