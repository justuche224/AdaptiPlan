
"use client";

import { useState, useMemo, useCallback, useTransition, useOptimistic } from "react";
import type { Task, DailySummaryData } from "@/lib/types";
import {
  addTaskAndDecompose,
  addQuickTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  breakDownTask,
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
import type { User } from "better-auth";
import { RescheduleDialog } from "@/components/reschedule-dialog";
import { EditTaskDialog } from "@/components/edit-task-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";


export default function AppPage({
  initialTasks,
  user,
}: {
  initialTasks: Task[];
  user: User;
}) {
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
  
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [taskToReschedule, setTaskToReschedule] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);


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

  const handleDecomposeTask = async (taskTitle: string) => {
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

  const handleBreakDownTask = async (task: Task) => {
    if (isLoading) return;
  
    startTransition(async () => {
      const originalTasks = tasks;
      setOptimisticTasks(tasks.filter((t) => t.id !== task.id));
      
      try {
        const updatedTasks = await breakDownTask(task.id);
        setTasks(updatedTasks);
        toast({
          title: "Task Decomposed",
          description: `"${task.name}" has been broken down into smaller steps.`,
        });
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Could not break down the task.",
          variant: "destructive",
        });
        setOptimisticTasks(originalTasks);
      }
    });
  };
  
  const handleQuickAddTask = async (name: string, duration: number) => {
    if (!name.trim() || isLoading) return;

    startTransition(async () => {
        const optimisticTask: Task = {
            id: `temp-${Date.now()}`,
            name,
            durationEstimateMinutes: duration,
            status: "pending",
            startTime: new Date().toISOString(),
        };

        setOptimisticTasks([...tasks, optimisticTask]);

        try {
            const newTask = await addQuickTask(name, duration);
            setTasks(prev => [...prev.filter(t => !t.id.startsWith('temp-')), newTask]);
            
            toast({
                title: "Task Added",
                description: `"${name}" has been added to your timeline.`,
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Could not add task. Please try again.",
                variant: "destructive",
            });
            setOptimisticTasks(tasks);
        }
    });
  };
  
  const handleUpdateTask = async (taskId: string, name: string, duration: number) => {
    if (isLoading) return;

    startTransition(async () => {
      const originalTasks = tasks;
      const newOptimisticTasks = tasks.map((t) =>
        t.id === taskId ? { ...t, name, durationEstimateMinutes: duration } : t
      );
      setOptimisticTasks(newOptimisticTasks);
      setEditingTask(null);

      try {
        const updatedTasks = await updateTask(taskId, name, duration);
        setTasks(updatedTasks);
        toast({
          title: "Task Updated",
          description: "Your task and schedule have been updated.",
        });
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Could not update task.",
          variant: "destructive",
        });
        setOptimisticTasks(originalTasks);
      }
    });
  };
  
  const handleDeleteTask = () => {
    if (!deletingTaskId || isLoading) return;

    startTransition(async () => {
        const originalTasks = tasks;
        const optimisticTasks = tasks.filter((t) => t.id !== deletingTaskId);
        setOptimisticTasks(optimisticTasks);
        setDeletingTaskId(null);

        try {
            await deleteTask(deletingTaskId);
            setTasks(optimisticTasks); 
            toast({
                title: "Task Deleted",
                description: "The task has been removed from your timeline.",
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Could not delete the task.",
                variant: "destructive",
            });
            setOptimisticTasks(originalTasks);
        }
    });
  };


  const handleUpdateTaskStatus = (
    taskId: string,
    status: "completed" | "missed"
  ) => {
    startTransition(async () => {
      const originalTasks = tasks;
      const newOptimisticTasks = tasks.map((t) =>
        t.id === taskId ? { ...t, status } : t
      );
      setOptimisticTasks(newOptimisticTasks);

      try {
        await updateTaskStatus(taskId, status);
        setTasks(newOptimisticTasks);

        if (status === 'missed') {
          const missedTask = originalTasks.find(t => t.id === taskId);
            if (missedTask) {
                setTaskToReschedule(missedTask);
                setIsRescheduleDialogOpen(true);
            }
        } else {
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
        }
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Could not update task status.",
          variant: "destructive",
        });
        setOptimisticTasks(originalTasks);
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
    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedTasksList = arrayMove(tasks, oldIndex, newIndex);
    setOptimisticTasks(reorderedTasksList);

    startTransition(async () => {
      try {
        await reorderTasks(reorderedTasksList.map((t) => t.id));
        setTasks(reorderedTasksList); 
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
          onEditTask={setEditingTask}
          onDeleteTask={setDeletingTaskId}
          onBreakDown={handleBreakDownTask}
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
        user={user}
        viewMode={viewMode}
        setViewMode={setViewMode}
        mood={mood}
        setMood={handleSetMood}
        onClearTasks={handleResetDay}
      />
      <main className="flex-grow container mx-auto p-4 flex flex-col gap-6">
        {!dailySummaryData && (
          <TaskInputForm 
            onDecomposeSubmit={handleDecomposeTask}
            onQuickAddSubmit={handleQuickAddTask}
            isLoading={isLoading} 
          />
        )}

        {mindfulSuggestion && (
          <MindfulMomentAlert
            suggestion={mindfulSuggestion}
            onDismiss={() => setMindfulSuggestion(null)}
          />
        )}

        {renderMainContent()}
      </main>
      <RescheduleDialog
        open={isRescheduleDialogOpen}
        onOpenChange={setIsRescheduleDialogOpen}
        tasks={tasks}
        missedTask={taskToReschedule}
      />
      <EditTaskDialog
        open={!!editingTask}
        onOpenChange={(isOpen) => !isOpen && setEditingTask(null)}
        task={editingTask}
        onSave={handleUpdateTask}
        isSaving={isLoading}
      />
      <AlertDialog
        open={!!deletingTaskId}
        onOpenChange={(isOpen) => !isOpen && setDeletingTaskId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this task. You cannot undo this.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTask}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <footer className="text-center p-4 text-xs text-muted-foreground">
        <p>AdaptiPlan by Firebase Studio</p>
      </footer>
    </div>
  );
}
