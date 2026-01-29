"use client";

import Image from "next/image";
import { MessageSquare, Calculator, Brain, FileText } from "lucide-react";
import { useEffect, useState } from "react";

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

export default function DemoPage3() {
  return (
    <div className="relative min-h-screen bg-linear-to-br from-white via-[#4d8227] to-[#3a91ba] overflow-hidden">
      {/* Main content */}
      <div className="flex min-h-screen flex-col items-center justify-center px-12 py-20">
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
          <div className="grid grid-cols-2 gap-6 w-full max-w-6xl animate-in fade-in zoom-in-95 duration-1000 delay-500 fill-mode-both">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl hover:bg-white/15 transition-all duration-300 group overflow-hidden"
                  style={{ minHeight: '200px' }}
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
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom banner */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/10 backdrop-blur-xl border-t border-white/20 py-6 px-8 flex justify-center animate-in fade-in slide-in-from-bottom-full duration-1000 delay-1000 fill-mode-both">
        <p className="text-2xl font-black text-white tracking-[0.1em] uppercase drop-shadow-lg">
          Zero clinical data. <span className="text-emerald-400">100% operational metrics.</span>
        </p>
      </div>

    </div>
  );
}
