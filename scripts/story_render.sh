#!/usr/bin/env bash
# Render a StoryReel spec: SFX -> video -> loudness -> published/auto/<id>.mp4
set -euo pipefail
SPEC="$1"; ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
ID="$(python3 -c 'import json,sys;print(json.load(open(sys.argv[1]))["id"])' "$SPEC")"
python3 scripts/story_audio.py "$SPEC"
mkdir -p out published/auto
npx remotion render StoryReel "out/raw-$ID.mp4" --props="$SPEC" --log=error --concurrency=4
ffmpeg -v error -y -i "out/raw-$ID.mp4" -c:v copy -af loudnorm=I=-14:TP=-1:LRA=11 -ar 48000 -c:a aac -b:a 192k "published/auto/$ID.mp4"
rm -f "out/raw-$ID.mp4"
ffmpeg -v error -y -i "published/auto/$ID.mp4" -vf "fps=1,scale=140:-1,tile=12x4" -frames:v 1 "out/sheet-$ID.jpg"
echo "OK published/auto/$ID.mp4 ($(ffprobe -v error -show_entries format=duration -of csv=p=0 "published/auto/$ID.mp4") s)"
