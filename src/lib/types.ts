export interface Task {
  id: string; // This will be the publicId from the database
  name: string;
  durationEstimateMinutes: number;
  status: 'pending' | 'completed' | 'missed';
  startTime: string; // ISO string for easy serialization
  parentTaskTitle?: string;
  isFirstOfParent?: boolean;
}

export interface DailySummaryData {
  summary: string;
  completedCount: number;
  missedCount: number;
}

export interface RescheduleOption {
  title: string;
  description: string;
  newSchedule: string; // The full schedule as a JSON string of Task[]
}
