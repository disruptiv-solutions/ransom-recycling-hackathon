import { PhaseProgressRing } from "@/components/participant/phase-progress-ring";
import { MetricCard } from "@/components/participant/metric-card";
import { DailyAgenda } from "@/components/participant/daily-agenda";
import { NextPhaseCard } from "@/components/participant/next-phase-card";
import { MentorCard } from "@/components/participant/mentor-card";
import { getSessionProfile } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const runtime = "nodejs";

export default async function ParticipantHomePage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  const agendaItems = [
    {
      id: "1",
      type: "active" as const,
      title: "Check-in",
      description: "How are you feeling today? Share your daily pulse with your mentor.",
      iconName: "check-in" as const,
    },
    {
      id: "2",
      type: "pending" as const,
      time: "08:00 AM",
      title: "Recycling Shift",
      description: "Warehouse Sector B",
      iconName: "recycling" as const,
    },
    {
      id: "3",
      type: "pending" as const,
      time: "02:00 PM",
      title: "Life Skills Workshop",
      description: "Main Conference Hall",
      iconName: "workshop" as const,
    },
    {
      id: "4",
      type: "completed" as const,
      title: "Safety Briefing",
      description: "Warehouse Entrance",
      iconName: "safety" as const,
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header Message */}
      <p className="text-slate-500 font-medium">You&apos;re making incredible progress this week.</p>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column (8 units) */}
        <div className="flex flex-col gap-8 lg:col-span-7">
          {/* Phase Progress */}
          <PhaseProgressRing phaseName="Job Readiness" percentage={75} />

          {/* Metric Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <MetricCard 
              label="Electronics Processed" 
              value="1,450" 
              unit="lbs" 
              iconName="recycle" 
              progress={65} 
            />
            <MetricCard 
              label="Hours Worked" 
              value="120" 
              unit="hours" 
              iconName="clock" 
              progress={80} 
            />
          </div>

          {/* Next Phase */}
          <NextPhaseCard />
        </div>

        {/* Right Column (4 units) */}
        <div className="flex flex-col gap-8 lg:col-span-5">
          {/* Daily Agenda */}
          <DailyAgenda items={agendaItems} />

          {/* Mentor Card */}
          <MentorCard name={profile.displayName?.split(" ")[0] || "there"} mentorName="Sarah" />
        </div>
      </div>
    </div>
  );
}
