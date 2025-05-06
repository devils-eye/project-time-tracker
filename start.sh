#!/bin/bash

# Create data directory if it doesn't exist
mkdir -p data

# Check if we should use the simple server
if [ "$1" == "--simple" ]; then
  echo "Starting with simple server..."
  # Start the client
  npm run dev &
  CLIENT_PID=$!

  # Start the simple server
  node server/simple-server.js &
  SERVER_PID=$!

  # Handle termination
  trap "kill $CLIENT_PID $SERVER_PID; exit" INT TERM
  wait
else
  # Start the development server with TypeScript
  echo "Starting with TypeScript server..."
  npm run dev:all
fi
