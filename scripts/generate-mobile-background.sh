#!/bin/bash
# Script to generate blurred and tinted mobile background for performance optimization
# This pre-bakes the blur and tint effects that would otherwise be applied via CSS backdrop-filter

set -e

# Configuration
INPUT_IMAGE="public/assets/img/background@mobile.webp"
OUTPUT_IMAGE="public/assets/img/background@mobile-blurred.webp"
BLUR_RADIUS="64"
# Radix UI cyan-a3 color (display-p3 0.051 0.725 1 / 0.227)
# Using darker cyan to match the visual weight of the semi-transparent overlay
TINT_COLOR="#f0f2f1"  # Darker cyan
TINT_OPACITY=".31"     # Reduced opacity for subtler effect
BRIGHTNESS="100"       # Reduce brightness to match Radix UI gray-a1 darkening effect

echo "🎨 Generating blurred and tinted mobile background..."
echo "   Input:  $INPUT_IMAGE"
echo "   Output: $OUTPUT_IMAGE"
echo "   Blur:   ${BLUR_RADIUS}px"
echo "   Tint:   $TINT_COLOR at ${TINT_OPACITY}%"
echo "   Bright: ${BRIGHTNESS}%"

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ Error: ImageMagick is not installed."
    echo "   Install it with: sudo apt-get install imagemagick"
    exit 1
fi

# Check if input file exists
if [ ! -f "$INPUT_IMAGE" ]; then
    echo "❌ Error: Input file not found: $INPUT_IMAGE"
    exit 1
fi

# Generate blurred and tinted background
# Step 1: Apply blur to the image
# Step 2: Reduce brightness (modulate) to fix "gray fog" from blurring stars
# Step 3: Create a tint overlay and blend it
convert "$INPUT_IMAGE" \
    -blur 0x${BLUR_RADIUS} \
    -modulate ${BRIGHTNESS},100,100 \
    \( +clone -fill "$TINT_COLOR" -colorize 100% \) \
    -compose blend -define compose:args=${TINT_OPACITY} -composite \
    "$OUTPUT_IMAGE"

# Get file sizes for comparison
INPUT_SIZE=$(du -h "$INPUT_IMAGE" | cut -f1)
OUTPUT_SIZE=$(du -h "$OUTPUT_IMAGE" | cut -f1)

echo "✅ Successfully generated blurred and tinted background!"
echo "   Original size: $INPUT_SIZE"
echo "   Blurred size:  $OUTPUT_SIZE"
echo ""
echo "💡 The blurred image is now ready to use in MainAppContent.scss"
echo ""
echo "🔧 To adjust the effect, modify these variables in the script:"
echo "   BLUR_RADIUS - Controls blur strength (currently ${BLUR_RADIUS}px)"
echo "   TINT_COLOR  - Controls tint color (currently $TINT_COLOR)"
echo "   TINT_OPACITY - Controls tint strength (currently ${TINT_OPACITY}%)"

