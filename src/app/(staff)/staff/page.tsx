import { Card, CardContent } from "@/components/ui/card";
import { LogoutButton } from "@/components/auth/logout-button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Bell, 
  ArrowRight, 
  MessageSquare, 
  Recycle,
  AlertTriangle,
  Briefcase,
  MoreHorizontal,
  Plus,
  LayoutGrid,
  Kanban
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PhaseBoard, Participant } from "@/components/staff/phase-board";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationPopover } from "@/components/staff/notification-popover";
import { getSessionProfile } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { SupervisorDashboard } from "@/components/staff/supervisor-dashboard";

export const runtime = "nodejs";

const MOCK_PARTICIPANTS: Participant[] = [
  { id: "1", name: "Marcus Robinson", phase: "development", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus", riskLevel: "none", lastCheckIn: "2 days ago", pulseEmoji: "😊", missedHours: false },
  { id: "2", name: "Elena Rodriguez", phase: "intake", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena", riskLevel: "low", lastCheckIn: "1 week ago", pulseEmoji: "😐", missedHours: false },
  { id: "3", name: "Jordan Smith", phase: "readiness", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan", riskLevel: "none", lastCheckIn: "Yesterday", pulseEmoji: "😊", missedHours: false },
  { id: "4", name: "Sarah Chen", phase: "development", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", riskLevel: "high", lastCheckIn: "3 days ago", pulseEmoji: "😔", missedHours: true },
  { id: "5", name: "James Wilson", phase: "employed", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James", riskLevel: "none", lastCheckIn: "Today", pulseEmoji: "🎉", missedHours: false },
];

const MetricCard = ({ title, value, percentage, trend }: { title: string, value: string, percentage: number, trend: string }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <Card className="rounded-card border-none bg-white shadow-sm dark:bg-slate-900">
      <CardContent className="flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="relative h-12 w-12 md:h-16 md:w-16">
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="50"
                cy="50"
              />
              <circle
                className="text-primary transition-all duration-1000 ease-in-out"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="50"
                cy="50"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold md:text-xs">
              {percentage}%
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 md:text-sm md:font-medium md:text-slate-500">{title}</p>
            <h3 className="text-lg font-bold md:text-2xl">
              {value} <span className="text-[10px] font-normal text-green-500 md:text-xs">{trend}</span>
            </h3>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ParticipantCard = ({ id, name, status, checkIn, phase, color, avatar }: { id: string, name: string, status: string, checkIn: string, phase: string, color: 'mint' | 'amber', avatar: string }) => (
  <Card className="group relative min-w-[280px] rounded-card border-none bg-white p-6 shadow-sm dark:bg-slate-900 md:shadow-lg md:shadow-slate-200/40">
    <div className="absolute top-6 right-6 flex items-center gap-2">
      <div className={`h-3 w-3 rounded-full ${color === 'mint' ? 'bg-mint glow-mint' : 'bg-amber glow-amber'}`} />
    </div>
    <div className="flex items-center gap-4">
      <Avatar className={`h-16 w-16 border-4 ${color === 'mint' ? 'border-mint/20' : 'border-amber/20'}`}>
        <AvatarImage src={avatar} alt={name} />
        <AvatarFallback>{name.substring(0, 2)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <h4 className="text-lg font-bold">{name}</h4>
        <p className="text-sm text-slate-500">Last Check-in: {checkIn}</p>
      </div>
    </div>
    <div className="mt-6 flex items-center justify-between">
      <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${color === 'mint' ? 'bg-mint/10 text-primary' : 'bg-amber/10 text-amber-700'}`}>
        {phase}
      </span>
      <div className="flex gap-2">
        <Button variant="ghost" size="icon" asChild className="h-10 w-10 rounded-full bg-slate-50 text-slate-400 transition-all hover:bg-primary hover:text-white dark:bg-slate-800">
          <Link href={`/staff/participants/${id}`}>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all group-hover:bg-primary group-hover:text-white dark:bg-slate-800">
          <MessageSquare className="h-4 w-4" />
        </button>
      </div>
    </div>
  </Card>
);

export default async function StaffHomePage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  if (profile.role === "supervisor") {
    return <SupervisorDashboard supervisorName={profile.displayName || "Supervisor"} />;
  }

  return (
    <div className="relative flex flex-col gap-6 md:gap-8">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 md:text-3xl">Command Center</h2>
          <p className="text-sm text-slate-500 md:text-base">Welcome back, {profile.displayName || "Staff"}.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Tabs id="staff-home-nav" defaultValue="dashboard" className="hidden md:flex">
            <TabsList className="rounded-full bg-slate-100 p-1 dark:bg-slate-800">
              <TabsTrigger value="dashboard" className="rounded-full px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <LayoutGrid className="mr-2 h-4 w-4" /> Dashboard
              </TabsTrigger>
              <TabsTrigger value="pipeline" className="rounded-full px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Kanban className="mr-2 h-4 w-4" /> Pipeline
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="hidden items-center gap-4 md:flex">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input 
                placeholder="Search records..." 
                className="w-64 rounded-full border-none bg-white pl-12 shadow-sm focus:ring-2 focus:ring-primary dark:bg-slate-900" 
              />
            </div>
            <NotificationPopover />
            <Avatar className="h-12 w-12 border-2 border-primary">
               <AvatarImage src={profile.photoURL || undefined} />
               <AvatarFallback>{profile.displayName?.substring(0, 2) || "ST"}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <Tabs id="staff-home-main" defaultValue="dashboard" className="w-full">
        <div className="mb-6 flex md:hidden">
          <TabsList className="w-full rounded-full bg-slate-100 p-1 dark:bg-slate-800">
            <TabsTrigger value="dashboard" className="flex-1 rounded-full data-[state=active]:bg-white">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="flex-1 rounded-full data-[state=active]:bg-white">
              Pipeline
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard" className="mt-0 outline-none">
          <div className="flex flex-col gap-8">
            {/* Metrics List (Mobile) / Grid (Desktop) */}
            <section className="flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              <MetricCard title="Tons Recycled" value="12.5" percentage={75} trend="+15%" />
              <MetricCard title="Hours Worked" value="1,240" percentage={56} trend="+8%" />
              <MetricCard title="Job Placements" value="48" percentage={28} trend="+12%" />
              <MetricCard title="Housing Secured" value="15" percentage={84} trend="+5%" />
            </section>

            {/* Participant Focus */}
            <section>
              <div className="mb-4 flex items-center justify-between md:mb-6">
                <h3 className="text-lg font-bold md:text-xl">Participant Focus</h3>
                <Link href="/staff/participants" className="flex items-center gap-1 text-[10px] font-bold text-primary md:text-sm md:font-semibold">
                  View all <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
                </Link>
              </div>
                      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide md:gap-6">
                        <ParticipantCard 
                          id="1"
                          name="Marcus Robinson" 
                          status="ON TRACK" 
                          checkIn="2 days ago" 
                          phase="STABLE" 
                          color="mint"
                          avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus"
                        />
                        <ParticipantCard 
                          id="2"
                          name="Elena Rodriguez" 
                          status="NEEDS ATTENTION" 
                          checkIn="1 week ago" 
                          phase="ENTRY" 
                          color="amber"
                          avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Elena"
                        />
                      </div>
            </section>

            {/* Activities & Requests (Stacked on mobile) */}
            <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:gap-8">
              <Card className="rounded-card border-none bg-white p-6 shadow-sm dark:bg-slate-900 md:p-8 md:shadow-xl md:shadow-slate-200/50 lg:col-span-2">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-bold">New Job: Marcus R.</h5>
                      <p className="text-xs text-slate-500">Riverside Logistics • 2h ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mint/20 text-primary">
                      <Recycle className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-bold">Recycle Goal Met</h5>
                      <p className="text-xs text-slate-500">Community Hub #4 • 4h ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber/20 text-amber-700">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-bold">Meeting Moved</h5>
                      <p className="text-xs text-slate-500">Elena R. • 6h ago</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="rounded-card border-none bg-primary p-6 text-white shadow-xl md:p-8">
                <h3 className="mb-2 text-lg font-bold">Resource Requests</h3>
                <p className="mb-6 text-xs text-white/70">Pending housing vouchers.</p>
                <div className="space-y-3">
                  <div className="rounded-xl bg-white/10 p-4 border border-white/10">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase">Transit Pass</span>
                      <span className="rounded-full bg-amber px-2 py-0.5 text-[8px] font-bold text-amber-900">URGENT</span>
                    </div>
                    <p className="text-[10px]">Jordan S. requested monthly bus pass for new job commute.</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-4 border border-white/10">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase">Work Boots</span>
                      <span className="rounded-full bg-white/20 px-2 py-0.5 text-[8px] font-bold text-white">STANDARD</span>
                    </div>
                    <p className="text-[10px]">Sarah C. needs safety gear for training site.</p>
                  </div>
                </div>
                <Button className="mt-6 h-12 w-full rounded-full bg-white text-xs font-bold text-primary hover:bg-white/90">
                  Review All Requests (5)
                </Button>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="mt-0 outline-none">
          <PhaseBoard initialParticipants={MOCK_PARTICIPANTS} />
        </TabsContent>
      </Tabs>

      <div className="rounded-xl bg-slate-200/50 p-4 text-center text-[10px] text-slate-500 md:text-left">
        <p><span className="font-bold uppercase text-primary">Program Tip</span> Regular check-ins improve retention by 40%.</p>
      </div>

      {/* Floating Action Button */}
      <Button className="fixed bottom-24 right-6 h-14 w-14 rounded-full bg-primary p-0 shadow-lg md:hidden">
        <Plus className="h-8 w-8 text-white" />
      </Button>
    </div>
  );
}
