import express from "express";
import { getDatabase } from "../database";

const router = express.Router();

// Get all projects
router.get("/", (req, res) => {
  try {
    const db = getDatabase();
    const projects = db
      .prepare("SELECT * FROM projects ORDER BY updatedAt DESC")
      .all();
    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// Get a single project by ID
router.get("/:id", (req, res) => {
  try {
    const db = getDatabase();
    const project = db
      .prepare("SELECT * FROM projects WHERE id = ?")
      .get(req.params.id);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    console.error(`Error fetching project ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// Create a new project
router.post("/", (req, res) => {
  try {
    const {
      id,
      name,
      description,
      color,
      totalTimeSpent,
      goalHours,
      createdAt,
      updatedAt,
    } = req.body;

    if (!id || !name || !color || !createdAt || !updatedAt) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const db = getDatabase();

    const result = db
      .prepare(
        `
      INSERT INTO projects (id, name, description, color, totalTimeSpent, goalHours, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
      )
      .run(
        id,
        name,
        description,
        color,
        totalTimeSpent || 0,
        goalHours,
        createdAt,
        updatedAt
      );

    res.status(201).json({ id, message: "Project created successfully" });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// Update a project
router.put("/:id", (req, res) => {
  try {
    const { name, description, color, totalTimeSpent, goalHours, updatedAt } =
      req.body;
    const { id } = req.params;

    if (!name || !color || !updatedAt) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const db = getDatabase();

    // Check if project exists
    const existingProject = db
      .prepare("SELECT * FROM projects WHERE id = ?")
      .get(id);
    if (!existingProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    const result = db
      .prepare(
        `
      UPDATE projects
      SET name = ?, description = ?, color = ?, totalTimeSpent = ?, goalHours = ?, updatedAt = ?
      WHERE id = ?
    `
      )
      .run(name, description, color, totalTimeSpent, goalHours, updatedAt, id);

    res.json({ id, message: "Project updated successfully" });
  } catch (error) {
    console.error(`Error updating project ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to update project" });
  }
});

// Delete a project
router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Check if project exists
    const existingProject = db
      .prepare("SELECT * FROM projects WHERE id = ?")
      .get(id);
    if (!existingProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Delete the project (sessions will be deleted via CASCADE)
    const result = db.prepare("DELETE FROM projects WHERE id = ?").run(id);

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error(`Error deleting project ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

export const projectsRouter = router;
