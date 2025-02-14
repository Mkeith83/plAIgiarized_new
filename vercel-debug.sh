#!/bin/bash

# Comprehensive Build & Permission Diagnostic Script
DEBUG_LOG="build-debug.log"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Redirect all output to log file and console
{
    echo -e "${GREEN}🔍 Build Diagnostic Started at $(date)${NC}"
    echo "----------------------------------------"

    # Environment Check
    echo -e "\n${YELLOW}📋 Environment Check:${NC}"
    echo "User: $(whoami)"
    echo "Directory: $(pwd)"
    echo "Node: $(node --version)"
    echo "NPM: $(npm --version)"

    # Vite Binary Check
    echo -e "\n${YELLOW}🔒 Vite Binary Check:${NC}"
    VITE_PATH="./node_modules/.bin/vite"
    if [ -f "$VITE_PATH" ]; then
        echo "Vite binary exists"
        ls -l "$VITE_PATH"
        file "$VITE_PATH"
        
        if [ ! -x "$VITE_PATH" ]; then
            echo -e "${RED}Adding execute permissions...${NC}"
            chmod +x "$VITE_PATH"
        fi
    else
        echo -e "${RED}Vite binary not found!${NC}"
    fi

    # Project Structure
    echo -e "\n${YELLOW}📁 Project Structure:${NC}"
    ls -R src/

    # Try direct Node execution
    echo -e "\n${YELLOW}🚀 Attempting direct Node execution:${NC}"
    node ./node_modules/vite/bin/vite.js --version || echo -e "${RED}Failed to run Vite directly${NC}"

    # Attempt build
    echo -e "\n${YELLOW}🛠️ Attempting build:${NC}"
    npm run build --verbose

} 2>&1 | tee "$DEBUG_LOG"

echo -e "\n${GREEN}Debug log saved to $DEBUG_LOG${NC}" 