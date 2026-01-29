"use client";

import { ReportDetail } from "@/components/ops/reports/report-detail";
import type { ReportResult } from "@/lib/ops/types";

type ReportDetailClientProps = {
  report: ReportResult;
  isAdmin: boolean;
};

export function ReportDetailClient({ report, isAdmin }: ReportDetailClientProps) {
  return <ReportDetail report={report} isAdmin={isAdmin} />;
}
