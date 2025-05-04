/**
 * Date utility functions for the time tracker app
 */

/**
 * Check if a date is today
 * @param date The date to check
 * @returns boolean indicating if the date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if a date is within the current week (last 7 days)
 * @param date The date to check
 * @returns boolean indicating if the date is within the current week
 */
export const isThisWeek = (date: Date): boolean => {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  return date >= weekAgo && date <= now;
};

/**
 * Check if a date is within the current month
 * @param date The date to check
 * @returns boolean indicating if the date is within the current month
 */
export const isThisMonth = (date: Date): boolean => {
  const now = new Date();
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
};

/**
 * Get the day name for a date (e.g., "Monday", "Tuesday")
 * @param date The date to get the day name for
 * @returns The day name
 */
export const getDayName = (date: Date): string => {
  return date.toLocaleDateString("en-US", { weekday: "short" });
};

/**
 * Get the last 7 days as an array of date objects
 * @returns Array of the last 7 days
 */
export const getLast7Days = (): Date[] => {
  const result: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    result.push(date);
  }
  return result;
};

/**
 * Get the days in the current month as an array of date objects
 * @returns Array of days in the current month
 */
export const getDaysInCurrentMonth = (): Date[] => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const result: Date[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    result.push(date);
  }
  return result;
};

/**
 * Format a date as a day with month (e.g., "1 Jan")
 * @param date The date to format
 * @returns Formatted date string
 */
export const formatDayMonth = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
};
