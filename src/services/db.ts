import { openDB, DBSchema, IDBPDatabase } from "idb";
import { Project, TimerSession } from "../types";

interface TimeTrackerDB extends DBSchema {
  projects: {
    key: string;
    value: Project;
    indexes: { "by-name": string };
  };
  sessions: {
    key: string;
    value: TimerSession;
    indexes: { "by-project": string };
  };
}

const DB_NAME = "time-tracker-db";
const DB_VERSION = 3; // Incremented for schema update

let dbPromise: Promise<IDBPDatabase<TimeTrackerDB>> | null = null;
let dbInitialized = false;

// Check if IndexedDB is available
const isIndexedDBAvailable = () => {
  try {
    return "indexedDB" in window && window.indexedDB !== null;
  } catch (e) {
    console.error("IndexedDB availability check failed:", e);
    return false;
  }
};

export const initDB = async () => {
  // If already initialized or in progress, return the existing promise
  if (dbPromise) {
    return dbPromise;
  }

  // Check if IndexedDB is available
  if (!isIndexedDBAvailable()) {
    console.error("IndexedDB is not available in this browser");
    throw new Error("IndexedDB is not available");
  }

  console.log("Initializing database...");

  try {
    dbPromise = openDB<TimeTrackerDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        console.log(
          `Upgrading database from version ${oldVersion} to ${newVersion}`
        );

        // Handle database creation and version upgrades
        if (oldVersion < 1) {
          console.log("Creating initial database schema (v1)");
          // Create projects store
          const projectsStore = db.createObjectStore("projects", {
            keyPath: "id",
          });
          projectsStore.createIndex("by-name", "name");

          // Create sessions store
          const sessionsStore = db.createObjectStore("sessions", {
            keyPath: "id",
          });
          sessionsStore.createIndex("by-project", "projectId");
        }

        // Migration from version 1 to 2: Add goalHours field to projects
        if (oldVersion < 2) {
          console.log(
            "Migrating database from version 1 to 2 (adding goalHours)"
          );
          // No schema changes needed for optional fields in IndexedDB
          // The field will be added to objects when they're updated
        }

        // Migration from version 2 to 3: Ensure data persistence
        if (oldVersion < 3) {
          console.log(
            "Migrating database from version 2 to 3 (improving persistence)"
          );
          // No schema changes needed, just a version bump to ensure proper initialization
        }
      },
      blocked() {
        console.warn("Database opening blocked. Another tab may be using it.");
      },
      blocking() {
        console.warn("This tab is blocking a database upgrade.");
      },
      terminated() {
        console.error("Database connection was terminated unexpectedly");
        dbPromise = null; // Reset so we can try to reconnect
      },
    });

    // Wait for the database to open successfully
    await dbPromise;
    console.log("Database initialized successfully");
    dbInitialized = true;

    return dbPromise;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    dbPromise = null;
    throw error;
  }
};

// Project operations
export const getAllProjects = async (): Promise<Project[]> => {
  const db = await initDB();
  return db.getAll("projects");
};

export const getProject = async (id: string): Promise<Project | undefined> => {
  const db = await initDB();
  return db.get("projects", id);
};

export const addProject = async (project: Project): Promise<string> => {
  const db = await initDB();
  await db.put("projects", project);
  return project.id;
};

export const updateProject = async (project: Project): Promise<string> => {
  const db = await initDB();
  await db.put("projects", project);
  return project.id;
};

export const deleteProject = async (id: string): Promise<void> => {
  const db = await initDB();
  await db.delete("projects", id);
};

// Session operations
export const getAllSessions = async (): Promise<TimerSession[]> => {
  const db = await initDB();
  return db.getAll("sessions");
};

export const getSessionsByProject = async (
  projectId: string
): Promise<TimerSession[]> => {
  const db = await initDB();
  const index = db.transaction("sessions").store.index("by-project");
  return index.getAll(projectId);
};

export const addSession = async (session: TimerSession): Promise<string> => {
  const db = await initDB();
  await db.put("sessions", session);
  return session.id;
};

export const updateSession = async (session: TimerSession): Promise<string> => {
  const db = await initDB();
  await db.put("sessions", session);
  return session.id;
};

export const deleteSession = async (id: string): Promise<void> => {
  const db = await initDB();
  await db.delete("sessions", id);
};

// Backup data to localStorage
export const backupData = async () => {
  try {
    if (!dbInitialized) {
      console.warn("Cannot backup data: database not initialized");
      return false;
    }

    const projects = await getAllProjects();
    const sessions = await getAllSessions();

    // Get active state from localStorage
    const activeStateStr = localStorage.getItem("timeTrackerState");
    const activeState = activeStateStr
      ? JSON.parse(activeStateStr)
      : { activeProject: null, activeSessions: [] };

    // Create a complete backup
    const backupData = {
      version: DB_VERSION,
      projects,
      completedSessions: sessions,
      activeProject: activeState.activeProject,
      activeSessions: activeState.activeSessions,
      lastBackup: new Date().toISOString(),
    };

    // Save to localStorage with error handling
    try {
      localStorage.setItem("timeTrackerBackup", JSON.stringify(backupData));
      console.log("Data backup created:", new Date().toISOString());

      // Also save a separate copy with timestamp to have multiple backups
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      localStorage.setItem(
        `timeTrackerBackup_${timestamp}`,
        JSON.stringify(backupData)
      );

      // Clean up old backups (keep only the 5 most recent)
      const keys = Object.keys(localStorage)
        .filter((key) => key.startsWith("timeTrackerBackup_"))
        .sort()
        .reverse();

      if (keys.length > 5) {
        for (let i = 5; i < keys.length; i++) {
          localStorage.removeItem(keys[i]);
        }
      }

      return true;
    } catch (storageError) {
      // Handle localStorage quota exceeded or other storage errors
      console.error("Failed to save backup to localStorage:", storageError);
      return false;
    }
  } catch (error) {
    console.error("Error creating backup data:", error);
    return false;
  }
};

// Load initial data
export const loadInitialData = async () => {
  try {
    if (!dbInitialized) {
      console.warn("Cannot load initial data: database not initialized");
      await initDB(); // Try to initialize the database again
    }

    // Check if we have any projects already
    const projects = await getAllProjects();
    if (projects.length === 0) {
      console.log("No projects found, attempting to restore from backup");

      // First try to restore from the main backup
      const backupStr = localStorage.getItem("timeTrackerBackup");
      if (backupStr) {
        try {
          const backup = JSON.parse(backupStr);
          console.log("Found backup from:", backup.lastBackup);

          // Import projects
          if (backup.projects && backup.projects.length > 0) {
            console.log(`Restoring ${backup.projects.length} projects`);
            for (const project of backup.projects) {
              await addProject(project);
            }
          }

          // Import completed sessions
          if (backup.completedSessions && backup.completedSessions.length > 0) {
            console.log(
              `Restoring ${backup.completedSessions.length} sessions`
            );
            for (const session of backup.completedSessions) {
              await addSession(session);
            }
          }

          // Update active state
          const activeState = {
            activeProject: backup.activeProject,
            activeSessions: backup.activeSessions || [],
          };
          localStorage.setItem("timeTrackerState", JSON.stringify(activeState));

          console.log("Successfully restored data from backup");
          return;
        } catch (error) {
          console.error("Error restoring from main backup:", error);

          // Try to find the most recent timestamped backup
          const backupKeys = Object.keys(localStorage)
            .filter((key) => key.startsWith("timeTrackerBackup_"))
            .sort()
            .reverse();

          if (backupKeys.length > 0) {
            console.log("Attempting to restore from timestamped backup");
            try {
              const latestBackup = localStorage.getItem(backupKeys[0]);
              if (latestBackup) {
                const backup = JSON.parse(latestBackup);

                // Import projects
                if (backup.projects && backup.projects.length > 0) {
                  console.log(
                    `Restoring ${backup.projects.length} projects from timestamped backup`
                  );
                  for (const project of backup.projects) {
                    await addProject(project);
                  }
                }

                // Import completed sessions
                if (
                  backup.completedSessions &&
                  backup.completedSessions.length > 0
                ) {
                  console.log(
                    `Restoring ${backup.completedSessions.length} sessions from timestamped backup`
                  );
                  for (const session of backup.completedSessions) {
                    await addSession(session);
                  }
                }

                // Update active state
                const activeState = {
                  activeProject: backup.activeProject,
                  activeSessions: backup.activeSessions || [],
                };
                localStorage.setItem(
                  "timeTrackerState",
                  JSON.stringify(activeState)
                );

                console.log(
                  "Successfully restored data from timestamped backup"
                );
                return;
              }
            } catch (backupError) {
              console.error(
                "Error restoring from timestamped backup:",
                backupError
              );
            }
          }
        }
      }

      // If no backup or backup failed, try the old method
      console.log("No backup found, checking timeTrackerState");
      const savedState = localStorage.getItem("timeTrackerState");
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);

          // Import projects
          if (parsedState.projects && parsedState.projects.length > 0) {
            console.log(
              `Importing ${parsedState.projects.length} projects from timeTrackerState`
            );
            for (const project of parsedState.projects) {
              await addProject(project);
            }
          }

          // Import completed sessions
          if (
            parsedState.completedSessions &&
            parsedState.completedSessions.length > 0
          ) {
            console.log(
              `Importing ${parsedState.completedSessions.length} sessions from timeTrackerState`
            );
            for (const session of parsedState.completedSessions) {
              await addSession(session);
            }
          }

          console.log("Imported data from timeTrackerState");
        } catch (parseError) {
          console.error("Error parsing timeTrackerState:", parseError);
        }
      } else {
        console.log("No data found to restore");
      }
    } else {
      console.log(`Database already contains ${projects.length} projects`);
    }

    // Create a fresh backup after loading data
    await backupData();
  } catch (error) {
    console.error("Error loading initial data:", error);
  }
};
