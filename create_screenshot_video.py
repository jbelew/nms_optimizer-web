#!/usr/bin/env python3
"""
Create a video from git history of a screenshot with crossfades between frames.
"""

import subprocess
import tempfile
import os
from pathlib import Path
import sys

SCREENSHOT_PATH = "public/assets/img/screenshots/screenshot.png"
OUTPUT_VIDEO = "screenshot_evolution.mp4"
KEEP_FRAMES = True  # Set to True to keep extracted frames in a 'frames' directory
CROSSFADE_DURATION = 0.65  # Duration of crossfade in seconds
IMAGE_DURATION = 0.05      # How long each image is shown (before fade starts)
HOLD_DURATION = 1.5        # Duration to hold first and last screenshots
SKIP_FRAMES = [20]  # Frame indices to skip (0-indexed filenames, so 19 is 0019.png)


def get_screenshot_history():
    """Get all commits that modified the screenshot in reverse chronological order."""
    # First try the current path with --follow to catch renames
    result = subprocess.run(
        ["git", "log", "--follow", "--format=%H", "--", SCREENSHOT_PATH],
        capture_output=True,
        text=True,
        check=True
    )
    commits = result.stdout.strip().split("\n")
    commits = [c for c in commits if c]  # Remove empty lines

    # Also check the old path location for any additional history
    old_path = "public/assets/img/screenshot.png"
    try:
        result_old = subprocess.run(
            ["git", "log", "--format=%H", "--", old_path],
            capture_output=True,
            text=True,
            check=True
        )
        old_commits = result_old.stdout.strip().split("\n")
        old_commits = [c for c in old_commits if c]
        # Merge and deduplicate while preserving order
        seen = set(commits)
        for commit in old_commits:
            if commit not in seen:
                commits.append(commit)
                seen.add(commit)
    except subprocess.CalledProcessError:
        pass

    return commits


def extract_versions(commits, temp_dir):
    """Extract each version of the screenshot from git history."""
    files = []
    old_path = "public/assets/img/screenshot.png"

    for i, commit in enumerate(commits):
        # Skip frames in SKIP_FRAMES list (0-indexed)
        if i in SKIP_FRAMES:
            print(f"  Skipped frame {i:04d} (explicitly excluded)")
            continue

        # Try current path first, then old path
        for path in [SCREENSHOT_PATH, old_path]:
            try:
                output_file = os.path.join(temp_dir, f"{i:04d}.png")
                result = subprocess.run(
                    ["git", "show", f"{commit}:{path}"],
                    stdout=open(output_file, "wb"),
                    stderr=subprocess.PIPE,
                    check=True
                )
                files.append(output_file)
                print(f"  Extracted frame {i:04d} from commit {commit[:7]}")
                break
            except subprocess.CalledProcessError:
                continue
        else:
            print(f"  Skipped commit {commit[:7]} (screenshot not found in either path)")

    return files


def create_video(files):
    """Create video with crossfades by pre-rendering each transition."""
    if len(files) < 2:
        print("Error: Need at least 2 versions to create a video")
        return False

    print(f"Creating video with {len(files)} frames and crossfades...")

    temp_videos = []
    try:
        # Pre-render transitions between consecutive images
        print(f"Rendering {len(files)-1} crossfades...")

        for i in range(len(files) - 1):
            # Create a transition from image i to image i+1
            transition_file = f"_temp_transition_{i:04d}.mp4"

            # First, create looped videos for both images
            img1_file = f"_temp_img1_{i:04d}.mp4"
            img2_file = f"_temp_img2_{i:04d}.mp4"

            # Determine duration for first image (use HOLD_DURATION for first frame, otherwise IMAGE_DURATION)
            img1_duration = HOLD_DURATION if i == 0 else IMAGE_DURATION
            # Both need to be long enough for the transition
            duration = img1_duration + CROSSFADE_DURATION

            # Create video for first image
            cmd = [
                "ffmpeg", "-y", "-loop", "1", "-i", files[i],
                "-t", str(duration),
                "-vf", "scale=1280:1024:force_original_aspect_ratio=decrease,pad=1280:1024:(ow-iw)/2:(oh-ih)/2",
                "-c:v", "libx264", "-crf", "23", "-pix_fmt", "yuv420p",
                img1_file
            ]
            subprocess.run(cmd, capture_output=True, check=True)

            # Create video for second image
            cmd = [
                "ffmpeg", "-y", "-loop", "1", "-i", files[i+1],
                "-t", str(duration),
                "-vf", "scale=1280:1024:force_original_aspect_ratio=decrease,pad=1280:1024:(ow-iw)/2:(oh-ih)/2",
                "-c:v", "libx264", "-crf", "23", "-pix_fmt", "yuv420p",
                img2_file
            ]
            subprocess.run(cmd, capture_output=True, check=True)

            # Now create the crossfade between these two, trimmed to actual duration needed
            xfade_cmd = [
                "ffmpeg", "-y",
                "-i", img1_file,
                "-i", img2_file,
                "-filter_complex", f"[0:v][1:v]xfade=transition=fade:duration={CROSSFADE_DURATION}:offset={img1_duration}[v];[v]trim=0:{duration}[trimmed]",
                "-map", "[trimmed]",
                "-c:v", "libx264",
                "-crf", "23",
                "-pix_fmt", "yuv420p",
                transition_file
            ]
            subprocess.run(xfade_cmd, capture_output=True, check=True)

            # Cleanup intermediate files
            os.unlink(img1_file)
            os.unlink(img2_file)

            temp_videos.append(transition_file)

            if (i + 1) % 10 == 0:
                print(f"  Rendered {i+1}/{len(files)-1} transitions", flush=True)

        # Create a hold frame for the last screenshot
        last_screenshot_file = "_temp_last_screenshot.mp4"
        cmd = [
            "ffmpeg", "-y", "-loop", "1", "-i", files[-1],
            "-t", str(HOLD_DURATION),
            "-vf", "scale=1280:1024:force_original_aspect_ratio=decrease,pad=1280:1024:(ow-iw)/2:(oh-ih)/2",
            "-c:v", "libx264", "-crf", "23", "-pix_fmt", "yuv420p",
            last_screenshot_file
        ]
        subprocess.run(cmd, capture_output=True, check=True)
        temp_videos.append(last_screenshot_file)
        print(f"  Added {HOLD_DURATION}s hold for last screenshot")

        # Concatenate all transition videos
        concat_file = tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, dir='.')
        for video_file in temp_videos:
            abs_path = os.path.abspath(video_file)
            concat_file.write(f"file '{abs_path}'\n")
        concat_file.close()

        concat_cmd = ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_file.name,
                      "-c", "copy", OUTPUT_VIDEO]

        print(f"Concatenating {len(temp_videos)} transitions...")
        subprocess.run(concat_cmd, capture_output=True, check=True)
        os.unlink(concat_file.name)
        print(f"Video created: {OUTPUT_VIDEO}")

        return True
    except subprocess.CalledProcessError as e:
        print(f"Error creating video: {e}")
        return False
    finally:
        # Cleanup temp files
        for video_file in temp_videos:
            try:
                os.unlink(video_file)
            except:
                pass


def main():
    print(f"Extracting screenshot history from git...")

    commits = get_screenshot_history()
    commits = [c for c in commits if c]  # Remove empty lines

    if not commits:
        print(f"Error: No commits found for {SCREENSHOT_PATH}")
        sys.exit(1)

    # Use a persistent directory if keeping frames, otherwise use temp
    if KEEP_FRAMES:
        frames_dir = "frames"
        if not os.path.exists(frames_dir):
            os.makedirs(frames_dir)
        temp_dir = frames_dir
        cleanup = False
    else:
        temp_dir = tempfile.mkdtemp()
        cleanup = True

    try:
        files = extract_versions(commits, temp_dir)

        if len(files) < 2:
            print(f"Error: Found only {len(files)} version(s), need at least 2")
            sys.exit(1)

        print(f"Found {len(files)} versions of the screenshot")

        if create_video(files):
            if KEEP_FRAMES:
                print(f"Frames saved to: {frames_dir}/")
            print("Done!")
        else:
            sys.exit(1)
    finally:
        if cleanup:
            import shutil
            shutil.rmtree(temp_dir)


if __name__ == "__main__":
    main()
