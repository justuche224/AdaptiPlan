
"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Task } from "@/lib/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Loader2 } from "lucide-react";

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onSave: (taskId: string, name: string, duration: number) => void;
  isSaving: boolean;
}

const formSchema = z.object({
  name: z.string().min(1, "Task name cannot be empty."),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute."),
});

export function EditTaskDialog({
  open,
  onOpenChange,
  task,
  onSave,
  isSaving,
}: EditTaskDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      duration: 30,
    },
  });

  useEffect(() => {
    if (task) {
      form.reset({
        name: task.name,
        duration: task.durationEstimateMinutes,
      });
    }
  }, [task, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (task) {
      onSave(task.id, values.name, values.duration);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Make changes to your task here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="edit-task-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="grid gap-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Name</FormLabel>
                  <FormControl>
                    <Input {...field} className="col-span-3" disabled={isSaving} />
                  </FormControl>
                  <div className="col-start-2 col-span-3">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Duration (min)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      className="col-span-3"
                      disabled={isSaving}
                    />
                  </FormControl>
                  <div className="col-start-2 col-span-3">
                     <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button
            type="submit"
            form="edit-task-form"
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
