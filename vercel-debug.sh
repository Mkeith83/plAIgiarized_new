#!/bin/bash

DEBUG_LOG="build-debug.log"

{
    echo "��� Build Path Analysis"
    echo "====================="
    
    echo "1. Current Directory:"
    pwd
    
    echo "2. Directory Structure:"
    ls -la
    
    echo "3. Checking Critical Paths:"
    echo "- src/frontend exists?"
    [ -d "src/frontend" ] && echo "✅ Yes" || echo "❌ No"
    
    echo "- package.json exists?"
    [ -f "package.json" ] && echo "✅ Yes" || echo "❌ No"
    
    echo "- vite binary exists?"
    [ -f "src/frontend/node_modules/.bin/vite" ] && echo "✅ Yes" || echo "❌ No"
    
    echo "4. Package.json Content:"
    cat package.json
    
} 2>&1 | tee "$DEBUG_LOG"
