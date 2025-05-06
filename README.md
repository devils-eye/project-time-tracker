# Project Time Tracker

A time tracking application with project management, countdown and stopwatch timers, and statistics dashboard.

## Features

- Track time using countdown or stopwatch timers
- Manage projects with customizable colors
- Set optional hour goals for projects
- View statistics and reports with project-specific color coding
- Light and dark mode with customizable color palettes
- Data persistence across browsers and devices using SQLite
- Cross-browser synchronization of timer states

## Setup and Running

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)

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

You can also use the simple server mode:

```
./start.sh --simple
```

### Development

- Client only: `npm run dev:client`
- Server only: `npm run dev:server`
- Both: `npm run dev` or `npm run dev:all`

### Building for Production

```
npm run build
```

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: SQLite (via better-sqlite3)
- **Charts**: Chart.js with react-chartjs-2
- **Routing**: React Router

## Data Storage

The application uses:

- SQLite database (stored in the `data` directory) for persistent storage
- localStorage for active sessions and theme preferences

## Troubleshooting

### Server Connection Issues

If you see a "Server Connection Error" message:

1. Make sure the server is running (`npm run dev:server`)
2. Check if port 3001 is available
3. Restart the application using `./start.sh`

### Data Not Syncing Between Browsers

For data to sync between browsers, the server must be running. If you're using the application without the server, data will be saved locally but won't sync across browsers or devices.

### Missing Data Directory

If you encounter database errors, make sure the `data` directory exists in the project root. You can create it manually or run `./start.sh` which will create it automatically.
