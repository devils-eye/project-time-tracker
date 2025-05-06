import express from "express";
import { getDatabase } from "../database";

const router = express.Router();

// Get all active sessions
router.get("/active", (req, res) => {
  try {
    const db = getDatabase();
    const activeSessions = db
      .prepare(
        "SELECT * FROM sessions WHERE status = 'active' ORDER BY startTime DESC"
      )
      .all();
    res.json(activeSessions);
  } catch (error) {
    console.error("Error fetching active sessions:", error);
    res.status(500).json({ error: "Failed to fetch active sessions" });
  }
});

// Get all sessions
router.get("/", (req, res) => {
  try {
    const db = getDatabase();
    const sessions = db
      .prepare("SELECT * FROM sessions ORDER BY startTime DESC")
      .all();
    res.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

// Get sessions for a specific project
router.get("/project/:projectId", (req, res) => {
  try {
    const { projectId } = req.params;
    const db = getDatabase();

    const sessions = db
      .prepare(
        "SELECT * FROM sessions WHERE projectId = ? ORDER BY startTime DESC"
      )
      .all(projectId);

    res.json(sessions);
  } catch (error) {
    console.error(
      `Error fetching sessions for project ${req.params.projectId}:`,
      error
    );
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

// Get a single session by ID
router.get("/:id", (req, res) => {
  try {
    const db = getDatabase();
    const session = db
      .prepare("SELECT * FROM sessions WHERE id = ?")
      .get(req.params.id);

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json(session);
  } catch (error) {
    console.error(`Error fetching session ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

// Create a new session
router.post("/", (req, res) => {
  try {
    const {
      id,
      projectId,
      startTime,
      endTime,
      duration,
      type,
      initialDuration,
    } = req.body;

    if (!id || !projectId || !startTime || !duration || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const db = getDatabase();

    // Check if project exists
    const project = db
      .prepare("SELECT * FROM projects WHERE id = ?")
      .get(projectId);
    if (!project) {
      return res.status(400).json({ error: "Project not found" });
    }

    // Insert the session
    const result = db
      .prepare(
        `
      INSERT INTO sessions (id, projectId, startTime, endTime, duration, type, initialDuration)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
      )
      .run(id, projectId, startTime, endTime, duration, type, initialDuration);

    // Update the project's total time spent
    db.prepare(
      `
      UPDATE projects
      SET totalTimeSpent = totalTimeSpent + ?,
          updatedAt = ?
      WHERE id = ?
    `
    ).run(duration, new Date().toISOString(), projectId);

    res.status(201).json({ id, message: "Session created successfully" });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: "Failed to create session" });
  }
});

// Update a session
router.put("/:id", (req, res) => {
  try {
    const { projectId, startTime, endTime, duration, type, initialDuration } =
      req.body;
    const { id } = req.params;

    if (!projectId || !startTime || !duration || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const db = getDatabase();

    // Check if session exists
    const existingSession = db
      .prepare("SELECT * FROM sessions WHERE id = ?")
      .get(id);
    if (!existingSession) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Calculate duration difference for updating project total time
    const durationDiff = duration - existingSession.duration;

    // Update the session
    const result = db
      .prepare(
        `
      UPDATE sessions
      SET projectId = ?, startTime = ?, endTime = ?, duration = ?, type = ?, initialDuration = ?
      WHERE id = ?
    `
      )
      .run(projectId, startTime, endTime, duration, type, initialDuration, id);

    // Update the project's total time spent if duration changed
    if (durationDiff !== 0) {
      db.prepare(
        `
        UPDATE projects
        SET totalTimeSpent = totalTimeSpent + ?,
            updatedAt = ?
        WHERE id = ?
      `
      ).run(durationDiff, new Date().toISOString(), projectId);
    }

    res.json({ id, message: "Session updated successfully" });
  } catch (error) {
    console.error(`Error updating session ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to update session" });
  }
});

// Delete a session
router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Get session to update project total time
    const session = db.prepare("SELECT * FROM sessions WHERE id = ?").get(id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Delete the session
    const result = db.prepare("DELETE FROM sessions WHERE id = ?").run(id);

    // Update the project's total time spent
    db.prepare(
      `
      UPDATE projects
      SET totalTimeSpent = totalTimeSpent - ?,
          updatedAt = ?
      WHERE id = ?
    `
    ).run(session.duration, new Date().toISOString(), session.projectId);

    res.json({ message: "Session deleted successfully" });
  } catch (error) {
    console.error(`Error deleting session ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to delete session" });
  }
});

// Create or update an active session
router.post("/active", (req, res) => {
  try {
    const {
      id,
      projectId,
      startTime,
      duration,
      type,
      initialDuration,
      elapsedTime,
    } = req.body;

    if (!id || !projectId || !startTime || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const db = getDatabase();

    // Check if project exists
    const project = db
      .prepare("SELECT * FROM projects WHERE id = ?")
      .get(projectId);
    if (!project) {
      return res.status(400).json({ error: "Project not found" });
    }

    const now = new Date().toISOString();

    // Check if session already exists
    const existingSession = db
      .prepare("SELECT * FROM sessions WHERE id = ?")
      .get(id);

    if (existingSession) {
      // Update the existing session
      db.prepare(
        `
        UPDATE sessions
        SET duration = ?, lastUpdated = ?, status = 'active'
        WHERE id = ?
      `
      ).run(elapsedTime || duration || 0, now, id);
    } else {
      // Insert a new active session
      db.prepare(
        `
        INSERT INTO sessions (id, projectId, startTime, endTime, duration, type, initialDuration, status, lastUpdated)
        VALUES (?, ?, ?, NULL, ?, ?, ?, 'active', ?)
      `
      ).run(
        id,
        projectId,
        startTime,
        elapsedTime || duration || 0,
        type,
        initialDuration,
        now
      );
    }

    res.status(200).json({ id, message: "Active session saved successfully" });
  } catch (error) {
    console.error("Error saving active session:", error);
    res.status(500).json({ error: "Failed to save active session" });
  }
});

// Complete an active session
router.post("/active/:id/complete", (req, res) => {
  try {
    const { id } = req.params;
    const { endTime, duration } = req.body;

    if (!endTime || duration === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const db = getDatabase();

    // Check if session exists
    const session = db.prepare("SELECT * FROM sessions WHERE id = ?").get(id);

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Update the session to completed
    db.prepare(
      `
      UPDATE sessions
      SET endTime = ?, duration = ?, status = 'completed', lastUpdated = ?
      WHERE id = ?
    `
    ).run(endTime, duration, new Date().toISOString(), id);

    // Update the project's total time spent
    db.prepare(
      `
      UPDATE projects
      SET totalTimeSpent = totalTimeSpent + ?,
          updatedAt = ?
      WHERE id = ?
    `
    ).run(duration, new Date().toISOString(), session.projectId);

    res.json({ id, message: "Session completed successfully" });
  } catch (error) {
    console.error(`Error completing session ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to complete session" });
  }
});

export const sessionsRouter = router;
