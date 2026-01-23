"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Clock } from "lucide-react";

interface HeroMetricCardProps {
  participantName: string;
  poundsProcessed: number;
  hoursWorked: number;
}

export const HeroMetricCard = ({ 
  participantName, 
  poundsProcessed, 
  hoursWorked 
}: HeroMetricCardProps) => {
  return (
    <Card className="relative overflow-hidden border-2 border-accent/20 bg-gradient-to-br from-accent/5 via-card to-tracker-mint/5">
      {/* Decorative Background Elements */}
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-tracker-mint/10 blur-2xl" />
      
      <CardContent className="relative p-6">
        <div className="mb-4">
          <h2 className="text-lg font-medium text-muted-foreground">
            Your Cumulative Impact
          </h2>
          <p className="text-2xl font-bold text-primary">
            {participantName}, you're making a difference! 🌱
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Pounds Processed */}
          <div className="flex items-start gap-4 rounded-xl bg-card/80 p-4 shadow-sm backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
              <Leaf className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1">
              <div className="text-3xl font-bold text-foreground">
                {poundsProcessed.toLocaleString()}
              </div>
              <div className="mt-1 text-sm font-medium text-muted-foreground">
                lbs of electronics processed
              </div>
              <div className="mt-2 text-xs text-tracker-teal">
                ≈ {Math.round(poundsProcessed * 0.0005)} tons diverted from landfills
              </div>
            </div>
          </div>

          {/* Hours Worked */}
          <div className="flex items-start gap-4 rounded-xl bg-card/80 p-4 shadow-sm backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-tracker-mint/20">
              <Clock className="h-6 w-6 text-tracker-teal" />
            </div>
            <div className="flex-1">
              <div className="text-3xl font-bold text-foreground">
                {hoursWorked}
              </div>
              <div className="mt-1 text-sm font-medium text-muted-foreground">
                hours worked this month
              </div>
              <div className="mt-2 text-xs text-tracker-teal">
                Building skills & experience
              </div>
            </div>
          </div>
        </div>

        {/* Motivational Footer */}
        <div className="mt-4 rounded-lg bg-primary/5 p-3 text-center">
          <p className="text-sm font-medium text-primary">
            Every pound processed is a step toward your future! 💪
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
