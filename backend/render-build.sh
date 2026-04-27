#!/usr/bin/env bash
# exit on error
set -o errexit

# Define the cache paths explicitly so you don't have to set them in the dashboard!
export PUPPETEER_CACHE_DIR=/opt/render/project/puppeteer
export XDG_CACHE_HOME=/opt/render/.cache

echo "Starting build process..."

# 1. If we have a cached version of Chrome, restore it BEFORE npm install
if [ -d "$PUPPETEER_CACHE_DIR" ]; then 
  echo "...Restoring Puppeteer Cache from previous builds" 
  mkdir -p "$XDG_CACHE_HOME/puppeteer/"
  cp -R "$PUPPETEER_CACHE_DIR"/* "$XDG_CACHE_HOME/puppeteer/" || true
else 
  echo "...No existing Puppeteer Cache found. Chrome will be downloaded now." 
fi

# 2. Install dependencies (Puppeteer uses the restored cache to skip downloading if it exists)
npm install
npx prisma generate
npm run build

# 3. If we didn't have a cache before, save the newly downloaded Chrome for next time!
if [ ! -d "$PUPPETEER_CACHE_DIR" ]; then 
  echo "...Saving new Puppeteer Cache for future builds" 
  mkdir -p "$PUPPETEER_CACHE_DIR"
  cp -R "$XDG_CACHE_HOME/puppeteer"/* "$PUPPETEER_CACHE_DIR" || true
fi

echo "Build complete!"
