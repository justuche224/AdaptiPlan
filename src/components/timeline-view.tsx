"use client";

import type { Task } from "@/lib/types";
import { TaskCard } from "@/components/task-card";
import { Coffee, FileText } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface TimelineViewProps {
  tasks: Task[];
  onUpdateTaskStatus: (taskId: string, status: "completed" | "missed") => void;
  onBreakDownTask: (taskId: string, taskTitle: string) => void;
  isLoading: boolean;
}

const BREAK_DURATION = 15; // 15 minutes
const WORK_SESSION_DURATION = 90; // 90 minutes

type TimelineItem =
  | { type: "task"; data: Task }
  | { type: "break"; data: { id: string; duration: number } }
  | { type: "header"; data: { id: string; title: string } };

export function TimelineView({ tasks, onUpdateTaskStatus, onBreakDownTask, isLoading }: TimelineViewProps) {
  let accumulatedWorkTime = 0;
  const items: TimelineItem[] = [];

  for (const task of tasks) {
    if (task.isFirstOfParent && task.parentTaskTitle) {
      items.push({
        type: "header",
        data: {
          id: `header_${task.id}`,
          title: task.parentTaskTitle,
        },
      });
    }

    items.push({ type: "task", data: task });
    accumulatedWorkTime += task.durationEstimateMinutes;

    if (accumulatedWorkTime >= WORK_SESSION_DURATION) {
      items.push({
        type: "break",
        data: {
          id: `break_${task.id}`,
          duration: BREAK_DURATION,
        },
      });
      accumulatedWorkTime = 0;
    }
  }

  return (
    <div className="space-y-2">
       <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.data.id}
            id={`item-${item.data.id}`}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {item.type === "header" && (
              <div className="pt-4 pb-1">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-muted-foreground">
                    <FileText className="h-5 w-5" />
                    {item.data.title}
                </h3>
              </div>
            )}
            {item.type === "task" ? (
              <TaskCard
                task={item.data as Task}
                onUpdateStatus={onUpdateTaskStatus}
                onBreakDown={onBreakDownTask}
                isLoading={isLoading}
              />
            ) : item.type === "break" ? (
              <div className="flex items-center gap-4 pl-6">
                <div className="h-full w-px bg-border" />
                <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
                  <Coffee className="h-4 w-4 text-accent" />
                  <span>{(item.data as any).duration} min break</span>
                </div>
              </div>
            ) : null}
          </motion.div>
        ))}
       </AnimatePresence>
    </div>
  );
}
