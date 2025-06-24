"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/icons";
import { Wand2 } from "lucide-react";

interface TaskInputFormProps {
  onSubmit: (taskTitle: string) => void;
  isLoading: boolean;
}

export function TaskInputForm({ onSubmit, isLoading }: TaskInputFormProps) {
  const [taskTitle, setTaskTitle] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(taskTitle);
    setTaskTitle("");
  };

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Textarea
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="What's a big task on your mind? e.g., 'Plan a birthday party'"
            rows={3}
            disabled={isLoading}
            required
            className="text-base"
          />
          <Button type="submit" disabled={isLoading || !taskTitle.trim()} className="w-full sm:w-auto sm:self-end">
            {isLoading ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" />
                Decomposing...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Break Down Task
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
