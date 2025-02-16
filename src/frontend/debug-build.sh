#!/bin/bash

echo "í´ Starting Comprehensive Build Diagnostic..."

# System Information
echo -e "\ní³‹ System Information:"
uname -a
pwd
whoami

# Runtime Versions
echo -e "\ní´§ Runtime Versions:"
node --version
npm --version
which npm

# Project Structure
echo -e "\ní³ Project Structure:"
ls -R src/
cat package.json

# Dependencies Check
echo -e "\ní³¦ Dependencies Status:"
npm ls @chakra-ui/react react-router-dom vite

# Build Attempt
echo -e "\ní¿—ï¸ Build Attempt:"
npm run build --verbose

