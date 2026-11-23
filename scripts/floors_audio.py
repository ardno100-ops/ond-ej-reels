"""SFX for FloorsReel (fixed timeline FL in src/auto/FloorsReel.tsx). Usage: python3 scripts/floors_audio.py <spec.json>"""
import json, sys
from pathlib import Path
import numpy as np
from audiolib import SR, add, chime, fr, impact, kaching, ping, pop, riser, sub_boom, t2i, thud, tick, whoosh, write_wav

spec = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
TOTAL = 1380
FL = dict(l1=90, l2=330, l3=540, l4=750, later=960, twist=1110, cta=1230)
sfx = np.zeros(int(TOTAL / 30 * SR) + SR // 2)
# hook
add(sfx, 0.0, impact(), 1.0); add(sfx, 0.0, sub_boom(), 0.7)
add(sfx, fr(6), pop(), 0.6)
# camera moves (elevator whoosh) + level badges
for a in (70, 320, 530, 740, 950, 1100):
    add(sfx, fr(a), whoosh(0.9, True, 0.7), 1)
for i, s in enumerate((FL['l1'], FL['l2'], FL['l3'], FL['l4'])):
    add(sfx, fr(s + 8), impact(), 0.8)
    add(sfx, fr(s + 10), chime([660 * 2 ** (i * 2 / 12), 990 * 2 ** (i * 2 / 12)], 0.9), 0.5)
# L1 NE/ANO stamps
for i in range(7):
    yes = i in (3, 6)
    add(sfx, fr(FL['l1'] + 100 + i * 9), ping(1568, 0.3) if yes else thud(), 0.7 if yes else 0.55)
# L2 calendar fill
for i in range(15):
    add(sfx, fr(FL['l2'] + 60 + i * 7), tick(2400 + i * 40), 0.45)
# L3 team pops
for i in (1, 2):
    add(sfx, fr(FL['l3'] + 40 + i * 30), pop(), 0.8)
# L4 folders
for i in range(36):
    add(sfx, fr(FL['l4'] + 40 + i * 3), tick(2000 + (i % 6) * 120), 0.25)
# later
add(sfx, fr(FL['later'] + 20), impact(), 0.8)
add(sfx, fr(FL['later'] + 22), chime([1046.5, 1318.5, 1568.0, 2093.0], 1.6), 0.6)
# twist: phone ring
for r in range(3):
    t = fr(FL['twist'] + 50) + r * 0.45
    for j in range(6):
        add(sfx, t + j * 0.05, ping(1400 if j % 2 else 1700, 0.05), 0.35)
# cta
add(sfx, fr(FL['cta']) - 0.6, riser(0.6), 0.6)
add(sfx, fr(FL['cta'] + 12), impact(), 1.0); add(sfx, fr(FL['cta'] + 12), sub_boom(), 0.7)
add(sfx, fr(FL['cta'] + 30), kaching(), 0.8)
sfx[t2i(fr(TOTAL)):] = 0
out = Path(__file__).resolve().parent.parent / 'public' / spec['audio']
out.parent.mkdir(parents=True, exist_ok=True)
write_wav(out, sfx)
print('wrote', out)
