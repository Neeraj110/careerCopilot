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

# 2. Install dependencies — ensure Puppeteer downloads Chrome
export PUPPETEER_SKIP_DOWNLOAD=false
npm install

# 3. Explicitly download Chrome if it wasn't downloaded during install
echo "...Ensuring Chrome is downloaded"
npx puppeteer browsers install chrome 2>/dev/null || npx @puppeteer/browsers install chrome@stable --path "$XDG_CACHE_HOME/puppeteer" 2>/dev/null || true

# 4. Generate Prisma client and build
npx prisma generate
npm run build

# 5. Save Chrome cache for future builds
echo "...Saving Puppeteer Cache for future builds"
mkdir -p "$PUPPETEER_CACHE_DIR"
if [ -d "$XDG_CACHE_HOME/puppeteer" ] && [ "$(ls -A $XDG_CACHE_HOME/puppeteer 2>/dev/null)" ]; then
  cp -R "$XDG_CACHE_HOME/puppeteer"/* "$PUPPETEER_CACHE_DIR/" 2>/dev/null || true
  echo "...Cache saved successfully"
else
  echo "...Warning: No puppeteer cache found to save"
  # Also check home cache
  if [ -d "$HOME/.cache/puppeteer" ] && [ "$(ls -A $HOME/.cache/puppeteer 2>/dev/null)" ]; then
    cp -R "$HOME/.cache/puppeteer"/* "$PUPPETEER_CACHE_DIR/" 2>/dev/null || true
    echo "...Saved from home cache"
  fi
fi

echo "Build complete!"
