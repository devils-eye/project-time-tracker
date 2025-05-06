import { Project, TimerSession } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string,
  method: string = "GET",
  data?: any
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    options.signal = controller.signal;

    const response = await fetch(url, options);
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `API request failed with status ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`API request error for ${method} ${endpoint}:`, error);

    // Check if it's a network error (server not available)
    if (
      error instanceof TypeError ||
      error instanceof DOMException ||
      (error instanceof Error &&
        (error.message.includes("Failed to fetch") ||
          error.message.includes("NetworkError") ||
          error.message.includes("abort")))
    ) {
      console.warn(
        "Server connection issue detected, using local storage fallback"
      );
      throw new Error(
        `Server connection failed. Your changes will be saved locally. Details: ${error.message}`
      );
    }

    throw error;
  }
}

// Project API functions
export const projectsApi = {
  getAll: () => apiRequest<Project[]>("/projects"),

  getById: (id: string) => apiRequest<Project>(`/projects/${id}`),

  create: (project: Project) =>
    apiRequest<{ id: string }>("/projects", "POST", project),

  update: (project: Project) =>
    apiRequest<{ id: string }>(`/projects/${project.id}`, "PUT", project),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/projects/${id}`, "DELETE"),
};

// Session API functions
export const sessionsApi = {
  getAll: () => apiRequest<TimerSession[]>("/sessions"),

  getByProject: (projectId: string) =>
    apiRequest<TimerSession[]>(`/sessions/project/${projectId}`),

  getById: (id: string) => apiRequest<TimerSession>(`/sessions/${id}`),

  create: (session: TimerSession) =>
    apiRequest<{ id: string }>("/sessions", "POST", session),

  update: (session: TimerSession) =>
    apiRequest<{ id: string }>(`/sessions/${session.id}`, "PUT", session),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/sessions/${id}`, "DELETE"),

  // Active sessions
  getActiveSessions: () => apiRequest<TimerSession[]>("/sessions/active"),

  saveActiveSession: (session: TimerSession & { elapsedTime?: number }) =>
    apiRequest<{ id: string }>("/sessions/active", "POST", session),

  completeActiveSession: (id: string, endTime: string, duration: number) =>
    apiRequest<{ id: string }>(`/sessions/active/${id}/complete`, "POST", {
      endTime,
      duration,
    }),
};

// Settings API functions
export const settingsApi = {
  getAll: () => apiRequest<Record<string, string>>("/settings"),

  get: (key: string) =>
    apiRequest<{ key: string; value: string }>(`/settings/${key}`),

  update: (key: string, value: string) =>
    apiRequest<{ key: string; value: string }>(`/settings/${key}`, "PUT", {
      value,
    }),
};
