#!/bin/bash

# Advanced Error 126 Diagnostic Toolkit
deep_diagnostic() {
    local target_file="$1"
    
    echo "🔍 Deep Diagnostic for: $target_file"
    
    # System Information
    echo "📋 System Details:"
    uname -a
    
    # Architecture Check
    echo "🖥️ Architecture:"
    arch
    file "$target_file"
    
    # Dependency Tracing
    echo "🔗 Library Dependencies:"
    ldd "$target_file" || echo "Cannot trace dependencies"
}

# Execute diagnostic
deep_diagnostic "./src/frontend/node_modules/.bin/vite" 