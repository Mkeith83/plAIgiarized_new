#!/bin/bash

# Build Diagnostics Script

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to log messages
log() {
    echo -e "${GREEN}[LOG]${NC} $1"
}

# Function to log warnings
warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to log errors
error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Main diagnostic function
diagnose_build_issue() {
    log "Starting Build Diagnostics..."

    # Check current directory and project structure
    log "Current Directory: $(pwd)"
    log "Directory Contents:"
    ls -la

    # Check Node.js and npm versions
    log "Node.js Version: $(node --version)"
    log "npm Version: $(npm --version)"

    # Check Vite executable in frontend directory
    cd src/frontend || error "Frontend directory not found"
    VITE_PATH="./node_modules/.bin/vite"
    
    if [ ! -f "$VITE_PATH" ]; then
        error "Vite executable not found at $VITE_PATH"
        log "Attempting to reinstall Vite..."
        npm install vite --save-dev
    fi

    # Check file permissions
    log "Checking Vite executable permissions:"
    if [ -f "$VITE_PATH" ]; then
        ls -l "$VITE_PATH"
        file "$VITE_PATH"
        
        # Check if executable has correct permissions
        if [ ! -x "$VITE_PATH" ]; then
            warn "Vite executable lacks execute permissions"
            log "Attempting to add execute permissions..."
            chmod +x "$VITE_PATH"
        fi
    fi

    # Try running Vite directly
    log "Attempting to run Vite directly..."
    node ./node_modules/vite/bin/vite.js --version || error "Failed to run Vite"

    # Check npm cache and potential permission issues
    log "Verifying npm cache..."
    npm cache verify

    # Attempt to diagnose specific build script
    log "Attempting build with verbose logging..."
    npm run build --verbose
}

# Error handling wrapper
main() {
    set -e
    trap 'error "Build script failed at line $LINENO"' ERR

    diagnose_build_issue
}

# Execute main function
main "$@" 