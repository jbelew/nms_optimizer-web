#!/bin/bash

# Task: Install vite-plugin-beasties and add it to vite.config.ts

echo "Attempting to install vite-plugin-beasties..."

# --- Modify package.json and install ---
npm install -D vite-plugin-beasties --legacy-peer-deps
if [ $? -ne 0 ]; then
  echo "Failed to install vite-plugin-beasties. Exiting."
  exit 1
fi
echo "vite-plugin-beasties installed and added to package.json."

echo "Attempting to add vite-plugin-beasties to vite.config.ts..."

# --- Modify vite.config.ts ---
config_content=$(cat vite.config.ts)

# Check if 'vite-plugin-beasties' is already imported
if grep -q "from ['\"]vite-plugin-beasties['\"]" vite.config.ts; then
  echo "vite-plugin-beasties seems to be already imported. Skipping import addition."
else
  # Add the import statement. Assuming named import { beasties }
  import_statement="import { beasties } from \"vite-plugin-beasties\";"
  visualizer_import_pattern='from "rollup-plugin-visualizer";'
  define_config_pattern='import { defineConfig, type UserConfigExport } from "vitest/config";' # Note: vitest/config, not vite

  if [[ $config_content == *"$visualizer_import_pattern"* ]]; then
    config_content="${config_content/$visualizer_import_pattern/$visualizer_import_pattern\n$import_statement}"
  elif [[ $config_content == *"$define_config_pattern"* ]]; then
    # Fallback: add it after defineConfig import
    config_content="${config_content/$define_config_pattern/$define_config_pattern\n$import_statement}"
  else
    # Absolute fallback: add at the beginning of the file (less ideal)
    config_content="$import_statement\n$config_content"
  fi
fi

# Construct the beasties plugin configuration string
# Using the structure beasties({ options: { preload: 'swap' } })
# Ensure proper indentation for insertion (e.g., 2 tabs or 3 tabs depending on location)
# The visualizer plugin is typically indented by 2 tabs.
beasties_plugin_config="		beasties({
      options: {
        preload: 'swap',
        // inlineFonts: true, // Example: default false
        // preloadFonts: true, // Example: default true
      }
		})," # Trailing comma is important

# Add the beasties plugin to the plugins array
# Placing it before the visualizer plugin.
visualizer_plugin_locator="visualizer({ open: false, gzipSize: true, brotliSize: true }) as never,"
# The actual visualizer line in the current vite.config.ts might be part of the merged comment:
# "// Bundle visualizervisualizer({ open: false, gzipSize: true, brotliSize: true }) as never,"
# So, we need a more robust locator for the visualizer plugin line.
# Let's use a grep to find the line that contains the visualizer call, ignoring comments for location.
# Then use sed to insert before that line. This is more complex than simple string replacement.

# Simpler approach: Rely on the known structure and the visualizer_plugin_locator.
# If that fails, the fallback to `plugins: [` is okay.

if [[ $config_content == *"$visualizer_plugin_locator"* ]]; then
  config_content="${config_content/$visualizer_plugin_locator/$beasties_plugin_config\n\t\t$visualizer_plugin_locator}"
elif [[ $config_content == *"// Bundle visualizervisualizer({ open: false, gzipSize: true, brotliSize: true }) as never,"* ]]; then
  # Handle the case where comment is merged
  merged_visualizer_locator="// Bundle visualizervisualizer({ open: false, gzipSize: true, brotliSize: true }) as never,"
  config_content="${config_content/$merged_visualizer_locator/$beasties_plugin_config\n\t\t$merged_visualizer_locator}"
elif [[ $config_content == *"plugins: ["* ]]; then
  # Fallback: Insert it carefully after "plugins: [" ensuring proper comma handling for the next item.
  # This requires checking if plugins array is empty or not.
  # For simplicity, assume if plugins: [ exists, we can add it as the first item if visualizer isn't found.
  # This might require manual comma adjustment if other plugins are present without visualizer.
  config_content="${config_content/plugins: [/plugins: [\n$beasties_plugin_config}" # Add as first, assumes other plugins handle their leading comma.
else
  echo "Could not find a suitable place to add the beasties plugin configuration. Manual edit required."
  exit 1
fi

# Write the modified content back to vite.config.ts
# Using echo -e to handle \n in variables if they were used (though here literal newlines are primary)
echo -e "$config_content" > vite.config.ts

echo "vite.config.ts modified to include vite-plugin-beasties."
echo "Installation and configuration of vite-plugin-beasties complete."
