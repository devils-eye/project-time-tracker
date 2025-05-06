const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// Ensure the data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database file path
const dbPath = path.join(dataDir, 'timetracker.db');

// Initialize the database
function setupDatabase() {
  const db = new Database(dbPath);
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  
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
  const settingsStmt = db.prepare('INSERT OR IGNORE INTO settings (key, value, updatedAt) VALUES (?, ?, ?)');
  const now = new Date().toISOString();
  
  settingsStmt.run('themeMode', 'light', now);
  settingsStmt.run('colorPalette', 'blue', now);
  
  console.log(`Database initialized at ${dbPath}`);
  
  return db;
}

// Initialize the database
const db = setupDatabase();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Helper function to get database connection
function getDatabase() {
  return db;
}

// API Routes

// Projects
app.get('/api/projects', (req, res) => {
  try {
    const projects = db.prepare('SELECT * FROM projects ORDER BY updatedAt DESC').all();
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.get('/api/projects/:id', (req, res) => {
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    console.error(`Error fetching project ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

app.post('/api/projects', (req, res) => {
  try {
    const { id, name, description, color, totalTimeSpent, goalHours, createdAt, updatedAt } = req.body;
    
    if (!id || !name || !color || !createdAt || !updatedAt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const result = db.prepare(`
      INSERT INTO projects (id, name, description, color, totalTimeSpent, goalHours, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, description, color, totalTimeSpent || 0, goalHours, createdAt, updatedAt);
    
    res.status(201).json({ id, message: 'Project created successfully' });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

app.put('/api/projects/:id', (req, res) => {
  try {
    const { name, description, color, totalTimeSpent, goalHours, updatedAt } = req.body;
    const { id } = req.params;
    
    if (!name || !color || !updatedAt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if project exists
    const existingProject = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const result = db.prepare(`
      UPDATE projects
      SET name = ?, description = ?, color = ?, totalTimeSpent = ?, goalHours = ?, updatedAt = ?
      WHERE id = ?
    `).run(name, description, color, totalTimeSpent, goalHours, updatedAt, id);
    
    res.json({ id, message: 'Project updated successfully' });
  } catch (error) {
    console.error(`Error updating project ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

app.delete('/api/projects/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if project exists
    const existingProject = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Delete the project (sessions will be deleted via CASCADE)
    const result = db.prepare('DELETE FROM projects WHERE id = ?').run(id);
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error(`Error deleting project ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Sessions
app.get('/api/sessions', (req, res) => {
  try {
    const sessions = db.prepare('SELECT * FROM sessions ORDER BY startTime DESC').all();
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

app.get('/api/sessions/project/:projectId', (req, res) => {
  try {
    const { projectId } = req.params;
    
    const sessions = db.prepare('SELECT * FROM sessions WHERE projectId = ? ORDER BY startTime DESC')
      .all(projectId);
    
    res.json(sessions);
  } catch (error) {
    console.error(`Error fetching sessions for project ${req.params.projectId}:`, error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

app.post('/api/sessions', (req, res) => {
  try {
    const { id, projectId, startTime, endTime, duration, type, initialDuration } = req.body;
    
    if (!id || !projectId || !startTime || !duration || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if project exists
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    if (!project) {
      return res.status(400).json({ error: 'Project not found' });
    }
    
    // Insert the session
    const result = db.prepare(`
      INSERT INTO sessions (id, projectId, startTime, endTime, duration, type, initialDuration)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, projectId, startTime, endTime, duration, type, initialDuration);
    
    // Update the project's total time spent
    db.prepare(`
      UPDATE projects
      SET totalTimeSpent = totalTimeSpent + ?,
          updatedAt = ?
      WHERE id = ?
    `).run(duration, new Date().toISOString(), projectId);
    
    res.status(201).json({ id, message: 'Session created successfully' });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Settings
app.get('/api/settings', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM settings').all();
    
    // Convert to key-value object
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    
    res.json(settingsObj);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.get('/api/settings/:key', (req, res) => {
  try {
    const { key } = req.params;
    
    const setting = db.prepare('SELECT * FROM settings WHERE key = ?').get(key);
    
    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    res.json({ key: setting.key, value: setting.value });
  } catch (error) {
    console.error(`Error fetching setting ${req.params.key}:`, error);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
});

app.put('/api/settings/:key', (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({ error: 'Missing value field' });
    }
    
    const now = new Date().toISOString();
    
    // Check if setting exists
    const existingSetting = db.prepare('SELECT * FROM settings WHERE key = ?').get(key);
    
    if (existingSetting) {
      // Update existing setting
      db.prepare('UPDATE settings SET value = ?, updatedAt = ? WHERE key = ?')
        .run(value, now, key);
    } else {
      // Insert new setting
      db.prepare('INSERT INTO settings (key, value, updatedAt) VALUES (?, ?, ?)')
        .run(key, value, now);
    }
    
    res.json({ key, value, message: 'Setting updated successfully' });
  } catch (error) {
    console.error(`Error updating setting ${req.params.key}:`, error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
