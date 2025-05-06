import Database from "better-sqlite3";
import * as path from "path";
import * as fs from "fs";

// Ensure the data directory exists
const dataDir = path.join(__dirname, "../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database file path
const dbPath = path.join(dataDir, "timetracker.db");

// Database version - increment when schema changes
const DB_VERSION = 2;

// Initialize the database
export function setupDatabase() {
  const db = new Database(dbPath);

  // Check if we need to update the schema
  const userVersion = db.pragma("user_version", { simple: true });

  if (userVersion < DB_VERSION) {
    console.log(
      `Upgrading database from version ${userVersion} to ${DB_VERSION}`
    );
  }

  // Enable foreign keys
  db.pragma("foreign_keys = ON");

  // Create projects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT NOT NULL,
      totalTimeSpent INTEGER NOT NULL DEFAULT 0,
      goalHours REAL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  // Create sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      projectId TEXT NOT NULL,
      startTime TEXT NOT NULL,
      endTime TEXT,
      duration INTEGER NOT NULL,
      type TEXT NOT NULL,
      initialDuration INTEGER,
      status TEXT DEFAULT 'completed' CHECK(status IN ('active', 'completed')),
      lastUpdated TEXT,
      FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
    )
  `);

  // Create settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  // Insert default settings if they don't exist
  const settingsStmt = db.prepare(
    "INSERT OR IGNORE INTO settings (key, value, updatedAt) VALUES (?, ?, ?)"
  );
  const now = new Date().toISOString();

  settingsStmt.run("themeMode", "light", now);
  settingsStmt.run("colorPalette", "blue", now);

  // Set the database version
  db.pragma(`user_version = ${DB_VERSION}`);

  console.log(`Database initialized at ${dbPath} (version ${DB_VERSION})`);

  return db;
}

// Get the database instance
export function getDatabase() {
  return new Database(dbPath);
}
