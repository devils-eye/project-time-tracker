import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { AppState, Project, TimerSession } from "../types";
import { projectsApi, sessionsApi } from "../services/api";

// Initial state
const initialState: AppState = {
  projects: [],
  activeSessions: [],
  completedSessions: [],
  activeProject: null,
};

// Action types
type Action =
  | { type: "ADD_PROJECT"; payload: Project }
  | { type: "UPDATE_PROJECT"; payload: Project }
  | { type: "DELETE_PROJECT"; payload: string }
  | { type: "SET_ACTIVE_PROJECT"; payload: string | null }
  | { type: "START_TIMER"; payload: TimerSession }
  | { type: "STOP_TIMER"; payload: string }
  | { type: "COMPLETE_TIMER"; payload: TimerSession }
  | { type: "SET_PROJECTS"; payload: Project[] }
  | { type: "SET_COMPLETED_SESSIONS"; payload: TimerSession[] }
  | { type: "SET_ACTIVE_SESSIONS"; payload: TimerSession[] }
  | { type: "LOAD_STATE"; payload: AppState };

// Reducer function
const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case "ADD_PROJECT":
      return {
        ...state,
        projects: [...state.projects, action.payload],
      };
    case "UPDATE_PROJECT":
      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.payload.id ? action.payload : project
        ),
      };
    case "DELETE_PROJECT":
      return {
        ...state,
        projects: state.projects.filter(
          (project) => project.id !== action.payload
        ),
        activeProject:
          state.activeProject === action.payload ? null : state.activeProject,
      };
    case "SET_ACTIVE_PROJECT":
      return {
        ...state,
        activeProject: action.payload,
      };
    case "START_TIMER":
      return {
        ...state,
        activeSessions: [...state.activeSessions, action.payload],
      };
    case "STOP_TIMER":
      return {
        ...state,
        activeSessions: state.activeSessions.filter(
          (session) => session.id !== action.payload
        ),
      };
    case "COMPLETE_TIMER":
      return {
        ...state,
        completedSessions: [...state.completedSessions, action.payload],
        activeSessions: state.activeSessions.filter(
          (session) => session.id !== action.payload.id
        ),
      };
    case "SET_PROJECTS":
      return {
        ...state,
        projects: action.payload,
      };
    case "SET_COMPLETED_SESSIONS":
      return {
        ...state,
        completedSessions: action.payload,
      };
    case "SET_ACTIVE_SESSIONS":
      return {
        ...state,
        activeSessions: action.payload,
      };
    case "LOAD_STATE":
      return action.payload;
    default:
      return state;
  }
};

// Create context
type AppContextType = {
  state: AppState;
  addProject: (project: Project) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setActiveProject: (id: string | null) => void;
  startTimer: (session: TimerSession) => Promise<void>;
  stopTimer: (id: string) => Promise<void>;
  completeTimer: (session: TimerSession) => Promise<void>;
  isLoading: boolean;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and load data from API
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        console.log("Initializing application...");

        // Try to load data from API first
        let serverAvailable = true;

        // Load projects from API
        console.log("Loading projects from API...");
        try {
          const projects = await projectsApi.getAll();
          dispatch({ type: "SET_PROJECTS", payload: projects });
          console.log(`Loaded ${projects.length} projects from API`);
        } catch (projectsError) {
          console.error("Failed to load projects from API:", projectsError);
          serverAvailable = false;

          // Fall back to localStorage if available
          const backupStr = localStorage.getItem("timeTrackerBackup");
          if (backupStr) {
            try {
              const backup = JSON.parse(backupStr);
              if (backup.projects && backup.projects.length > 0) {
                dispatch({ type: "SET_PROJECTS", payload: backup.projects });
                console.log(
                  `Loaded ${backup.projects.length} projects from localStorage backup`
                );
              }
            } catch (backupError) {
              console.error(
                "Failed to load projects from backup:",
                backupError
              );
            }
          }
        }

        // Load completed sessions from API
        console.log("Loading completed sessions from API...");
        try {
          if (serverAvailable) {
            const sessions = await sessionsApi.getAll();
            dispatch({ type: "SET_COMPLETED_SESSIONS", payload: sessions });
            console.log(
              `Loaded ${sessions.length} completed sessions from API`
            );
          } else {
            throw new Error("Server unavailable, using backup");
          }
        } catch (sessionsError) {
          console.error("Failed to load sessions from API:", sessionsError);

          // Fall back to localStorage if available
          const backupStr = localStorage.getItem("timeTrackerBackup");
          if (backupStr) {
            try {
              const backup = JSON.parse(backupStr);
              if (
                backup.completedSessions &&
                backup.completedSessions.length > 0
              ) {
                dispatch({
                  type: "SET_COMPLETED_SESSIONS",
                  payload: backup.completedSessions,
                });
                console.log(
                  `Loaded ${backup.completedSessions.length} sessions from localStorage backup`
                );
              }
            } catch (backupError) {
              console.error(
                "Failed to load sessions from backup:",
                backupError
              );
            }
          }
        }

        // Try to restore active project and sessions from localStorage
        // (active sessions are still kept in localStorage for performance)
        console.log("Restoring active state...");
        const savedState = localStorage.getItem("timeTrackerState");
        if (savedState) {
          try {
            const parsedState = JSON.parse(savedState);

            // Restore active project
            if (parsedState.activeProject) {
              console.log(
                `Restoring active project: ${parsedState.activeProject}`
              );
              dispatch({
                type: "SET_ACTIVE_PROJECT",
                payload: parsedState.activeProject,
              });
            }

            // Restore active sessions
            if (
              parsedState.activeSessions &&
              parsedState.activeSessions.length > 0
            ) {
              console.log(
                `Restoring ${parsedState.activeSessions.length} active sessions`
              );
              parsedState.activeSessions.forEach((session: TimerSession) => {
                dispatch({ type: "START_TIMER", payload: session });
              });
            }

            console.log("Active state restored successfully");
          } catch (parseError) {
            console.error("Failed to parse saved state:", parseError);

            // Create a fresh timeTrackerState if parsing failed
            const freshState = {
              activeProject: null,
              activeSessions: [],
            };
            localStorage.setItem(
              "timeTrackerState",
              JSON.stringify(freshState)
            );
          }
        } else {
          console.log("No active state found in localStorage");
        }

        console.log("Application initialization complete");
      } catch (error) {
        console.error("Failed to initialize app:", error);

        // Store error information
        try {
          localStorage.setItem("initializationFailed", "true");
          localStorage.setItem("lastInitializationError", String(error));
          localStorage.setItem(
            "lastInitializationAttempt",
            new Date().toISOString()
          );
        } catch (storageError) {
          console.error(
            "Failed to save initialization error info:",
            storageError
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Save active state to localStorage and server
  useEffect(() => {
    const activeState = {
      activeProject: state.activeProject,
      activeSessions: state.activeSessions,
    };

    // Save to localStorage
    localStorage.setItem("timeTrackerState", JSON.stringify(activeState));

    // Save active sessions to server
    if (state.activeSessions.length > 0) {
      state.activeSessions.forEach(async (session) => {
        try {
          // Only save if the session has a valid ID and projectId
          if (session.id && session.projectId) {
            await sessionsApi.saveActiveSession({
              ...session,
              elapsedTime: session.duration,
            });
          }
        } catch (error) {
          console.error("Failed to save active session to server:", error);
        }
      });
    }
  }, [state.activeProject, state.activeSessions]);

  // Poll for active sessions from other browsers
  useEffect(() => {
    // Function to fetch active sessions
    const fetchActiveSessions = async () => {
      try {
        const activeSessions = await sessionsApi.getActiveSessions();

        // Filter out sessions that are already in our state (by ID)
        const currentSessionIds = state.activeSessions.map((s) => s.id);
        const newSessions = activeSessions.filter(
          (session) => !currentSessionIds.includes(session.id)
        );

        // If we found new sessions, add them to our state
        if (newSessions.length > 0) {
          console.log(
            `Found ${newSessions.length} active sessions from other browsers`
          );
          dispatch({
            type: "SET_ACTIVE_SESSIONS",
            payload: [...state.activeSessions, ...newSessions],
          });

          // If we don't have an active project but there's an active session, set the active project
          if (!state.activeProject && newSessions.length > 0) {
            dispatch({
              type: "SET_ACTIVE_PROJECT",
              payload: newSessions[0].projectId,
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch active sessions:", error);
      }
    };

    // Initial fetch
    fetchActiveSessions();

    // Set up polling interval (every 5 seconds)
    const intervalId = setInterval(fetchActiveSessions, 5000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [state.activeSessions, state.activeProject]);

  // Handle page unload and visibility change
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Save active state to localStorage before unload
      try {
        const activeState = {
          activeProject: state.activeProject,
          activeSessions: state.activeSessions,
        };

        // Save to localStorage
        localStorage.setItem("timeTrackerState", JSON.stringify(activeState));
        console.log("Active state saved before page unload");
      } catch (error) {
        console.error("Error saving active state:", error);
      }

      // Only show confirmation dialog if there are active timer sessions
      if (state.activeSessions.length > 0) {
        event.preventDefault();
        event.returnValue = "";
        return "";
      }
    };

    // Only add the beforeunload event listener if there are active sessions
    if (state.activeSessions.length > 0) {
      console.log("Adding beforeunload event listener for active sessions");
      window.addEventListener("beforeunload", handleBeforeUnload);
    } else {
      // Remove the event listener if it was previously added
      window.removeEventListener("beforeunload", handleBeforeUnload);
    }

    // Also handle visibilitychange to catch when the page is hidden
    // (useful for mobile browsers that might not trigger beforeunload)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Save active state when the page is hidden
        const activeState = {
          activeProject: state.activeProject,
          activeSessions: state.activeSessions,
        };
        localStorage.setItem("timeTrackerState", JSON.stringify(activeState));
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [state.activeSessions.length, state.activeProject]);

  // Context actions
  const addProject = async (project: Project) => {
    try {
      // Try to save to server
      await projectsApi.create(project);
      dispatch({ type: "ADD_PROJECT", payload: project });

      // Also save to localStorage backup
      const backupStr = localStorage.getItem("timeTrackerBackup");
      if (backupStr) {
        try {
          const backup = JSON.parse(backupStr);
          backup.projects = [...(backup.projects || []), project];
          backup.lastBackup = new Date().toISOString();
          localStorage.setItem("timeTrackerBackup", JSON.stringify(backup));
        } catch (backupError) {
          console.error(
            "Failed to update backup after adding project:",
            backupError
          );
        }
      } else {
        // Create new backup
        const newBackup = {
          version: 1,
          projects: [project],
          completedSessions: state.completedSessions,
          lastBackup: new Date().toISOString(),
        };
        localStorage.setItem("timeTrackerBackup", JSON.stringify(newBackup));
      }
    } catch (error) {
      console.error("Failed to add project:", error);

      // If server is unavailable, still add to local state and backup
      if (
        error instanceof Error &&
        error.message.includes("Server connection failed")
      ) {
        dispatch({ type: "ADD_PROJECT", payload: project });

        // Update localStorage backup
        const backupStr = localStorage.getItem("timeTrackerBackup");
        if (backupStr) {
          try {
            const backup = JSON.parse(backupStr);
            backup.projects = [...(backup.projects || []), project];
            backup.lastBackup = new Date().toISOString();
            localStorage.setItem("timeTrackerBackup", JSON.stringify(backup));
            console.log(
              "Project saved to localStorage backup due to server unavailability"
            );
          } catch (backupError) {
            console.error(
              "Failed to update backup after adding project:",
              backupError
            );
          }
        } else {
          // Create new backup
          const newBackup = {
            version: 1,
            projects: [project],
            completedSessions: state.completedSessions,
            lastBackup: new Date().toISOString(),
          };
          localStorage.setItem("timeTrackerBackup", JSON.stringify(newBackup));
        }

        // Don't throw error if we managed to save locally
        return;
      }

      throw error;
    }
  };

  const updateProject = async (project: Project) => {
    try {
      await projectsApi.update(project);
      dispatch({ type: "UPDATE_PROJECT", payload: project });
    } catch (error) {
      console.error("Failed to update project:", error);
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await projectsApi.delete(id);
      dispatch({ type: "DELETE_PROJECT", payload: id });
    } catch (error) {
      console.error("Failed to delete project:", error);
      throw error;
    }
  };

  const setActiveProject = (id: string | null) => {
    dispatch({ type: "SET_ACTIVE_PROJECT", payload: id });
  };

  const startTimer = async (session: TimerSession) => {
    // Update local state
    dispatch({ type: "START_TIMER", payload: session });

    // Save active session to server
    try {
      await sessionsApi.saveActiveSession(session);
      console.log("Active session saved to server");
    } catch (error) {
      console.error("Failed to save active session to server:", error);
      // Continue anyway since we've updated the local state
    }
  };

  const stopTimer = async (id: string) => {
    // Find the session in active sessions
    const session = state.activeSessions.find((s) => s.id === id);

    // Update local state
    dispatch({ type: "STOP_TIMER", payload: id });

    // If we found the session, complete it on the server
    if (session) {
      try {
        const now = new Date().toISOString();
        await sessionsApi.completeActiveSession(id, now, session.duration);
        console.log("Active session stopped and completed on server");
      } catch (error) {
        console.error("Failed to stop active session on server:", error);
        // Continue anyway since we've updated the local state
      }
    }
  };

  const completeTimer = async (session: TimerSession) => {
    try {
      // First, try to complete the active session if it exists
      try {
        await sessionsApi.completeActiveSession(
          session.id,
          session.endTime || new Date().toISOString(),
          session.duration
        );
        console.log("Active session completed on server");
      } catch (activeError) {
        console.warn(
          "Failed to complete active session, falling back to create:",
          activeError
        );

        // If that fails, add the completed session to the server as a new session
        await sessionsApi.create(session);
      }

      // The server will automatically update the project's total time spent

      // Update the local state
      dispatch({ type: "COMPLETE_TIMER", payload: session });

      // Refresh the projects to get the updated totalTimeSpent
      try {
        const projects = await projectsApi.getAll();
        dispatch({ type: "SET_PROJECTS", payload: projects });
      } catch (refreshError) {
        console.error(
          "Failed to refresh projects after timer completion:",
          refreshError
        );
      }
    } catch (error) {
      console.error("Failed to complete timer:", error);
      throw error;
    }
  };

  return (
    <AppContext.Provider
      value={{
        state,
        addProject,
        updateProject,
        deleteProject,
        setActiveProject,
        startTimer,
        stopTimer,
        completeTimer,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
