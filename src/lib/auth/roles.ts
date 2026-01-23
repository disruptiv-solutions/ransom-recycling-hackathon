export type AppRole = "participant" | "supervisor" | "case_manager" | "admin";

export const isStaffRole = (role: AppRole) =>
  role === "supervisor" || role === "case_manager" || role === "admin";

