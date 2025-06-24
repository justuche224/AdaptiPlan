"use client";

import type { Task } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Clock, Target } from "lucide-react";

interface FocusViewProps {
  task: Task | undefined;
  onUpdateTaskStatus: (taskId: string, status: "completed" | "missed") => void;
}

export function FocusView({ task, onUpdateTaskStatus }: FocusViewProps) {
  if (!task) {
    return (
      <Card className="flex-grow flex items-center justify-center text-center p-8">
        <div>
          <Check className="h-16 w-16 mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold font-headline">All tasks completed!</h2>
          <p className="text-muted-foreground">
            You've finished everything on your list. Time for a well-deserved break!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex-grow flex items-center justify-center">
      <Card className="w-full max-w-lg animate-fade-in">
        <CardHeader className="text-center">
          <Target className="h-8 w-8 mx-auto text-primary mb-2" />
          <p className="text-sm font-semibold text-primary uppercase tracking-wider">
            Your Next Task
          </p>
          <CardTitle className="text-3xl font-headline">{task.name}</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex items-center justify-center gap-2 text-lg text-muted-foreground">
            <Clock className="h-5 w-5" />
            <span>Estimated time: {task.durationEstimateMinutes} minutes</span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4 pt-6">
          <Button
            size="lg"
            className="h-12 px-8 text-base bg-green-600 hover:bg-green-700 text-white"
            onClick={() => onUpdateTaskStatus(task.id, "completed")}
            aria-label={`Mark task '${task.name}' as completed`}
          >
            <Check className="mr-2 h-5 w-5" />
            Done
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 px-8 text-base"
            onClick={() => onUpdateTaskStatus(task.id, "missed")}
            aria-label={`Mark task '${task.name}' as missed`}
          >
            <X className="mr-2 h-5 w-5" />
            Skip
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
