#!/bin/bash

# Task: Remove rollup-plugin-critical from vite.config.ts and package.json

echo "Attempting to remove rollup-plugin-critical from vite.config.ts..."

# --- Modify vite.config.ts ---
# Remove import (more robust to leading/trailing whitespace around the line)
perl -i -p0e 's@^\s*import critical from "rollup-plugin-critical";\s*\r?\n?@@g' vite.config.ts

# Define the complex pattern string for the 'enforce: post' version
# Using a more flexible pattern with non-greedy match-all .*?
complex_block_pattern_str='\s*\{\s*// name property removed to avoid conflict.*?\}\s*as\s*never,\s*'
perl -i -p0e "s@$complex_block_pattern_str@@gms" vite.config.ts

# Define the simple pattern string for the original critical block
# Also making this one more flexible with non-greedy .*?
simple_block_pattern_str='\s*critical\(\{\s*// Adjust Puppeteer arguments if necessary, e\.g\., for running in a CI environment without a sandbox.*?\}\)\s*as\s*never,\s*'
perl -i -p0e "s@$simple_block_pattern_str@@gms" vite.config.ts


echo "vite.config.ts modification attempt complete."
echo "Please verify vite.config.ts to ensure the critical plugin is removed."

# --- Modify package.json ---
# This part seemed to work, keeping it as is from the successful run.
echo "Attempting to remove rollup-plugin-critical from package.json devDependencies..."
if grep -q '"rollup-plugin-critical"' package.json; then
  tmp_package_json=$(mktemp)

  awk '
    # Rule 1: Handle the line containing the target package
    /"rollup-plugin-critical":/ {
      if (prev_line ~ /,\s*$/) { # If the stored previous line ended with a comma
        sub(/,\s*$/, "", prev_line); # Remove the comma from prev_line
      }
      next;
    }

    # Rule 2: Main processing block for lines not skipped by "next"
    {
      if (NR > 1) {
        print prev_line;
      }
      prev_line = $0;
    }

    END {
      if (prev_line != "") {
         print prev_line;
      }
    }
  ' package.json > "$tmp_package_json" && mv "$tmp_package_json" package.json

  echo "Removed rollup-plugin-critical line from package.json."
  echo "It's recommended to run 'npm install' afterwards to update package-lock.json and node_modules."
else
  echo "rollup-plugin-critical not found in package.json devDependencies."
fi

echo "Removal of rollup-plugin-critical complete."
