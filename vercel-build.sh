#!/bin/bash
set -e

echo "Setting permissions..."
chmod +x ./node_modules/.bin/*

echo "Installing dependencies..."
npm install

echo "Building project..."
npm run build 