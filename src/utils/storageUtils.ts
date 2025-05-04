import { AppState } from '../types';

/**
 * Save the application state to localStorage
 */
export const saveState = (state: AppState): void => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('timeTrackerState', serializedState);
  } catch (error) {
    console.error('Could not save state to localStorage:', error);
  }
};

/**
 * Load the application state from localStorage
 */
export const loadState = (): AppState | undefined => {
  try {
    const serializedState = localStorage.getItem('timeTrackerState');
    if (!serializedState) return undefined;
    return JSON.parse(serializedState);
  } catch (error) {
    console.error('Could not load state from localStorage:', error);
    return undefined;
  }
};
