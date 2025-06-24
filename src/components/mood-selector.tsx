"use client";

import { Button } from "@/components/ui/button";

interface MoodSelectorProps {
  mood: string;
  setMood: (mood: string) => void;
}

const moods = [
  { value: "happy", label: "😊", name: "Happy" },
  { value: "neutral", label: "😐", name: "Neutral" },
  { value: "stressed", label: "😩", name: "Stressed" },
];

export function MoodSelector({ mood, setMood }: MoodSelectorProps) {
  return (
    <div className="flex items-center space-x-1">
      {moods.map((m) => (
        <Button
          key={m.value}
          variant="ghost"
          size="icon"
          onClick={() => setMood(m.value)}
          className={`rounded-full transition-all duration-200 ${
            mood === m.value
              ? "ring-2 ring-primary scale-110"
              : "opacity-50 hover:opacity-100"
          }`}
          aria-label={`Set mood to ${m.name}`}
          aria-pressed={mood === m.value}
        >
          <span className="text-xl">{m.label}</span>
        </Button>
      ))}
    </div>
  );
}
