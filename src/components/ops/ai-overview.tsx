"use client";

import { useState, useEffect } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";

interface AIOverviewProps {
  overview?: string;
  loading: boolean;
  onRegenerate: () => void;
  title?: string;
}

export function AIOverview({ overview, loading, onRegenerate, title = "AI Overview" }: AIOverviewProps) {
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
    <div className="mb-6 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm dark:border-blue-900 dark:from-slate-900 dark:to-slate-800">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRegenerate}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400"
        >
          <RefreshCw className="mr-1 h-3 w-3" /> Regenerate
        </Button>
      </div>

      <div className="max-h-[420px] overflow-y-auto pr-2 text-slate-700 dark:text-slate-300">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({node, ...props}) => <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-6 mb-3" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-5 mb-2" {...props} />,
            h3: ({node, ...props}) => (
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-6 mb-3 border-b border-slate-100 dark:border-slate-800 pb-2" {...props} />
            ),
            h4: ({node, ...props}) => <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-4 mb-2" {...props} />,
            p: ({node, ...props}) => <p className="mb-3 text-slate-700 dark:text-slate-300 leading-relaxed" {...props} />,
            ul: ({node, ...props}) => <ul className="mb-4 space-y-2 pl-5 list-disc marker:text-blue-500" {...props} />,
            ol: ({node, ...props}) => <ol className="mb-4 space-y-2 pl-5 list-decimal marker:text-blue-600 marker:font-bold" {...props} />,
            li: ({node, ...props}) => (
              <li className="text-slate-700 dark:text-slate-300 pl-1" {...props} />
            ),
            strong: ({node, ...props}) => <strong className="font-semibold text-slate-900 dark:text-slate-100" {...props} />,
            a: ({node, ...props}) => <a className="text-blue-600 hover:underline dark:text-blue-400" {...props} />,
            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-200 pl-4 italic text-slate-600 dark:border-blue-800 dark:text-slate-400" {...props} />,
          }}
        >
          {overview}
        </ReactMarkdown>
      </div>
    </div>
  );
}
