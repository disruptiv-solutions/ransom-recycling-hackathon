import StaffLayoutBase from "@/components/staff/staff-layout-base";

export const runtime = "nodejs";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StaffLayoutBase>{children}</StaffLayoutBase>;
}
