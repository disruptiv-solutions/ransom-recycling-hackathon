"use client";

import { useState, useEffect } from "react";
import { 
  Bell, 
  X, 
  CircleAlert, 
  MessageSquare, 
  TrendingUp,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function NotificationPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const togglePopover = () => setIsOpen(!isOpen);

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className={cn(
          "h-12 w-12 rounded-full transition-all",
          isOpen ? "bg-primary text-white" : "bg-white shadow-sm dark:bg-slate-900 text-slate-600"
        )}
        onClick={togglePopover}
      >
        <Bell className="h-5 w-5" />
        <span className="absolute top-3 right-3 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-4 w-80 md:w-96 rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-50 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto p-2">
              {loading ? (
                <div className="space-y-2 p-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-xl border border-slate-50 dark:border-slate-800">
                      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4 rounded" />
                        <Skeleton className="h-3 w-1/2 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  <NotificationItem 
                    icon={CircleAlert} 
                    iconColor="text-red-500 bg-red-50"
                    title="Missed Shift: Sam Wilson"
                    description="Participant missed their scheduled shift at Site B."
                    time="10m ago"
                  />
                  <NotificationItem 
                    icon={MessageSquare} 
                    iconColor="text-blue-500 bg-blue-50"
                    title="New Note from Sarah"
                    description="Regarding Marcus Thompson's housing interview."
                    time="2h ago"
                  />
                  <NotificationItem 
                    icon={TrendingUp} 
                    iconColor="text-green-500 bg-green-50"
                    title="Milestone Reached"
                    description="Alex Rivera completed 100 total work hours!"
                    time="Yesterday"
                  />
                  <NotificationItem 
                    icon={CheckCircle2} 
                    iconColor="text-purple-500 bg-purple-50"
                    title="Certification Verified"
                    description="Marcus Thompson's OSHA-10 is now verified."
                    time="2 days ago"
                  />
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 p-3 text-center dark:border-slate-800">
              <button className="text-xs font-bold text-primary hover:underline">
                Mark all as read
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function NotificationItem({ icon: Icon, iconColor, title, description, time }: any) {
  return (
    <div className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", iconColor)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">
          {title}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
          {description}
        </p>
        <p className="text-[10px] font-medium text-slate-400 mt-1">
          {time}
        </p>
      </div>
    </div>
  );
}
