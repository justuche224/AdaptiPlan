"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { Task, RescheduleOption } from "@/lib/types";
import { getReschedulingOptionsAction, applyReschedule } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: Task[];
  missedTask: Task | null;
}

export function RescheduleDialog({
  open,
  onOpenChange,
  tasks,
  missedTask,
}: RescheduleDialogProps) {
  const [options, setOptions] = useState<RescheduleOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && missedTask) {
      setIsLoading(true);
      setOptions([]);
      setSelectedOption(null);

      const fetchOptions = async () => {
        try {
          const result = await getReschedulingOptionsAction({
            currentSchedule: JSON.stringify(tasks),
            missedTask: JSON.stringify(missedTask),
          });
          setOptions(result.options);
          if (result.options.length > 0) {
            setSelectedOption(result.options[0].title);
          }
        } catch (error) {
          console.error("Failed to get rescheduling options:", error);
          toast({
            title: "Error",
            description: "Could not get rescheduling suggestions from AI.",
            variant: "destructive",
          });
          onOpenChange(false);
        } finally {
          setIsLoading(false);
        }
      };
      fetchOptions();
    }
  }, [open, missedTask, tasks, toast, onOpenChange]);

  const handleSubmit = async () => {
    if (!selectedOption) return;

    const chosenOption = options.find((opt) => opt.title === selectedOption);
    if (!chosenOption) return;

    setIsSubmitting(true);
    try {
      const newTasks: Task[] = JSON.parse(chosenOption.newSchedule);
      await applyReschedule(newTasks);
      toast({
        title: "Schedule Updated",
        description: "Your timeline has been successfully rearranged.",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to apply reschedule:", error);
      toast({
        title: "Error",
        description: "Could not apply the new schedule.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Adjust Your Day</DialogTitle>
          <DialogDescription>
            It's okay, plans change. How would you like to handle this missed task?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-[250px]" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-[220px]" />
              </div>
            </div>
          ) : (
            <RadioGroup
              value={selectedOption ?? ""}
              onValueChange={setSelectedOption}
              className="grid gap-4"
            >
              {options.map((option) => (
                <div key={option.title} className="flex items-start space-x-3">
                  <RadioGroupItem value={option.title} id={option.title} className="mt-1" />
                  <Label htmlFor={option.title} className="font-normal cursor-pointer">
                    <span className="font-semibold text-foreground">{option.title}</span>
                    <p className="text-muted-foreground text-sm">{option.description}</p>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || isSubmitting || !selectedOption}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
