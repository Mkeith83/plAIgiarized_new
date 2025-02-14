#!/bin/bash

echo "🔍 Vercel Build Environment Diagnostic"

# Create log file
exec 2> >(tee -a error_log.txt)

echo "📋 Starting diagnostic at $(date)"

# Trace system calls if strace is available
if command -v strace &> /dev/null; then
    echo "🔬 Tracing system calls:"
    strace -e trace=exec ./src/frontend/node_modules/.bin/vite --version
else
    echo "⚠️ strace not available"
fi

# Print working directory and contents
echo "📂 Current Directory:"
pwd
ls -la

# Check Vite binary location and permissions
echo "🔎 Vite binary details:"
find . -name vite -type f -exec ls -l {} \;

# Log all output to file
{
    echo "⚙️ Node.js Environment:"
    node --version
    npm --version
    
    echo "🔐 Binary Permissions:"
    ls -la ./src/frontend/node_modules/.bin/
} 2>&1 | tee -a error_log.txt

# Try to execute Vite directly
echo "🚀 Attempting Vite execution:"
./src/frontend/node_modules/.bin/vite --version || echo "Failed to execute Vite" 