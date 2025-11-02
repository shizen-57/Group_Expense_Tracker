#!/bin/bash

# Script to remove all dark: class variants from TypeScript/TSX files
# This converts the app to light-theme only

echo "Removing all dark: class variants from components..."

# Find all .tsx files and remove dark: classes
find components -name "*.tsx" -type f -exec sed -i.bak 's/ dark:[^ "]*//g' {} \;
find components -name "*.tsx" -type f -exec sed -i.bak 's/ dark:[^ }]*//g' {} \;

echo "Cleaning up backup files..."
find components -name "*.bak" -type f -delete

echo "Done! All dark mode classes have been removed."
echo "The app now uses a clean white/light theme only."
