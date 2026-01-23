import { getSessionProfile } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { 
  User, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  Settings, 
  Bell, 
  Award, 
  Briefcase, 
  Heart,
  ChevronRight,
  Camera,
  LogOut,
  Key
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export const runtime = "nodejs";

export default async function ParticipantProfilePage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  const initials = profile.displayName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "P";

  const badges = [
    { name: "Early Bird", icon: Calendar, color: "text-blue-500 bg-blue-50" },
    { name: "Team Player", icon: Heart, color: "text-rose-500 bg-rose-50" },
    { name: "Impact Master", icon: Award, color: "text-amber-500 bg-amber-50" },
    { name: "Safety First", icon: ShieldCheck, color: "text-emerald-500 bg-emerald-50" },
  ];

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
              <AvatarFallback className="bg-[#E8FBF4] text-[#30D59B] text-3xl font-black">
                {initials}
              </AvatarFallback>
            </Avatar>
            <Button size="icon" variant="secondary" className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full border-2 border-white shadow-lg bg-white text-slate-400 hover:text-primary">
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-[#1F292E]">{profile.displayName}</h1>
            <div className="flex items-center gap-2">
              <Badge className="bg-[#E8FBF4] text-[#30D59B] border-none px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                Phase 2: Job Readiness
              </Badge>
              <span className="text-xs text-slate-400 font-medium">Joined Oct 2025</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-200 text-slate-600 font-bold rounded-xl px-6 py-5">
            <Settings className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Info & Program */}
        <div className="flex flex-col gap-8 lg:col-span-8">
          {/* Personal Information */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="px-8 pt-8">
              <CardTitle className="text-xl font-bold text-[#1F292E]">Personal Information</CardTitle>
              <CardDescription className="text-slate-400 font-medium">Manage your contact details and public info.</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</label>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <User className="h-5 w-5 text-slate-300" />
                    <span className="font-bold text-[#1F292E]">{profile.displayName}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <Mail className="h-5 w-5 text-slate-300" />
                    <span className="font-bold text-[#1F292E] text-sm truncate">marcus.johnson@example.com</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button className="w-full bg-[#30D59B] text-white font-bold rounded-xl py-6 hover:bg-[#28B986]">
                  Update Details
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Program Progress Journey */}
          <Card className="border-none shadow-sm">
            <CardHeader className="px-8 pt-8">
              <CardTitle className="text-xl font-bold text-[#1F292E]">Program Journey</CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="relative space-y-8">
                {[
                  { phase: "Orientation", status: "completed", date: "Oct 12, 2025" },
                  { phase: "Job Readiness", status: "current", date: "In Progress" },
                  { phase: "Career Placement", status: "upcoming", date: "Jan 2026" },
                  { phase: "Graduation", status: "upcoming", date: "Mar 2026" },
                ].map((step, idx, arr) => (
                  <div key={step.phase} className="flex gap-6 items-start group">
                    <div className="flex flex-col items-center">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center z-10 ${
                        step.status === 'completed' ? 'bg-[#30D59B] text-white' : 
                        step.status === 'current' ? 'ring-4 ring-[#E8FBF4] bg-[#30D59B] text-white' : 
                        'bg-slate-100 text-slate-300'
                      }`}>
                        {step.status === 'completed' ? <ShieldCheck className="h-5 w-5" /> : (idx + 1)}
                      </div>
                      {idx !== arr.length - 1 && (
                        <div className={`w-0.5 h-12 ${step.status === 'completed' ? 'bg-[#30D59B]' : 'bg-slate-100'}`} />
                      )}
                    </div>
                    <div className="flex-1 pt-1.5">
                      <div className="flex justify-between items-center">
                        <h4 className={`font-bold ${step.status === 'upcoming' ? 'text-slate-400' : 'text-[#1F292E]'}`}>
                          {step.phase}
                        </h4>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{step.date}</span>
                      </div>
                      {step.status === 'current' && (
                        <p className="text-xs text-slate-500 mt-1">Focusing on interviewing skills and professional etiquette.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Badges & Account */}
        <div className="flex flex-col gap-8 lg:col-span-4">
          {/* Achievements Card */}
          <Card className="border-none shadow-sm">
            <CardHeader className="px-6 pt-6">
              <CardTitle className="text-lg font-bold text-[#1F292E]">Achievements</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="grid grid-cols-2 gap-4">
                {badges.map((badge) => (
                  <div key={badge.name} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:scale-105 cursor-help">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${badge.color}`}>
                      <badge.icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#1F292E] text-center">{badge.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Account Security */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="px-6 pt-6">
              <CardTitle className="text-lg font-bold text-[#1F292E]">Account & Security</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-4">
              <Button variant="ghost" className="w-full justify-between rounded-xl py-6 hover:bg-slate-50 text-slate-600 font-bold group">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-[#E8FBF4] transition-colors">
                    <Bell className="h-5 w-5 text-slate-400 group-hover:text-[#30D59B]" />
                  </div>
                  <span>Notification Preferences</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </Button>

              <Button variant="ghost" className="w-full justify-between rounded-xl py-6 hover:bg-slate-50 text-slate-600 font-bold group">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-[#E8FBF4] transition-colors">
                    <Key className="h-5 w-5 text-slate-400 group-hover:text-[#30D59B]" />
                  </div>
                  <span>Change Password</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </Button>
            </CardContent>
          </Card>

          {/* Support Info */}
          <Card className="border-none bg-gradient-to-br from-[#1F292E] to-[#2c3e46] text-white shadow-sm overflow-hidden relative">
            <CardContent className="p-6">
              <div className="relative z-10 flex flex-col gap-4">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-[#30D59B]" />
                </div>
                <div>
                  <h4 className="font-bold">Need assistance?</h4>
                  <p className="text-sm text-white/60 mt-1 leading-relaxed">Your Case Manager is here to help with any program concerns.</p>
                </div>
                <Button className="w-full bg-white text-[#1F292E] font-bold rounded-xl hover:bg-white/90">
                  Contact Support
                </Button>
              </div>
              <div className="absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-[#30D59B]/10 blur-3xl" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
