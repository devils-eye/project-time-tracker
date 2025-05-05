/**
 * Format seconds into a human-readable time string (HH:MM:SS)
 */
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};

/**
 * Parse a time string (HH:MM:SS) into seconds
 */
export const parseTimeToSeconds = (timeString: string): number => {
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * Get the current date in ISO format
 */
export const getCurrentDate = (): string => {
  return new Date().toISOString();
};

/**
 * Calculate the duration between two dates in seconds
 */
export const calculateDuration = (
  startTime: string,
  endTime: string
): number => {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  return Math.floor((end - start) / 1000);
};

/**
 * Format hours with proper pluralization
 */
export const formatHours = (hours: number): string => {
  return hours === 1 ? "1 hour" : `${hours} hours`;
};
