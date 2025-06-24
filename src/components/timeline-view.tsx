"use client";

import type { Task } from "@/lib/types";
import { TaskCard } from "@/components/task-card";
import { Coffee } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface TimelineViewProps {
  tasks: Task[];
  onUpdateTaskStatus: (taskId: string, status: "completed" | "missed") => void;
  onBreakDownTask: (taskId: string, taskTitle: string) => void;
  isLoading: boolean;
}

const BREAK_DURATION = 15; // 15 minutes
const WORK_SESSION_DURATION = 90; // 90 minutes

export function TimelineView({ tasks, onUpdateTaskStatus, onBreakDownTask, isLoading }: TimelineViewProps) {
  let accumulatedWorkTime = 0;
  const items = [];

  for (const task of tasks) {
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
    <div className="space-y-4">
       <AnimatePresence>
        {items.map((item, index) => (
          <motion.div
            key={item.data.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {item.type === "task" ? (
              <TaskCard
                task={item.data}
                onUpdateStatus={onUpdateTaskStatus}
                onBreakDown={onBreakDownTask}
                isLoading={isLoading}
              />
            ) : (
              <div className="flex items-center gap-4 pl-6">
                <div className="h-full w-px bg-border" />
                <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
                  <Coffee className="h-4 w-4 text-accent" />
                  <span>{item.data.duration} min break</span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
       </AnimatePresence>
    </div>
  );
}
