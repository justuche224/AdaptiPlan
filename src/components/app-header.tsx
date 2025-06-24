"use client";

import type { Dispatch, SetStateAction } from "react";
import { AdaptiPlanLogo } from "@/components/icons";
import { MoodSelector } from "@/components/mood-selector";
import { Button } from "@/components/ui/button";
import { List, Target } from "lucide-react";
import { Separator } from "./ui/separator";

interface AppHeaderProps {
  viewMode: "timeline" | "focus";
  setViewMode: Dispatch<SetStateAction<"timeline" | "focus">>;
  mood: string;
  setMood: Dispatch<SetStateAction<string>>;
}

export function AppHeader({
  viewMode,
  setViewMode,
  mood,
  setMood,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center">
          <AdaptiPlanLogo className="h-8 w-8 mr-2 text-primary" />
          <h1 className="text-2xl font-bold font-headline">AdaptiPlan</h1>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <MoodSelector mood={mood} setMood={setMood} />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center rounded-md bg-secondary p-1">
             <Button
                variant={viewMode === 'timeline' ? 'ghost' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('timeline')}
                className={`h-8 px-3 ${viewMode === 'timeline' ? 'bg-background shadow-sm' : ''}`}
                aria-pressed={viewMode === 'timeline'}
              >
                <List className="mr-2 h-4 w-4" />
                Timeline
              </Button>
              <Button
                variant={viewMode === 'focus' ? 'ghost' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('focus')}
                className={`h-8 px-3 ${viewMode === 'focus' ? 'bg-background shadow-sm' : ''}`}
                aria-pressed={viewMode === 'focus'}
              >
                <Target className="mr-2 h-4 w-4" />
                Focus
              </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
