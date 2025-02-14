#!/bin/bash
# Make the script executable
chmod +x ./node_modules/.bin/vite
chmod +x ./node_modules/.bin/next

# Install dependencies
npm install

# Build the project
npm run build 