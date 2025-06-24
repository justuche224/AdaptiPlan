"use client";

import { useState, useMemo } from "react";
import type { Task } from "@/lib/types";
import { decomposeTask, adjustSchedule } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/app-header";
import { TaskInputForm } from "@/components/task-input-form";
import { TimelineView } from "@/components/timeline-view";
import { FocusView } from "@/components/focus-view";
import { Card, CardContent } from "@/components/ui/card";
import { AdaptiPlanLogo } from "@/components/icons";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [mood, setMood] = useState("neutral");
  const [viewMode, setViewMode] = useState<"timeline" | "focus">("timeline");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
          description: "The AI couldn't break down the task. Please try a different wording.",
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
        };
      });

      setTasks((prevTasks) => [...prevTasks, ...newTasks]);
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

  const handleUpdateTaskStatus = async (
    taskId: string,
    status: "completed" | "missed"
  ) => {
    const updatedTasks = tasks.map((task) =>
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
        
        const rescheduledTasks: Task[] = JSON.parse(result.rescheduledSchedule);
        setTasks(rescheduledTasks);
        
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
  };

  const currentTask = useMemo(
    () => tasks.find((task) => task.status === "pending"),
    [tasks]
  );
  
  const welcomeContent = (
      <div className="flex flex-col items-center justify-center text-center p-8 h-full">
        <AdaptiPlanLogo className="w-24 h-24 mb-6 text-primary" />
        <h2 className="text-3xl font-bold mb-2 font-headline">Welcome to AdaptiPlan</h2>
        <p className="text-muted-foreground max-w-md">
          Start by telling me a large task you want to accomplish. For example, &quot;clean my apartment&quot; or &quot;prepare for final exams&quot;. I&apos;ll break it down into manageable steps for you.
        </p>
      </div>
    );

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        mood={mood}
        setMood={setMood}
      />
      <main className="flex-grow container mx-auto p-4 flex flex-col gap-6">
        <TaskInputForm onSubmit={handleAddTask} isLoading={isLoading} />

        {tasks.length === 0 && !isLoading ? (
          <Card className="flex-grow flex items-center justify-center">
            <CardContent className="p-0">{welcomeContent}</CardContent>
          </Card>
        ) : viewMode === "timeline" ? (
          <TimelineView tasks={tasks} onUpdateTaskStatus={handleUpdateTaskStatus} />
        ) : (
          <FocusView task={currentTask} onUpdateTaskStatus={handleUpdateTaskStatus} />
        )}
      </main>
      <footer className="text-center p-4 text-xs text-muted-foreground">
        <p>AdaptiPlan by Firebase Studio</p>
      </footer>
    </div>
  );
}
