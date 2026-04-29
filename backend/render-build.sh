#!/usr/bin/env bash
# exit on error
set -o errexit

# Define cache paths
export PUPPETEER_CACHE_DIR=/opt/render/project/puppeteer
export XDG_CACHE_HOME=/opt/render/.cache

echo "Starting build process..."

# 1. Restore cached Chrome if available
if [ -d "$PUPPETEER_CACHE_DIR/chrome" ] || [ -d "$PUPPETEER_CACHE_DIR/chromium" ]; then
  echo "...Restoring Puppeteer Cache from previous builds"
  mkdir -p "$XDG_CACHE_HOME/puppeteer/"
  cp -R "$PUPPETEER_CACHE_DIR"/* "$XDG_CACHE_HOME/puppeteer/" 2>/dev/null || true
else
  echo "...No existing Puppeteer Cache found. Chrome will be downloaded during install."
fi

# 2. Install dependencies
export PUPPETEER_SKIP_DOWNLOAD=false
npm install

# 3. Explicitly download Chrome if missing
echo "...Ensuring Chrome is downloaded"
npx puppeteer browsers install chrome 2>/dev/null || true

# 4. Find Chrome binary and save path to file for runtime use
echo "...Locating Chrome binary..."

CHROME_PATH=""

# Search in XDG_CACHE_HOME/puppeteer
if [ -d "$XDG_CACHE_HOME/puppeteer" ]; then
  CHROME_PATH=$(find "$XDG_CACHE_HOME/puppeteer" -name "chrome" -type f 2>/dev/null | head -1)
fi

# Search in HOME/.cache/puppeteer
if [ -z "$CHROME_PATH" ] && [ -d "$HOME/.cache/puppeteer" ]; then
  CHROME_PATH=$(find "$HOME/.cache/puppeteer" -name "chrome" -type f 2>/dev/null | head -1)
fi

# Fallback to system chrome
if [ -z "$CHROME_PATH" ] && [ -f "/usr/bin/google-chrome-stable" ]; then
  CHROME_PATH="/usr/bin/google-chrome-stable"
fi

if [ -z "$CHROME_PATH" ] && [ -f "/usr/bin/google-chrome" ]; then
  CHROME_PATH="/usr/bin/google-chrome"
fi

# Save path to file so runtime can read it
if [ -n "$CHROME_PATH" ]; then
  echo "$CHROME_PATH" > /opt/render/project/chrome-path.txt
  echo "...Chrome found at: $CHROME_PATH"
  echo "...Chrome path saved to /opt/render/project/chrome-path.txt"
else
  echo "...WARNING: Chrome binary not found!"
fi

# 5. Generate Prisma client and build TypeScript
npx prisma generate
npm run build

# 6. Save Chrome cache for future builds
echo "...Saving Puppeteer Cache for future builds"
mkdir -p "$PUPPETEER_CACHE_DIR"

if [ -d "$XDG_CACHE_HOME/puppeteer" ] && [ "$(ls -A $XDG_CACHE_HOME/puppeteer 2>/dev/null)" ]; then
  cp -R "$XDG_CACHE_HOME/puppeteer"/* "$PUPPETEER_CACHE_DIR/" 2>/dev/null || true
  echo "...Cache saved from XDG cache"
elif [ -d "$HOME/.cache/puppeteer" ] && [ "$(ls -A $HOME/.cache/puppeteer 2>/dev/null)" ]; then
  cp -R "$HOME/.cache/puppeteer"/* "$PUPPETEER_CACHE_DIR/" 2>/dev/null || true
  echo "...Cache saved from home cache"
else
  echo "...WARNING: No puppeteer cache found to save"
fi

# Also copy the chrome-path.txt to dist so it's accessible after build
if [ -f "/opt/render/project/chrome-path.txt" ]; then
  cp /opt/render/project/chrome-path.txt ./dist/chrome-path.txt 2>/dev/null || true
fi

echo "Build complete!"