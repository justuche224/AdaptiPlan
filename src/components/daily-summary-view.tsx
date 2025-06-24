"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PartyPopper, RotateCcw } from "lucide-react";

interface DailySummaryViewProps {
  summary: string | null;
  onReset: () => void;
}

export function DailySummaryView({ summary, onReset }: DailySummaryViewProps) {
  return (
    <Card className="flex-grow flex items-center justify-center text-center p-8 animate-fade-in">
      <div>
        <PartyPopper className="h-16 w-16 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-bold font-headline mb-2">Day Complete!</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          {summary ?? "Great job finishing your tasks!"}
        </p>
        <Button onClick={onReset} size="lg">
          <RotateCcw className="mr-2 h-5 w-5" />
          Start a New Day
        </Button>
      </div>
    </Card>
  );
}
