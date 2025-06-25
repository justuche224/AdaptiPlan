"use client";

import type { MouseEvent } from "react";
import type { Task } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onUpdateStatus: (taskId: string, status: "completed" | "missed") => void;
  onBreakDown: (taskId: string, taskTitle: string) => void;
  isLoading: boolean;
}

export function TaskCard({ task, onUpdateStatus, onBreakDown, isLoading }: TaskCardProps) {
  const startTime = new Date(task.startTime);
  const endTime = new Date(
    startTime.getTime() + task.durationEstimateMinutes * 60000
  );

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const isPending = task.status === "pending";

  return (
    <Card
      className={cn(
        "transition-all duration-300",
        task.status === "completed" && "bg-primary/10 border-primary/20",
        task.status === "missed" && "bg-destructive/10 border-destructive/20"
      )}
    >
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <div className="flex w-full flex-grow items-start gap-4 sm:items-center">
                <div className="flex flex-col items-center justify-center w-16 text-center shrink-0">
                    <div className="font-bold text-lg">{formatTime(startTime)}</div>
                    <div className="text-xs text-muted-foreground">
                        {formatTime(endTime)}
                    </div>
                </div>
                <div className="h-auto w-px self-stretch bg-border hidden sm:block" />
                <div className="flex-grow">
                    <p
                        className={cn(
                        "font-medium",
                        task.status === "completed" && "line-through text-muted-foreground",
                        task.status === "missed" && "line-through text-destructive/80"
                        )}
                    >
                        {task.name}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Clock className="h-4 w-4" />
                        <span>{task.durationEstimateMinutes} minutes</span>
                    </div>
                </div>
            </div>
            <div className="w-full sm:w-auto pt-4 sm:pt-0">
                {isPending && (
                <div className="flex gap-2 justify-end">
                    <Button
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 rounded-full border-primary/50 text-primary/80 hover:bg-primary/10 hover:text-primary"
                    onClick={(e: MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        onBreakDown(task.id, task.name);
                    }}
                    aria-label={`Break down task '${task.name}'`}
                    disabled={isLoading}
                    >
                    <Wand2 className="h-4 w-4" />
                    </Button>
                    <Button
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 rounded-full border-green-500 text-green-500 hover:bg-green-500/10 hover:text-green-400"
                    onClick={(e: MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        onUpdateStatus(task.id, "completed");
                    }}
                    aria-label={`Mark task '${task.name}' as completed`}
                    disabled={isLoading}
                    >
                    <Check className="h-4 w-4" />
                    </Button>
                    <Button
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 rounded-full border-red-500 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                    onClick={(e: MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        onUpdateStatus(task.id, "missed");
                    }}
                    aria-label={`Mark task '${task.name}' as missed`}
                    disabled={isLoading}
                    >
                    <X className="h-4 w-4" />
                    </Button>
                </div>
                )}
                {!isPending && (
                    <div className="flex justify-end sm:justify-center">
                        <Badge variant={task.status === 'completed' ? 'default' : 'destructive'} 
                            className={cn(task.status === 'completed' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30')}>
                            {task.status}
                        </Badge>
                    </div>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
