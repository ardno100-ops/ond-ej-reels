# Ondřej Zemánek · Finance & Kariéra – reels

Procedurální Instagram reely (Remotion + vlastní zvukové efekty).

- `src/` – kompozice a scény (`npx remotion studio`)
- `scripts/` – generátory zvuku (`python3 scripts/make_*_audio.py`)
- `content/` – popisky a obsahové plány
- `published/` – hotová videa a slidy pro Metricool (veřejné odkazy)

Render: `npx remotion render <CompositionId> out/<name>.mp4`, poté loudnorm na −14 LUFS:
`ffmpeg -i out/raw.mp4 -c:v copy -af loudnorm=I=-14:TP=-1:LRA=11 -ar 48000 -c:a aac -b:a 192k out/<name>.mp4`
