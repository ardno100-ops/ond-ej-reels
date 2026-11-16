"""SFX-only soundtrack for a data-driven AutoReel spec.

Usage: python3 scripts/auto_audio.py content/auto/specs/<id>.json
Writes public/<spec.audio>. Timings mirror the T constants in src/auto/AutoReel.tsx.
"""
import json
import sys
from pathlib import Path

import numpy as np

from audiolib import SR, add, chime, fr, impact, kaching, ping, pop, riser, sub_boom, t2i, thud, tick, whoosh, write_wav

T = dict(itemFirst=16, itemEvery=16, counterStart=18, counterLen=40, afterCounter=66, ctaWord=18, ctaBox=28,
         ctaType=40, ctaTypeEvery=5, ctaSend=72, slamEvery=8)

spec = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
total = sum(s['dur'] for s in spec['scenes'])
n = int(total / 30 * SR) + SR // 2
sfx = np.zeros(n)

start = 0
for i, s in enumerate(spec['scenes']):
    st = s['type']
    t0 = start
    if i > 0:
        add(sfx, fr(t0), whoosh(0.35, True, 0.7), 1)
    if st == 'slam':
        for k, _ in enumerate(s['lines']):
            add(sfx, fr(t0 + k * T['slamEvery']), impact() if k == 0 else pop(), 1.0 if k == 0 else 0.8)
        if i == 0:
            add(sfx, fr(t0), sub_boom(), 0.8)
    elif st == 'counter':
        if s.get('kicker'):
            add(sfx, fr(t0), impact(), 0.7)
        for k in range(T['counterLen'] // 3):
            add(sfx, fr(t0 + T['counterStart'] + k * 3), tick(2200 + k * 40), 0.6)
        add(sfx, fr(t0 + T['counterStart'] + T['counterLen']), thud(), 0.8)
        if s.get('after'):
            add(sfx, fr(t0 + T['afterCounter']), impact(), 1.0)
            add(sfx, fr(t0 + T['afterCounter']), sub_boom(), 0.7)
    elif st in ('list', 'compare', 'bars'):
        add(sfx, fr(t0), impact(), 0.7)
        m = len(s['items']) if st == 'list' else (len(s['bars']) if st == 'bars' else max(len(s['left']['items']), len(s['right']['items'])) * 2)
        for k in range(m):
            off = T['itemFirst'] + (k * T['itemEvery'] if st != 'compare' else (k // 2) * T['itemEvery'] + (k % 2) * 8)
            add(sfx, fr(t0 + off), pop(), 0.7)
            add(sfx, fr(t0 + off), ping(1320 * 2 ** ((k % 8) * 2 / 12), 0.2), 0.7 if s.get('mark') != 'x' else 0.0)
            if s.get('mark') == 'x':
                add(sfx, fr(t0 + off), thud(), 0.6)
    elif st == 'cta':
        add(sfx, fr(t0) - 0.8, riser(0.8), 0.7)
        add(sfx, fr(t0 + T['ctaWord']), impact(), 1.1)
        add(sfx, fr(t0 + T['ctaWord']), sub_boom(), 0.8)
        add(sfx, fr(t0 + T['ctaBox']), pop(), 0.8)
        for k in range(len(s['word'])):
            add(sfx, fr(t0 + T['ctaType'] + k * T['ctaTypeEvery']), tick(3000), 0.9)
        add(sfx, fr(t0 + T['ctaSend']), kaching(), 1.0)
        add(sfx, fr(t0 + T['ctaSend']), chime([1318.5, 1568.0, 2093.0], 1.2), 0.8)
    start += s['dur']

sfx[t2i(fr(total)):] = 0
out = Path(__file__).resolve().parent.parent / 'public' / spec['audio']
out.parent.mkdir(parents=True, exist_ok=True)
write_wav(out, sfx)
print('wrote', out)
