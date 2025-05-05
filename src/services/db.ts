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
const DB_VERSION = 2; // Incremented for schema update

let dbPromise: Promise<IDBPDatabase<TimeTrackerDB>>;

export const initDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB<TimeTrackerDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        // Handle database creation and version upgrades
        if (oldVersion < 1) {
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
          console.log("Migrating database from version 1 to 2");
          // No schema changes needed for optional fields in IndexedDB
          // The field will be added to objects when they're updated
        }
      },
    });
  }
  return dbPromise;
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

// Load initial data
export const loadInitialData = async () => {
  try {
    // Check if we have any projects already
    const projects = await getAllProjects();
    if (projects.length === 0) {
      console.log("No projects found, loading from localStorage if available");

      // Try to load from localStorage if available
      const savedState = localStorage.getItem("timeTrackerState");
      if (savedState) {
        const parsedState = JSON.parse(savedState);

        // Import projects
        if (parsedState.projects && parsedState.projects.length > 0) {
          for (const project of parsedState.projects) {
            await addProject(project);
          }
        }

        // Import completed sessions
        if (
          parsedState.completedSessions &&
          parsedState.completedSessions.length > 0
        ) {
          for (const session of parsedState.completedSessions) {
            await addSession(session);
          }
        }

        console.log("Imported data from localStorage");
      }
    }
  } catch (error) {
    console.error("Error loading initial data:", error);
  }
};
