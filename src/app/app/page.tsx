"use client";

import { useState, useMemo, useCallback } from "react";
import type { Task } from "@/lib/types";
import {
  decomposeTask,
  adjustSchedule,
  getMindfulMoment,
  getDailySummary,
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

export default function AppPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [mood, setMood] = useState("neutral");
  const [viewMode, setViewMode] = useState<"timeline" | "focus">("timeline");
  const [isLoading, setIsLoading] = useState(false);
  const [mindfulSuggestion, setMindfulSuggestion] = useState<string | null>(
    null
  );
  const [dailySummary, setDailySummary] = useState<string | null>(null);
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
    if (!taskTitle.trim()) return;
    setIsLoading(true);
    try {
      const result = await decomposeTask({
        task: taskTitle,
        userMood: mood,
      });

      if (!result || result.subTasks.length === 0) {
        toast({
          title: "No sub-tasks generated",
          description:
            "The AI couldn't break down the task. Please try a different wording.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      let lastEndTime = new Date();
      if (tasks.length > 0) {
        const lastTask = tasks[tasks.length - 1];
        lastEndTime = new Date(
          new Date(lastTask.startTime).getTime() +
            lastTask.durationEstimateMinutes * 60000
        );
        lastEndTime = new Date(lastEndTime.getTime() + 5 * 60000); // 5 min buffer
      }

      const newTasks: Task[] = result.subTasks.map((subTask, index) => {
        const startTime = new Date(lastEndTime.getTime());
        lastEndTime = new Date(
          lastEndTime.getTime() + subTask.durationEstimateMinutes * 60000
        );

        return {
          id: `task_${Date.now()}_${index}`,
          name: subTask.name,
          durationEstimateMinutes: subTask.durationEstimateMinutes,
          status: "pending",
          startTime: startTime.toISOString(),
          parentTaskTitle: taskTitle,
          isFirstOfParent: index === 0,
        };
      });

      setTasks((prevTasks) => [...prevTasks, ...newTasks]);

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
        description: "Could not break down task. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleBreakDownTask = async (taskId: string, taskTitle: string) => {
    if (isLoading) return;

    setIsLoading(true);
    toast({
      title: "Breaking it down...",
      description: "Getting smaller steps from the AI.",
    });

    try {
      const result = await decomposeTask({
        task: taskTitle,
        userMood: mood,
      });

      if (!result || !result.subTasks || result.subTasks.length === 0) {
        toast({
          title: "Couldn't break down task",
          description:
            "The AI couldn't break this down further. Maybe it's small enough?",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const originalTaskIndex = tasks.findIndex((t) => t.id === taskId);
      if (originalTaskIndex === -1) {
        setIsLoading(false);
        return;
      }

      const originalTask = tasks[originalTaskIndex];
      let lastEndTime = new Date(originalTask.startTime);

      const newSubTasks: Task[] = result.subTasks.map((subTask, index) => {
        const startTime = new Date(lastEndTime.getTime());
        lastEndTime = new Date(
          lastEndTime.getTime() + subTask.durationEstimateMinutes * 60000
        );

        return {
          id: `task_${Date.now()}_${index}`,
          name: subTask.name,
          durationEstimateMinutes: subTask.durationEstimateMinutes,
          status: "pending",
          startTime: startTime.toISOString(),
          parentTaskTitle: taskTitle,
          isFirstOfParent: index === 0,
        };
      });

      const tasksBefore = tasks.slice(0, originalTaskIndex);
      const tasksAfter = tasks.slice(originalTaskIndex + 1);

      let nextTaskStartTime = new Date(lastEndTime.getTime() + 5 * 60000); // Add buffer

      const updatedTasksAfter = tasksAfter.map((task) => {
        const newStartTime = new Date(nextTaskStartTime.getTime());
        nextTaskStartTime = new Date(
          nextTaskStartTime.getTime() + task.durationEstimateMinutes * 60000
        );
        return { ...task, startTime: newStartTime.toISOString() };
      });

      const newTaskList = [
        ...tasksBefore,
        ...newSubTasks,
        ...updatedTasksAfter,
      ];
      setTasks(newTaskList);

      if (newSubTasks.length > 0) {
        setTimeout(() => {
          const firstNewTaskEl = document.getElementById(
            `item-${newSubTasks[0].id}`
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
        title: "Task Broken Down",
        description: "I've replaced the task with smaller steps.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Could not break down task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (
    taskId: string,
    status: "completed" | "missed"
  ) => {
    let updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, status } : task
    );
    setTasks(updatedTasks);

    if (status === "completed") {
      toast({
        title: "Great job!",
        description: "One more task done. Keep it up!",
      });
    }

    if (status === "missed") {
      setIsLoading(true);
      toast({
        title: "Adjusting your schedule...",
        description: "It's okay, let's figure out a new plan.",
      });
      try {
        const result = await adjustSchedule({
          currentSchedule: JSON.stringify(updatedTasks),
          missedTasks: JSON.stringify([tasks.find((t) => t.id === taskId)]),
          userMood: mood,
        });

        updatedTasks = JSON.parse(result.rescheduledSchedule);
        setTasks(updatedTasks);

        toast({
          title: "Schedule Adjusted",
          description: result.message,
        });
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Could not adjust your schedule. Please adjust manually.",
          variant: "destructive",
        });
        // Revert optimistic update on error
        setTasks(tasks);
      }
      setIsLoading(false);
    }

    // Check for daily summary
    const allTasksDone = updatedTasks.every((t) => t.status !== "pending");
    if (allTasksDone && updatedTasks.length > 0 && !dailySummary) {
      setIsLoading(true);
      try {
        const result = await getDailySummary({
          tasks: JSON.stringify(updatedTasks),
        });
        setDailySummary(result.summary);
      } catch (error) {
        console.error("Failed to get daily summary:", error);
        setDailySummary(
          "You've completed all your tasks for the day. Great job!"
        );
      }
      setIsLoading(false);
    }
  };

  const handleResetDay = () => {
    setTasks([]);
    setDailySummary(null);
    setMindfulSuggestion(null);
    setMood("neutral");
    setViewMode("timeline");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    if (active.id !== over.id) {
      setTasks((currentTasks) => {
        const oldIndex = currentTasks.findIndex((t) => t.id === active.id);
        const newIndex = currentTasks.findIndex((t) => t.id === over.id);

        if (oldIndex === -1 || newIndex === -1) {
          return currentTasks; // Should not happen
        }

        const reorderedTasks = arrayMove(currentTasks, oldIndex, newIndex);

        // Now, recalculate start times to ensure chronological order
        if (reorderedTasks.length === 0) return [];

        // Anchor the schedule to the start time of the first task in the original list
        const scheduleStartTime = new Date(currentTasks[0].startTime);
        let nextStartTime = scheduleStartTime;

        const finalSchedule = reorderedTasks.map((task) => {
          const currentTaskStartTime = new Date(nextStartTime.getTime());
          nextStartTime = new Date(
            currentTaskStartTime.getTime() +
              task.durationEstimateMinutes * 60000
          );
          return {
            ...task,
            startTime: currentTaskStartTime.toISOString(),
          };
        });

        return finalSchedule;
      });

      toast({
        title: "Schedule Updated",
        description: "Your tasks have been rearranged.",
      });
    }
  };


  const currentTask = useMemo(
    () => tasks.find((task) => task.status === "pending"),
    [tasks]
  );

  const renderMainContent = () => {
    if (dailySummary) {
      return (
        <DailySummaryView summary={dailySummary} onReset={handleResetDay} />
      );
    }

    if (viewMode === "timeline") {
      return (
        <TimelineView
          tasks={tasks}
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
        {!dailySummary && (
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
