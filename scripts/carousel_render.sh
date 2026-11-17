#!/usr/bin/env bash
# Render a carousel spec to PNG slides: published/carousel/<id>/01.png …
# Usage: scripts/carousel_render.sh content/auto/carousels/<id>.json
set -euo pipefail
SPEC="$1"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
ID="$(python3 -c 'import json,sys;print(json.load(open(sys.argv[1]))["id"])' "$SPEC")"
N="$(python3 -c 'import json,sys;print(len(json.load(open(sys.argv[1]))["slides"]))' "$SPEC")"
OUT="published/carousel/$ID"
mkdir -p "$OUT"
for ((i=0; i<N; i++)); do
  npx remotion still AutoCarousel "$OUT/$(printf '%02d' $((i+1))).png" --props="$SPEC" --frame=$i --log=error
done
ffmpeg -v error -y -pattern_type glob -i "$OUT/*.png" -vf "scale=360:-1,tile=${N}x1" -frames:v 1 "out/sheet-carousel-$ID.jpg"
echo "OK $OUT ($N slides) – sheet out/sheet-carousel-$ID.jpg"
