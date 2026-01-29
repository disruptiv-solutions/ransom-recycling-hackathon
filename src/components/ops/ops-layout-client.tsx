"use client";

import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import type { SessionProfile } from "@/lib/auth/session";
import { OpsNavbar } from "@/components/ops/ops-navbar";
import { OpsSidebar } from "@/components/ops/ops-sidebar";
import { AgentPanel } from "@/components/ops/agent-panel";
import { cn } from "@/lib/utils";

type OpsLayoutClientProps = {
  profile: SessionProfile;
  unreadAlertsCount: number;
  children: React.ReactNode;
};

export const OpsLayoutClient = ({ profile, unreadAlertsCount, children }: OpsLayoutClientProps) => {
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isDemoPage = pathname.startsWith("/demo/");
  const isEmbedParam = searchParams.get("embed") === "true";
  const isReportEmbed = (pathname.includes("/reports/") && pathname.endsWith("/embed")) || isEmbedParam;

  const handleToggleAgent = () => setIsAgentOpen((prev) => !prev);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 md:flex md:h-screen md:overflow-hidden">
      {!isReportEmbed ? (
        <OpsSidebar profile={profile} isAgentOpen={isAgentOpen} onToggleAgent={handleToggleAgent} />
      ) : null}
      <div className="flex min-h-screen flex-1 flex-col md:overflow-hidden">
        {!isDemoPage && !isReportEmbed ? (
          <OpsNavbar 
            profile={profile} 
            unreadAlertsCount={unreadAlertsCount} 
            isAgentOpen={isAgentOpen}
            onToggleAgent={handleToggleAgent}
          />
        ) : null}
        <div className="flex flex-1 overflow-hidden">
          <main
            className={cn(
              "flex-1",
              isDemoPage
                ? "overflow-hidden p-0"
                : "overflow-y-auto px-4 py-6 sm:px-6 lg:px-8",
              !isDemoPage && (isAgentOpen ? "mx-auto w-full max-w-5xl" : "mx-auto w-full max-w-7xl"),
            )}
          >
            {children}
          </main>
          {isAgentOpen ? <AgentPanel onClose={() => setIsAgentOpen(false)} /> : null}
        </div>
      </div>
    </div>
  );
};
