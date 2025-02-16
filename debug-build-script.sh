#!/bin/bash

echo "🔍 Starting Comprehensive Build Diagnostics 🔍"

# System and Environment Information
echo "------- SYSTEM INFORMATION -------"
uname -a
echo "Current User: $(whoami)"
echo "Current Directory: $(pwd)"
ls -la

# Node and NPM Versions
echo -e "\n------- RUNTIME VERSIONS -------"
node --version
npm --version

# Project Structure Check
echo -e "\n------- PROJECT STRUCTURE -------"
echo "Frontend directory contents:"
cd src/frontend
ls -la

# Check File Permissions
echo -e "\n------- FILE PERMISSIONS -------"
echo "Vite binary permissions:"
ls -la node_modules/.bin/vite || echo "Vite binary not found!"

# Attempt Build with Different Methods
echo -e "\n------- BUILD ATTEMPTS -------"
echo "1. Using npx:"
npx vite build --debug

echo "2. Using node directly:"
node ./node_modules/vite/bin/vite.js build --debug

echo "3. Using npm script:"
npm run build --verbose

echo "🏁 Diagnostic Script Complete 🏁" 