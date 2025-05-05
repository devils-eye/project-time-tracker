export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  totalTimeSpent: number; // in seconds
  goalHours?: number; // optional goal in hours
  createdAt: string;
  updatedAt: string;
}

export interface TimerSession {
  id: string;
  projectId: string;
  startTime: string;
  endTime: string | null;
  duration: number; // in seconds
  type: "countdown" | "stopwatch";
  initialDuration?: number; // for countdown timer, in seconds
}

export interface AppState {
  projects: Project[];
  activeSessions: TimerSession[];
  completedSessions: TimerSession[];
  activeProject: string | null;
}

export type TimerType = "countdown" | "stopwatch";
