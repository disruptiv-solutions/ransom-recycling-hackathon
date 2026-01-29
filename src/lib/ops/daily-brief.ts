import { Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { 
  mapParticipant, 
  mapWorkLog, 
  mapProductionRecord, 
  mapAlert 
} from "@/lib/ops/firestore";
import type { 
  Participant, 
  WorkLog, 
  ProductionRecord, 
  Alert 
} from "@/lib/ops/types";

// --- Types ---

export interface DailyBriefData {
  participants: {
    total: number;
    byPhase: Record<number, number>;
    atRisk: Participant[];
    readyToAdvance: Participant[];
  };
  workLogs: {
    totalHours: number;
    attendanceRate: number;
    byRole: Record<string, number>;
    gaps: string[]; // Simplified for now
    trends: { date: string; rate: number }[];
  };
  production: {
    totalRevenue: number;
    totalWeight: number;
    dailyBreakdown: { date: string; revenue: number }[];
    materialMix: { category: string; percentage: number }[];
    efficiency: number; // $/hr
    topPerformers: { name: string; revenue: number }[];
  };
  alerts: {
    high: Alert[];
    medium: Alert[];
    low: Alert[];
  };
  schedule: {
    shifts: { period: "morning" | "afternoon"; role: string; count: number; checkedIn: number }[];
    pickups: { time: string; name: string; estWeight: number }[];
  };
  comparisons: {
    vsLastWeek: { revenueChange: number; attendanceChange: number };
    vsTarget: { revenuePercent: number; target: number };
    trends: string[];
  };
}

// --- Helpers ---

const getStartOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getEndOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const getSevenDaysAgo = (date: Date) => {
  const d = new Date(date);
  d.setDate(d.getDate() - 6);
  d.setHours(0, 0, 0, 0);
  return d;
};

// --- Data Fetching Functions ---

export const getParticipantData = async (isDemoMode: boolean) => {
  const db = getFirebaseAdminDb();
  const snap = await db.collection("participants").where("status", "==", "active").get();
  let participants = snap.docs.map(doc => mapParticipant(doc.id, doc.data()));

  if (!isDemoMode) {
    participants = participants.filter(p => !p.isMock);
  }

  // Filter out Unknown participants globally
  participants = participants.filter(p => p.name !== "Unknown");

  const byPhase: Record<number, number> = {};
  const atRisk: Participant[] = [];
  const readyToAdvance: Participant[] = [];

  // Mock logic for "At Risk" and "Ready to Advance" since we don't have full historical metrics per participant easily accessible in one go without expensive queries.
  // In a real app, we'd likely have aggregated stats on the participant document.
  // For now, we'll use some basic heuristics or random assignment for demo purposes if data is missing.
  
  participants.forEach(p => {
    // Phase count
    const phase = p.currentPhase ?? 0;
    byPhase[phase] = (byPhase[phase] || 0) + 1;

    // At Risk Logic (Simulated for now based on recent work logs would be better, but let's use a placeholder property if we had it, or random for demo)
    // We'll actually fetch work logs later to calculate attendance, but for individual "at risk" flagging, we might need a separate query or iterate.
    // Let's purely simulate "At Risk" based on a deterministic hash of ID for stable demo behavior if no real data.
    // actually, let's use the "isMock" flag to help us.
    if (p.isMock && (p.name.startsWith("D") || p.name.startsWith("J"))) {
       atRisk.push(p);
    }

    // Ready to advance
    if (p.currentPhase < 4 && p.isMock && (p.name.startsWith("M") || p.name.startsWith("S"))) {
      readyToAdvance.push(p);
    }
  });

  return {
    total: participants.length,
    byPhase,
    atRisk,
    readyToAdvance,
    all: participants // Return all for other calculations if needed
  };
};

export const getWorkLogData = async (date: Date, isDemoMode: boolean, participants: Participant[]) => {
  const db = getFirebaseAdminDb();
  const start = Timestamp.fromDate(getSevenDaysAgo(date));
  const end = Timestamp.fromDate(getEndOfDay(date));

  const snap = await db.collection("work_logs")
    .where("workDate", ">=", start)
    .where("workDate", "<=", end)
    .get();

  let logs = snap.docs.map(doc => mapWorkLog(doc.id, doc.data()));

  if (!isDemoMode) {
    logs = logs.filter(l => !l.isMock);
  }

  const totalHours = logs.reduce((sum, log) => sum + log.hours, 0);
  const byRole: Record<string, number> = {};
  
  logs.forEach(log => {
    byRole[log.role] = (byRole[log.role] || 0) + 1;
  });

  // Calculate attendance rate (simplified: logs / (participants * 5 days)) - roughly
  // A better way: unique participants logged / total active participants per day
  const logsByDate: Record<string, Set<string>> = {};
  logs.forEach(log => {
    if (!log.workDate) return;
    const day = new Date(log.workDate).toDateString();
    if (!logsByDate[day]) logsByDate[day] = new Set();
    logsByDate[day].add(log.participantId);
  });

  const trends = Object.entries(logsByDate).map(([day, set]) => ({
    date: day,
    rate: Math.round((set.size / (participants.length || 1)) * 100)
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const avgAttendance = trends.length > 0 
    ? Math.round(trends.reduce((sum, t) => sum + t.rate, 0) / trends.length) 
    : 0;

  // Identify gaps (simplified)
  const gaps: string[] = [];
  if (avgAttendance < 80) gaps.push("General low attendance");
  if ((byRole["Hammermill"] || 0) < 5) gaps.push("Hammermill understaffed");

  return {
    totalHours,
    attendanceRate: avgAttendance,
    byRole,
    gaps,
    trends
  };
};

export const getProductionData = async (date: Date, isDemoMode: boolean) => {
  const db = getFirebaseAdminDb();
  const start = Timestamp.fromDate(getSevenDaysAgo(date));
  const end = Timestamp.fromDate(getEndOfDay(date));

  const snap = await db.collection("production_records")
    .where("productionDate", ">=", start)
    .where("productionDate", "<=", end)
    .get();

  let records = snap.docs.map(doc => mapProductionRecord(doc.id, doc.data()));

  if (!isDemoMode) {
    records = records.filter(r => !r.isMock);
  }

  const totalRevenue = records.reduce((sum, r) => sum + r.value, 0);
  const totalWeight = records.reduce((sum, r) => sum + r.weight, 0);

  // Daily breakdown
  const dailyMap: Record<string, number> = {};
  records.forEach(r => {
    if (!r.productionDate) return;
    const day = new Date(r.productionDate).toDateString();
    dailyMap[day] = (dailyMap[day] || 0) + r.value;
  });

  const dailyBreakdown = Object.entries(dailyMap).map(([date, revenue]) => ({
    date,
    revenue
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Material Mix
  const categoryMap: Record<string, number> = {};
  records.forEach(r => {
    categoryMap[r.materialCategory] = (categoryMap[r.materialCategory] || 0) + r.value;
  });
  
  const materialMix = Object.entries(categoryMap).map(([category, value]) => ({
    category,
    percentage: totalRevenue > 0 ? Math.round((value / totalRevenue) * 100) : 0
  })).sort((a, b) => b.percentage - a.percentage);

  // Top Performers
  const performerMap: Record<string, number> = {};
  records.forEach(r => {
    if (r.participantName === "Unknown") return;
    performerMap[r.participantName] = (performerMap[r.participantName] || 0) + r.value;
  });

  const topPerformers = Object.entries(performerMap)
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    totalRevenue,
    totalWeight,
    dailyBreakdown,
    materialMix,
    efficiency: 0, // Placeholder, would need hours to calc
    topPerformers
  };
};

export const getUnreadAlerts = async () => {
  const db = getFirebaseAdminDb();
  const snap = await db.collection("alerts").where("isRead", "==", false).get();
  const alerts = snap.docs.map(doc => mapAlert(doc.id, doc.data()));

  return {
    high: alerts.filter(a => a.priority === "high"),
    medium: alerts.filter(a => a.priority === "medium"),
    low: alerts.filter(a => a.priority === "low"),
  };
};

export const getTodaySchedule = async (date: Date) => {
  // Mock data as per plan
  return {
    shifts: [
      { period: "morning" as const, role: "Processing", count: 8, checkedIn: 7 },
      { period: "morning" as const, role: "Sorting", count: 6, checkedIn: 6 },
      { period: "morning" as const, role: "Hammermill", count: 2, checkedIn: 1 },
      { period: "morning" as const, role: "Truck", count: 3, checkedIn: 3 },
      { period: "afternoon" as const, role: "Processing", count: 6, checkedIn: 0 },
      { period: "afternoon" as const, role: "Sorting", count: 5, checkedIn: 0 },
      { period: "afternoon" as const, role: "Hammermill", count: 2, checkedIn: 0 },
    ],
    pickups: [
      { time: "2:00 PM", name: "Neighborhood Collection", estWeight: 300 }
    ]
  };
};

export const getComparisons = async (currentRevenue: number, currentAttendance: number) => {
  // Simplified comparison logic
  // In a real app, we'd fetch last week's data to compare
  // For now, we'll simulate some variance
  
  return {
    vsLastWeek: {
      revenueChange: 12, // +12%
      attendanceChange: -5 // -5%
    },
    vsTarget: {
      revenuePercent: 85, // 85% of target
      target: 10000 // $10k weekly target
    },
    trends: [
      "Monday attendance consistently low",
      "Circuit board revenue increasing"
    ]
  };
};
