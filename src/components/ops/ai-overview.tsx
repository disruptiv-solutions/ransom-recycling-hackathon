"use client";

import { useState, useEffect, useMemo } from "react";
import { Sparkles, RefreshCw, AlertCircle, TrendingUp, Users, Lightbulb, CheckCircle2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AIOverviewProps {
  overview?: string;
  loading: boolean;
  onRegenerate: () => void;
  title?: string;
}

export function AIOverview({ overview, loading, onRegenerate, title = "AI Overview" }: AIOverviewProps) {
  const sections = useMemo(() => {
    if (!overview) return [];
    
    // Split by ### but keep the header
    const parts = overview.split(/(?=### )/);
    return parts.map(part => {
      const match = part.match(/### (.*)\n([\s\S]*)/);
      if (match) {
        return {
          title: match[1].trim(),
          content: match[2].trim()
        };
      }
      return {
        title: "",
        content: part.trim()
      };
    }).filter(s => s.title || s.content);
  }, [overview]);

  const getSectionIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("attention") || t.includes("risk") || t.includes("urgent")) return <AlertCircle className="h-4 w-4 text-rose-500" />;
    if (t.includes("highlight") || t.includes("positive") || t.includes("success")) return <TrendingUp className="h-4 w-4 text-emerald-500" />;
    if (t.includes("trend") || t.includes("pattern") || t.includes("group")) return <Users className="h-4 w-4 text-blue-500" />;
    if (t.includes("action") || t.includes("suggested") || t.includes("next")) return <Lightbulb className="h-4 w-4 text-amber-500" />;
    return <Sparkles className="h-4 w-4 text-slate-400" />;
  };

  const getSectionStyles = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("attention") || t.includes("risk") || t.includes("urgent")) return "border-rose-100 bg-rose-50/30 dark:border-rose-900/30 dark:bg-rose-900/10";
    if (t.includes("highlight") || t.includes("positive") || t.includes("success")) return "border-emerald-100 bg-emerald-50/30 dark:border-emerald-900/30 dark:bg-emerald-900/10";
    if (t.includes("trend") || t.includes("pattern") || t.includes("group")) return "border-blue-100 bg-blue-50/30 dark:border-blue-900/30 dark:bg-blue-900/10";
    if (t.includes("action") || t.includes("suggested") || t.includes("next")) return "border-amber-100 bg-amber-50/30 dark:border-amber-900/30 dark:bg-amber-900/10";
    return "border-slate-100 bg-slate-50/30 dark:border-slate-800 dark:bg-slate-900/10";
  };

  if (loading) {
    return (
      <div className="mb-6 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm dark:border-blue-900 dark:from-slate-900 dark:to-slate-800">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 animate-pulse text-blue-600" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Analyzing Operations...</h3>
        </div>
        <div className="space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-blue-100/50"></div>
          <div className="h-4 w-5/6 animate-pulse rounded bg-blue-100/50"></div>
          <div className="h-4 w-4/6 animate-pulse rounded bg-blue-100/50"></div>
        </div>
      </div>
    );
  }

  if (!overview) return null;

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-blue-100 p-1.5 dark:bg-blue-900/30">
            <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRegenerate}
          className="h-8 text-xs font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
        >
          <RefreshCw className="mr-1.5 h-3 w-3" /> Regenerate
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {sections.map((section, idx) => (
          <div 
            key={idx} 
            className={cn(
              "rounded-xl border p-5 transition-all duration-200 hover:shadow-md",
              getSectionStyles(section.title),
              section.title === "" ? "col-span-full border-none bg-transparent p-0 mb-2" : ""
            )}
          >
            {section.title && (
              <div className="mb-3 flex items-center gap-2">
                {getSectionIcon(section.title)}
                <h4 className="text-xs font-black uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                  {section.title}
                </h4>
              </div>
            )}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({node, ...props}) => <p className="mb-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium" {...props} />,
                  ul: ({node, ...props}) => <ul className="mb-0 space-y-2 pl-4 list-none" {...props} />,
                  li: ({node, ...props}) => (
                    <li className="relative text-sm text-slate-700 dark:text-slate-300 pl-5 before:absolute before:left-0 before:top-[0.6em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-slate-300 dark:before:bg-slate-700" {...props} />
                  ),
                  strong: ({node, ...props}) => <strong className="font-bold text-slate-900 dark:text-slate-100" {...props} />,
                }}
              >
                {section.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
