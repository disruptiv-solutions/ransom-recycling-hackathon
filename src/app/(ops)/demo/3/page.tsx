"use client";

import Image from "next/image";
import { MessageSquare, Calculator, Brain, FileText, Mail, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { AgentPanel } from "@/components/ops/agent-panel";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: MessageSquare,
    title: "Chat with your data for insights",
    description: "Natural language queries across all workforce metrics",
    color: "from-blue-500 to-cyan-500",
    type: "chat",
  },
  {
    icon: Calculator,
    title: "Auto-calculated production value",
    description: "Real-time tracking of materials processed and revenue generated",
    color: "from-emerald-500 to-green-500",
    type: "calculator",
  },
  {
    icon: Brain,
    title: "AI advancement readiness scoring",
    description: "Data-driven recommendations for participant progression",
    color: "from-purple-500 to-pink-500",
    type: "scoring",
  },
  {
    icon: FileText,
    title: "30-second grant reports",
    description: "Automated compliance documentation and impact metrics",
    color: "from-orange-500 to-red-500",
    type: "countdown",
  },
  {
    icon: Mail,
    title: "Email notifications enabled",
    description: "Automated alerts and updates delivered to your inbox",
    color: "from-indigo-500 to-blue-500",
    type: "email",
  },
  {
    icon: Clock,
    title: "Scheduled AI briefs",
    description: "Daily executive summaries sent automatically at 8 AM",
    color: "from-teal-500 to-cyan-500",
    type: "schedule",
  },
];

function ChatAnimation() {
  const [messages, setMessages] = useState([0]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMessages(prev => {
        const next = [...prev, prev.length];
        return next.length > 3 ? [0] : next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-2 w-full h-full items-center justify-center">
      {messages.map((msg, idx) => (
        <div 
          key={`${msg}-${idx}`}
          className="animate-in slide-in-from-bottom-4 fade-in duration-500 w-full"
          style={{ animationDelay: `${idx * 100}ms` }}
        >
          <div className={`${idx % 2 === 0 ? 'ml-0' : 'ml-auto'} w-3/4 bg-white/30 backdrop-blur-sm rounded-xl px-2 py-1.5`}>
            <div className="h-1.5 bg-white/50 rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CalculatorAnimation() {
  const [number, setNumber] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setNumber(prev => (prev + 1247) % 99999);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="text-3xl font-bold text-white/40 tabular-nums">
        ${number.toLocaleString()}
      </div>
    </div>
  );
}

function ScoringAnimation() {
  const [percentage, setPercentage] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPercentage(prev => {
        const next = prev + 5;
        return next > 100 ? 0 : next;
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="42"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="6"
            fill="none"
          />
          <circle
            cx="48"
            cy="48"
            r="42"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="6"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 42}`}
            strokeDashoffset={`${2 * Math.PI * 42 * (1 - percentage / 100)}`}
            className="transition-all duration-150"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white/50">
          {percentage}%
        </div>
      </div>
    </div>
  );
}

function CountdownAnimation() {
  const [seconds, setSeconds] = useState(30);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev <= 0 ? 30 : prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="text-4xl font-bold text-white/40 tabular-nums">
        {seconds}s
      </div>
    </div>
  );
}

function EmailAnimation() {
  const [envelope, setEnvelope] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setEnvelope(prev => (prev + 1) % 3);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="relative w-16 h-16">
        <div className={`absolute inset-0 transition-all duration-500 ${envelope === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
          <Mail className="w-full h-full text-white/50" />
        </div>
        <div className={`absolute inset-0 transition-all duration-500 ${envelope === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <Mail className="w-full h-full text-white/60" />
        </div>
        <div className={`absolute inset-0 transition-all duration-500 ${envelope === 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <Mail className="w-full h-full text-white/40" />
        </div>
      </div>
    </div>
  );
}

function ScheduleAnimation() {
  const [time, setTime] = useState("8:00");
  
  useEffect(() => {
    const times = ["8:00", "8:15", "8:30", "8:45"];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % times.length;
      setTime(times[index]);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="text-center">
        <Clock className="w-12 h-12 text-white/50 mx-auto mb-2" />
        <div className="text-2xl font-bold text-white/40 tabular-nums">
          {time}
        </div>
        <div className="text-xs text-white/30 mt-1">AM</div>
      </div>
    </div>
  );
}

export default function DemoPage3() {
  const [isAgentOpen, setIsAgentOpen] = useState(false);

  const handleChatClick = () => {
    setIsAgentOpen((prev) => !prev);
  };

  return (
    <div className="relative min-h-screen bg-linear-to-br from-white via-[#4d8227] to-[#3a91ba] overflow-hidden md:flex md:h-screen md:overflow-hidden">
      {/* Main content */}
      <div className={cn(
        "relative flex-1 flex min-h-screen flex-col items-center justify-center px-12 py-20 transition-all duration-300 overflow-hidden",
        isAgentOpen && "md:mr-0"
      )}>
        <div className="max-w-7xl w-full flex flex-col items-center gap-12">
          {/* Header Section */}
          <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-8 duration-1000 delay-300 fill-mode-both">
            <h1 className="text-5xl font-black text-white tracking-tight drop-shadow-lg uppercase">
              Ransom Operations Intelligence
            </h1>
            <p className="text-xl font-medium text-white/90 tracking-wide bg-white/10 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/20 inline-block">
              Manual spreadsheets <span className="mx-3 text-white/50">→</span> Real-time workforce intelligence
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-6xl animate-in fade-in zoom-in-95 duration-1000 delay-500 fill-mode-both">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className={cn(
                    "relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl hover:bg-white/15 transition-all duration-300 group overflow-hidden",
                    feature.type === "chat" && "cursor-pointer"
                  )}
                  style={{ minHeight: '200px' }}
                  onClick={feature.type === "chat" ? handleChatClick : undefined}
                >
                  {/* Gradient background glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  <div className="relative flex items-center gap-4 z-10 p-6 h-full">
                    {/* Left side: Icon + Text */}
                    <div className="flex flex-col gap-3 flex-1">
                      {/* Icon with gradient background */}
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} p-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-full h-full text-white stroke-[2.5px]" />
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-xl font-bold text-white leading-tight">
                        {feature.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-sm text-white/90 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                    
                    {/* Right side: Animation */}
                    <div className="flex items-center justify-center w-32 h-full opacity-0 group-hover:opacity-60 transition-opacity duration-300">
                      {feature.type === "chat" && <ChatAnimation />}
                      {feature.type === "calculator" && <CalculatorAnimation />}
                      {feature.type === "scoring" && <ScoringAnimation />}
                      {feature.type === "countdown" && <CountdownAnimation />}
                      {feature.type === "email" && <EmailAnimation />}
                      {feature.type === "schedule" && <ScheduleAnimation />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom banner */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/10 backdrop-blur-xl border-t border-white/20 py-6 px-8 flex justify-center animate-in fade-in slide-in-from-bottom-full duration-1000 delay-1000 fill-mode-both">
          <p className="text-2xl font-black text-white tracking-[0.1em] uppercase drop-shadow-lg">
            Zero clinical data. <span className="text-emerald-400">100% operational metrics.</span>
          </p>
        </div>
      </div>

      {/* AI Chat Sidebar */}
      {isAgentOpen && (
        <div className="fixed right-0 top-[73px] bottom-0 z-50 hidden md:block">
          <AgentPanel onClose={() => setIsAgentOpen(false)} />
        </div>
      )}
    </div>
  );
}
