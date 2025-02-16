#!/bin/bash

echo "� Starting Comprehensive Build Diagnostic..."

# System Information
echo -e "\n� System Information:"
uname -a
pwd
whoami

# Runtime Versions
echo -e "\n� Runtime Versions:"
node --version
npm --version
which npm

# Project Structure
echo -e "\n� Project Structure:"
ls -R src/
cat package.json

# Dependencies Check
echo -e "\n� Dependencies Status:"
npm ls @chakra-ui/react react-router-dom vite

# Build Attempt
echo -e "\n�️ Build Attempt:"
npm run build --verbose

