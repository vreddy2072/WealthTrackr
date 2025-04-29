#!/bin/bash

echo "Removing node_modules folder..."
rm -rf node_modules

echo "Removing package-lock.json..."
rm -f package-lock.json

echo "Installing dependencies..."
npm install --legacy-peer-deps

echo "Installation complete. Starting development server..."
npm run dev
