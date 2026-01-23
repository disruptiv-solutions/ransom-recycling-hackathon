"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  time?: string;
  completed: boolean;
}

interface DailyChecklistProps {
  items: ChecklistItem[];
  onToggle?: (id: string) => void;
}

export const DailyChecklist = ({ items, onToggle }: DailyChecklistProps) => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(items);

  const handleToggle = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
    onToggle?.(id);
  };

  const completedCount = checklist.filter((item) => item.completed).length;
  const totalCount = checklist.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  return (
    <Card className="border-2 border-primary/10 bg-gradient-to-br from-card to-secondary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-foreground">
            Today's Checklist
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              {completedCount} of {totalCount}
            </span>
            <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-gradient-to-r from-accent to-tracker-mint transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {checklist.map((item) => (
          <button
            key={item.id}
            onClick={() => handleToggle(item.id)}
            className="group flex w-full items-start gap-4 rounded-lg bg-card p-4 text-left shadow-sm transition-all hover:shadow-md hover:ring-2 hover:ring-accent/50 focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label={`${item.completed ? "Mark as incomplete" : "Mark as complete"}: ${item.label}`}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleToggle(item.id);
              }
            }}
          >
            {/* Checkbox Icon */}
            <div className="flex-shrink-0 pt-0.5">
              {item.completed ? (
                <CheckCircle2 className="h-6 w-6 text-accent transition-transform group-hover:scale-110" />
              ) : (
                <Circle className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-accent" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div
                className={`font-medium transition-all ${
                  item.completed
                    ? "text-muted-foreground line-through"
                    : "text-foreground"
                }`}
              >
                {item.label}
              </div>
              {item.time && (
                <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{item.time}</span>
                </div>
              )}
            </div>

            {/* Completion Badge */}
            {item.completed && (
              <div className="flex-shrink-0 rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent">
                Done!
              </div>
            )}
          </button>
        ))}

        {/* Motivational Message */}
        {completedCount === totalCount && totalCount > 0 && (
          <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 rounded-lg bg-gradient-to-r from-accent/20 to-tracker-mint/20 p-4 text-center">
            <p className="text-lg font-bold text-primary">
              🎉 All done for today! Great work!
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              You're building momentum toward your goals
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
