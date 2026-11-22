"""SFX for a StoryReel spec (calm, cinematic). Usage: python3 scripts/story_audio.py <spec.json>
Timings mirror ST in src/auto/StoryReel.tsx."""
import json, sys
from pathlib import Path
import numpy as np
from audiolib import SR, add, chime, fr, impact, kaching, ping, pop, riser, sub_boom, t2i, thud, tick, whoosh, write_wav

ST = dict(wordStart=3, wordMax=7)
spec = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
beats = spec['beats']
total = sum(b['dur'] for b in beats)
sfx = np.zeros(int(total / 30 * SR) + SR // 2)
t0 = 0
for i, b in enumerate(beats):
    v = b['v']; k = v['k']; d = b['dur']
    if i > 0:
        add(sfx, fr(t0), whoosh(0.4, True, 0.45), 1)
    if b.get('label'):
        add(sfx, fr(t0), pop(), 0.35)
    say = b.get('say') or ''
    if say and k not in ('big', 'cta'):
        words = say.split(' ')
        every = min(ST['wordMax'], max(3, int((d * 0.62) // max(1, len(words)))))
        for j in range(len(words)):
            add(sfx, fr(t0 + ST['wordStart'] + j * every), tick(2600), 0.12)
    if k == 'lift':
        for r in range(d // 18):
            add(sfx, fr(t0 + 6 + r * 18 + 9), thud(), 0.5)
    elif k == 'checklist':
        for j in range(len(v['items'])):
            add(sfx, fr(t0 + 10 + j * 12), ping(1320 * 2 ** (j * 3 / 12), 0.25), 0.55)
    elif k == 'chart':
        add(sfx, fr(t0 + 6), riser(max(0.6, (d - 30) / 30)), 0.45)
    elif k == 'think':
        add(sfx, fr(t0 + 20), ping(988, 0.4), 0.5)
    elif k == 'crosses':
        for j in range(len(v['items'])):
            add(sfx, fr(t0 + 14 + j * 14), thud(), 0.7)
    elif k == 'clock':
        for j in range(d // 6):
            add(sfx, fr(t0 + j * 6), tick(1800 if j % 2 else 2200), 0.3)
    elif k == 'shrink':
        add(sfx, fr(t0 + 8), whoosh(1.2, False, 0.5), 1)
    elif k == 'big':
        add(sfx, fr(t0) - 0.6, riser(0.6), 0.6)
        for j in range(len(v['lines'])):
            add(sfx, fr(t0 + 4 + j * 12), impact(), 1.0 if j == len(v['lines']) - 1 else 0.7)
        add(sfx, fr(t0 + 4 + (len(v['lines']) - 1) * 12), sub_boom(), 0.8)
    elif k == 'equation':
        for j in range(len(v['left'])):
            add(sfx, fr(t0 + 6) + j * 18 / 30 / max(1, len(v['left'])), tick(3000), 0.25)
        add(sfx, fr(t0 + 32), impact(), 0.7)
    elif k == 'icons':
        for j in range(len(v['items'])):
            add(sfx, fr(t0 + 6 + j * 14), pop(), 0.7)
            add(sfx, fr(t0 + 6 + j * 14), ping(880 * 2 ** (j * 4 / 12), 0.3), 0.5)
    elif k in ('future', 'crowd'):
        add(sfx, fr(t0 + 14), chime([880.0, 1318.5], 1.2), 0.5)
    elif k == 'doors':
        add(sfx, fr(t0 + 4), whoosh(0.8, True, 0.4), 1)
    elif k == 'bell':
        add(sfx, fr(t0 + 4), whoosh(0.9, True, 0.4), 1)
    elif k == 'cta':
        add(sfx, fr(t0) - 0.7, riser(0.7), 0.6)
        add(sfx, fr(t0 + 14), impact(), 1.0)
        add(sfx, fr(t0 + 14), sub_boom(), 0.7)
        for j in range(len(v['word'])):
            add(sfx, fr(t0 + 34 + j * 4), tick(3000), 0.8)
        add(sfx, fr(t0 + 34 + len(v['word']) * 4 + 10), kaching(), 0.9)
    t0 += d
sfx[t2i(fr(total)):] = 0
out = Path(__file__).resolve().parent.parent / 'public' / spec['audio']
out.parent.mkdir(parents=True, exist_ok=True)
write_wav(out, sfx)
print('wrote', out)
