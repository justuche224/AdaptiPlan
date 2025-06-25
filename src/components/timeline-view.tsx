"use client";

import type { Task } from "@/lib/types";
import { TaskCard } from "@/components/task-card";
import { Coffee, FileText, CalendarDays } from "lucide-react";
import React, { useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TimelineViewProps {
  tasks: Task[];
  onUpdateTaskStatus: (taskId: string, status: "completed" | "missed") => void;
  onBreakDownTask: (taskId: string, taskTitle: string) => void;
  isLoading: boolean;
  onDragEnd: (event: DragEndEvent) => void;
}

const BREAK_DURATION = 15; // 15 minutes
const WORK_SESSION_DURATION = 90; // 90 minutes

type TimelineItem =
  | { type: "task"; data: Task }
  | { type: "break"; data: { id: string; duration: number } }
  | { type: "header"; data: { id: string; title: string } }
  | { type: "day_separator"; data: { id: string; date: string } };

function SortableTaskWrapper({
  task,
  onUpdateStatus,
  onBreakDown,
  isLoading,
}: {
  task: Task;
  onUpdateStatus: (taskId: string, status: "completed" | "missed") => void;
  onBreakDown: (taskId: string, taskTitle: string) => void;
  isLoading: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto'
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard
        task={task}
        onUpdateStatus={onUpdateStatus}
        onBreakDown={onBreakDown}
        isLoading={isLoading}
      />
    </div>
  );
}

export function TimelineView({
  tasks,
  onUpdateTaskStatus,
  onBreakDownTask,
  isLoading,
  onDragEnd,
}: TimelineViewProps) {
  let accumulatedWorkTime = 0;
  const items: TimelineItem[] = [];

  let currentDay: string | null = null;

  for (const task of tasks) {
    const taskDate = new Date(task.startTime);
    const taskDayString = taskDate.toDateString();

    if (taskDayString !== currentDay) {
      currentDay = taskDayString;
      items.push({
        type: "day_separator",
        data: {
          id: `day_${taskDayString.replace(/\s/g, "_")}`,
          date: taskDate.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          }),
        },
      });
    }

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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require the pointer to move by 8 pixels before activating
      // This prevents click events from being interpreted as drags
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      onActivation: (event) => {
        // Do not activate drag on interactive elements
        if (
          event.target instanceof HTMLElement &&
          (event.target.closest("button") || event.target.closest("a"))
        ) {
          return false;
        }

        // Default activation for keyboard sensor
        if (event.code === "Enter" || event.code === "Space") {
          return true;
        }

        return false;
      },
    })
  );

  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={taskIds}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {items.map((item) => {
            if (item.type === "task") {
              return (
                <SortableTaskWrapper
                  key={item.data.id}
                  task={item.data as Task}
                  onUpdateStatus={onUpdateTaskStatus}
                  onBreakDown={onBreakDownTask}
                  isLoading={isLoading}
                />
              );
            }
            if (item.type === "day_separator") {
              return (
                <div key={item.data.id} className="pt-6 pb-2">
                  <h2 className="flex items-center gap-3 text-xl font-bold text-foreground">
                    <CalendarDays className="h-6 w-6 text-primary" />
                    <span>{item.data.date}</span>
                  </h2>
                  <hr className="mt-2 border-border" />
                </div>
              );
            }
            if (item.type === "header") {
              return (
                <div key={item.data.id} className="pt-4 pb-1">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-muted-foreground">
                    <FileText className="h-5 w-5" />
                    {item.data.title}
                  </h3>
                </div>
              );
            }
            if (item.type === "break") {
              return (
                <div key={item.data.id} className="flex items-center gap-4 pl-6">
                  <div className="h-full w-px bg-border" />
                  <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
                    <Coffee className="h-4 w-4 text-accent" />
                    <span>{(item.data as any).duration} min break</span>
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
