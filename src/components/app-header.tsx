"use client";

import type { Dispatch, SetStateAction } from "react";
import { AdaptiPlanLogo } from "@/components/icons";
import { MoodSelector } from "@/components/mood-selector";
import { Button } from "@/components/ui/button";
import { List, Target } from "lucide-react";
import { Separator } from "./ui/separator";
import type { User } from "better-auth";
import { UserProfileButton } from "./user-profile-button";

interface AppHeaderProps {
  user: User;
  viewMode: "timeline" | "focus";
  setViewMode: Dispatch<SetStateAction<"timeline" | "focus">>;
  mood: string;
  setMood: (mood: string) => void;
  onClearTasks: () => void;
}

export function AppHeader({
  user,
  viewMode,
  setViewMode,
  mood,
  setMood,
  onClearTasks,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <AdaptiPlanLogo className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <h1 className="text-lg sm:text-2xl font-bold font-headline">AdaptiPlan</h1>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <MoodSelector mood={mood} setMood={setMood} />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center rounded-md bg-secondary p-1">
             <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('timeline')}
                className={`h-8 w-auto px-2 sm:px-3 ${viewMode === 'timeline' ? 'bg-background shadow-sm' : ''}`}
                aria-pressed={viewMode === 'timeline'}
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Timeline</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('focus')}
                className={`h-8 w-auto px-2 sm:px-3 ${viewMode === 'focus' ? 'bg-background shadow-sm' : ''}`}
                aria-pressed={viewMode === 'focus'}
              >
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Focus</span>
              </Button>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <UserProfileButton user={user} onClearTasks={onClearTasks} />
        </div>
      </div>
    </header>
  );
}
