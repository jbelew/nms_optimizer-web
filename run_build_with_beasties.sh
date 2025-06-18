#!/bin/bash
# Task: Run the production build with vite-plugin-beasties.

echo "Attempting to run the production build with vite-plugin-beasties..."
npm run build

if [ $? -eq 0 ]; then
  echo "Build completed successfully with vite-plugin-beasties."
  echo "Please pull the changes, run 'npm install' and 'npm run build' locally."
  echo "Then, manually inspect dist/index.html to verify if critical CSS is now correctly inlined."
  echo "Also, test the site's appearance and performance."
  exit 0
else
  echo "Build failed with vite-plugin-beasties. Please check the logs."
  exit 1 # Exit with an error code to indicate build failure
fi
