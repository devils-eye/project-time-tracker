# Project Time Tracker

A time tracking application with project management, countdown and stopwatch timers, and statistics dashboard.

## Features

- Track time using countdown or stopwatch timers
- Manage projects with customizable colors
- Set optional hour goals for projects
- View statistics and reports
- Light and dark mode with customizable color palettes
- Data persistence across browsers and devices

## Setup and Running

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

### Running the Application

To run both the client and server:

```
./start.sh
```

This will start:

- The React client on http://localhost:5173
- The API server on http://localhost:3001

### Development

- Client only: `npm run dev`
- Server only: `npm run server`
- Both: `npm run dev:all`

### Building for Production

```
npm run build
```

## Data Storage

The application uses:

- SQLite database (stored in the `data` directory) for persistent storage
- localStorage for active sessions and theme preferences

## Troubleshooting

### Server Connection Issues

If you see a "Server Connection Error" message:

1. Make sure the server is running (`npm run server`)
2. Check if port 3001 is available
3. Restart the application using `./start.sh`

### Data Not Syncing Between Browsers

For data to sync between browsers, the server must be running. If you're using the application without the server, data will be saved locally but won't sync across browsers or devices.
