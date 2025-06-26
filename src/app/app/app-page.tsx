"use client";

import { useState, useMemo, useCallback, useTransition, useOptimistic } from "react";
import type { Task, DailySummaryData } from "@/lib/types";
import {
  addTaskAndDecompose,
  updateTaskStatus,
  getMindfulMoment,
  getDailySummary,
  reorderTasks,
  clearAllTasks,
} from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/app-header";
import { TaskInputForm } from "@/components/task-input-form";
import { TimelineView } from "@/components/timeline-view";
import { FocusView } from "@/components/focus-view";
import { MindfulMomentAlert } from "@/components/mindful-moment-alert";
import { DailySummaryView } from "@/components/daily-summary-view";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

export default function AppPage({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [optimisticTasks, setOptimisticTasks] = useOptimistic(
    tasks,
    (state, newTasks: Task[]) => newTasks
  );

  const [mood, setMood] = useState("neutral");
  const [viewMode, setViewMode] = useState<"timeline" | "focus">("timeline");
  const [isLoading, startTransition] = useTransition();

  const [mindfulSuggestion, setMindfulSuggestion] = useState<string | null>(
    null
  );
  const [dailySummaryData, setDailySummaryData] =
    useState<DailySummaryData | null>(null);
  const { toast } = useToast();

  const handleSetMood = useCallback(async (newMood: string) => {
    setMood(newMood);
    if (newMood === "stressed") {
      try {
        const result = await getMindfulMoment({ userMood: newMood });
        if (result.suggestion) {
          setMindfulSuggestion(result.suggestion);
        }
      } catch (error) {
        console.error("Failed to get mindful moment:", error);
      }
    } else {
      setMindfulSuggestion(null);
    }
  }, []);

  const handleAddTask = async (taskTitle: string) => {
    if (!taskTitle.trim() || isLoading) return;

    startTransition(async () => {
      try {
        const newTasks = await addTaskAndDecompose(taskTitle, mood);
        setTasks((prev) => [...prev, ...newTasks]);

        if (newTasks.length > 0) {
          setTimeout(() => {
            const firstNewTaskEl = document.getElementById(
              `item-${newTasks[0].id}`
            );
            if (firstNewTaskEl) {
              firstNewTaskEl.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }
          }, 300);
        }

        toast({
          title: "Tasks Added",
          description: "Your new tasks are on the timeline.",
        });
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Could not break down task. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  const handleBreakDownTask = async (taskId: string, taskTitle: string) => {
    // This functionality is now part of initial task creation.
    // For simplicity, we'll suggest breaking down tasks from the input form.
    toast({
      title: "Feature Update",
      description: "To break down a task, please add it as a new item.",
    });
  };

  const handleUpdateTaskStatus = (
    taskId: string,
    status: "completed" | "missed"
  ) => {
    startTransition(async () => {
      const newOptimisticTasks = tasks.map((t) =>
        t.id === taskId ? { ...t, status } : t
      );
      setOptimisticTasks(newOptimisticTasks);

      try {
        await updateTaskStatus(taskId, status);
        // The revalidation from the server action will update the `tasks` state
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Could not update task status.",
          variant: "destructive",
        });
        // Revert optimistic update by setting it back to original state
        setOptimisticTasks(tasks);
      }

       // Check for daily summary
      const allTasksDone = newOptimisticTasks.every((t) => t.status !== "pending");
      if (allTasksDone && newOptimisticTasks.length > 0 && !dailySummaryData) {
        try {
          const result = await getDailySummary({
            tasks: JSON.stringify(newOptimisticTasks),
          });
          setDailySummaryData(result);
        } catch (error) {
          console.error("Failed to get daily summary:", error);
          setDailySummaryData({
            summary:
              "You've completed all your tasks for the day. Great job!",
            completedCount: newOptimisticTasks.filter(t => t.status === 'completed').length,
            missedCount: newOptimisticTasks.filter(t => t.status === 'missed').length,
          });
        }
      }
    });
  };

  const handleResetDay = () => {
    startTransition(async () => {
        setDailySummaryData(null);
        setMindfulSuggestion(null);
        setMood("neutral");
        setViewMode("timeline");
        try {
            await clearAllTasks();
            setTasks([]);
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Could not clear tasks. Please refresh the page.",
                variant: "destructive"
            });
        }
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    const reorderedTasks = arrayMove(tasks, oldIndex, newIndex);

    setOptimisticTasks(reorderedTasks);

    startTransition(async () => {
      try {
        await reorderTasks(reorderedTasks.map((t) => t.id));
        toast({
          title: "Schedule Updated",
          description: "Your tasks have been rearranged.",
        });
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Could not save the new order.",
          variant: "destructive",
        });
        setOptimisticTasks(tasks);
      }
    });
  };


  const currentTask = useMemo(
    () => optimisticTasks.find((task) => task.status === "pending"),
    [optimisticTasks]
  );

  const renderMainContent = () => {
    if (dailySummaryData) {
      return (
        <DailySummaryView summaryData={dailySummaryData} onReset={handleResetDay} />
      );
    }

    if (viewMode === "timeline") {
      return (
        <TimelineView
          tasks={optimisticTasks}
          onUpdateTaskStatus={handleUpdateTaskStatus}
          onBreakDownTask={handleBreakDownTask}
          isLoading={isLoading}
          onDragEnd={handleDragEnd}
        />
      );
    }

    return (
      <FocusView task={currentTask} onUpdateTaskStatus={handleUpdateTaskStatus} />
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        mood={mood}
        setMood={handleSetMood}
      />
      <main className="flex-grow container mx-auto p-4 flex flex-col gap-6">
        {!dailySummaryData && (
          <TaskInputForm onSubmit={handleAddTask} isLoading={isLoading} />
        )}

        {mindfulSuggestion && (
          <MindfulMomentAlert
            suggestion={mindfulSuggestion}
            onDismiss={() => setMindfulSuggestion(null)}
          />
        )}

        {renderMainContent()}
      </main>
      <footer className="text-center p-4 text-xs text-muted-foreground">
        <p>AdaptiPlan by Firebase Studio</p>
      </footer>
    </div>
  );
}
