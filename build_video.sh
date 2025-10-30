#!/usr/bin/env bash
set -e

# 1. Setup
FILE_PATH="public/assets/img/screenshots/screenshot.png"
OUT_DIR="screenshot_history"
RESIZED_DIR="$OUT_DIR/resized"
CLIPS_DIR="$OUT_DIR/clips"
VIDEO_OUT="progression.mp4"
FRAME_DURATION=1       # seconds per image
FADE_DURATION=0.5      # seconds for crossfade

rm -rf "$OUT_DIR" "$VIDEO_OUT"
mkdir -p "$RESIZED_DIR" "$CLIPS_DIR"

# 2. Extract historical versions
echo "Extracting all historical versions of $FILE_PATH..."
for commit in $(git log --format="%H" --follow -- "$FILE_PATH" | tac); do
    date=$(git show -s --format="%cd" --date=short $commit)
    short=$(git rev-parse --short $commit)
    git show "$commit:$FILE_PATH" > "$OUT_DIR/${date}_${short}.png" 2>/dev/null || true
done
echo "✅ Extracted versions."

# 3. Resize images
echo "Resizing images to 1280x720..."
for img in "$OUT_DIR"/*.png; do
  if [ ! -s "$img" ]; then continue; fi
  ffmpeg -y -loglevel error -i "$img" \
    -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2" \
    -frames:v 1 -update 1 "$RESIZED_DIR/$(basename "$img")"
done
echo "✅ All images resized."

# 4. Build video with crossfades
echo "Building video with crossfades..."

i=0
for img in $(find "$RESIZED_DIR" -name '*.png' | sort); do
  ffmpeg -y -loglevel error -loop 1 -t $FRAME_DURATION -i "$img" \
    -vf "format=yuv420p,scale=1280:720" \
    -c:v libx264 -r 25 "$CLIPS_DIR/clip_$i.mp4"
  i=$((i+1))
done

num_clips=$i
if [ $num_clips -lt 2 ]; then
  echo "❌ Not enough clips to build a video."
  exit 1
fi

echo "Combining $num_clips clips with crossfades..."

ffmpeg_args=(-y)
for k in $(seq 0 $((num_clips - 1))); do
  ffmpeg_args+=(-i "$CLIPS_DIR/clip_$k.mp4")
done

filter_chain=""
last_v_stream="[0:v]"
for j in $(seq 1 $((num_clips - 1))); do
  offset=$(awk "BEGIN {print $j * $FRAME_DURATION - $FADE_DURATION}")
  filter_chain+="${last_v_stream}[${j}:v]xfade=transition=fade:duration=${FADE_DURATION}:offset=${offset}[v${j}];"
  last_v_stream="[v${j}]"
done

filter_chain+="${last_v_stream}format=yuv420p[vout]"

ffmpeg_args+=(-filter_complex "$filter_chain")
ffmpeg_args+=(-map "[vout]")
ffmpeg_args+=(-r 25)

# Total duration needs to be precise
total_duration=$(awk "BEGIN {print ($num_clips * $FRAME_DURATION) - (($num_clips - 1) * $FADE_DURATION)}")
ffmpeg_args+=(-t "$total_duration")

ffmpeg_args+=("$VIDEO_OUT")

# Execute ffmpeg
ffmpeg "${ffmpeg_args[@]}"

echo "✅ Video with crossfades created: $VIDEO_OUT"