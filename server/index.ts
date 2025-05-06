import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { setupDatabase } from "./database";
import { projectsRouter } from "./routes/projects";
import { sessionsRouter } from "./routes/sessions";
import { settingsRouter } from "./routes/settings";

// Initialize the database
const db = setupDatabase();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API routes
app.use("/api/projects", projectsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/settings", settingsRouter);

// Serve static files from the React app in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../dist")));

  // Handle React routing, return all requests to React app
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
