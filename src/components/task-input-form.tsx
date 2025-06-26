
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/icons";
import { Wand2, Plus } from "lucide-react";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "./ui/form";

interface TaskInputFormProps {
  onDecomposeSubmit: (taskTitle: string) => void;
  onQuickAddSubmit: (name: string, duration: number) => void;
  isLoading: boolean;
}

const decomposeSchema = z.object({
  taskTitle: z.string().min(1, "Please enter a task to decompose."),
});

const quickAddSchema = z.object({
  quickTaskName: z.string().min(1, "Please enter a task name."),
  quickTaskDuration: z.coerce
    .number()
    .min(1, "Duration must be at least 1 minute."),
});

export function TaskInputForm({
  onDecomposeSubmit,
  onQuickAddSubmit,
  isLoading,
}: TaskInputFormProps) {
  const [useAI, setUseAI] = useState(true);

  const formDecompose = useForm({
    resolver: zodResolver(decomposeSchema),
    defaultValues: { taskTitle: "" },
  });

  const formQuickAdd = useForm({
    resolver: zodResolver(quickAddSchema),
    defaultValues: { quickTaskName: "", quickTaskDuration: 30 },
  });

  const handleDecompose = (values: z.infer<typeof decomposeSchema>) => {
    onDecomposeSubmit(values.taskTitle);
    formDecompose.reset();
  };

  const handleQuickAdd = (values: z.infer<typeof quickAddSchema>) => {
    onQuickAddSubmit(values.quickTaskName, values.quickTaskDuration);
    formQuickAdd.reset();
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-end space-x-2 mb-4">
          <Label htmlFor="ai-toggle" className="text-sm font-medium">
            Use AI Decomposition
          </Label>
          <Switch
            id="ai-toggle"
            checked={useAI}
            onCheckedChange={setUseAI}
            disabled={isLoading}
          />
        </div>

        {useAI ? (
          <Form {...formDecompose}>
            <form
              onSubmit={formDecompose.handleSubmit(handleDecompose)}
              className="flex flex-col gap-4"
            >
              <FormField
                control={formDecompose.control}
                name="taskTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="What's a big task on your mind? e.g., 'Plan a birthday party'"
                        rows={3}
                        disabled={isLoading}
                        className="text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={isLoading || !formDecompose.watch("taskTitle")?.trim()}
                className="w-full sm:w-auto sm:self-end"
              >
                {isLoading ? (
                  <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Break Down Task
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...formQuickAdd}>
            <form
              onSubmit={formQuickAdd.handleSubmit(handleQuickAdd)}
              className="flex flex-col gap-4 sm:flex-row sm:items-start"
            >
              <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-4 flex-grow">
                 <FormField
                    control={formQuickAdd.control}
                    name="quickTaskName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Quick task name, e.g., 'Call the dentist'"
                            disabled={isLoading}
                            className="text-base h-11"
                          />
                        </FormControl>
                         <FormMessage />
                      </FormItem>
                    )}
                 />
                 <FormField
                    control={formQuickAdd.control}
                    name="quickTaskDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="Duration"
                            disabled={isLoading}
                            className="text-base h-11"
                          />
                        </FormControl>
                         <FormMessage />
                      </FormItem>
                    )}
                 />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !formQuickAdd.formState.isValid}
                className="w-full sm:w-auto h-11"
              >
                {isLoading ? (
                  <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Add Task
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
