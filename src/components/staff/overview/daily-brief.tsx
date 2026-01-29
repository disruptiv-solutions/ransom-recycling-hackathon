"use client";

import { useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";

interface DailyBriefProps {
  brief: string;
  generatedAt: string;
  programHealth: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'CONCERNING';
  loading: boolean;
  onRegenerate: () => void;
}

export function DailyBrief({ brief, generatedAt, programHealth, loading, onRegenerate }: DailyBriefProps) {
  const [expanded, setExpanded] = useState(false);

  const healthColors = {
    EXCELLENT: 'text-emerald-700 bg-emerald-100 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    GOOD: 'text-blue-700 bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    FAIR: 'text-amber-700 bg-amber-100 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    CONCERNING: 'text-red-700 bg-red-100 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 rounded-xl border-2 border-blue-100 dark:border-slate-800 p-8 mb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="h-6 w-6 text-blue-600 animate-pulse" />
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Daily Executive Brief</h2>
            <p className="text-sm text-slate-500">Analyzing program data...</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-full"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-5/6"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-4/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 rounded-xl border-2 border-blue-100 dark:border-slate-800 p-6 md:p-8 mb-6 shadow-sm hover:shadow-md transition-shadow">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Daily Executive Brief</h2>
            <p className="text-sm text-slate-500">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-bold border ${healthColors[programHealth]}`}>
            {programHealth}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRegenerate}
            className="text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400"
          >
            <RefreshCw className="mr-2 h-3 w-3" /> Regenerate
          </Button>
        </div>
      </div>
      
      {/* Brief Content */}
      <div className={`prose prose-sm max-w-none dark:prose-invert text-slate-700 dark:text-slate-300 leading-relaxed ${!expanded && brief.length > 600 ? 'max-h-[400px] overflow-hidden relative' : ''}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({node, ...props}) => <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-6 mb-3" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-5 mb-2" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-4 mb-2" {...props} />,
            h4: ({node, ...props}) => <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-4 mb-2" {...props} />,
            p: ({node, ...props}) => <p className="mb-3 text-slate-700 dark:text-slate-300 leading-relaxed" {...props} />,
            ul: ({node, ...props}) => <ul className="mb-4 space-y-2 pl-5 list-disc marker:text-blue-500" {...props} />,
            ol: ({node, ...props}) => <ol className="mb-4 space-y-2 pl-5 list-decimal marker:text-blue-600 marker:font-bold" {...props} />,
            li: ({node, ...props}) => (
              <li className="text-slate-700 dark:text-slate-300 pl-2" {...props} />
            ),
            strong: ({node, ...props}) => <strong className="font-semibold text-slate-900 dark:text-slate-100" {...props} />,
            a: ({node, ...props}) => <a className="text-blue-600 hover:underline dark:text-blue-400" {...props} />,
            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-200 pl-4 italic text-slate-600 dark:border-blue-800 dark:text-slate-400" {...props} />,
          }}
        >
          {brief}
        </ReactMarkdown>
        
        {!expanded && brief.length > 600 && (
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent dark:from-slate-800" />
        )}
      </div>
      
      {/* Expand/Collapse */}
      {brief.length > 600 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium dark:text-blue-400"
        >
          {expanded ? '↑ Show Less' : '↓ View Full Analysis'}
        </button>
      )}
      
      {/* Timestamp */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          Generated {new Date(generatedAt).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
