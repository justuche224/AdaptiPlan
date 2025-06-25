"use client";

import { Button } from "@/components/ui/button";
import { PartyPopper, RotateCcw } from "lucide-react";
import { ProgressChart } from "./progress-chart";
import type { DailySummaryData } from "@/lib/types";

interface DailySummaryViewProps {
  summaryData: DailySummaryData | null;
  onReset: () => void;
}

export function DailySummaryView({ summaryData, onReset }: DailySummaryViewProps) {
  if (!summaryData) {
    return null; // Or a loading/default state
  }

  const { summary, completedCount, missedCount } = summaryData;

  return (
    <div className="flex-grow flex flex-col items-center justify-center text-center p-4 sm:p-8 animate-fade-in gap-6">
      <div className="max-w-md">
        <PartyPopper className="h-16 w-16 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-bold font-headline mb-2">Day Complete!</h2>
        <p className="text-muted-foreground mb-6">
          {summary ?? "Great job finishing your tasks!"}
        </p>
      </div>

      <ProgressChart completed={completedCount} missed={missedCount} />

      <Button onClick={onReset} size="lg" className="mt-6">
        <RotateCcw className="mr-2 h-5 w-5" />
        Start a New Day
      </Button>
    </div>
  );
}
