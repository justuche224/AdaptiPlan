"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Lightbulb, X } from "lucide-react";

interface MindfulMomentAlertProps {
  suggestion: string;
  onDismiss: () => void;
}

export function MindfulMomentAlert({
  suggestion,
  onDismiss,
}: MindfulMomentAlertProps) {
  return (
    <div className="relative">
      <Alert className="border-accent/50 bg-accent/10 text-accent-foreground pr-10">
        <Lightbulb className="h-4 w-4 text-accent" />
        <AlertTitle className="font-semibold">A Mindful Moment</AlertTitle>
        <AlertDescription>{suggestion}</AlertDescription>
      </Alert>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7 text-accent/80 hover:text-accent"
        onClick={onDismiss}
        aria-label="Dismiss mindful moment"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
