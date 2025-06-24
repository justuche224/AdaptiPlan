export interface Task {
  id: string;
  name: string;
  durationEstimateMinutes: number;
  status: 'pending' | 'completed' | 'missed';
  startTime: string; // ISO string for easy serialization
}
