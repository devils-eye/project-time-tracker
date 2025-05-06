import express from "express";
import { getDatabase } from "../database";

const router = express.Router();

// Get all settings
router.get("/", (req, res) => {
  try {
    const db = getDatabase();
    const settings = db.prepare("SELECT * FROM settings").all();

    // Convert to key-value object
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    res.json(settingsObj);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// Get a specific setting
router.get("/:key", (req, res) => {
  try {
    const { key } = req.params;
    const db = getDatabase();

    const setting = db.prepare("SELECT * FROM settings WHERE key = ?").get(key);

    if (!setting) {
      return res.status(404).json({ error: "Setting not found" });
    }

    res.json({ key: setting.key, value: setting.value });
  } catch (error) {
    console.error(`Error fetching setting ${req.params.key}:`, error);
    res.status(500).json({ error: "Failed to fetch setting" });
  }
});

// Update a setting
router.put("/:key", (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({ error: "Missing value field" });
    }

    const db = getDatabase();
    const now = new Date().toISOString();

    // Check if setting exists
    const existingSetting = db
      .prepare("SELECT * FROM settings WHERE key = ?")
      .get(key);

    if (existingSetting) {
      // Update existing setting
      db.prepare(
        "UPDATE settings SET value = ?, updatedAt = ? WHERE key = ?"
      ).run(value, now, key);
    } else {
      // Insert new setting
      db.prepare(
        "INSERT INTO settings (key, value, updatedAt) VALUES (?, ?, ?)"
      ).run(key, value, now);
    }

    res.json({ key, value, message: "Setting updated successfully" });
  } catch (error) {
    console.error(`Error updating setting ${req.params.key}:`, error);
    res.status(500).json({ error: "Failed to update setting" });
  }
});

export const settingsRouter = router;
