import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { AppState, Project, TimerSession } from "../types";
import * as db from "../services/db";

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
  startTimer: (session: TimerSession) => void;
  stopTimer: (id: string) => void;
  completeTimer: (session: TimerSession) => Promise<void>;
  isLoading: boolean;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize database and load data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);

        // Initialize the database
        await db.initDB();

        // Load initial data from localStorage if needed
        await db.loadInitialData();

        // Load projects from database
        const projects = await db.getAllProjects();
        dispatch({ type: "SET_PROJECTS", payload: projects });

        // Load completed sessions from database
        const sessions = await db.getAllSessions();
        dispatch({ type: "SET_COMPLETED_SESSIONS", payload: sessions });

        // Try to restore active project from localStorage
        const savedState = localStorage.getItem("timeTrackerState");
        if (savedState) {
          try {
            const parsedState = JSON.parse(savedState);
            if (parsedState.activeProject) {
              dispatch({
                type: "SET_ACTIVE_PROJECT",
                payload: parsedState.activeProject,
              });
            }
            if (
              parsedState.activeSessions &&
              parsedState.activeSessions.length > 0
            ) {
              parsedState.activeSessions.forEach((session: TimerSession) => {
                dispatch({ type: "START_TIMER", payload: session });
              });
            }
          } catch (error) {
            console.error("Failed to parse saved state:", error);
          }
        }
      } catch (error) {
        console.error("Failed to initialize app:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Save active state to localStorage
  useEffect(() => {
    const activeState = {
      activeProject: state.activeProject,
      activeSessions: state.activeSessions,
    };
    localStorage.setItem("timeTrackerState", JSON.stringify(activeState));
  }, [state.activeProject, state.activeSessions]);

  // Backup complete state periodically and when state changes
  useEffect(() => {
    // Create an initial backup when the app loads
    const initialBackup = async () => {
      if (state.projects.length > 0 || state.completedSessions.length > 0) {
        await db.backupData();
      }
    };

    initialBackup();

    // Set up periodic backup (every 5 minutes)
    const backupInterval = setInterval(async () => {
      await db.backupData();
    }, 5 * 60 * 1000); // 5 minutes

    // Cleanup interval on unmount
    return () => clearInterval(backupInterval);
  }, []);

  // Backup when important state changes
  useEffect(() => {
    const backupOnChange = async () => {
      await db.backupData();
    };

    backupOnChange();
  }, [state.projects, state.completedSessions]);

  // Backup data when the user is about to leave the page
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Synchronously backup data
      try {
        // Create a synchronous backup
        const projects = state.projects;
        const completedSessions = state.completedSessions;
        const activeState = {
          activeProject: state.activeProject,
          activeSessions: state.activeSessions,
        };

        // Create a complete backup
        const backupData = {
          projects,
          completedSessions,
          activeProject: activeState.activeProject,
          activeSessions: activeState.activeSessions,
          lastBackup: new Date().toISOString(),
        };

        // Save to localStorage
        localStorage.setItem("timeTrackerBackup", JSON.stringify(backupData));
        console.log("Emergency backup created before page unload");
      } catch (error) {
        console.error("Error creating emergency backup:", error);
      }

      // Standard beforeunload handling
      event.preventDefault();
      event.returnValue = "";
    };

    // Add event listener for beforeunload
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [state]);

  // Context actions
  const addProject = async (project: Project) => {
    try {
      await db.addProject(project);
      dispatch({ type: "ADD_PROJECT", payload: project });
    } catch (error) {
      console.error("Failed to add project:", error);
      throw error;
    }
  };

  const updateProject = async (project: Project) => {
    try {
      await db.updateProject(project);
      dispatch({ type: "UPDATE_PROJECT", payload: project });
    } catch (error) {
      console.error("Failed to update project:", error);
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await db.deleteProject(id);
      dispatch({ type: "DELETE_PROJECT", payload: id });
    } catch (error) {
      console.error("Failed to delete project:", error);
      throw error;
    }
  };

  const setActiveProject = (id: string | null) => {
    dispatch({ type: "SET_ACTIVE_PROJECT", payload: id });
  };

  const startTimer = (session: TimerSession) => {
    dispatch({ type: "START_TIMER", payload: session });
  };

  const stopTimer = (id: string) => {
    dispatch({ type: "STOP_TIMER", payload: id });
  };

  const completeTimer = async (session: TimerSession) => {
    try {
      await db.addSession(session);

      // Update project's total time spent
      const project = state.projects.find((p) => p.id === session.projectId);
      if (project) {
        const updatedProject = {
          ...project,
          totalTimeSpent: project.totalTimeSpent + session.duration,
          updatedAt: new Date().toISOString(),
        };
        await db.updateProject(updatedProject);
        dispatch({ type: "UPDATE_PROJECT", payload: updatedProject });
      }

      dispatch({ type: "COMPLETE_TIMER", payload: session });
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
