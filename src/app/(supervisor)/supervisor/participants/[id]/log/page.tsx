"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Minus, 
  Mic, 
  ChevronLeft, 
  Save, 
  Trash2,
  History,
  Scale,
  Zap,
  Battery,
  Cpu,
  Target
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import Link from "next/link";

interface MaterialOption {
  id: string;
  label: string;
  icon: any;
  color: string;
}

const MATERIAL_OPTIONS: MaterialOption[] = [
  { id: "copper", label: "Copper", icon: Zap, color: "bg-orange-100 text-orange-600 border-orange-200" },
  { id: "batteries", label: "Batteries", icon: Battery, color: "bg-blue-100 text-blue-600 border-blue-200" },
  { id: "circuit-boards", label: "Circuit Boards", icon: Cpu, color: "bg-emerald-100 text-emerald-600 border-emerald-200" },
  { id: "lead", label: "Lead", icon: Scale, color: "bg-slate-100 text-slate-600 border-slate-200" },
];

const MOODS = [
  { value: 1, emoji: "😫", label: "Struggling" },
  { value: 2, emoji: "😐", label: "Fair" },
  { value: 3, emoji: "😊", label: "Good" },
  { value: 4, emoji: "🤩", label: "Excellent" },
  { value: 5, emoji: "🔥", label: "Outstanding" },
];

export default function WorkLogPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [weight, setWeight] = useState(0);
  const [selectedMaterial, setSelectedMaterial] = useState<string>("copper");
  const [mood, setMood] = useState(3);
  const [note, setNote] = useState("");
  const [isLogging, setIsLogging] = useState(false);

  const handleAdjustWeight = (amount: number) => {
    setWeight((prev) => Math.max(0, prev + amount));
  };

  const handleSaveEntry = async () => {
    setIsLogging(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLogging(false);
    router.push("/staff");
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="rounded-full hover:bg-slate-100"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-black text-[#1F292E]">Shift Entry</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Marcus Robinson</p>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full text-slate-300" asChild>
          <Link href="/staff/logs">
            <History className="h-5 w-5" />
          </Link>
        </Button>
      </div>

      {/* Participant Snapshot */}
      <Card className="border-none bg-white shadow-sm">
        <CardContent className="flex items-center gap-4 p-4">
          <Avatar className="h-14 w-14 border-2 border-[#E8FBF4]">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus" />
            <AvatarFallback>MR</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="font-bold text-[#1F292E]">Marcus Robinson</h2>
            <div className="flex items-center gap-2">
              <Badge className="bg-[#E8FBF4] text-[#30D59B] border-none text-[8px] font-black uppercase tracking-widest px-1.5 py-0">
                Active Shift
              </Badge>
              <span className="text-[10px] font-medium text-slate-400">Clocked in at 08:00 AM</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Material Log Section */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 px-2">
          <Scale className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-black uppercase tracking-widest text-[#1F292E]">Material Log</h3>
        </div>

        <Card className="overflow-hidden border-none bg-white shadow-sm">
          <CardContent className="flex flex-col items-center gap-8 p-8">
            {/* Weight Dial */}
            <div className="flex items-center gap-8">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handleAdjustWeight(-5)}
                className="h-16 w-16 rounded-full border-2 border-slate-100 text-slate-400 hover:border-primary hover:text-primary transition-all active:scale-95"
              >
                <Minus className="h-8 w-8" />
              </Button>
              
              <div className="flex flex-col items-center gap-1">
                <div className="text-6xl font-black tracking-tight text-[#1F292E]">
                  {weight}
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Pounds (lbs)</span>
              </div>

              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handleAdjustWeight(5)}
                className="h-16 w-16 rounded-full border-2 border-slate-100 text-slate-400 hover:border-primary hover:text-primary transition-all active:scale-95"
              >
                <Plus className="h-8 w-8" />
              </Button>
            </div>

            {/* Quick Presets */}
            <div className="flex gap-2">
              {[1, 10, 25, 50].map((val) => (
                <Button 
                  key={val}
                  variant="secondary" 
                  onClick={() => handleAdjustWeight(val)}
                  className="rounded-full bg-slate-50 px-4 py-1 text-[10px] font-bold text-slate-500 hover:bg-slate-100"
                >
                  +{val}
                </Button>
              ))}
            </div>

            <Separator className="bg-slate-50" />

            {/* Material Pills */}
            <div className="flex flex-wrap justify-center gap-3">
              {MATERIAL_OPTIONS.map((mat) => (
                <button
                  key={mat.id}
                  onClick={() => setSelectedMaterial(mat.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border-2 px-4 py-2 transition-all active:scale-95",
                    selectedMaterial === mat.id 
                      ? `${mat.color} border-current shadow-sm` 
                      : "border-slate-50 bg-slate-50 text-slate-400"
                  )}
                >
                  <mat.icon className="h-4 w-4" />
                  <span className="text-xs font-bold">{mat.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Daily Pulse Section */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 px-2">
          <Target className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-black uppercase tracking-widest text-[#1F292E]">Daily Pulse</h3>
        </div>

        <Card className="border-none bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Mood Slider */}
              <div className="space-y-4">
                <div className="flex justify-between px-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Soft Skills / Performance</span>
                  <span className="text-xs font-bold text-primary">{MOODS.find(m => m.value === mood)?.label}</span>
                </div>
                <div className="flex items-center justify-between gap-2 px-4">
                  {MOODS.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setMood(m.value)}
                      className={cn(
                        "flex flex-col items-center gap-1 transition-all active:scale-90",
                        mood === m.value ? "scale-125" : "grayscale opacity-40"
                      )}
                    >
                      <span className="text-3xl">{m.emoji}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <Textarea 
                  placeholder="Tap microphone to dictate or type a case note..." 
                  className="min-h-[100px] resize-none border-none bg-slate-50 p-4 text-sm font-medium placeholder:text-slate-300 focus:ring-1 focus:ring-primary"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <Button 
                  size="icon" 
                  className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-primary text-white shadow-lg shadow-primary/30 active:scale-90 transition-all"
                  aria-label="Dictate Note"
                >
                  <Mic className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Action Buttons */}
      <div className="flex gap-4 px-2">
        <Button 
          variant="outline" 
          className="h-16 flex-1 rounded-2xl border-slate-200 font-bold text-slate-400 hover:bg-slate-50"
          onClick={() => setWeight(0)}
        >
          <Trash2 className="mr-2 h-5 w-5" />
          Clear
        </Button>
        <Button 
          className="h-16 flex-[2] rounded-2xl bg-[#30D59B] text-white font-black text-lg shadow-xl shadow-[#30D59B]/20 hover:bg-[#28B986] active:scale-95 transition-all"
          onClick={handleSaveEntry}
          disabled={isLogging || weight === 0}
        >
          {isLogging ? "Saving..." : "Confirm Entry"}
          {!isLogging && <Save className="ml-2 h-6 w-6" />}
        </Button>
      </div>
    </div>
  );
}
