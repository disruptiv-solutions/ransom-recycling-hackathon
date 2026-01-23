import { getSessionProfile } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Briefcase, 
  BookOpen, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const runtime = "nodejs";

export default async function ParticipantSchedulePage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  const days = [
    { name: "Mon", date: "Jan 19", isToday: true },
    { name: "Tue", date: "Jan 20", isToday: false },
    { name: "Wed", date: "Jan 21", isToday: false },
    { name: "Thu", date: "Jan 22", isToday: false },
    { name: "Fri", date: "Jan 23", isToday: false },
    { name: "Sat", date: "Jan 24", isToday: false },
    { name: "Sun", date: "Jan 25", isToday: false },
  ];

  const scheduleItems = [
    {
      id: "1",
      type: "shift",
      time: "08:00 AM - 12:00 PM",
      title: "Recycling Shift",
      location: "Warehouse Sector B",
      description: "Electronic component sorting and processing.",
      icon: Briefcase,
      color: "bg-blue-50 text-blue-600",
    },
    {
      id: "2",
      type: "meeting",
      time: "01:00 PM - 02:00 PM",
      title: "Case Manager Check-in",
      location: "Office 204",
      description: "Weekly progress review with Marcus.",
      icon: Users,
      color: "bg-purple-50 text-purple-600",
    },
    {
      id: "3",
      type: "workshop",
      time: "03:00 PM - 04:30 PM",
      title: "Financial Literacy Workshop",
      location: "Community Room A",
      description: "Basic budgeting and saving strategies.",
      icon: BookOpen,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#1F292E]">Your Schedule</h1>
          <p className="text-slate-500 font-medium mt-1">Stay on track with your daily commitments.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-slate-200 text-slate-600 font-bold rounded-xl px-6 py-5">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Month View
          </Button>
          <Button className="bg-[#30D59B] text-white font-bold rounded-xl px-6 py-5 hover:bg-[#28B986]">
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Week Selector */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex flex-1 items-center justify-around overflow-hidden">
              {days.map((day) => (
                <div 
                  key={day.date} 
                  className={`flex flex-col items-center gap-1 rounded-2xl px-4 py-3 transition-all cursor-pointer ${
                    day.isToday 
                      ? "bg-[#30D59B] text-white shadow-lg shadow-[#30D59B]/20" 
                      : "hover:bg-slate-50 text-slate-400"
                  }`}
                >
                  <span className={`text-[10px] font-black uppercase tracking-widest ${day.isToday ? "text-white/80" : "text-slate-400"}`}>
                    {day.name}
                  </span>
                  <span className={`text-sm font-black ${day.isToday ? "text-white" : "text-[#1F292E]"}`}>
                    {day.date.split(" ")[1]}
                  </span>
                </div>
              ))}
            </div>

            <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Daily Timeline */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Card className="border-none shadow-sm h-full">
            <CardHeader className="px-8 pt-8">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-[#1F292E]">Monday, January 19</CardTitle>
                <Badge className="bg-[#E8FBF4] text-[#30D59B] border-none px-3 py-1 text-[10px] font-bold uppercase tracking-wider">3 Events</Badge>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8 flex flex-col gap-6">
              {scheduleItems.map((item, index) => (
                <div key={item.id} className="relative flex gap-6">
                  {/* Timeline Line */}
                  {index !== scheduleItems.length - 1 && (
                    <div className="absolute left-[23px] top-12 bottom-[-24px] w-[2px] bg-slate-100" />
                  )}

                  {/* Icon */}
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl shadow-sm z-10 ${item.color}`}>
                    <item.icon className="h-6 w-6" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-2 pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <Clock className="h-3 w-3" />
                        {item.time}
                      </div>
                      <Badge variant="secondary" className="w-fit bg-slate-100 text-slate-500 border-none text-[10px] font-bold uppercase px-2 py-0">
                        {item.type}
                      </Badge>
                    </div>
                    <h4 className="text-lg font-bold text-[#1F292E]">{item.title}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed max-w-xl">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#30D59B]">
                      <MapPin className="h-3.5 w-3.5" />
                      {item.location}
                    </div>
                  </div>

                  <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-slate-600 rounded-xl">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          {/* Stats Card */}
          <Card className="border-none bg-[#30D59B] text-white shadow-sm overflow-hidden relative">
            <CardContent className="p-8">
              <div className="relative z-10">
                <h3 className="text-lg font-bold opacity-90">Weekly Summary</h3>
                <div className="mt-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <span className="text-sm font-medium opacity-80">Total Hours</span>
                    <span className="text-2xl font-black">32.5</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <span className="text-sm font-medium opacity-80">Work Shifts</span>
                    <span className="text-2xl font-black">5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium opacity-80">Workshops</span>
                    <span className="text-2xl font-black">2</span>
                  </div>
                </div>
              </div>
              {/* Abstract Background Decor */}
              <div className="absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-black/5 blur-2xl" />
            </CardContent>
          </Card>

          {/* Reminders Card */}
          <Card className="border-none shadow-sm">
            <CardHeader className="px-6 pt-6">
              <CardTitle className="text-lg font-bold text-[#1F292E]">Reminders</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                <div className="mt-1 h-2 w-2 rounded-full bg-[#30D59B]" />
                <p className="text-sm text-slate-600 font-medium">
                  Submit weekly reflection by Friday 5 PM.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                <div className="mt-1 h-2 w-2 rounded-full bg-amber-400" />
                <p className="text-sm text-slate-600 font-medium">
                  Update your profile photo for ID badge.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
